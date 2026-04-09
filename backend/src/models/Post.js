const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    postId: { type: Number, unique: true, required: true },
    userId: { type: Number, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
  },
  { timestamps: true }
);

// Text index for full-text search
postSchema.index({ title: 'text', body: 'text' });

module.exports = mongoose.model('Post', postSchema);
