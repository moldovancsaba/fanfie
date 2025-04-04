To ensure every AI-led implementation is production-grade, documented, and traceable, supporting reliable continuation by anyone (AI or human). It formalises a zero-ambiguity workflow for sustainable product development.

Warp AI Rule – Definition of Done 

Applies To: Every AI-generated implementation (feature, fix, enhancement)

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


⸻

🧾 REQUIRED STEPS (all must be fulfilled):
	1.	Implement the requested feature, bug fix, change, or enhancement according to the specification.
	2.	Write and run tests:
	•	Implement unit tests for logic-heavy modules.
	•	Implement automated frontend tests (if applicable).
	•	Perform manual testing to verify expected UI/UX behaviour.
	3.	Verify success locally and in production:
	•	Ensure the implemented feature works as intended.
	•	Ensure it does not break existing functionality.

	4.	Update documentation (all entries must be current):

README.md:
Reflect changes to usage, layout, interface behaviour, or system setup.

05_50FirstDates.MD:
Update the working state and current context so any new AI or developer can continue seamlessly without prior knowledge.

04_releasenotes.MD:
Add a new semantic version entry (e.g. v1.1.1) including:
	•	Summary of the feature or fix
	•	Reason for change
	•	Technical notes or known side effects

03_lessonslearned.MD:
If relevant, document:
	•	Errors encountered and how they were resolved
	•	Design trade-offs or edge cases handled
	•	Future safeguards or validations

	5.	Tag the Git commit with the new version (e.g. git tag -a v1.1.1 -m "Feature: new layout for camera").
	6.	Deploy to Vercel (Production) and confirm the deployment is successful:
	•	Verify the production URL works as intended.
	•	If deployment fails:
	•	Identify root cause.
	•	Fix the issue.
	•	Repeat deployment and verification.
	•	Update LESSONS_LEARNED.md with the incident if applicable.
	7.	Prepare for handover:
	•	Ensure all documentation and code are self-contained and sufficient for AI or human continuation.
	•	Avoid any uncommitted local logic, hidden assumptions, or undocumented changes.

⸻

✅ OUTPUT FORMAT (must include all):
	•	Full, working code (no partial snippets)
	•	Updated versions of:
README.MD
01_roadmap.MD
02_development.MD
03_lessonslearned.MD
04_releasenotes.MD
05_50FirstDates.MD
06_technology.MD
07_Definition_of_Done_AI_Warp.md

	•	README.md
	•	Live deployment on Vercel (tested and validated)
	•	Git version tag suggestion (e.g. v1.1.1)

⸻

🧠 Purpose:

To ensure every AI-led implementation is production-grade, documented, and traceable, supporting reliable continuation by anyone (AI or human). It formalises a zero-ambiguity workflow for sustainable product development.