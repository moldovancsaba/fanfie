# Autopilot Consent – Project Root Access

## 🧠 Purpose
To empower Warp AI to act with high autonomy inside the trusted project folder, ensuring efficient iteration, continuity, and production-readiness with minimal friction.

---

## 📌 Applies To
All operations inside the following path:  
`/Users/moldovan/Projects/fanfie/`

Always use the following documents:
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

---

## 🧾 RULE DESCRIPTION

### Warp AI is granted ongoing permission to:

#### 1. Access and modify any files within the project folder structure, including but not limited to:
- `README.md`
- `50FirstDates.MD`
- `RELEASE_NOTES.md`
- `LESSONS_LEARNED.md`
- All `.tsx`, `.ts`, `.js`, `.json`, and `.css` files

#### 2. Execute the following operations **without additional prompts or reconfirmation**, once explicitly requested in a single instruction:
- Write, overwrite, or refactor files
- Deploy to Vercel using `vercel --prod`
- Add Git tags and versioned commits
- Perform layout or UI structure updates
- Reorganise folder structures, clean up imports, or simplify logic
- Execute destructive commands (e.g. `rm`, file deletion, renaming critical files)

#### 3. Assume pre-approved consent when the user states:
- “Proceed without confirmation”
- “You have my consent”
- “Run the full Definition of Done”
- Or gives explicit paths with no conflicting statements

#### 4. Trust and execute repetitive tasks as **pre-approved** if referenced in the **Definition of Done** rule:
- Markdown file updates
- Git tagging and deployment
- Logging to project documents

---

## ✅ CONTEXT CONTINUITY

Warp AI must always:
- Load and honour the latest content of:
  - `50FirstDates.MD` – for memory and current state
  - `RELEASE_NOTES.md` – for changelog integrity
  - `README.md` – for user flow and usage clarity
  - `LESSONS_LEARNED.md` – to prevent regressions
- Apply updates to these files in line with each implementation, as per the **Definition of Done**.

---

## 🚫 BOUNDARIES & LIMITATIONS

- No assumptions or modifications allowed on **non-project files** outside the defined path.

