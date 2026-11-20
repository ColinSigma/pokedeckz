import '../styles/components.css';

export default function LoadingSkeleton({ type = 'card', count = 8 }) {
  if (type === 'detail') {
    return (
      <div className="skeleton skeleton-detail">
        <div className="skeleton-image-large shimmer" />
        <div className="skeleton-text-block">
          <div className="skeleton-line skeleton-line-title shimmer" />
          <div className="skeleton-line shimmer" />
          <div className="skeleton-line shimmer" />
          <div className="skeleton-line skeleton-line-short shimmer" />
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="skeleton skeleton-list">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-row shimmer" />
        ))}
      </div>
    );
  }

  // Default: card grid
  return (
    <div className="skeleton skeleton-card card-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card-item">
          <div className="skeleton-card-image shimmer" />
          <div className="skeleton-card-text">
            <div className="skeleton-line shimmer" />
            <div className="skeleton-line skeleton-line-short shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}
