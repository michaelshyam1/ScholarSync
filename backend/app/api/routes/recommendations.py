from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.scholarship import Scholarship
from app.utils.recommender import recommender
from app.schemas.recommendation import UserProfile
from app.schemas.scholarship import ScholarshipResponse

router = APIRouter()


def serialize_scholarship(s):
    return {
        "scholarship_name": s.scholarship_name,
        "scholarship_description": s.scholarship_description,
        "scholarship_amount": s.scholarship_amount,
        "scholarship_deadline": s.scholarship_deadline,
        "scholarship_url": s.scholarship_url,
        "scholarship_category": s.scholarship_category,
        "scholarship_country": s.scholarship_country,
        "scholarship_min_gpa": s.scholarship_min_gpa,
        "scholarship_min_education_level": s.scholarship_min_education_level,
        "scholarship_gender_looking_for": s.scholarship_gender_looking_for,
        "scholarship_max_age": s.scholarship_max_age,
        "scholarship_image": s.scholarship_image,
        "scholarship_status": s.scholarship_status,
        "tags": s.tags,
        "recommended": getattr(s, "recommended", False),
        "id": str(s.id),  # Convert UUID to string
        "created_at": s.created_at,
        "updated_at": s.updated_at,
    }


@router.post("/", response_model=List[ScholarshipResponse])
async def get_scholarship_recommendations(
    user_profile: UserProfile,
    db: Session = Depends(get_db)
):
    """
    Get personalized scholarship recommendations based on user profile
    """
    try:
        print("Received user profile for recommendations:", user_profile)
        recommendations = recommender.get_recommendations(user_profile, db)
        print("Returning recommendations:", recommendations)
        return [serialize_scholarship(s) for s in recommendations]
    except Exception as e:
        print("Error in recommendations endpoint:", e)
        raise HTTPException(status_code=500, detail=str(e))
