from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ARRAY, Date, Numeric
from datetime import datetime
from app.db.database import Base
from sqlalchemy.dialects.postgresql import UUID
import uuid


class Scholarship(Base):
    __tablename__ = "scholarships"

    id = Column(UUID(as_uuid=True), primary_key=True,
                default=uuid.uuid4, index=True)
    scholarship_name = Column(String, nullable=False)
    scholarship_description = Column(String, nullable=True)
    scholarship_amount = Column(Integer, nullable=True)
    scholarship_deadline = Column(Date, nullable=True)
    scholarship_url = Column(String, nullable=True)
    scholarship_image = Column(String, nullable=True)
    scholarship_status = Column(String, default='active', nullable=True)
    scholarship_category = Column(ARRAY(String), nullable=True)
    scholarship_min_gpa = Column(Numeric, nullable=True)
    scholarship_min_education_level = Column(String, nullable=True)
    scholarship_country = Column(String, nullable=True)
    scholarship_gender_looking_for = Column(String, nullable=True)
    scholarship_max_age = Column(Integer, nullable=True)
    tags = Column(ARRAY(String), nullable=True)
    recommended = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)
