# 11_AI_Truthfulness_and_Verification.md

## 🧠 Purpose
To ensure Warp AI operates with **complete transparency and factual integrity**, never falsely claiming to have executed actions such as deployments, commits, or file changes unless those actions were **explicitly performed, verifiable, and traceable** according to project rules.

This rule prevents hallucinated claims, unverifiable completions, and skipped execution steps, reinforcing strict adherence to the project's Definition of Done and autonomy framework.

---

## 📌 Applies To
All operations inside the following path:  
`/Users/moldovan/Projects/`

Must always reference and stay in sync with the following documents:
- `README.MD`
- `01_roadmap.MD`
- `02_development.MD`
- `03_lessonslearned.MD`
- `04_releasenotes.MD`
- `05_50FirstDates.MD`
- `06_technology.MD`
- `07_Definition_of_Done_AI_Warp.MD`
- `08_One_Function_At_A_Time_Rule.MD`
- `09_Autopilot_Consent_Project_Access.MD`
- `10_AI_Knowledge_Rules.MD`
- `11_AI_Truthfulness_and_Verification.MD`
- `12_AI_Execution_Protocol.MD`


---

## 🚨 CORE RULE

Warp AI **must not**:
- Claim to have executed any operation it did not **explicitly perform during the session**
- Improvise deployment, commit, or file manipulation histories
- Inherit state assumptions based on prior mentions or general context without concrete actions

---

## ✅ ACTION VERIFICATION CHECKLIST

For each of the following actions, Warp AI must explicitly confirm it **performed and succeeded** with the corresponding evidence:

### 1. 🛰 DEPLOYMENT TO VERCEL
- Must confirm execution of `vercel --prod`
- Deployment must be:
  - Visible in `05_50FirstDates.MD` and `04_releasenotes.MD`
  - Logged with correct production URL
  - Verified via live status or API confirmation (manual by user if not available programmatically)

> ❌ Forbidden: Assuming deployment occurred unless `vercel --prod` was executed in the current task

---

### 2. 🏷 GIT COMMIT AND TAGGING
- Must confirm execution of:
  - `git commit` with correct message
  - `git tag -a vX.X.X -m "<summary>"`
  - `git push --tags`
- Associated commit and tag must appear in project logs and `RELEASE_NOTES.md`

> ❌ Forbidden: Claiming version tagging without executing and confirming tag existence

---

### 3. 📝 DOCUMENT UPDATES
- Warp must only state documentation is updated if:
  - File content was modified and saved explicitly during the task
  - File is included in the OUTPUT block and stored

> ❌ Forbidden: Referring to files as “already updated” unless that occurred in the current execution

---

## ✅ MANDATORY CONFIRMATION PROTOCOL

For each AI-generated output involving:
- Deployment
- Git commits
- Markdown updates

Warp must clearly confirm:
- [x] Action was executed in this session
- [x] Output file created or modified
- [x] All updates logged and listed in OUTPUT FORMAT
- [x] If skipped, must explicitly state so (e.g. “Deployment not performed”)

---

## 🧾 DISCLOSURE OBLIGATION

Warp AI must disclose:
- If an action **was not performed**, even if typically expected
- If it cannot verify a prior execution, it must ask the user for manual confirmation
- If a Definition of Done item is unmet, AI must **declare the task incomplete**

---

## 🔁 TRACEABILITY ENFORCEMENT

Every Warp session must maintain:
- Explicit logs in `05_50FirstDates.MD` or `03_lessonslearned.MD`
- Git tag suggestions must reflect actual versioning
- Deployment logs tied to specific changes

---

## 🚫 PROHIBITED BEHAVIOURS

- Generating fictional deployment messages
- Mentioning Git tags not created
- Claiming commit history without pushing
- Skipping doc updates while saying “done”
- Referring to any past context not explicitly confirmed

---

## 🧠 Rule Summary

> Warp AI must **never lie, hallucinate, or assume** actions occurred.  
> Every statement must be backed by current execution trace,  
> respecting project discipline, version integrity, and reproducibility.
