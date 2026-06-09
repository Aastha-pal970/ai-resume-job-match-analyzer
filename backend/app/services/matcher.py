from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def semantic_similarity(resume_text: str, job_description: str) -> float:
    vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2), max_features=4000)
    matrix = vectorizer.fit_transform([resume_text, job_description])
    score = cosine_similarity(matrix[0], matrix[1])[0][0]
    return round(float(score) * 100, 2)


def skill_match_score(resume_skills: list[str], job_skills: list[str]) -> float:
    if not job_skills:
        return 0.0

    matched = set(resume_skills) & set(job_skills)
    return round((len(matched) / len(set(job_skills))) * 100, 2)


def final_score(semantic_score: float, skill_score: float) -> float:
    return round((semantic_score * 0.55) + (skill_score * 0.45), 2)
