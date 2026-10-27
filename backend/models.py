from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100),
        nullable=False
    )

    email = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )

    password_hash = Column(
        String(255),
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )


class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False,
        unique=True,
        index=True
    )

    career_goal = Column(
        String(100),
        nullable=False,
        default="Full-Time Job"
    )

    experience_level = Column(
        String(100),
        nullable=False,
        default="Student"
    )

    preferred_roles = Column(
        String(500),
        nullable=False,
        default=""
    )

    response_style = Column(
        String(50),
        nullable=False,
        default="Balanced"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )


class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    filename = Column(
        String(255),
        nullable=False
    )

    resume_text = Column(
        String,
        nullable=False
    )

    career_summary = Column(
        String,
        nullable=True
    )

    skills = Column(
        String,
        nullable=True
    )

    strengths = Column(
        String,
        nullable=True
    )

    skill_gaps = Column(
        String,
        nullable=True
    )

    recommended_roles = Column(
        String,
        nullable=True
    )

    learning_recommendations = Column(
        String,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    token = Column(
        String(255),
        nullable=False,
        unique=True,
        index=True
    )

    expires_at = Column(
        DateTime,
        nullable=False
    )

    used = Column(
        Integer,
        nullable=False,
        default=0
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )