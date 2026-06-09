# AI Resume + Job Match Analyzer

A placement-focused full-stack project for B.Tech CSE students. It extracts text from a resume PDF, compares it with a job description, calculates a match score, finds missing skills, and gives improvement suggestions.

## Tech Stack

- Frontend: FastAPI-served HTML/CSS/JS, plus optional React + Vite version
- Backend: FastAPI + Python
- NLP: TF-IDF cosine similarity with optional Sentence Transformers support
- Resume parsing: PyMuPDF

## Quick Run

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Open:

```text
http://localhost:8000
```

## Optional React Frontend

If Node.js and npm are installed, you can also run the React version:

```bash
cd frontend
npm install
npm run dev
```

Open the frontend URL shown by Vite, usually `http://localhost:5173`. Keep the backend running on `http://localhost:8000`.

## Resume Project Line

Developed an AI-powered Resume and Job Match Analyzer that extracts resume text from PDFs, compares candidate profiles with job descriptions using NLP similarity scoring, identifies missing skills, and generates personalized improvement suggestions using React, FastAPI, Python, and scikit-learn.
