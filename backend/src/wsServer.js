require('dotenv').config();
const { WebSocketServer } = require('ws');
const mongoose = require('mongoose');
const Post = require('./models/Post');

const PORT = process.env.WS_PORT || process.env.PORT || 8080;

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ WS Server: Connected to MongoDB Atlas'))
  .catch((err) => {
    console.error('❌ WS Server MongoDB error:', err.message);
    process.exit(1);
  });

// ─── WebSocket Server ─────────────────────────────────────────────────────────
const wss = new WebSocketServer({ port: PORT }, () => {
  console.log(`⚡ WebSocket Server running on ws://localhost:${PORT}`);
});

wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`🔌 Client connected from ${clientIp}`);

  // Send welcome handshake
  ws.send(JSON.stringify({ type: 'connected', message: 'WebSocket connection established' }));

  ws.on('message', async (rawMessage) => {
    try {
      const message = JSON.parse(rawMessage.toString());
      const { type, query } = message;

      if (type === 'search') {
        let posts;

        if (!query || query.trim() === '') {
          // Empty query — return first 20 posts
          posts = await Post.find().sort({ postId: 1 }).limit(20).lean();
        } else {
          // Search by regex in title or body (case-insensitive)
          posts = await Post.find({
            $or: [
              { title: { $regex: query.trim(), $options: 'i' } },
              { body: { $regex: query.trim(), $options: 'i' } },
            ],
          })
            .sort({ postId: 1 })
            .limit(50)
            .lean();
        }

        ws.send(
          JSON.stringify({
            type: 'results',
            query,
            count: posts.length,
            posts,
          })
        );

        console.log(`🔍 Search "${query}" → ${posts.length} results`);
      } else {
        ws.send(JSON.stringify({ type: 'error', message: `Unknown message type: ${type}` }));
      }
    } catch (err) {
      console.error('WS message error:', err.message);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format. Expected JSON.' }));
    }
  });

  ws.on('close', () => {
    console.log(`🔌 Client disconnected from ${clientIp}`);
  });

  ws.on('error', (err) => {
    console.error('WS client error:', err.message);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing WebSocket server...');
  wss.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});
