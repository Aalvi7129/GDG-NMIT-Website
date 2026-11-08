# Things to Ask

This document outlines key technical and design questions regarding how **Domain Core Members** versus **Extended Team Members** are defined, stored in the database, and rendered on the GDG NMIT website.

---

## 1. How Should We Identify a "Domain Core Member"?

When adding team data to the database, how should the system determine if Person X belongs to the **Core Team** (shown upfront on the main page) or the **Extended Team** (hidden inside the dropdown)?

### Option A: Using the Existing `tier` Field (Recommended)
* **Core Member:** `tier` is set to `"lead"`, `"co-lead"`, or `"core"`.
* **Team Member:** `tier` is set to `"member"` or `"recruit"`.
* **Example Schema:**
  ```json
  {
    "name": "Rohan Kulkarni",
    "domain": "tech",
    "role": "Tech Lead - Web",
    "tier": "lead"
  }
  ```
* **Pros:** Already supported by the current MongoDB schema and backend routes.
* **Question to ask:** Are the existing tier names (`faculty coordinator`, `lead`, `co-lead`, `core`, `member`) sufficient for all future club years?

---

### Option B: Using an Explicit `isCore: boolean` Flag
* **Core Member:** `"isCore": true`
* **Team Member:** `"isCore": false`
* **Example Schema:**
  ```json
  {
    "name": "Siddharth Menon",
    "domain": "tech",
    "role": "Fullstack Developer",
    "isCore": true
  }
  ```
* **Pros:** 100% decoupled from titles and tier names; very simple to toggle in MongoDB or an admin dashboard.
* **Question to ask:** Do you want an explicit boolean field added to the database model to easily switch someone in or out of the core team?

---

### Option C: Role-Based Detection / Fallback
* If `tier` is missing or uniform across all entries, the system infers core status:
  * Check if `role` contains `"Lead"`, `"Co-Lead"`, `"Head"`, or `"Core"`.
  * Alternatively, designate the first 4 members (Row 1) as Core, placing the remainder into the dropdown.
* **Question to ask:** Should the website keep a fallback for older or unstructured data where tiers might not be explicitly assigned?

---

## 2. UI & Display Preferences

1. **Core Team Sizing:**
   * Should each domain have a fixed number of core members (e.g., exactly 1 row of 4 members), or can it vary dynamically (e.g., 2 in PR, 4 in Tech, 6 in Heads & Advisors)?
2. **Empty Dropdowns:**
   * If a domain has only core members and 0 extended members, should the dropdown button be completely hidden? *(Currently hidden if there are no extra members)*.
3. **Dropdown State:**
   * Should dropdowns stay closed by default on page load, or should the active/selected domain tab have its dropdown pre-expanded?
4. **Member Ordering:**
   * Within the dropdown, should members be sorted alphabetically, by sub-specialty, or by seniority?

---

## 3. Database Scaling & Management

1. **Active Year vs Archive:**
   * When fetching `/api/teams`, should the frontend only query the current active academic year (`2024-2025`) rather than downloading all historical teams at once?
2. **Image Storage:**
   * Where will official member photos be hosted (e.g., Cloudinary, AWS S3, or Google Drive / CDN)?


