from pydantic import BaseModel, Field
from typing import List, Optional


class UserProfile(BaseModel):
    """Schema for user profile data used in recommendations"""
    interests: str = Field(...,
                           description="User's academic and personal interests")
    field_of_study: str = Field(...,
                                description="User's field of study or major")
    country: str = Field(..., description="User's country of residence")
    gpa: Optional[float] = Field(
        None, description="User's GPA (if applicable)")
    age: Optional[int] = Field(None, description="User's age (if applicable)")

    class Config:
        json_schema_extra = {
            "example": {
                "interests": "machine learning artificial intelligence data science",
                "field_of_study": "Computer Science",
                "country": "United States",
                "gpa": 3.8,
                "age": 20
            }
        }
