import { useState } from "react";

function PopularityBar({ value }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="pop-bar-wrap" title={`Popularity: ${pct}`}>
      <div className="pop-bar" style={{ width: `${pct}%` }} />
    </div>
  );
}

function SongCard({ song, index }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="card" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="card-rank">#{index + 1}</div>

      <div className="card-art">
        {song.artwork_url && !imgError ? (
          <img
            src={song.artwork_url}
            alt={song.track}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="card-art-placeholder">🎶</div>
        )}
      </div>

      <div className="card-body">
        <h3 className="card-track">{song.track}</h3>
        <p className="card-artist">{song.artist}</p>
        {song.album && <p className="card-album">{song.album}</p>}

        <div className="card-meta">
          {song.year && <span className="meta-tag">{song.year}</span>}
          {song.popularity != null && (
            <span className="meta-tag pop-tag">
              🔥 {song.popularity}
            </span>
          )}
        </div>

        <PopularityBar value={song.popularity} />

        {song.track_url && (
          <a
            href={song.track_url}
            target="_blank"
            rel="noopener noreferrer"
            className="spotify-btn"
            aria-label={`Open ${song.track} on Spotify`}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 17.322a.75.75 0 01-1.031.249c-2.825-1.726-6.38-2.116-10.567-1.16a.75.75 0 01-.334-1.462c4.583-1.047 8.516-.596 11.682 1.342a.75.75 0 01.25 1.031zm1.484-3.302a.937.937 0 01-1.288.308c-3.232-1.987-8.16-2.563-11.982-1.402a.937.937 0 01-.545-1.793c4.37-1.327 9.8-.684 13.507 1.598a.937.937 0 01.308 1.289zm.128-3.44C15.368 8.34 9.275 8.137 5.893 9.165a1.125 1.125 0 01-.651-2.151C9.426 5.75 16.19 5.985 20.082 8.38a1.125 1.125 0 01-1.908 1.2z" />
            </svg>
            Open on Spotify
          </a>
        )}
      </div>
    </div>
  );
}

export default function Results({ results, loading, error, query }) {
  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="results-section">
        <p className="results-label">Finding songs like <em>{query}</em>…</p>
        <div className="cards-grid">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="card skeleton" />
          ))}
        </div>
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="empty-state">
        <span className="empty-icon">⚠️</span>
        <p>{error}</p>
      </div>
    );
  }

  /* ── No results ── */
  if (results && results.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">🔍</span>
        <p>No results found for <strong>"{query}"</strong></p>
        <p className="empty-hint">Try a different spelling or another song name.</p>
      </div>
    );
  }

  /* ── Results ── */
  if (results && results.length > 0) {
    return (
      <div className="results-section">
        <p className="results-label">
          Top <strong>{results.length}</strong> recommendations for <em>"{query}"</em>
        </p>
        <div className="cards-grid">
          {results.map((song, i) => (
            <SongCard key={`${song.track}-${song.artist}-${i}`} song={song} index={i} />
          ))}
        </div>
      </div>
    );
  }

  return null;
}
