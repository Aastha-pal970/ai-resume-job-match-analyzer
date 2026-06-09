from pathlib import Path

from fastapi import FastAPI, UploadFile
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.models import AnalyzeRequest, AnalyzeResponse, ResumeUploadResponse
from app.services.matcher import final_score, semantic_similarity, skill_match_score
from app.services.recommender import build_suggestions, build_summary
from app.services.resume_parser import extract_text_from_pdf, save_upload
from app.services.skill_extractor import extract_skills


BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
STATIC_DIR = BASE_DIR / "static"

app = FastAPI(
    title="AI Resume + Job Match Analyzer",
    description="Analyze resume fit against a job description using NLP scoring and skill gap detection.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/", include_in_schema=False)
def index() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/upload-resume", response_model=ResumeUploadResponse)
async def upload_resume(file: UploadFile) -> ResumeUploadResponse:
    path = await save_upload(file, UPLOAD_DIR)
    text = extract_text_from_pdf(path)
    return ResumeUploadResponse(filename=path.name, text=text, preview=text[:900])


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(payload: AnalyzeRequest) -> AnalyzeResponse:
    resume_skills = extract_skills(payload.resume_text)
    job_skills = extract_skills(payload.job_description)
    matched_skills = sorted(set(resume_skills) & set(job_skills))
    missing_skills = sorted(set(job_skills) - set(resume_skills))

    semantic = semantic_similarity(payload.resume_text, payload.job_description)
    skills = skill_match_score(resume_skills, job_skills)
    score = final_score(semantic, skills)

    return AnalyzeResponse(
        match_score=score,
        semantic_score=semantic,
        skill_score=skills,
        resume_skills=resume_skills,
        job_skills=job_skills,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        suggestions=build_suggestions(missing_skills, matched_skills, score),
        summary=build_summary(score, matched_skills, missing_skills),
    )
