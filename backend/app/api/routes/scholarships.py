from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.scholarship import Scholarship
from app.schemas.scholarship import ScholarshipCreate, ScholarshipResponse

router = APIRouter()


@router.get("/", response_model=List[ScholarshipResponse])
async def list_scholarships(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    scholarships = db.query(Scholarship).offset(skip).limit(limit).all()

    def serialize_scholarship(s):
        return {
            "scholarship_name": s.scholarship_name,
            "scholarship_description": s.scholarship_description,
            "scholarship_amount": s.scholarship_amount,
            "scholarship_deadline": s.scholarship_deadline,
            "scholarship_url": s.scholarship_url,
            "scholarship_category": s.scholarship_category if isinstance(s.scholarship_category, list) else [s.scholarship_category],
            "scholarship_country": s.scholarship_country,
            "scholarship_min_gpa": s.scholarship_min_gpa,
            "scholarship_min_education_level": s.scholarship_min_education_level,
            "scholarship_gender_looking_for": s.scholarship_gender_looking_for,
            "scholarship_max_age": s.scholarship_max_age,
            "scholarship_image": s.scholarship_image,
            "scholarship_status": s.scholarship_status,
            "tags": s.tags,
            "recommended": getattr(s, "recommended", False),
            "id": str(s.id),
            "created_at": s.created_at,
            "updated_at": s.updated_at,
        }
    return [serialize_scholarship(s) for s in scholarships]


@router.get("/{scholarship_id}", response_model=ScholarshipResponse)
async def get_scholarship(
    scholarship_id: str,
    db: Session = Depends(get_db)
):
    scholarship = db.query(Scholarship).filter(
        Scholarship.id == scholarship_id).first()
    if scholarship is None:
        raise HTTPException(status_code=404, detail="Scholarship not found")
    return {
        "scholarship_name": scholarship.scholarship_name,
        "scholarship_description": scholarship.scholarship_description,
        "scholarship_amount": scholarship.scholarship_amount,
        "scholarship_deadline": scholarship.scholarship_deadline,
        "scholarship_url": scholarship.scholarship_url,
        "scholarship_category": scholarship.scholarship_category,
        "scholarship_country": scholarship.scholarship_country,
        "scholarship_min_gpa": scholarship.scholarship_min_gpa,
        "scholarship_min_education_level": scholarship.scholarship_min_education_level,
        "scholarship_gender_looking_for": scholarship.scholarship_gender_looking_for,
        "scholarship_max_age": scholarship.scholarship_max_age,
        "scholarship_image": scholarship.scholarship_image,
        "scholarship_status": scholarship.scholarship_status,
        "tags": scholarship.tags,
        "recommended": getattr(scholarship, "recommended", False),
        "id": str(scholarship.id),
        "created_at": scholarship.created_at,
        "updated_at": scholarship.updated_at,
    }


@router.post("/", response_model=ScholarshipResponse)
async def create_scholarship(
    scholarship: ScholarshipCreate,
    db: Session = Depends(get_db)
):
    db_scholarship = Scholarship(**scholarship.dict())
    db.add(db_scholarship)
    db.commit()
    db.refresh(db_scholarship)
    return db_scholarship
