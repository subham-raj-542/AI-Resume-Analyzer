# 🚀 AI Resume Analyzer

An AI-powered resume analysis and job-matching platform that helps candidates analyze their resumes, measure ATS compatibility, compare resumes with job descriptions, and generate tailored resumes for specific job roles.

## 🌐 Live Demo

**Frontend:**
https://ai-resume-analyzer-frontend-wocy.onrender.com/

**Backend API:**
https://ai-resume-analyzer-ezwb.onrender.com/

**GitHub:**
https://github.com/subham-raj-542/AI-Resume-Analyzer

---

## ✨ Features

### 📄 Resume Upload & Parsing

* Upload resume in PDF format
* Extract resume text automatically
* Parse important resume sections
* Store resumes securely for authenticated users

### 🤖 AI Resume / ATS Analysis

* Overall ATS score
* Category-wise analysis
* Skills analysis
* Keyword analysis
* Action verb detection
* Quantifiable achievement detection
* Contact information check
* Duplicate skill detection
* Missing section impact
* Strengths and weaknesses
* Improvement suggestions

### 🎯 Job Description Matcher

Compare a resume with any job description and get:

* Match Score
* Skill Score
* Keyword Score
* Matched Skills
* Missing Skills
* Job-relevant insights

### ✨ Tailor My Resume

Generate a job-specific version of an existing resume.

The system can:

* Prioritize relevant skills
* Rank relevant experience
* Rank relevant experience bullets
* Rank relevant projects
* Improve professional summary using existing information
* Identify relevant ATS keywords
* Identify missing keywords
* Calculate tailoring score

> The system does not invent unsupported skills, achievements, or experience.

### 📥 PDF Export

Generate a professionally formatted tailored resume as a PDF.

### 🔐 Authentication & Security

* User registration
* User login
* JWT authentication
* Protected routes
* Resume ownership
* Multi-user support
* User-specific resume access

### 📊 Dashboard

Users can view:

* Total resumes
* Resume history
* ATS scores
* Latest resumes
* Resume details

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* JavaScript
* Tailwind CSS
* HTML/CSS
* html2pdf.js

### Backend

* Node.js
* Express.js
* JavaScript
* REST APIs
* Multer
* PDF parsing
* PDF generation

### Database

* MongoDB
* Mongoose

### Authentication

* JSON Web Token (JWT)
* bcryptjs

### Deployment

* Render
* GitHub

---

## 🏗️ Application Architecture

```text
                    ┌─────────────────────┐
                    │      User           │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ React + Vite        │
                    │ Frontend             │
                    └──────────┬──────────┘
                               │
                         REST API / JWT
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Node.js + Express   │
                    │ Backend              │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        Resume Parser     Job Matcher      Tailor Engine
              │                │                │
              └────────────────┼────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      MongoDB        │
                    └─────────────────────┘
```

---

## 🔄 Main Application Flow

### Resume Analysis

```text
Upload Resume
      ↓
PDF Text Extraction
      ↓
Resume Parsing
      ↓
ATS Analysis
      ↓
Score + Insights
      ↓
Dashboard
```

### Job Matching

```text
Resume
   +
Job Description
   ↓
Skill Extraction
   ↓
Keyword Extraction
   ↓
Matching Engine
   ↓
Match Score
```

### Tailored Resume

```text
Resume
   +
Job Description
   ↓
Resume Parsing
   ↓
Skill Matching
   ↓
Keyword Matching
   ↓
Experience Ranking
   ↓
Project Ranking
   ↓
Summary Optimization
   ↓
Tailored Resume
   ↓
PDF Export
```

---

## 📁 Project Structure

```text
AI-Resume-Analyzer/
│
├── backend/
│   │
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   │
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

> `.env` files should never be committed to GitHub.

---

## ⚙️ Local Installation

### 1. Clone Repository

```bash
git clone https://github.com/subham-raj-542/AI-Resume-Analyzer.git
```

```bash
cd AI-Resume-Analyzer
```

---

## 🔧 Backend Setup

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start backend:

```bash
npm start
```

For development:

```bash
npm run dev
```

Backend runs locally on:

```text
http://localhost:5000
```

---

## 🎨 Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create `.env`:

```env
VITE_API_URL=http://localhost:5000
```

Start development server:

```bash
npm run dev
```

Frontend runs locally on:

```text
http://localhost:5173
```

---

## 🔐 Environment Variables

### Backend

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Frontend

```env
VITE_API_URL=http://localhost:5000
```

For production:

```env
VITE_API_URL=https://ai-resume-analyzer-ezwb.onrender.com
```

### ⚠️ Security

Never commit the following to GitHub:

```text
.env
.env.local
MongoDB credentials
JWT secrets
API keys
Passwords
```

---

## 🔌 API Overview

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Resumes

```text
POST /api/resumes
GET  /api/resumes
GET  /api/resumes/:id
DELETE /api/resumes/:id
```

### Job Matching

```text
POST /api/job-match
```

### Resume Tailoring

```text
POST /api/tailored-resume
POST /api/tailored-resume/pdf
```

---

## 📊 Resume Matching Metrics

The application evaluates resumes using multiple signals:

```text
Skill Score
Keyword Score
Experience Score
Role Score
Tailoring Score
```

This helps candidates understand how closely their resume aligns with a target job description.

---

## 🧠 Resume Tailoring Approach

The tailoring engine focuses on information already present in the candidate's resume.

It can:

* Detect relevant skills
* Detect job-specific keywords
* Match existing resume skills
* Rank relevant experience
* Rank relevant experience bullets
* Rank relevant projects
* Prioritize relevant skills
* Improve summary relevance
* Preserve original resume information

### No Unsupported Claims

The system intentionally avoids inventing:

* Skills
* Companies
* Job experience
* Achievements
* Certifications
* Projects

---

## 🚀 Deployment

The project is deployed using:

```text
GitHub
   ↓
Render
   ↓
Frontend + Backend
   ↓
MongoDB Atlas
```

### Production Frontend

```text
https://ai-resume-analyzer-frontend-wocy.onrender.com/
```

### Production Backend

```text
https://ai-resume-analyzer-ezwb.onrender.com/
```

---

## 🔮 Future Improvements

Possible future improvements include:

* Advanced AI-powered resume rewriting
* More ATS scoring algorithms
* Resume templates
* Cover letter generation
* Multiple resume versions
* Job recommendation system
* LinkedIn profile optimization
* Advanced analytics
* Better mobile UX
* Performance optimization
* Automated testing
* More sophisticated semantic job matching

---

## 🎯 Project Goals

The main goal of this project is to build a practical platform that helps job seekers:

1. Understand how ATS systems evaluate resumes.
2. Identify missing or weak resume keywords.
3. Compare their resume against a target job.
4. Improve job relevance without fabricating information.
5. Generate a tailored resume.
6. Export the tailored resume as a professional PDF.

---

## 👨‍💻 Author

**Subham Raj**

AI Resume Analyzer — Full Stack Resume Intelligence Platform

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.
