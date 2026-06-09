from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    resume_text: str = Field(..., min_length=20)
    job_description: str = Field(..., min_length=20)
    job_title: str | None = None


class AnalyzeResponse(BaseModel):
    match_score: float
    semantic_score: float
    skill_score: float
    resume_skills: list[str]
    job_skills: list[str]
    matched_skills: list[str]
    missing_skills: list[str]
    suggestions: list[str]
    summary: str


class ResumeUploadResponse(BaseModel):
    filename: str
    text: str
    preview: str
