import { useState } from "react";
import SearchBar from "./components/SearchBar";
import Results from "./components/Results";
import { getRecommendations } from "./api";

export default function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentQuery, setCurrentQuery] = useState("");

  async function handleSearch(song) {
    if (!song.trim()) return;
    setCurrentQuery(song);
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const data = await getRecommendations(song);
      setResults(data.recommendations || []);
    } catch (err) {
      setError("Could not connect to the server. Make sure the backend is running on port 8000.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      {/* ── Animated background orbs ── */}
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <div className="bg-orb orb-3" />

      {/* ── Header ── */}
      <header className="hero">
        <div className="logo-row">
          <span className="logo-icon">🎧</span>
          <h1 className="logo-text">Tuni<span className="logo-accent">fy</span></h1>
        </div>
        <p className="hero-tagline">
          Discover music you’ll actually love.
        </p>

        <SearchBar onSearch={handleSearch} />

        {/* <div className="feature-pills">
          <span className="pill">🎵 50k+ Tracks</span>
          <span className="pill">⚡ Instant Results</span>
          <span className="pill">🌍 Multi-Language</span>
          <span className="pill">🔗 Spotify Links</span>
        </div> */}
      </header>

      {/* ── Results ── */}
      <main className="main-content">
        <Results
          results={results}
          loading={loading}
          error={error}
          query={currentQuery}
        />

        {/* ── Landing state hint ── */}
        {!loading && !error && results === null && (
          <div className="landing-hint">
            <div className="hint-cards">
              {["Calling", "Superlove", "In Pieces", "Magic", "Pressure"].map((s) => (
                <button
                  key={s}
                  className="hint-chip"
                  onClick={() => handleSearch(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="hint-label">Try one of these →</p>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        {/* <p>Built with FastAPI + React · Cosine Similarity on Spotify Audio Features</p> */}
      </footer>
    </div>
  );
}
