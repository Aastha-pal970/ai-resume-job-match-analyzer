const sampleJob =
  "Software Engineer Intern role requiring Python, React, SQL, REST API development, Git, data structures, algorithms, and basic cloud deployment experience. Candidate should build clean UI, integrate backend APIs, and write maintainable code.";

const resumeFile = document.querySelector("#resumeFile");
const uploadLabel = document.querySelector("#uploadLabel");
const resumeText = document.querySelector("#resumeText");
const jobDescription = document.querySelector("#jobDescription");
const analyzeButton = document.querySelector("#analyzeButton");
const message = document.querySelector("#message");
const results = document.querySelector("#results");

jobDescription.value = sampleJob;

resumeFile.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  uploadLabel.textContent = "Reading PDF...";
  hideMessage();

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("/upload-resume", {
      method: "POST",
      body: formData,
    });
    const data = await readResponse(response);
    resumeText.value = data.text;
    uploadLabel.textContent = data.filename;
  } catch (error) {
    uploadLabel.textContent = "Choose resume PDF";
    showMessage(error.message);
  }
});

analyzeButton.addEventListener("click", async () => {
  if (resumeText.value.trim().length < 20 || jobDescription.value.trim().length < 20) {
    showMessage("Add resume text and job description before analyzing.");
    return;
  }

  analyzeButton.disabled = true;
  analyzeButton.textContent = "Analyzing...";
  hideMessage();

  try {
    const response = await fetch("/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resume_text: resumeText.value,
        job_description: jobDescription.value,
        job_title: "Software Engineer Intern",
      }),
    });

    const data = await readResponse(response);
    renderResults(data);
  } catch (error) {
    showMessage(error.message);
  } finally {
    analyzeButton.disabled = false;
    analyzeButton.textContent = "Analyze Match";
  }
});

async function readResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Something went wrong.");
  }
  return data;
}

function renderResults(data) {
  const scoreTone = data.match_score >= 75 ? "strong" : data.match_score >= 55 ? "medium" : "weak";
  const scoreCard = document.querySelector("#scoreCard");
  scoreCard.className = `score-card ${scoreTone}`;

  document.querySelector("#matchScore").textContent = `${data.match_score}%`;
  document.querySelector("#summary").textContent = data.summary;
  document.querySelector("#scoreNumber").textContent = Math.round(data.match_score);
  document.querySelector("#scoreRing").style.setProperty("--score", `${data.match_score * 3.6}deg`);
  document.querySelector("#semanticScore").textContent = `${data.semantic_score}%`;
  document.querySelector("#skillScore").textContent = `${data.skill_score}%`;
  document.querySelector("#matchedCount").textContent = data.matched_skills.length;
  document.querySelector("#missingCount").textContent = data.missing_skills.length;

  renderChips("#matchedSkills", data.matched_skills, "matched", "No direct matches found.");
  renderChips("#missingSkills", data.missing_skills, "missing", "No important missing skills detected.");

  const suggestions = document.querySelector("#suggestions");
  suggestions.innerHTML = "";
  data.suggestions.forEach((suggestion) => {
    const item = document.createElement("li");
    item.textContent = suggestion;
    suggestions.appendChild(item);
  });

  results.classList.remove("hidden");
}

function renderChips(selector, skills, tone, emptyText) {
  const container = document.querySelector(selector);
  container.innerHTML = "";

  if (!skills.length) {
    const empty = document.createElement("p");
    empty.textContent = emptyText;
    container.appendChild(empty);
    return;
  }

  skills.forEach((skill) => {
    const chip = document.createElement("span");
    chip.className = `chip ${tone}`;
    chip.textContent = skill;
    container.appendChild(chip);
  });
}

function showMessage(text) {
  message.textContent = text;
  message.className = "message error";
}

function hideMessage() {
  message.className = "message hidden";
  message.textContent = "";
}
