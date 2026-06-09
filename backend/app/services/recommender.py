ROLE_HINTS = {
    "react": "Add a React project with components, state management, API integration, and deployment.",
    "docker": "Containerize one backend project and mention Dockerfile, image build, and deployment workflow.",
    "sql": "Add measurable database work such as schema design, joins, indexes, or query optimization.",
    "machine learning": "Mention the dataset, model, evaluation metric, and business outcome of an ML project.",
    "aws": "Deploy a project on AWS and mention the exact services used.",
    "fastapi": "Build or expose REST APIs with validation, error handling, and documentation.",
    "cybersecurity": "Add a security-focused project covering detection, logging, alerts, or secure authentication.",
}


def build_suggestions(missing_skills: list[str], matched_skills: list[str], score: float) -> list[str]:
    suggestions: list[str] = []

    if score < 45:
        suggestions.append("Rewrite the resume summary to directly mention the target role and strongest matching skills.")
    elif score < 70:
        suggestions.append("Add two project bullets that use the same keywords and tools found in the job description.")
    else:
        suggestions.append("Your resume is close to the job description. Improve impact by adding metrics to project bullets.")

    for skill in missing_skills[:5]:
        suggestions.append(ROLE_HINTS.get(skill, f"Add a project, certification, or bullet that demonstrates practical use of {skill}."))

    if matched_skills:
        suggestions.append(f"Move strong matching skills near the top: {', '.join(matched_skills[:6])}.")

    suggestions.append("Use action verbs and numbers, for example: built, optimized, deployed, reduced latency, improved accuracy.")
    return suggestions[:7]


def build_summary(score: float, matched_skills: list[str], missing_skills: list[str]) -> str:
    if score >= 75:
        verdict = "Strong match"
    elif score >= 55:
        verdict = "Moderate match"
    else:
        verdict = "Needs improvement"

    matched = len(matched_skills)
    missing = len(missing_skills)
    return f"{verdict}: {matched} required skills matched and {missing} important skills missing."
