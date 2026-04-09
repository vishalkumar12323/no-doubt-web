const USER_COLORS = [
  '#7c3aed', '#0891b2', '#059669', '#d97706',
  '#dc2626', '#9333ea', '#2563eb', '#16a34a',
  '#ca8a04', '#c026d3',
];

function PostCard({ post, index, onClick }) {
  const color = USER_COLORS[(post.userId - 1) % USER_COLORS.length];
  const delay = (index % 12) * 30;

  return (
    <article
      className="post-card"
      onClick={onClick}
      role="listitem"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      style={{ animationDelay: `${delay}ms` }}
      aria-label={`Post ${post.postId}: ${post.title}`}
    >
      <div className="card-accent" style={{ background: color }} />

      <div className="card-inner">
        <div className="card-header">
          <span className="card-id">#{post.postId}</span>
          <span className="card-user" style={{ color }}>
            U{post.userId}
          </span>
        </div>

        <h3 className="card-title">{post.title}</h3>

        <p className="card-body">
          {post.body.length > 100 ? post.body.substring(0, 100) + '…' : post.body}
        </p>

        <div className="card-footer">
          <span className="card-read">Read more</span>
          <span className="card-arrow">→</span>
        </div>
      </div>
    </article>
  );
}

export default PostCard;
