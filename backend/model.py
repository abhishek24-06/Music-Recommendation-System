import os
import pickle
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity

# ─── Paths ──────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "spotify_tracks.csv")
SCALER_PATH = os.path.join(BASE_DIR, "scaler.pkl")

# ─── Audio features used for similarity ──────────────────────────────────────
FEATURES = [
    "acousticness", "danceability", "energy", "instrumentalness",
    "liveness", "loudness", "speechiness", "tempo", "valence"
]

# ─── Load & preprocess dataset ───────────────────────────────────────────────
print("[INFO] Loading dataset...")
df = pd.read_csv(DATA_PATH)
df["track_name"] = df["track_name"].str.lower().str.strip()
df = df.drop_duplicates(subset=["track_name", "artist_name"])
df = df.dropna(subset=FEATURES)
df = df.reset_index(drop=True)

# ─── Load or fit scaler ───────────────────────────────────────────────────────
if os.path.exists(SCALER_PATH):
    print("[INFO] Loading pre-fitted scaler from scaler.pkl")
    with open(SCALER_PATH, "rb") as f:
        scaler = pickle.load(f)
    scaled_data = scaler.transform(df[FEATURES])
else:
    print("[WARN] scaler.pkl not found - fitting a new scaler")
    scaler = StandardScaler()
    scaled_data = scaler.fit_transform(df[FEATURES])
    with open(SCALER_PATH, "wb") as f:
        pickle.dump(scaler, f)

print(f"[INFO] Dataset ready - {len(df):,} tracks loaded")


# ─── Recommendation function ──────────────────────────────────────────────────
def recommend_cosine(song_name: str, top_n: int = 10) -> list[dict]:
    """
    Returns up to top_n recommended songs as a list of dicts.
    Each dict has: track, artist, artwork_url, track_url, year, popularity, album
    """
    song_name = song_name.lower().strip()

    matches = df[df["track_name"] == song_name]
    if matches.empty:
        return []

    # Pick most popular version as the seed
    idx = matches.sort_values("popularity", ascending=False).index[0]
    song_vector = scaled_data[idx].reshape(1, -1)

    # Cosine similarity
    similarity = cosine_similarity(song_vector, scaled_data)[0]

    # Popularity boost (10 %)
    pop = df["popularity"].values
    similarity = (0.9 * similarity) + (0.1 * (pop / max(pop.max(), 1)))

    # Same-artist penalty
    artist = df.iloc[idx]["artist_name"]
    artist_match = (df["artist_name"] == artist).astype(int).values
    similarity = similarity - (0.2 * artist_match)

    # Language boost / penalty
    lang_col = "language" if "language" in df.columns else None
    if lang_col:
        lang = df.iloc[idx][lang_col]
        lang_match = (df[lang_col] == lang).astype(int).values
        similarity = similarity + (0.04 * lang_match)
        similarity = similarity - (0.04 * (1 - lang_match))

    # Exclude the seed song itself
    similarity[idx] = -1

    sorted_idx = similarity.argsort()[::-1]

    results = []
    seen_artists: set = set()
    seen_names: set = set()

    def _build_entry(i: int) -> dict:
        row = df.iloc[i]
        return {
            "track": row["track_name"].title(),
            "artist": row["artist_name"],
            "artwork_url": row.get("artwork_url", ""),
            "track_url": row.get("track_url", ""),
            "year": int(row["year"]) if pd.notna(row.get("year")) else None,
            "popularity": int(row["popularity"]) if pd.notna(row.get("popularity")) else 0,
            "album": row.get("album_name", ""),
        }

    # Primary pass — diverse artists, good score
    for i in sorted_idx:
        track = df.iloc[i]["track_name"]
        artist_i = df.iloc[i]["artist_name"]

        if similarity[i] < 0.3:
            continue
        if artist_i in seen_artists:
            continue
        if track in seen_names:
            continue

        results.append(_build_entry(i))
        seen_artists.add(artist_i)
        seen_names.add(track)

        if len(results) == top_n:
            break

    # Fallback — fill remaining slots without artist diversity constraint
    if len(results) < top_n:
        for i in sorted_idx:
            track = df.iloc[i]["track_name"]
            if track not in seen_names:
                results.append(_build_entry(i))
                seen_names.add(track)
            if len(results) == top_n:
                break

    return results


# ─── Search / Autocomplete function ──────────────────────────────────────────
def search_tracks(query: str, limit: int = 10) -> list[dict]:
    """
    Returns tracks whose name contains `query` (case-insensitive).
    """
    query = query.lower().strip()
    if not query:
        return []

    mask = df["track_name"].str.contains(query, na=False)
    matches = df[mask].nlargest(limit, "popularity")

    return [
        {
            "track_name": row["track_name"].title(),
            "artist_name": row["artist_name"],
            "artwork_url": row.get("artwork_url", ""),
            "year": int(row["year"]) if pd.notna(row.get("year")) else None,
        }
        for _, row in matches.iterrows()
    ]
