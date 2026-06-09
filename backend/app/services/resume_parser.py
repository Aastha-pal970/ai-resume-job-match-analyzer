from pathlib import Path

import fitz
from fastapi import HTTPException, UploadFile


ALLOWED_EXTENSIONS = {".pdf"}
MAX_FILE_SIZE = 5 * 1024 * 1024


async def save_upload(file: UploadFile, upload_dir: Path) -> Path:
    extension = Path(file.filename or "").suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only PDF resumes are supported in this version.")

    data = await file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Resume must be smaller than 5 MB.")

    upload_dir.mkdir(parents=True, exist_ok=True)
    safe_name = Path(file.filename or "resume.pdf").name.replace(" ", "_")
    path = upload_dir / safe_name
    path.write_bytes(data)
    return path


def extract_text_from_pdf(path: Path) -> str:
    try:
        document = fitz.open(path)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Could not read the PDF file.") from exc

    pages = [page.get_text("text") for page in document]
    text = "\n".join(page.strip() for page in pages if page.strip())
    if not text:
        raise HTTPException(status_code=400, detail="No readable text found in the PDF.")

    return normalize_text(text)


def normalize_text(text: str) -> str:
    lines = [line.strip() for line in text.replace("\x00", " ").splitlines()]
    return "\n".join(line for line in lines if line)
