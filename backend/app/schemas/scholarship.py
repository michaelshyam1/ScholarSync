from pydantic import BaseModel, ConfigDict, field_serializer
from typing import Optional, List, Union
from datetime import datetime, date
from uuid import UUID
from decimal import Decimal


class ScholarshipBase(BaseModel):
    scholarship_name: str  # Required field
    scholarship_description: Optional[str] = None
    scholarship_amount: Optional[int] = None  # Changed from float to int
    # Changed from datetime to date
    scholarship_deadline: Optional[date] = None
    scholarship_url: Optional[str] = None
    scholarship_image: Optional[str] = None
    scholarship_status: Optional[str] = "active"
    scholarship_category: Optional[List[str]] = None
    # Changed from float to Decimal
    scholarship_min_gpa: Optional[Decimal] = None
    scholarship_min_education_level: Optional[str] = None
    scholarship_country: Optional[str] = None
    scholarship_gender_looking_for: Optional[str] = None
    scholarship_max_age: Optional[int] = None
    tags: Optional[List[str]] = []
    recommended: Optional[bool] = False


class ScholarshipCreate(ScholarshipBase):
    pass


class ScholarshipUpdate(ScholarshipBase):
    pass


class ScholarshipResponse(ScholarshipBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "scholarship_name": "BrightSparks Scholarship",
                "scholarship_description": "A great opportunity for students...",
                "scholarship_amount": 10000,
                "scholarship_deadline": "2024-12-31",
                "scholarship_url": "https://brightsparks.com.sg/profile/123",
                "scholarship_image": "https://example.com/image.jpg",
                "scholarship_status": "active",
                "scholarship_category": ["Academic", "Merit-based"],
                "scholarship_country": "Singapore",
                "scholarship_min_gpa": 3.5,
                "scholarship_min_education_level": "High School",
                "scholarship_gender_looking_for": "Any",
                "scholarship_max_age": 25,
                "tags": ["academic", "merit-based"],
                "recommended": False
            }
        }
    )

    @field_serializer('id')
    def serialize_id(self, v: Union[UUID, str], _info):
        return str(v) if v is not None else None
