# Personal Blogging System (Group Project Portfolio Copy)

This repository is a personal portfolio copy of a group project completed at the University of Auckland. The original project was **Final Project - Personal Blogging System - Group 8**.

This project was developed collaboratively by the whole team. I am sharing this copy for portfolio purposes only, and the contribution statement in this repository refers only to the parts I personally implemented or documented in my individual report. I do not claim sole authorship of the full project.

## My Contributions

In this full-stack blogging system, my main contributions focused on core user account features across both the backend and frontend.

### Backend Development - User Account Features
- Implemented the main backend logic for user account features, including user creation, profile updates, account deletion, username validation, and returning user information and avatar data.
- Wrote the related Express routes and helper functions for these user-account features.
- Implemented database updates and password processing for user account workflows.

### Frontend Development - Registration and Profile Pages
- Built the user registration page and profile page in SvelteKit.
- Implemented full form validation, including username checks, password rules, email format checks, and confirmation matching.
- Added real-time username validation with debounce to reduce unnecessary API calls.
- Built avatar selection with preview and keyboard accessibility support.
- Added inline validation messages and integrated frontend forms with backend APIs.
- Implemented editable profile flows, save/return actions, and account deletion behavior.

### Teamwide and Supporting Contributions
- Collected, revised, and combined team API documentation into a unified project reference.
- Wrote the risk mitigation strategy plan for the team.
- Acted as a main tester, identifying major bugs and multiple smaller logic issues before final submission.
- Helped define teammate backup roles to improve collaboration efficiency.
- Suggested UI improvements, including page colors, button styles, and background image ideas.

### Applied Course Concepts
- Applied HTML forms, CSS layout techniques such as Flexbox, JavaScript events, Svelte reactivity, and REST-style API integration in the implementation.
- Extended classroom learning through practical use of validation logic, debounced input handling, reusable frontend structures, and component-based UI design.

## Highlights

## Project Management
Each file has a dedicated maintainer, and only the assignee is allowed to modify it, completely avoiding merge conflicts and team interference.

## Architecture Features
- Unified access control via a global authentication filter
- All SQL operations are centrally managed in `sql-util.js`
- The frontend calls the backend uniformly through `api.js`
- All backend API parameters are validated using Yup

## Feature Highlights
- Session Expiry Handling: After session expiry, any operation redirects to the login page and returns to the original page after re-login
- Global Login Redirection: From any page, login redirects back to the original page
- Auto Tag Suggestion: NLP-based auto tag recommendations when creating new articles
- One-Click Mark All as Read for notifications
- Auto-Refreshing UI Panel for notifications
- Follow List Expandable directly from user profile, with inline unfollow support
- Multi-level nested comment system with reply threading
- @Mentions Highlight: Only valid usernames are highlighted, preventing mis-tagging
- Smart Comment Display for each article:
  - shows top-level comments and earliest reply
  - allows expanding/collapsing child replies
  - supports toggling comment threads and hiding full comment blocks
- All three notification types support clickable redirection: @mention, reply, and author notification

## 1. Development Environment Requirements

| Tool | Version (Recommended) | Purpose |
|------|------------------------|---------|
| Node.js | ≥ 18.x | Required for backend/frontend |
| npm | Comes with Node.js | Dependency management |
| VSCode | Latest | Recommended development editor |

## 2. Installation Instructions

### 2.1 Backend Setup
```bash
cd backend
npm install
npm install bcryptjs
npm install uuid
npm install nlp
npm install yup

### 2.2 Frontend Setup
cd frontend
npm install

## 3. Run in Development Mode
### 3.1 Start Backend Server 
http://localhost:3000

cd backend
npm run dev

### 3.2 Start Frontend Server 
http://localhost:5173

cd frontend
npm run dev

Access the site via: http://localhost:5173

### 3.3 Start Admin Panel (Java Swing)
ictgradschool.industry.administrator.Main

## 4. Test Accounts (For Feature Testing)
User Role	    Username   Password
Admin	        admin123   123456Aa
Regular User	annie88	   123456Aa

## 5. Project Structure (Simplified Overview)
```bash
group-8-s1-25/
│
├── backend/                # Express backend with API logic
│   ├── src/                # Source code (routes, services, DAO)
│   ├── uploads/            # Uploaded user content
│   ├── public/images/      # Static image assets
│   └── project-database.db # SQLite DB file
│
├── frontend/               # SvelteKit frontend app
│   ├── src/                # Routes, components, API handlers
│   ├── static/             # Frontend static assets
│   └── app.html            # HTML shell
│
├── app/                    # Reserved shared modules
├── README.md               # Documentation