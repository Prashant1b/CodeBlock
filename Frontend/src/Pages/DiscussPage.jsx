import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { discussionApi } from '../api/discussion.api';

const CATEGORY_OPTIONS = [
  'Interview',
  'Contest',
  'Career',
  'Compensation',
  'Feedback',
  'General',
];

export default function DiscussPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [needsLogin, setNeedsLogin] = useState(false);

  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    category: 'General',
  });
  const [creating, setCreating] = useState(false);

  const loadDiscussions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await discussionApi.list();
      setPosts(res.data || []);
      setNeedsLogin(false);
    } catch (e) {
      if (e?.response?.status === 401) {
        setNeedsLogin(true);
        setError('Please sign in to view discussions.');
      } else {
        setError(e?.response?.data || 'Unable to load discussions');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiscussions();
  }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    if (!createForm.title.trim() || !createForm.description.trim()) return;

    setCreating(true);
    setError('');
    try {
      const res = await discussionApi.create({
        title: createForm.title.trim(),
        description: createForm.description.trim(),
        category: createForm.category,
      });
      setPosts((prev) => [res.data, ...prev]);
      setCreateForm({ title: '', description: '', category: 'General' });
    } catch (e) {
      setError(e?.response?.data || 'Unable to create discussion');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060c17] text-slate-100">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="rounded-3xl border border-white/10 bg-[#0d1628]/85 p-6">
          <h1 className="text-3xl font-semibold text-white">Discuss</h1>
          <p className="mt-2 text-sm text-slate-300">
            Discussion list view: click any title to open full post and comments.
          </p>
        </div>

        {needsLogin ? (
          <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-amber-100">
            <p>{error}</p>
            <Link to="/signin" className="mt-2 inline-block text-sm font-semibold underline">
              Go to Sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={onCreate} className="mt-6 rounded-2xl border border-white/10 bg-[#0d1628]/85 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-200">Create Discussion</p>
            <div className="grid gap-3 md:grid-cols-4">
              <input
                value={createForm.title}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Post title"
                className="h-11 rounded-xl border border-white/10 bg-[#091123] px-3 text-sm outline-none focus:border-cyan-300/60 md:col-span-3"
              />
              <select
                value={createForm.category}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, category: e.target.value }))}
                className="h-11 rounded-xl border border-white/10 bg-[#091123] px-3 text-sm outline-none focus:border-cyan-300/60"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c} className="bg-slate-900">
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Write details"
              rows={3}
              className="mt-3 w-full rounded-xl border border-white/10 bg-[#091123] px-3 py-2 text-sm outline-none focus:border-cyan-300/60"
            />
            <div className="mt-3 flex justify-end">
              <button
                disabled={creating}
                className="h-10 rounded-xl bg-white px-4 text-sm font-semibold text-slate-900 disabled:opacity-60"
              >
                {creating ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        )}

        {error && !needsLogin ? (
          <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#0d1628]/85 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">All Titles</h2>
          {loading ? (
            <p className="mt-3 text-sm text-slate-400">Loading discussions...</p>
          ) : posts.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">No discussions yet.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {posts.map((post, index) => (
                <Link
                  key={post._id}
                  to={`/discuss/${post._id}`}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-cyan-300/40 hover:bg-cyan-500/10"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-100">
                      {index + 1}. {post.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {post.category} | {post.likesCount || 0} likes | {(post.comments || []).length} comments
                    </p>
                  </div>
                  <span className="text-xs text-cyan-200">Open</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
