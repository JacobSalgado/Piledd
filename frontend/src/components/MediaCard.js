function MediaCard({ item }) {
  return (
    <div className="media-card">
      {item.coverUrl ? (
        <img src={item.coverUrl} alt={`Cover of ${item.title}`} loading="lazy" />
      ) : (
        <div className="cover-placeholder">No cover</div>
      )}
      <h3 title={item.title}>{item.title}</h3>
      {item.authors?.length > 0 && (
        <p className="media-authors">{item.authors.join(', ')}</p>
      )}
      <span className={`media-badge badge-${item.type}`}>{item.type}</span>
    </div>
  );
}

export default MediaCard;