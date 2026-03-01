const discuss = require('../models/discuss');
const mongoose = require('mongoose');

const isOwnerOrAdmin = (discussion, user) => {
  return (
    String(discussion.problemcreator) === String(user._id) ||
    String(user.role) === 'admin'
  );
};

const AllDiscussion = async (req, res) => {
  try {
    const data = await discuss
      .find()
      .populate('problemcreator', '_id firstname lastname emailid')
      .sort({ createdAt: -1 });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).send('Error ' + error.message);
  }
};

const GetDiscussionById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid discussion ID');
    }

    const data = await discuss
      .findById(id)
      .populate('problemcreator', '_id firstname lastname emailid')
      .populate('comments.commenter', '_id firstname lastname emailid');

    if (!data) return res.status(404).send('Discussion not found');

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).send('Error ' + error.message);
  }
};

const CreateDiscussion = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description) {
      return res.status(400).send('Title and description are required');
    }

    const username = `${req.user.firstname || ''} ${req.user.lastname || ''}`.trim() || 'Anonymous User';

    const created = await discuss.create({
      title,
      description,
      category: category || 'General',
      username,
      problemcreator: req.user._id,
    });

    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).send('Error ' + error.message);
  }
};

const UpdateDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid discussion ID');
    }

    const post = await discuss.findById(id);
    if (!post) return res.status(404).send('Discussion not found');

    if (!isOwnerOrAdmin(post, req.user)) {
      return res.status(403).send('You are not allowed to update this post');
    }

    const { title, description, category } = req.body;

    if (title !== undefined) post.title = title;
    if (description !== undefined) post.description = description;
    if (category !== undefined) post.category = category;

    await post.save();
    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).send('Error ' + error.message);
  }
};

const DeleteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid discussion ID');
    }

    const post = await discuss.findById(id);
    if (!post) return res.status(404).send('Discussion not found');

    if (!isOwnerOrAdmin(post, req.user)) {
      return res.status(403).send('You are not allowed to delete this post');
    }

    await discuss.findByIdAndDelete(id);
    return res.status(200).send('Discussion deleted successfully');
  } catch (error) {
    return res.status(500).send('Error ' + error.message);
  }
};

const ToggleDiscussionLike = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid discussion ID');
    }

    const post = await discuss.findById(id);
    if (!post) return res.status(404).send('Discussion not found');

    const userId = String(req.user._id);
    const alreadyLiked = post.likedBy.some((uid) => String(uid) === userId);

    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter((uid) => String(uid) !== userId);
    } else {
      post.likedBy.push(req.user._id);
    }

    post.likesCount = post.likedBy.length;
    await post.save();

    return res.status(200).json({
      liked: !alreadyLiked,
      likesCount: post.likesCount,
    });
  } catch (error) {
    return res.status(500).send('Error ' + error.message);
  }
};

const AddDiscussionComment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid discussion ID');
    }

    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).send('Comment text is required');
    }

    const post = await discuss.findById(id);
    if (!post) return res.status(404).send('Discussion not found');

    const commenterName = `${req.user.firstname || ''} ${req.user.lastname || ''}`.trim() || 'Anonymous User';

    post.comments.push({
      commenter: req.user._id,
      commenterName,
      text: text.trim(),
    });

    await post.save();

    const comment = post.comments[post.comments.length - 1];
    return res.status(201).json(comment);
  } catch (error) {
    return res.status(500).send('Error ' + error.message);
  }
};

const DeleteDiscussionComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).send('Invalid discussion or comment ID');
    }

    const post = await discuss.findById(id);
    if (!post) return res.status(404).send('Discussion not found');

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).send('Comment not found');

    if (String(req.user.role) !== 'admin') {
      return res.status(403).send('Only admin can delete comments');
    }

    comment.deleteOne();
    await post.save();

    return res.status(200).send('Comment deleted successfully');
  } catch (error) {
    return res.status(500).send('Error ' + error.message);
  }
};

module.exports = {
  AllDiscussion,
  GetDiscussionById,
  CreateDiscussion,
  UpdateDiscussion,
  DeleteDiscussion,
  ToggleDiscussionLike,
  AddDiscussionComment,
  DeleteDiscussionComment,
};
