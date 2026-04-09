const express = require('express');
const axios = require('axios');
const Post = require('../models/Post');

const router = express.Router();

// POST /api/posts/seed — Fetch from JSONPlaceholder and save to MongoDB
router.post('/seed', async (req, res) => {
  try {
    const { data } = await axios.get('https://jsonplaceholder.typicode.com/posts');

    const bulkOps = data.map((post) => ({
      updateOne: {
        filter: { postId: post.id },
        update: {
          $set: {
            postId: post.id,
            userId: post.userId,
            title: post.title,
            body: post.body,
          },
        },
        upsert: true,
      },
    }));

    const result = await Post.bulkWrite(bulkOps);

    res.json({
      message: `Successfully seeded posts from JSONPlaceholder`,
      upserted: result.upsertedCount,
      modified: result.modifiedCount,
      total: data.length,
    });
  } catch (err) {
    console.error('Seed error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/posts — Get all posts
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const posts = await Post.find()
      .sort({ postId: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Post.countDocuments();

    res.json({ posts, total, page: Number(page) });
  } catch (err) {
    console.error('Get posts error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/posts/:id — Get single post by postId
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findOne({ postId: Number(req.params.id) });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    console.error('Get post error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
