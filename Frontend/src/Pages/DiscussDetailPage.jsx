import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { discussionApi } from '../api/discussion.api';
import useAuth from '../auth/useAuth';

const CATEGORY_OPTIONS = [
  'Interview',
  'Contest',
  'Career',
  'Compensation',
  'Feedback',
  'General',
];

export default function DiscussDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', category: 'General' });
  const [savingEdit, setSavingEdit] = useState(false);

  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadPost = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await discussionApi.getById(id);
      setPost(res.data);
      setEditForm({
        title: res.data?.title || '',
        description: res.data?.description || '',
        category: res.data?.category || 'General',
      });
    } catch (e) {
      setError(String(e?.response?.data || 'Unable to load discussion'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPost();
  }, [id]);

  const canManage = useMemo(() => {
    const ownerId = post?.problemcreator?._id || post?.problemcreator;
    return Boolean(user?._id && (String(ownerId) === String(user._id) || user?.role === 'admin'));
  }, [post, user]);

  const hasLiked = useMemo(() => {
    if (!user?._id || !Array.isArray(post?.likedBy)) return false;
    return post.likedBy.some((uid) => String(uid) === String(user._id));
  }, [post, user]);

  const onLike = async () => {
    if (!post?._id) return;
    try {
      const res = await discussionApi.toggleLike(post._id);
      const liked = Boolean(res.data?.liked);
      const likesCount = Number(res.data?.likesCount ?? 0);

      setPost((prev) => {
        if (!prev) return prev;
        const likedBy = Array.isArray(prev.likedBy) ? [...prev.likedBy] : [];
        const exists = likedBy.some((uid) => String(uid) === String(user?._id));
        let next = likedBy;
        if (liked && !exists) next.push(user._id);
        if (!liked && exists) next = likedBy.filter((uid) => String(uid) !== String(user._id));

        return { ...prev, likedBy: next, likesCount };
      });
    } catch (e) {
      setError(String(e?.response?.data || 'Unable to like post'));
    }
  };

  const onSaveEdit = async () => {
    if (!post?._id) return;
    if (!editForm.title.trim() || !editForm.description.trim()) return;

    setSavingEdit(true);
    setError('');
    try {
      const res = await discussionApi.update(post._id, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        category: editForm.category,
      });
      setPost((prev) => ({ ...prev, ...res.data }));
      setEditing(false);
    } catch (e) {
      setError(String(e?.response?.data || 'Unable to update post'));
    } finally {
      setSavingEdit(false);
    }
  };

  const onDeletePost = async () => {
    if (!post?._id) return;

    setDeleting(true);
    setError('');
    const toastId = toast.loading('Deleting post...');
    try {
      await discussionApi.remove(post._id);
      toast.success('Post deleted', { id: toastId });
      nav('/discuss');
    } catch (e) {
      toast.error(String(e?.response?.data || 'Unable to delete post'), { id: toastId });
      setError(String(e?.response?.data || 'Unable to delete post'));
      setDeleting(false);
    }
  };

  const onAddComment = async () => {
    const text = commentText.trim();
    if (!text || !post?._id) return;

    setCommenting(true);
    setError('');
    try {
      const res = await discussionApi.addComment(post._id, text);
      setPost((prev) => ({
        ...prev,
        comments: [...(prev?.comments || []), res.data],
      }));
      setCommentText('');
    } catch (e) {
      setError(String(e?.response?.data || 'Unable to add comment'));
    } finally {
      setCommenting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#060c17] px-4 py-8 text-slate-300">Loading post...</div>;
  }

  if (!post) {
    return <div className="min-h-screen bg-[#060c17] px-4 py-8 text-red-200">{error || 'Post not found'}</div>;
  }

  return (
    <div className="min-h-screen bg-[#060c17] text-slate-100">
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="mb-4">
          <Link to="/discuss" className="text-sm text-cyan-200 underline">Back to discuss titles</Link>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>
        ) : null}

        <article className="rounded-2xl border border-white/10 bg-[#0d1628]/85 p-5">
          {editing ? (
            <div>
              <div className="grid gap-3 md:grid-cols-4">
                <input
                  value={editForm.title}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="h-10 rounded-xl border border-white/10 bg-[#091123] px-3 text-sm outline-none md:col-span-3"
                />
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="h-10 rounded-xl border border-white/10 bg-[#091123] px-3 text-sm outline-none"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c} className="bg-slate-900">{c}</option>
                  ))}
                </select>
              </div>
              <textarea
                rows={5}
                value={editForm.description}
                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                className="mt-3 w-full rounded-xl border border-white/10 bg-[#091123] px-3 py-2 text-sm outline-none"
              />
              <div className="mt-3 flex gap-2">
                <button onClick={onSaveEdit} disabled={savingEdit} className="h-9 rounded-lg bg-white px-3 text-sm font-semibold text-slate-900 disabled:opacity-60">{savingEdit ? 'Saving...' : 'Save'}</button>
                <button onClick={() => setEditing(false)} className="h-9 rounded-lg border border-white/10 px-3 text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-2xl font-semibold text-white">{post.title}</h1>
                <span className="rounded-full border border-cyan-300/30 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-200">{post.category}</span>
              </div>
              <p className="mt-2 text-xs text-slate-400">By {post.username || 'Anonymous User'}</p>
              <p className="mt-4 whitespace-pre-wrap text-sm text-slate-200">{post.description}</p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button onClick={onLike} className={`h-9 rounded-lg px-3 text-sm ${hasLiked ? 'bg-emerald-300 text-slate-900' : 'border border-white/10 bg-slate-900/50 text-slate-100'}`}>
                  {hasLiked ? 'Liked' : 'Like'} ({post.likesCount || 0})
                </button>

                {canManage ? (
                  <>
                    <button onClick={() => setEditing(true)} className="h-9 rounded-lg border border-white/10 px-3 text-sm">Edit</button>
                    <button onClick={onDeletePost} disabled={deleting} className="h-9 rounded-lg border border-red-500/30 bg-red-500/10 px-3 text-sm text-red-200 disabled:opacity-60">
                      {deleting ? 'Deleting...' : 'Delete Post'}
                    </button>
                  </>
                ) : null}
              </div>
            </>
          )}
        </article>

        <section className="mt-4 rounded-2xl border border-white/10 bg-[#0d1628]/85 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Comments</h2>
          <div className="mt-3 space-y-2">
            {(post.comments || []).map((comment) => (
              <div key={comment._id} className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2">
                <p className="text-xs text-slate-400">{comment.commenterName || 'User'}</p>
                <p className="text-sm text-slate-100">{comment.text}</p>
              </div>
            ))}
            {!(post.comments || []).length ? <p className="text-sm text-slate-400">No comments yet.</p> : null}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment"
              className="h-10 flex-1 rounded-xl border border-white/10 bg-[#091123] px-3 text-sm outline-none"
            />
            <button
              onClick={onAddComment}
              disabled={commenting}
              className="h-10 rounded-xl bg-white px-3 text-sm font-semibold text-slate-900 disabled:opacity-60"
            >
              {commenting ? 'Sending...' : 'Comment'}
            </button>
          </div>

              </section>
      </div>
    </div>
  );
}
