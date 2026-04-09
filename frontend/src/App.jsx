import { useState, useEffect, useRef, useCallback } from 'react';
import PostCard from './components/PostCard.jsx';
import SearchBar from './components/SearchBar.jsx';

const API_URL = import.meta.env.VITE_API_URL || '';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';

function App() {
  const [allPosts, setAllPosts] = useState([]);
  const [displayedPosts, setDisplayedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ total: 0 });

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectCountRef = useRef(0);

  // ── Fetch all posts from REST API ──────────────────────────────────────────
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/posts`);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        const posts = data.posts || data;
        setAllPosts(posts);
        setDisplayedPosts(posts);
        setStats({ total: data.total || posts.length });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // ── WebSocket connection with auto-reconnect ───────────────────────────────
  const connectWS = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        reconnectCountRef.current = 0;
        console.log('⚡ WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const { type, posts: results } = JSON.parse(event.data);
          if (type === 'results') {
            setDisplayedPosts(results || []);
            setSearchLoading(false);
          }
        } catch (e) {
          console.error('WS message parse error:', e);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        // Exponential backoff reconnect (max 30s)
        const delay = Math.min(1000 * 2 ** reconnectCountRef.current, 30000);
        reconnectCountRef.current += 1;
        console.log(`WS closed. Reconnecting in ${delay}ms...`);
        reconnectTimeoutRef.current = setTimeout(connectWS, delay);
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        ws.close();
      };
    } catch (e) {
      console.error('Failed to create WebSocket:', e);
    }
  }, []);

  useEffect(() => {
    connectWS();
    return () => {
      clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connectWS]);

  // ── Handle search ─────────────────────────────────────────────────────────
  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query);

      if (!query.trim()) {
        setDisplayedPosts(allPosts);
        setSearchLoading(false);
        return;
      }

      setSearchLoading(true);

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        // Real-time search via WebSocket
        wsRef.current.send(JSON.stringify({ type: 'search', query }));
      } else {
        // Fallback: local search while WS reconnects
        const q = query.toLowerCase();
        const filtered = allPosts.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.body.toLowerCase().includes(q)
        );
        setDisplayedPosts(filtered);
        setSearchLoading(false);
      }
    },
    [allPosts]
  );

  // ── Keyboard shortcut: close modal on Escape ──────────────────────────────
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setSelectedPost(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="app">
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <div className="bg-orb orb-3" />

      <header className="header">
        <div className="header-inner">
          <a href="/" className="logo" aria-label="NoDoubt App Home">
            <span className="logo-icon">⚡</span>
            <span className="logo-name">NoDoubt</span>
          </a>

          <div className="header-right">
            <div className={`ws-badge ${wsConnected ? 'ws-on' : 'ws-off'}`} aria-live="polite">
              <span className="ws-dot" />
              <span>{wsConnected ? 'Live Search' : 'Connecting…'}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="main" id="main-content">
        <section className="hero" aria-label="Hero section">
          <div className="hero-badge">📡 Powered by WebSockets + MongoDB</div>
          <h1 className="hero-title">
            Explore <span className="gradient-text">Every Post</span>
            <br />
            in Real&#8209;Time
          </h1>
          <p className="hero-subtitle">
            {stats.total > 0 ? (
              <>
                <strong>{stats.total}</strong> posts fetched from JSONPlaceholder, stored in
                MongoDB, and instantly searchable.
              </>
            ) : (
              'Loading posts from MongoDB…'
            )}
          </p>
        </section>

        <SearchBar onSearch={handleSearch} isSearching={searchLoading} wsConnected={wsConnected} />

        {!loading && !error && (
          <div className="results-meta" aria-live="polite">
            {searchQuery ? (
              <p>
                <span className="meta-count">{displayedPosts.length}</span> results for{' '}
                <span className="meta-query">"{searchQuery}"</span>
                {wsConnected && (
                  <span className="meta-live"> · via WebSocket</span>
                )}
              </p>
            ) : (
              <p>
                Showing <span className="meta-count">{displayedPosts.length}</span> posts
              </p>
            )}
          </div>
        )}

        {loading ? (
          <div className="state-container" aria-busy="true">
            <div className="loader">
              <div className="loader-ring" />
              <div className="loader-ring" />
              <div className="loader-ring" />
            </div>
            <p className="state-text">Fetching posts from the server…</p>
          </div>
        ) : error ? (
          <div className="state-container error-state" role="alert">
            <div className="error-icon">⚠️</div>
            <h2 className="state-title">Couldn't load posts</h2>
            <p className="state-text">{error}</p>
            <button className="btn-retry" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        ) : displayedPosts.length === 0 ? (
          <div className="state-container empty-state">
            <div className="empty-icon">🔍</div>
            <h2 className="state-title">No results found</h2>
            <p className="state-text">Try a different search term.</p>
          </div>
        ) : (
          <div className="posts-grid" role="list" aria-label="Posts list">
            {displayedPosts.map((post, idx) => (
              <PostCard
                key={post._id || post.postId}
                post={post}
                index={idx}
                onClick={() => setSelectedPost(post)}
              />
            ))}
          </div>
        )}
      </main>

      {selectedPost && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedPost(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Post details"
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedPost(null)}
              aria-label="Close modal"
            >
              ✕
            </button>
            <div className="modal-header">
              <span className="modal-badge">Post #{selectedPost.postId}</span>
              <span className="modal-user">👤 User {selectedPost.userId}</span>
            </div>
            <h2 className="modal-title">{selectedPost.title}</h2>
            <div className="modal-divider" />
            <p className="modal-body">{selectedPost.body}</p>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>
          Built with React · Express · MongoDB · WebSockets &nbsp;|&nbsp;
          <a
            href="https://jsonplaceholder.typicode.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Data: JSONPlaceholder
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
