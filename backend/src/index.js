require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');

const postsRouter = require('./routes/posts');
const Post = require('./models/Post');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

// ─── MongoDB Connection + Auto-Seed ──────────────────────────────────────────
const connectAndSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    const count = await Post.countDocuments();
    if (count === 0) {
      console.log('📥 No posts found — seeding from JSONPlaceholder...');
      const { data } = await axios.get('https://jsonplaceholder.typicode.com/posts');
      const bulkOps = data.map((post) => ({
        updateOne: {
          filter: { postId: post.id },
          update: { $set: { postId: post.id, userId: post.userId, title: post.title, body: post.body } },
          upsert: true,
        },
      }));
      await Post.bulkWrite(bulkOps);
      console.log(`✅ Seeded ${data.length} posts successfully`);
    } else {
      console.log(`📚 Found ${count} existing posts in DB`);
    }
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

connectAndSeed();

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: '🚀 NoDoubt API is running',
    endpoints: {
      getAllPosts: 'GET /api/posts',
      getSinglePost: 'GET /api/posts/:id',
      seedPosts: 'POST /api/posts/seed',
    },
  });
});

app.use('/api/posts', postsRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🌐 REST API Server running on http://localhost:${PORT}`);
});

module.exports = app;
