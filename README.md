# 🎧 Tunify — Music Recommendation System.

An AI-powered music recommendation system that suggests songs based on audio similarity using cosine similarity on Spotify features.

##  Features
-  Smart song search
-  Cosine similarity recommendations
-  Language-aware filtering
-  Direct Spotify links
-  Modern React UI

## 🛠 Tech Stack
- Frontend: React (Vite)
- Backend: FastAPI
- ML: Cosine Similarity
- Data: Spotify audio features dataset

---

## 🏗️ Project Structure

```
Music Recommendation System/
├── backend/
│   ├── app.py            # FastAPI server (REST API)
│   ├── model.py          # ML logic: cosine similarity + ranking
│   ├── scaler.pkl        # Pre-fitted StandardScaler
│   ├── requirements.txt
│   └── data/
│       └── spotify_tracks.csv
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── api.js
│   │   └── components/
│   │       ├── SearchBar.jsx   # Debounced autocomplete
│   │       └── Results.jsx     # Song cards + Spotify links
│   └── index.html
│
└── README.md
```

---

## ⚙️ Setup & Run

### 1. Backend (FastAPI)

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app:app --reload --port 8000
```

API will be live at → **http://localhost:8000**  
Interactive docs → **http://localhost:8000/docs**

---

### 2. Frontend (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

App will be live at → **http://localhost:5173**

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/recommend?song=<name>` | Top-10 similar songs |
| GET | `/search?query=<text>` | Autocomplete (up to 10 results) |

### Example

```bash
curl "http://localhost:8000/recommend?song=raakh"
curl "http://localhost:8000/search?query=tum"
```

---

## 🧠 Algorithm

1. **Load** `spotify_tracks.csv` → clean + deduplicate
2. **Scale** audio features with `StandardScaler` (pre-fitted `scaler.pkl`)
3. **Cosine Similarity** between seed song vector and all tracks
4. **Rank** with:
   - +10% popularity boost
   - −20% same-artist penalty
   - ±4% language match bonus/penalty
5. **Deduplicate** by artist and track name
6. Return top-10

### Audio Features Used
`acousticness`, `danceability`, `energy`, `instrumentalness`, `liveness`, `loudness`, `speechiness`, `tempo`, `valence`

---

## 🎨 UI Features

- 🌑 Dark glassmorphism theme with animated gradient orbs
- 🔍 Debounced autocomplete with album art thumbnails
- 🃏 Song cards with artwork, popularity bar, year, and Spotify links
- ⏳ Skeleton loading animations
- 📱 Fully responsive

---

## 📦 Dependencies

**Backend:** FastAPI, Uvicorn, Pandas, NumPy, Scikit-learn  
**Frontend:** React 18, Vite, Inter & Outfit fonts (Google Fonts)
