from pydantic import BaseModel, AnyHttpUrl, HttpUrl
from typing import Optional, Union


class WebsiteSource(BaseModel):
    """Schema for defining how to scrape a scholarship website"""
    url: Union[AnyHttpUrl, HttpUrl, str]  # More lenient URL validation
    name: str
    scholarship_element_selector: str  # CSS selector for scholarship container
    name_selector: str                 # CSS selector for scholarship name
    description_selector: Optional[str] = None
    amount_selector: Optional[str] = None
    deadline_selector: Optional[str] = None
    deadline_format: Optional[str] = "%Y-%m-%d"  # Default date format
    category_selector: Optional[str] = None
    country_selector: Optional[str] = None
    tags_selector: Optional[str] = None


class ScrapingResponse(BaseModel):
    """Schema for scraping response"""
    message: str
    website_name: str
    total_scraped: Optional[int] = None
    status: str = "started"
