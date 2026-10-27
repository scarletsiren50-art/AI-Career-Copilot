from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel, EmailStr, Field
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pypdf import PdfReader
from dotenv import load_dotenv
from groq import Groq
from sqlalchemy.orm import Session
from database import get_db
from models import User, UserPreferences, ResumeAnalysis
from schemas import UserSignup
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token
)
import io
import os
import json
import html
import resend


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv()


# ============================================================
# RESEND EMAIL CONFIGURATION
# ============================================================

resend.api_key = os.getenv("RESEND_API_KEY")

CONTACT_EMAIL = os.getenv("CONTACT_EMAIL")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL")


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI()

security = HTTPBearer()


# ============================================================
# REQUEST MODELS
# ============================================================

class JobMatchRequest(BaseModel):
    resume_text: str
    job_description: str


class LoginRequest(BaseModel):
    email: str
    password: str


class ProfileUpdateRequest(BaseModel):
    name: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class PreferencesRequest(BaseModel):
    career_goal: str
    experience_level: str
    preferred_roles: list[str]
    response_style: str


class ContactRequest(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=100
    )

    email: EmailStr

    subject: str = Field(
        min_length=3,
        max_length=150
    )

    message: str = Field(
        min_length=10,
        max_length=5000
    )


class DeleteAccountRequest(BaseModel):
    current_password: str


class CareerRoadmapRequest(BaseModel):
    resume_text: str
    job_description: str
    missing_skills: list[str]
    recommended_role: str


# ============================================================
# AUTHENTICATION
# ============================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Validate the JWT token and return the authenticated user.
    """

    token = credentials.credentials

    try:
        payload = decode_access_token(token)

        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token."
            )

        user_id = int(user_id)

    except (ValueError, TypeError):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token."
        )

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User account not found."
        )

    return user


# ============================================================
# GROQ CLIENT
# ============================================================

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "https://ai-career-copilot-snowy.vercel.app",
    "https://ai-career-copilot-o0g6lcpzn-scarletsiren50-arts-projects.vercel.app"
    ]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# UPLOAD & ANALYZE RESUME
# ============================================================

@app.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

    # -----------------------------
    # 1. Basic file validation
    # -----------------------------
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Please select a PDF file."
        )

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    # -----------------------------
    # 2. Read uploaded file
    # -----------------------------
    try:
        file_bytes = await file.read()
    except Exception as error:
        print("File read error:", str(error))

        raise HTTPException(
            status_code=400,
            detail="Unable to read the uploaded file."
        )

    # -----------------------------
    # 3. File size validation
    # -----------------------------
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Resume file is too large. Please upload a PDF smaller than 5 MB."
        )

    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty."
        )

    # -----------------------------
    # 4. Verify PDF signature
    # -----------------------------
    if not file_bytes.startswith(b"%PDF"):
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is not a valid PDF."
        )

    # -----------------------------
    # 5. Extract PDF text
    # -----------------------------
    try:
        pdf_reader = PdfReader(
            io.BytesIO(file_bytes)
        )

        extracted_text = []

        for page in pdf_reader.pages:
            page_text = page.extract_text()

            if page_text:
                extracted_text.append(page_text)

        resume_text = "\n".join(extracted_text).strip()

    except Exception as error:
        print("PDF extraction error:", str(error))

        raise HTTPException(
            status_code=400,
            detail="Unable to read this PDF. Please upload a valid, text-based resume PDF."
        )

    # -----------------------------
    # 6. Check extracted content
    # -----------------------------
    if not resume_text:
        raise HTTPException(
            status_code=400,
            detail="No readable text was found in this PDF. Please upload a text-based resume."
        )

    # -----------------------------
    # 7. Prevent excessively large AI input
    # -----------------------------
    MAX_RESUME_TEXT_LENGTH = 30000

    if len(resume_text) > MAX_RESUME_TEXT_LENGTH:
        resume_text = resume_text[:MAX_RESUME_TEXT_LENGTH]

    # -----------------------------
    # 8. Load user's preferences
    # -----------------------------
    preferences = (
        db.query(UserPreferences)
        .filter(
            UserPreferences.user_id == current_user.id
        )
        .first()
    )

    career_goal = (
        preferences.career_goal
        if preferences
        else "Full-Time Job"
    )

    experience_level = (
        preferences.experience_level
        if preferences
        else "Student"
    )

    preferred_roles = []

    if preferences and preferences.preferred_roles:
        try:
            preferred_roles = json.loads(
                preferences.preferred_roles
            )
        except Exception:
            preferred_roles = []

    response_style = (
        preferences.response_style
        if preferences
        else "Balanced"
    )

    preference_context = f"""
Career Goal: {career_goal}
Experience Level: {experience_level}
Preferred Roles: {", ".join(preferred_roles) if preferred_roles else "Not specified"}
Response Style: {response_style}
"""

    # -----------------------------
    # 9. Call Groq safely
    # -----------------------------
    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",

            messages=[
                {
                    "role": "system",
                    "content": f"""
You are Career Copilot, an AI career advisor specializing in
resume analysis for students and early-career professionals.

Your job is to analyze the candidate's resume accurately and
turn the information into practical career guidance.

CORE RULES:
- Use ONLY information explicitly supported by the resume.
- Never invent skills, experience, education, certifications,
  achievements, projects, job titles, or years of experience.
- Do not assume proficiency simply because a technology is
  mentioned once.
- Distinguish between skills demonstrated through projects,
  internships, coursework, and skills merely listed.
- Keep recommendations realistic for the candidate's actual
  experience level.
- Do not make exaggerated claims such as "expert", "highly
  experienced", or "industry-ready" unless clearly supported.
- Avoid generic advice that could apply to every candidate.
- Make every recommendation relevant to the candidate's resume.

CANDIDATE PREFERENCES:
{preference_context}

Use the candidate's preferences to influence:
- Career direction
- Recommended roles
- Skill-gap identification
- Learning recommendations
- Response style

If preferred roles are provided, prioritize them when the resume
provides reasonable evidence for those roles.

CAREER SUMMARY:
Write a concise professional summary describing:
- Current career/education position
- Main technical areas
- Relevant project or internship exposure
- Most realistic career direction

SKILLS:
List only meaningful skills clearly supported by the resume.
Avoid duplicates and avoid listing extremely broad concepts
unless they are genuinely relevant.

STRENGTHS:
Identify concrete strengths demonstrated by the resume.
Prioritize evidence from projects, internships, certifications,
technical work, leadership, or communication.

SKILL GAPS:
Identify realistic gaps that could prevent the candidate from
progressing toward the recommended roles.
Do not label something as a gap simply because it is absent from
the resume unless it is relevant to the candidate's career goals.

RECOMMENDED ROLES:
Recommend roles that realistically match the candidate's current
background.
Prioritize roles aligned with both the resume and stated
preferences.
Do not recommend senior-level roles unless clearly justified.

LEARNING RECOMMENDATIONS:
Give practical, prioritized actions that address the most important
skill gaps.
Prefer specific technologies, concepts, projects, or practice
areas over vague advice such as "improve coding skills."

{preference_context}

Always remain honest, evidence-based, practical, and
career-focused.
"""
    },
    {
        "role": "user",
        "content": f"""
Analyze the following resume using the candidate's career
preferences.

RESUME:
{resume_text}

Return recommendations that are:
- Specific to this candidate
- Realistic for their current level
- Useful for internships, placements, and early-career roles
- Directly supported by the resume
"""
                },

                {
                    "role": "user",
                    "content": f"""
Analyze the following resume using the candidate's saved
career preferences and the rules provided above.

RESUME:

{resume_text}
"""
                }
            ],

            response_format={
                "type": "json_schema",

                "json_schema": {
                    "name": "resume_analysis",

                    "strict": True,

                    "schema": {
                        "type": "object",

                        "properties": {
                            "career_summary": {
                                "type": "string"
                            },

                            "skills": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                }
                            },

                            "strengths": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                }
                            },

                            "skill_gaps": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                }
                            },

                            "recommended_roles": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                }
                            },

                            "learning_recommendations": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                }
                            }
                        },

                        "required": [
                            "career_summary",
                            "skills",
                            "strengths",
                            "skill_gaps",
                            "recommended_roles",
                            "learning_recommendations"
                        ],

                        "additionalProperties": False
                    }
                }
            }
        )

    except Exception as error:
        print("Groq resume analysis error:", str(error))

        raise HTTPException(
            status_code=502,
            detail="The AI analysis service is temporarily unavailable. Please try again."
        )

    # -----------------------------
    # 10. Parse AI response
    # -----------------------------
    try:
        analysis = json.loads(
            response.choices[0].message.content
        )

    except Exception as error:
        print("AI response parsing error:", str(error))

        raise HTTPException(
            status_code=502,
            detail="The AI returned an invalid analysis. Please try again."
        )

    # -----------------------------
    # 11. Save analysis to database
    # -----------------------------
    try:
        resume_analysis = ResumeAnalysis(
            user_id=current_user.id,
            filename=file.filename,
            resume_text=resume_text,
            career_summary=analysis.get(
                "career_summary",
                ""
            ),
            skills=json.dumps(
                analysis.get("skills", [])
            ),
            strengths=json.dumps(
                analysis.get("strengths", [])
            ),
            skill_gaps=json.dumps(
                analysis.get("skill_gaps", [])
            ),
            recommended_roles=json.dumps(
                analysis.get("recommended_roles", [])
            ),
            learning_recommendations=json.dumps(
                analysis.get(
                    "learning_recommendations",
                    []
                )
            )
        )

        db.add(resume_analysis)
        db.commit()
        db.refresh(resume_analysis)

    except Exception as error:
        db.rollback()

        print(
            "Resume analysis database error:",
            str(error)
        )

        raise HTTPException(
            status_code=500,
            detail="The analysis was generated but could not be saved. Please try again."
        )

    # -----------------------------
    # 12. Return successful response
    # -----------------------------
    return {
        "success": True,
        "filename": file.filename,
        "message": "Resume analyzed successfully!",
        "resume_text": resume_text,
        "analysis": analysis
    }


@app.get("/resume-analysis")
def get_resume_analysis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analyses = (
        db.query(ResumeAnalysis)
        .filter(
            ResumeAnalysis.user_id == current_user.id
        )
        .order_by(
            ResumeAnalysis.created_at.desc()
        )
        .all()
    )

    return {
        "success": True,
        "analyses": [
            {
                "id": analysis.id,
                "filename": analysis.filename,
                "resume_text": analysis.resume_text,
                "career_summary": analysis.career_summary,
                "skills": json.loads(
                    analysis.skills or "[]"
                ),
                "strengths": json.loads(
                    analysis.strengths or "[]"
                ),
                "skill_gaps": json.loads(
                    analysis.skill_gaps or "[]"
                ),
                "recommended_roles": json.loads(
                    analysis.recommended_roles or "[]"
                ),
                "learning_recommendations": json.loads(
                    analysis.learning_recommendations or "[]"
                ),
                "created_at": analysis.created_at,
                "updated_at": analysis.updated_at
            }
            for analysis in analyses
        ]
    }

@app.delete("/resume-analysis/{analysis_id}")
def delete_resume_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = (
        db.query(ResumeAnalysis)
        .filter(
            ResumeAnalysis.id == analysis_id,
            ResumeAnalysis.user_id == current_user.id
        )
        .first()
    )

    if not analysis:
        raise HTTPException(
            status_code=404,
            detail="Resume analysis not found."
        )

    try:
        db.delete(analysis)
        db.commit()

        return {
            "success": True,
            "message": "Resume analysis deleted successfully."
        }

    except Exception as error:
        db.rollback()

        print(
            "Delete resume analysis error:",
            str(error)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to delete the resume analysis right now."
        )
# ============================================================
# JOB MATCHING
# ============================================================

@app.post("/match-job")
async def match_job(
    request: JobMatchRequest
):

    if not request.resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Resume text cannot be empty."
        )

    if not request.job_description.strip():
        raise HTTPException(
            status_code=400,
            detail="Job description cannot be empty."
        )

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",

        messages=[
            {
                "role": "system",

                "content": """
You are Career Copilot, an AI job-matching advisor.

Your task is to objectively compare a candidate's resume with a
specific job description and determine how well the candidate
currently matches the role.

IMPORTANT RULES:
- Use ONLY information present in the resume and job description.
- Never invent skills, experience, qualifications, certifications,
  projects, achievements, or years of experience.
- Do not assume a candidate knows a technology simply because it
  is related to another technology they know.
- Do not treat a missing resume detail as proof that the candidate
  lacks that skill.
- Distinguish between clearly demonstrated skills and weak or
  indirect evidence.
- Be honest about weaknesses while remaining constructive.
- Do not inflate the match score to make the candidate feel better.

MATCH SCORE:
Assign an integer score from 0 to 100.

Use this general interpretation:
90-100 = Excellent match; most important requirements are clearly met.
75-89  = Strong match; most important requirements are met with a
         few manageable gaps.
60-74  = Moderate match; several relevant requirements are met,
         but meaningful gaps remain.
40-59  = Partial match; some relevant skills exist, but substantial
         preparation is needed.
0-39   = Low match; the candidate currently lacks many important
        requirements.

The score should reflect the actual evidence in the resume, not
the candidate's potential.

MATCHING SKILLS:
Include skills from the resume that directly correspond to
requirements in the job description.

MISSING SKILLS:
Include important job requirements that are not clearly supported
by the resume.
Do not include every technology mentioned in the job description.
Prioritize skills that materially affect the candidate's ability
to perform the role.

STRENGTHS:
Highlight the strongest evidence that makes the candidate suitable
for this specific position.

RECOMMENDATIONS:
Give practical actions that would improve the candidate's
readiness for this particular job.
Prioritize the most important gaps first.

MATCH SUMMARY:
Provide a concise explanation of why the candidate received the
score.
Mention both the strongest matches and the most important gaps.

Be objective, specific, evidence-based, and career-focused.
"""
    },
    {
        "role": "user",
        "content": f"""
Evaluate the candidate's current fit for the following position.

CANDIDATE RESUME:
{request.resume_text}

JOB DESCRIPTION:
{request.job_description}

Focus on the actual requirements of this job and the evidence
available in the candidate's resume.

Do not evaluate based on assumptions or potential.
"""
            }
        ],

        response_format={
            "type": "json_schema",

            "json_schema": {
                "name": "job_match_analysis",

                "strict": True,

                "schema": {
                    "type": "object",

                    "properties": {

                        "match_score": {
                            "type": "integer"
                        },

                        "match_summary": {
                            "type": "string"
                        },

                        "matching_skills": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            }
                        },

                        "missing_skills": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            }
                        },

                        "strengths": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            }
                        },

                        "recommendations": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            }
                        }
                    },

                    "required": [
                        "match_score",
                        "match_summary",
                        "matching_skills",
                        "missing_skills",
                        "strengths",
                        "recommendations"
                    ],

                    "additionalProperties": False
                }
            }
        }
    )

    result = json.loads(
        response.choices[0].message.content
    )

    return {
        "success": True,
        "job_match": result
    }


# ============================================================
# CAREER ROADMAP
# ============================================================

@app.post("/career-roadmap")
async def career_roadmap(
    request: CareerRoadmapRequest
):

    if not request.resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Resume text cannot be empty."
        )

    if not request.job_description.strip():
        raise HTTPException(
            status_code=400,
            detail="Job description cannot be empty."
        )

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",

        messages=[
            {
                "role": "system",

                "content": """
You are Career Copilot, an AI career planning advisor.

Create a realistic, personalized career roadmap that helps the
candidate move from their current level toward the recommended
target role.

SOURCE OF TRUTH:
Use only:
- Resume
- Target job description
- Missing skills
- Recommended role

Never invent:
- Experience
- Qualifications
- Certifications
- Projects
- Skills
- Achievements
- Employment history

ROADMAP PRINCIPLES:
- Start from the candidate's actual current level.
- Prioritize the most important missing skills.
- Align every step with the target job requirements.
- Make the roadmap practical for a student or early-career
  candidate.
- Avoid vague advice such as "learn more", "practice coding",
  or "improve yourself" without explaining what to learn or do.
- Prefer hands-on learning and portfolio-building.
- Avoid recommending too many technologies at once.
- Do not repeat the same action across multiple steps.
- Do not recommend senior-level responsibilities to a beginner.
- Keep the roadmap achievable and logically ordered.

ROADMAP ORDER:
Structure the roadmap progressively:

1. Strengthen the most important fundamentals.
2. Learn the highest-priority missing technical skills.
3. Build practical projects demonstrating those skills.
4. Gain role-specific practical experience.
5. Improve interview/job-readiness skills.
6. Define the next realistic milestone toward the target role.

Each step must contain:
- A clear title
- A specific focus
- Practical actions
- A measurable or observable expected outcome

CAREER GOAL:
State the actual recommended role.

CURRENT LEVEL:
Describe the candidate's current position based only on the
resume.

ROADMAP SUMMARY:
Explain briefly how the roadmap connects the candidate's current
skills to the target role.

STEP QUALITY:
Every action should answer:
"What exactly should the candidate do next?"

Examples of strong actions:
- Build a REST API using FastAPI with authentication and
  PostgreSQL.
- Complete two SQL projects involving joins, aggregation,
  subqueries, and window functions.
- Build and deploy one end-to-end ML project with documented
  evaluation metrics.

Avoid vague actions such as:
- Learn Python.
- Improve communication.
- Study AI.
- Practice more.

Never output placeholders such as:
<RECOMMENDED_ROLE>
<TARGET_ROLE>
<CURRENT_ROLE>
<CURRENT_EXPERIENCE>

Always use the actual values supplied in the request.
"""
    },
    {
        "role": "user",
        "content": f"""
Create a personalized career roadmap for this candidate.

RESUME:
{request.resume_text}

TARGET JOB DESCRIPTION:
{request.job_description}

MISSING SKILLS:
{request.missing_skills}

RECOMMENDED ROLE:
{request.recommended_role}

Create a logical progression from the candidate's current level
toward the recommended role.

Prioritize the missing skills that matter most for the target job.
Make each step practical, specific, and achievable.
"""
            }
        ],

        response_format={
            "type": "json_schema",

            "json_schema": {
                "name": "career_roadmap",

                "strict": True,

                "schema": {
                    "type": "object",

                    "properties": {

                        "career_goal": {
                            "type": "string"
                        },

                        "current_level": {
                            "type": "string"
                        },

                        "roadmap_summary": {
                            "type": "string"
                        },

                        "steps": {
                            "type": "array",

                            "items": {
                                "type": "object",

                                "properties": {

                                    "step_number": {
                                        "type": "integer"
                                    },

                                    "title": {
                                        "type": "string"
                                    },

                                    "focus": {
                                        "type": "string"
                                    },

                                    "actions": {
                                        "type": "array",

                                        "items": {
                                            "type": "string"
                                        }
                                    },

                                    "expected_outcome": {
                                        "type": "string"
                                    }
                                },

                                "required": [
                                    "step_number",
                                    "title",
                                    "focus",
                                    "actions",
                                    "expected_outcome"
                                ],

                                "additionalProperties": False
                            }
                        }
                    },

                    "required": [
                        "career_goal",
                        "current_level",
                        "roadmap_summary",
                        "steps"
                    ],

                    "additionalProperties": False
                }
            }
        }
    )

    roadmap = json.loads(
        response.choices[0].message.content
    )

    return {
        "success": True,
        "roadmap": roadmap
    }


# ============================================================
# SIGNUP
# ============================================================

@app.post("/auth/signup")
def signup(
    user: UserSignup,
    db: Session = Depends(get_db)
):

    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_user:
        return {
            "success": False,
            "message": "An account with this email already exists."
        }

    hashed_password = hash_password(
        user.password
    )

    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "success": True,
        "message": "Account created successfully!",

        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email
        }
    }


# ============================================================
# LOGIN
# ============================================================

@app.post("/auth/login")
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):

    db_user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    if not verify_password(
        request.password,
        db_user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    access_token = create_access_token(
        data={
            "sub": str(db_user.id),
            "email": db_user.email
        }
    )

    return {
        "success": True,
        "message": "Login successful!",
        "access_token": access_token,
        "token_type": "bearer",

        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email
        }
    }


# ============================================================
# CURRENT USER
# ============================================================

@app.get("/auth/me")
def get_my_account(
    current_user: User = Depends(get_current_user)
):

    return {
        "success": True,

        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email
        }
    }


# ============================================================
# CHANGE PASSWORD
# ============================================================

@app.put("/auth/change-password")
def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if not verify_password(
        request.current_password,
        current_user.password_hash
    ):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect."
        )

    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="New password must be at least 8 characters long."
        )

    if verify_password(
        request.new_password,
        current_user.password_hash
    ):
        raise HTTPException(
            status_code=400,
            detail="New password must be different from the current password."
        )

    current_user.password_hash = hash_password(
        request.new_password
    )

    db.commit()
    db.refresh(current_user)

    return {
        "success": True,
        "message": "Password changed successfully!"
    }


# ============================================================
# UPDATE PROFILE
# ============================================================

@app.put("/profile/{user_id}")
def update_profile(
    user_id: int,
    profile: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to update this profile."
        )

    if not profile.name.strip():
        raise HTTPException(
            status_code=400,
            detail="Name cannot be empty."
        )

    current_user.name = profile.name.strip()

    db.commit()
    db.refresh(current_user)

    return {
        "success": True,
        "message": "Profile updated successfully!",

        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email
        }
    }


# ============================================================
# GET AI PREFERENCES
# ============================================================

@app.get("/preferences/{user_id}")
def get_preferences(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to access these preferences."
        )

    preferences = (
        db.query(UserPreferences)
        .filter(
            UserPreferences.user_id == user_id
        )
        .first()
    )

    if not preferences:

        preferences = UserPreferences(
            user_id=user_id,
            career_goal="Full-Time Job",
            experience_level="Student",
            preferred_roles="",
            response_style="Balanced"
        )

        db.add(preferences)
        db.commit()
        db.refresh(preferences)

    return {
        "success": True,

        "preferences": {
            "career_goal": preferences.career_goal,
            "experience_level": preferences.experience_level,

            "preferred_roles": (
                preferences.preferred_roles.split(",")
                if preferences.preferred_roles
                else []
            ),

            "response_style": preferences.response_style
        }
    }


# ============================================================
# UPDATE AI PREFERENCES
# ============================================================

@app.put("/preferences/{user_id}")
def update_preferences(
    user_id: int,
    request: PreferencesRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to update these preferences."
        )

    preferences = (
        db.query(UserPreferences)
        .filter(
            UserPreferences.user_id == user_id
        )
        .first()
    )

    if not preferences:

        preferences = UserPreferences(
            user_id=user_id
        )

        db.add(preferences)

    preferences.career_goal = request.career_goal

    preferences.experience_level = (
        request.experience_level
    )

    preferences.preferred_roles = ",".join(
        request.preferred_roles
    )

    preferences.response_style = (
        request.response_style
    )

    db.commit()
    db.refresh(preferences)

    return {
        "success": True,
        "message": "AI preferences saved successfully!",

        "preferences": {
            "career_goal": preferences.career_goal,
            "experience_level": preferences.experience_level,

            "preferred_roles": (
                preferences.preferred_roles.split(",")
                if preferences.preferred_roles
                else []
            ),

            "response_style": preferences.response_style
        }
    }


# ============================================================
# CONTACT US
# ============================================================

@app.post("/contact")
def contact_us(
    request: ContactRequest
):

    # --------------------------------------------------------
    # Check email configuration
    # --------------------------------------------------------

    if (
        not resend.api_key
        or not CONTACT_EMAIL
        or not RESEND_FROM_EMAIL
    ):
        raise HTTPException(
            status_code=500,
            detail="Contact service is not configured."
        )

    # --------------------------------------------------------
    # Escape user input
    # --------------------------------------------------------

    safe_name = html.escape(
        request.name
    )

    safe_email = html.escape(
        str(request.email)
    )

    safe_subject = html.escape(
        request.subject
    )

    safe_message = html.escape(
        request.message
    ).replace("\n", "<br>")

    # --------------------------------------------------------
    # Create email
    # --------------------------------------------------------

    email_params: resend.Emails.SendParams = {

        "from": (
            f"Career Copilot <{RESEND_FROM_EMAIL}>"
        ),

        "to": [
            CONTACT_EMAIL
        ],

        "subject": (
            f"[Career Copilot] {safe_subject}"
        ),

        "reply_to": [
            str(request.email)
        ],

        "html": f"""
        <div style="
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        ">

            <h2 style="color: #735451;">
                New Career Copilot Contact Request
            </h2>

            <p>
                <strong>Name:</strong><br>
                {safe_name}
            </p>

            <p>
                <strong>Email:</strong><br>
                {safe_email}
            </p>

            <p>
                <strong>Subject:</strong><br>
                {safe_subject}
            </p>

            <p>
                <strong>Message:</strong>
            </p>

            <div style="
                padding: 15px;
                background: #f5f5f5;
                border-radius: 8px;
                border: 1px solid #ddd;
            ">
                {safe_message}
            </div>

            <br>

            <p style="
                font-size: 13px;
                color: #777;
            ">
                This message was sent through the
                Career Copilot Contact Us form.
            </p>

        </div>
        """
    }

    # --------------------------------------------------------
    # Send email
    # --------------------------------------------------------

    try:

        resend.Emails.send(
            email_params
        )

        return {
            "success": True,
            "message": "Your message has been sent successfully!"
        }

    except Exception as error:

        print(
            "Contact email error:",
            str(error)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to send your message right now."
        )


# ============================================================
# DELETE ACCOUNT
# ============================================================

@app.delete("/auth/delete-account")
def delete_account(
    request: DeleteAccountRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # Verify password
    # --------------------------------------------------------

    if not verify_password(
        request.current_password,
        current_user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Incorrect password."
        )

    try:

        # ----------------------------------------------------
        # Delete preferences first
        # ----------------------------------------------------

        preferences = (
            db.query(UserPreferences)
            .filter(
                UserPreferences.user_id == current_user.id
            )
            .first()
        )

        if preferences:
            db.delete(preferences)

        # ----------------------------------------------------
        # Delete user
        # ----------------------------------------------------

        db.delete(current_user)

        db.commit()

        return {
            "success": True,
            "message": "Your account has been permanently deleted."
        }

    except Exception as error:

        db.rollback()

        print(
            "Delete account error:",
            str(error)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to delete your account right now."
        )