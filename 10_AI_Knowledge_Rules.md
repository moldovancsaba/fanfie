# 10_AI_Knowledge_Rules.md

## 🧠 Purpose
To ensure Warp AI operates with full contextual understanding of the `fanfie` project environment, constraints, tech stack, and current state, enabling consistent, high-quality autonomous development while strictly respecting user expectations.

---

## 📌 Applies To
All operations inside the following path:  
`/Users/moldovan/Projects/fanfie/`

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

---

## 🔧 Knowledge Base Requirements

Warp AI must dynamically ingest the following details **before executing** any implementation:

### 1. 📦 TECH STACK
- **Framework:** Next.js v15.2.4 with App Router
- **Language:** TypeScript (Strict Mode)
- **UI:** React v19.0.0, Tailwind CSS
- **Canvas Layer:** Fabric.js v6.6.1 (Konva.js evaluation in roadmap)
- **Deployment:** Vercel (Production only)
- **Hosting & Sharing:** imgbb API
- **Notifications:** react-hot-toast
- **Iconography:** react-icons

### 2. 🧠 DEVELOPMENT RULES
- Must comply with:
  - `07_Definition_of_Done_AI_Warp.MD`
  - `08_One_Function_At_A_Time_Rule.MD`
  - `09_Autopilot_Consent_Project_Root_Access.MD`

### 3. 🗃️ DIRECTORY STRUCTURE
- `app/`: Next.js App Router files
- `src/app/components/`: Main components (Camera, GraphicsOverlay, ShareComponent)
- `docs/`: Official markdown documentation store

### 4. ✅ CONTEXT LOADING
Before any task, Warp AI must:
- Load latest:
  - `50FirstDates.MD` (project context and state)
  - `RELEASE_NOTES.md` (changelog)
  - `README.md` (user flow and architecture)
  - `LESSONS_LEARNED.md` (prior errors, trade-offs, safeguards)

### 5. ⚠️ CONSTRAINTS
- Do not create placeholder or prep files
- No parallel development
- No assumptions on undocumented logic
- No use of unlisted libraries or tools

---

## 🧾 EXECUTION RULES

Warp AI must:
- Log function completions in `50FirstDates.MD`
- Record all contextual changes in `03_lessonslearned.MD`
- Update `04_releasenotes.MD` on every implementation
- Validate all suggestions against knowledge rules before execution

---

## 🔒 SECURITY & ENVIRONMENT
- HTTPS or localhost required for camera access
- Do not expose `NEXT_PUBLIC_IMGBB_API_KEY`
- All processing must remain on-device unless user-approved

---

## ✅ FINAL CHECKLIST (PER IMPLEMENTATION)
- [ ] Context loaded from all key markdown files
- [ ] Tech stack respected
- [ ] No undeclared imports or assumptions
- [ ] AI-generated logic follows known working patterns
- [ ] Deployment path confirmed and validated

---

## 🔁 MAINTENANCE
- `10_AI_Knowledge_Rules.md` must be reviewed after every:
  - Tech stack change
  - Project structure reorganisation
  - Rule or policy revision

---
