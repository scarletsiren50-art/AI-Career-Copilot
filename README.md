# 🤖 AI Career Copilot

> An AI-powered career intelligence platform that analyzes resumes, identifies skill gaps, matches users with suitable career opportunities, and generates personalized career roadmaps.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://ai-career-copilot-snowy.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://ai-career-copilot-backend-50km.onrender.com/)
[![Frontend](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Backend](https://img.shields.io/badge/API-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
---
## 📌 TEST THE LIVE APP HERE

[CAREER COPILOT](https://ai-career-copilot-snowy.vercel.app/)
---

## 👩‍💻 Author

**Md. Sadiya Tabassum**

Final Year B.Tech Student — Data Science & Artificial Intelligence  
**ICFAI Tech, ICFAI University, Hyderabad**

Interested in **Artificial Intelligence, Machine Learning, Full-Stack Development, and AI-powered applications**.

### 🔗 Connect With Me

- **GitHub:** https://github.com/scarletsiren50-art
- **LinkedIn:** https://www.linkedin.com/in/sadiya-tabassum-aa8459339

## 📌 Overview

AI Career Copilot is a full-stack AI career guidance platform designed to help students and job seekers understand their career readiness and make more informed career decisions.

Users can upload their resume and receive AI-powered insights including:

- Resume analysis
- Strength identification
- Skill-gap analysis
- Job-role matching
- Personalized career roadmap
- Saved resume analysis history
- Profile and AI preference management

The application combines a modern React frontend with a FastAPI backend, PostgreSQL database, JWT-based authentication, and Groq-powered AI inference.

---

## ✨ Features

### 📄 AI Resume Analysis

Upload a PDF resume and receive structured AI-generated insights about:

- Professional summary
- Technical skills
- Strengths
- Weaknesses
- Missing skills
- Recommended improvements
- Suitable career directions

### 🎯 Job Matching

The system evaluates the user's resume against potential career roles and provides:

- Recommended job roles
- Match scores
- Matching skills
- Skill gaps
- Explanation of the match

### 🗺️ Career Roadmap

AI Career Copilot generates a practical learning roadmap based on the user's current skills and career direction.

The roadmap focuses on progressive development rather than generic recommendations.

### 📊 Dashboard

Users can:

- View previous resume analyses
- Open historical analyses
- Manage saved analyses
- Delete individual analyses

### 🔐 Authentication & Security

The application includes:

- User registration
- Login
- JWT authentication
- Protected API endpoints
- Password hashing with bcrypt
- Authenticated profile management
- Password change
- Secure account deletion

### ⚙️ AI Preferences

Users can configure career-related preferences that are incorporated into the AI analysis workflow.

### 📬 Contact Us

A built-in contact form allows users to send messages through the application's email service.

### 📱 Responsive UI

The frontend is designed to work across desktop and mobile screen sizes.

---

## 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │       Vercel         │
                         │  React + TypeScript   │
                         │       + Vite         │
                         └──────────┬───────────┘
                                    │
                                    │ HTTPS / REST API
                                    ▼
                         ┌──────────────────────┐
                         │       Render         │
                         │       FastAPI        │
                         │       Backend        │
                         └──────────┬───────────┘
                                    │
                  ┌─────────────────┼─────────────────┐
                  │                 │                 │
                  ▼                 ▼                 ▼
          ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
          │    Neon      │  │    Groq AI   │  │    Resend    │
          │ PostgreSQL   │  │  LLM Inference│  │    Email     │
          └──────────────┘  └──────────────┘  └──────────────┘
```

### Application Flow

```text
User
  │
  ▼
React Frontend
  │
  │ JWT / REST API
  ▼
FastAPI Backend
  │
  ├── Authentication
  │
  ├── PDF Text Extraction
  │
  ├── Resume Analysis
  │
  ├── Job Matching
  │
  ├── Career Roadmap
  │
  └── Database Operations
       │
       ├── PostgreSQL / Neon
       │
       └── Groq AI
```

---

## 🛠️ Tech Stack

### Frontend

- React
- TypeScript
- Vite
- CSS
- Responsive UI

### Backend

- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- Pydantic

### AI / Machine Intelligence

- Groq API
- `openai/gpt-oss-20b`
- Prompt-based structured career analysis

### Database

- PostgreSQL
- Neon
- SQLAlchemy ORM

### Authentication

- JWT
- Python-JOSE
- Passlib
- bcrypt

### Resume Processing

- PDF upload
- PyPDF text extraction

### Email

- Resend

### Deployment

- Vercel — Frontend
- Render — Backend
- Neon — PostgreSQL

### Development Tools

- Git
- GitHub
- VS Code

---

## 🔄 AI Processing Workflow

```text
Resume PDF
    │
    ▼
PDF Validation
    │
    ▼
Text Extraction
    │
    ▼
Resume Text Cleaning / Limiting
    │
    ▼
AI Prompt Construction
    │
    ▼
Groq LLM
    │
    ▼
Structured JSON Response
    │
    ▼
Resume Analysis
    │
    ├── Job Matching
    │
    └── Career Roadmap
    │
    ▼
PostgreSQL
    │
    ▼
Dashboard
```

---

## 🔐 Security Measures

The application includes several security and reliability measures:

- JWT-protected API endpoints
- Password hashing using bcrypt
- Environment variables for secrets
- `.env` excluded from Git
- Protected user-specific database operations
- Ownership checks before accessing/deleting analyses
- PDF-only upload validation
- File size restrictions
- PDF signature validation
- Empty PDF/text validation
- Resume text length limits
- Database rollback on failed operations
- Controlled AI error handling
- Production CORS configuration

---

## 📁 Project Structure

```text
AI-Career-Copilot/
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   └── ...
│   │
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
│
├── .gitignore
└── README.md
```

---

## 🚀 Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/scarletsiren50-art/AI-Career-Copilot.git
cd AI-Career-Copilot
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
```

Activate the virtual environment.

**Windows:**

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file containing the required backend environment variables.

Start the backend:

```bash
python -m uvicorn main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

### 3. Frontend setup

Open another terminal:

```bash
cd frontend
npm install
```

Create:

```text
frontend/.env
```

with:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Start the frontend:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 🌐 Live Deployment

### Frontend

**Vercel**

https://ai-career-copilot-snowy.vercel.app/

### Backend

**Render**

https://ai-career-copilot-backend-50km.onrender.com/

### Database

**Neon PostgreSQL**

Used as the production relational database.

---

## 🔑 Environment Variables

### Backend

The backend uses environment variables for sensitive configuration such as:

```env
GROQ_API_KEY=
DATABASE_URL=
SECRET_KEY=
RESEND_API_KEY=
CONTACT_EMAIL=
RESEND_FROM_EMAIL=
```

### Frontend

```env
VITE_API_BASE_URL=
```

> Never commit `.env` files or API keys to GitHub.

---

## 🧪 Production Testing

The deployed application has been tested across the major user flows:

- User registration
- User login
- JWT authentication
- Resume PDF upload
- AI resume analysis
- Job matching
- Career roadmap generation
- Dashboard
- Saved analysis history
- Historical analysis retrieval
- Analysis deletion
- Profile management
- Password change
- AI preferences
- Account deletion
- Contact form
- Logout
- Responsive interface

---

## 🎯 Future Improvements

Potential future enhancements include:

- Real-time job-market integration
- More advanced resume scoring
- LinkedIn profile integration
- ATS compatibility scoring
- Interview question generation
- AI-powered mock interviews
- Job application tracking
- Skill-learning resource recommendations
- Analytics and career-progress tracking
- More personalized career recommendations

---

## 👩‍💻 Author

**Sadiya Tabassum**

B.Tech — Data Science & Artificial Intelligence

Hyderabad, India

### Connect

- GitHub: https://github.com/scarletsiren50-art
- LinkedIn: https://www.linkedin.com/in/sadiya-tabassum-aa8459339

---

## 📄 License

This project is licensed under the **MIT License**.

See the [LICENSE](LICENSE) file for the complete license text.

---

© 2026 Md. Sadiya Tabassum. All rights reserved under the terms of the MIT License.

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.