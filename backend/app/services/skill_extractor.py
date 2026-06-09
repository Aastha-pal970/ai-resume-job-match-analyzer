import re

from app.skills import ALIASES, SKILLS


def extract_skills(text: str) -> list[str]:
    normalized = f" {text.lower()} "
    normalized = normalized.replace("/", " ").replace("-", " ")
    found: set[str] = set()

    for alias, canonical in ALIASES.items():
        if _contains_phrase(normalized, alias):
            found.add(canonical)

    for skill in SKILLS:
        if _contains_phrase(normalized, skill):
            found.add(skill)

    return sorted(found)


def _contains_phrase(text: str, phrase: str) -> bool:
    escaped = re.escape(phrase.lower()).replace("\\ ", r"[\s\-.]+")
    return bool(re.search(rf"(?<![a-z0-9+#]){escaped}(?![a-z0-9+#])", text))
