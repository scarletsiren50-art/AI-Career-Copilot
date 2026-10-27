# 🤖 AI Career Copilot

> An AI-powered career intelligence platform that analyzes resumes, identifies skill gaps, matches users with suitable career opportunities, and generates personalized career roadmaps.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://ai-career-copilot-snowy.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://ai-career-copilot-backend-50km.onrender.com/)
[![Frontend](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![API](https://img.shields.io/badge/API-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

---

## 🚀 Live Application

### Career Copilot

https://ai-career-copilot-snowy.vercel.app/

### Backend API

https://ai-career-copilot-backend-50km.onrender.com/

---

## 📌 Overview

**AI Career Copilot** is a full-stack AI-powered career development platform designed to help students and early-career professionals understand their career readiness and make informed career decisions.

Users can upload their resume and receive structured AI-powered insights including:

- 📄 Resume analysis
- 💡 Career summary
- 🧠 Technical skill identification
- 💪 Strength analysis
- 🎯 Skill-gap identification
- 💼 Job-role matching
- 🗺️ Personalized career roadmap
- 📊 Saved resume analysis history
- ⚙️ AI preference customization
- 🔐 Secure authentication
- 🔑 Password reset through email
- 👤 Profile management

The application combines a **React + TypeScript frontend**, **FastAPI backend**, **PostgreSQL database**, **JWT authentication**, and **Groq-powered AI inference**.

---

# ✨ Features

## 📄 AI Resume Analysis

Users can upload a PDF resume and receive structured AI-generated insights covering:

- Professional summary
- Technical skills
- Strengths
- Skill gaps
- Recommended career directions
- Learning recommendations
- Resume improvement suggestions

The backend validates uploaded files before processing them and limits resume text sent to the AI model.

---

## 🎯 Job Matching

The platform evaluates the user's resume and career profile against potential career roles.

It provides:

- Recommended job roles
- Match scores
- Matching skills
- Missing skills
- Skill gaps
- Explanation of the match

---

## 🗺️ Personalized Career Roadmap

Career Copilot generates a practical learning roadmap based on the user's:

- Current skills
- Career goal
- Experience level
- Preferred roles
- AI response preferences
- Identified skill gaps

The roadmap focuses on progressive skill development rather than generic recommendations.

---

## 📊 Dashboard & Analysis History

Authenticated users can:

- View previous resume analyses
- Open historical analyses
- Review past AI recommendations
- Delete individual analyses
- Continue using their saved career insights

Each analysis is associated with its authenticated user to prevent unauthorized access.

---

## 🔐 Authentication & Security

The application includes:

- User registration
- Secure login
- JWT-based authentication
- Protected API endpoints
- Password hashing with bcrypt
- Password change
- Password reset
- Secure account deletion
- User ownership checks
- Environment-based secret management
- Production CORS configuration

---

## 🔑 Password Reset

Career Copilot includes a complete password recovery workflow.

### Flow

```text
Forgot Password
       │
       ▼
Registered Email
       │
       ▼
Secure Reset Token
       │
       ▼
Brevo Transactional Email
       │
       ▼
Password Reset Page
       │
       ▼
New Password
       │
       ▼
Password Hash Updated
       │
       ▼
User Can Log In
```

Password reset tokens are:

- Cryptographically generated
- Time-limited
- Single-use
- Invalidated after successful use
- Stored in the PostgreSQL database

The application also avoids revealing whether an email address is registered when requesting a password reset.

---

## ⚙️ AI Preferences

Users can configure preferences that influence AI-generated career recommendations.

Preferences include:

- Career goal
- Experience level
- Preferred roles
- Response style

These preferences are incorporated into the resume analysis workflow.

---

## 👤 Profile & Account Management

Users can manage:

- Name
- Email
- Password
- AI preferences
- Account data

The application also provides a protected account deletion flow requiring password confirmation.

---

## 📬 Contact Us

A built-in contact form allows authenticated users to send support messages through **Brevo Transactional Email**.

The backend sanitizes user-provided content before generating the email.

---

## 📱 Responsive UI

The frontend is designed to work across:

- Desktop
- Laptop
- Tablet
- Mobile

The interface uses a responsive layout with a consistent Career Copilot visual identity.

---

# 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │       Vercel         │
                         │  React + TypeScript  │
                         │      + Vite          │
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
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
       ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
       │     Neon     │      │   Groq AI    │      │    Brevo     │
       │  PostgreSQL  │      │ LLM Inference│      │ Transactional │
       │              │      │              │      │    Email     │
       └──────────────┘      └──────────────┘      └──────────────┘
```

---

## 🔄 Application Flow

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
 ├── Password Reset
 │
 ├── PDF Validation
 │
 ├── PDF Text Extraction
 │
 ├── Resume Analysis
 │
 ├── Job Matching
 │
 ├── Career Roadmap
 │
 ├── AI Preferences
 │
 └── Database Operations
 │
 ├── PostgreSQL / Neon
 │
 ├── Groq AI
 │
 └── Brevo Email
```

---

# 🛠️ Tech Stack

## Frontend

- React
- TypeScript
- Vite
- CSS
- Responsive UI

## Backend

- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- Pydantic

## AI / Machine Intelligence

- Groq API
- `openai/gpt-oss-20b`
- Structured JSON generation
- Prompt-based career analysis

## Database

- PostgreSQL
- Neon
- SQLAlchemy ORM

## Authentication & Security

- JWT
- Python-JOSE
- Passlib
- bcrypt
- Secure reset tokens using Python `secrets`

## Resume Processing

- PDF upload
- PyPDF
- PDF signature validation
- Resume text extraction
- Resume text length limiting

## Email

- Brevo Transactional Email
- `sib-api-v3-sdk`

## Deployment

- Vercel — Frontend
- Render — Backend
- Neon — PostgreSQL
- Brevo — Transactional Email

## Development Tools

- Git
- GitHub
- VS Code

---

# 🔄 AI Processing Workflow

```text
Resume PDF
    │
    ▼
PDF Validation
    │
    ├── PDF extension check
    ├── File size check
    └── PDF signature validation
    │
    ▼
Text Extraction
    │
    ▼
Resume Text Cleaning
    │
    ▼
Resume Text Length Limiting
    │
    ▼
AI Preference Integration
    │
    ▼
Prompt Construction
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

# 🔐 Security & Reliability

Career Copilot implements multiple application-level security measures:

- JWT-protected API endpoints
- Password hashing using bcrypt
- Secure password reset tokens
- Time-limited password reset links
- One-time password reset tokens
- Environment variables for secrets
- `.env` excluded from Git
- User ownership checks
- Protected user-specific database operations
- Secure account deletion
- PDF-only upload validation
- 5 MB resume upload limit
- PDF signature validation
- Empty PDF/text validation
- Resume text length limits
- Database rollback on failed operations
- Controlled AI error handling
- Production CORS configuration
- Generic password-reset responses to reduce account enumeration risk
- HTML escaping for contact form email content

---

# 📁 Project Structure

```text
AI-Career-Copilot/
│
├── backend/
│   ├── main.py
│   ├── auth.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
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
│   ├── vercel.json
│   └── ...
│
├── .gitignore
├── LICENSE
└── README.md
```

---

# 🚀 Running Locally

## 1. Clone the repository

```bash
git clone https://github.com/scarletsiren50-art/AI-Career-Copilot.git
cd AI-Career-Copilot
```

---

## 2. Backend Setup

```bash
cd backend
python -m venv venv
```

### Windows

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file in the backend directory.

### Backend Environment Variables

```env
GROQ_API_KEY=
DATABASE_URL=
SECRET_KEY=
CONTACT_EMAIL=
BREVO_API_KEY=
BREVO_FROM_EMAIL=
```

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

---

## 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create:

```text
frontend/.env
```

Add:

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

# 🌐 Production Deployment

## Frontend — Vercel

The React/Vite frontend is deployed on Vercel.

```text
https://ai-career-copilot-snowy.vercel.app/
```

Production environment variable:

```env
VITE_API_BASE_URL=https://ai-career-copilot-backend-50km.onrender.com
```

The project includes a Vercel rewrite configuration so that client-side routes such as:

```text
/reset-password
```

continue to work correctly after deployment.

---

## Backend — Render

The FastAPI backend is deployed on Render.

```text
https://ai-career-copilot-backend-50km.onrender.com/
```

Render configuration:

```text
Root Directory:
backend

Build Command:
pip install -r requirements.txt

Start Command:
uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

## Database — Neon

Neon PostgreSQL is used as the production relational database.

The application stores:

- User accounts
- User preferences
- Resume analyses
- Password reset tokens

---

## Email — Brevo

Brevo is used for transactional email functionality including:

- Password reset emails
- Contact form messages

The verified Brevo sender address is configured through environment variables and is never committed to GitHub.

---

# 🔑 Environment Variables

## Backend

```env
GROQ_API_KEY=
DATABASE_URL=
SECRET_KEY=
CONTACT_EMAIL=
BREVO_API_KEY=
BREVO_FROM_EMAIL=
```

## Frontend

```env
VITE_API_BASE_URL=
```

### Security Note

Never commit:

- `.env`
- API keys
- database credentials
- JWT secrets
- email service credentials

The repository excludes environment files through `.gitignore`.

---

# 🧪 Production Testing

The deployed application has been tested across the major user flows:

- ✅ User registration
- ✅ User login
- ✅ JWT authentication
- ✅ Protected API access
- ✅ Resume PDF upload
- ✅ PDF validation
- ✅ AI resume analysis
- ✅ Job matching
- ✅ Career roadmap generation
- ✅ Dashboard
- ✅ Saved analysis history
- ✅ Historical analysis retrieval
- ✅ Analysis deletion
- ✅ Profile management
- ✅ Password change
- ✅ Forgot password
- ✅ Password reset email
- ✅ Password reset link
- ✅ New password login
- ✅ AI preferences
- ✅ Account deletion
- ✅ Contact form
- ✅ Logout
- ✅ Responsive interface
- ✅ Production frontend/backend communication

---

# 🎯 Future Improvements

Potential future enhancements include:

- Real-time job-market integration
- Advanced resume scoring
- ATS compatibility scoring
- LinkedIn profile integration
- Interview question generation
- AI-powered mock interviews
- Job application tracking
- Skill-learning resource recommendations
- Career progress analytics
- More personalized career recommendations
- Resume version comparison
- Job application history

---

# 👩‍💻 Author

**Md. Sadiya Tabassum**

B.Tech — Data Science & Artificial Intelligence  
ICFAI Tech, ICFAI University, Hyderabad

Interested in:

- Artificial Intelligence
- Machine Learning
- Full-Stack Development
- Generative AI
- AI-powered applications

### Connect

- GitHub: https://github.com/scarletsiren50-art
- LinkedIn: https://www.linkedin.com/in/sadiya-tabassum-aa8459339

---

# 📄 License

This project is licensed under the **MIT License**.

See the [LICENSE](LICENSE) file for the complete license text.

---

© 2026 Md. Sadiya Tabassum. Licensed under the MIT License.

⭐ If you find this project useful, consider giving the repository a star on GitHub.