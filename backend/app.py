from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from model import recommend_cosine, search_tracks

app = FastAPI(
    title="Music Recommendation API",
    description="Cosine-similarity based music recommendations powered by Spotify audio features.",
    version="1.0.0",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


# ─── Health check ─────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "ok", "message": "Music Recommendation API is running"}


# ─── Recommendation endpoint ──────────────────────────────────────────────────
@app.get("/recommend")
def get_recommendations(song: str = Query(..., description="Song name to get recommendations for")):
    """
    Returns top-10 similar songs based on cosine similarity of audio features.
    """
    if not song.strip():
        raise HTTPException(status_code=400, detail="Song name cannot be empty.")

    results = recommend_cosine(song.strip())

    if not results:
        return {"recommendations": [], "message": f"No song named '{song}' found in the dataset."}

    return {"recommendations": results, "query": song}


# ─── Search / Autocomplete endpoint ──────────────────────────────────────────
@app.get("/search")
def search(q: str = Query(..., description="Search query for autocomplete")):
    """
    Returns up to 10 tracks matching the query string (autocomplete).
    """
    if not q.strip():
        return {"results": []}

    results = search_tracks(q.strip())
    return {"results": results}


# ─── Run directly ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8001, reload=True)
