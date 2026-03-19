from fastapi import APIRouter, BackgroundTasks, HTTPException, Body
from app.utils.scraper import scrape_scholarships, extract_scholarship_from_soup
from app.schemas.scraping import ScrapingResponse, WebsiteSource
from app.schemas.scholarship import ScholarshipResponse
from app.models.scholarship import Scholarship as ScholarshipModel
from app.db.database import SessionLocal

router = APIRouter()


@router.post("/", response_model=ScrapingResponse)
async def start_scraping(
    source: WebsiteSource,
    background_tasks: BackgroundTasks
):
    """
    Start scraping scholarships from specified website source
    """
    try:
        # Add scraping task to background tasks
        background_tasks.add_task(scrape_scholarships, source)
        return {
            "message": f"Started scraping scholarships from {source.url}",
            "website_name": source.name,
            "status": "started"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/scrapBrightSparks", response_model=ScrapingResponse)
async def scrap_brightsparks(background_tasks: BackgroundTasks):
    """
    Start scraping scholarships from BrightSparks Singapore (hardcoded source)
    """
    source = WebsiteSource(
        url="https://brightsparks.com.sg/searchScholarships.php/",
        name="BrightSparks Singapore",
        scholarship_element_selector=".col-span-11.movie",
        name_selector="h4 a span#getUpdatedTitle",
        description_selector=".detail dd",
        amount_selector=None,
        deadline_selector=".caption-deadline h6",
        deadline_format="%d %b %Y",
        category_selector=None,
        country_selector="singapore",
        tags_selector=None
    )
    try:
        background_tasks.add_task(scrape_scholarships, source)
        return {
            "message": f"Started scraping scholarships from {source.url}",
            "website_name": source.name,
            "status": "started"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/extractSingleScholarship", response_model=ScholarshipResponse)
async def extract_single_scholarship(
    body: dict = Body(
        ...,
        example={
            "url": "https://brightsparks.com.sg/profile/123",
            "title_selector": "span#getUpdatedTitle",
            "description_selector": "div.detail dd",
            "deadline_selector": ".caption-deadline h6",
            "provider_selector": "span#getUpdatedName"
        }
    )
):
    from app.utils.scraper import get_rendered_html
    from bs4 import BeautifulSoup
    import logging
    logger = logging.getLogger(__name__)

    url = body.get('url')
    selectors = {
        'title': body.get('title_selector', 'span#getUpdatedTitle'),
        'description': body.get('description_selector', 'div.detail dd'),
        'deadline': body.get('deadline_selector', '.caption-deadline h6'),
        'provider': body.get('provider_selector', 'span#getUpdatedName'),
        'url': url
    }

    html = get_rendered_html(url)
    soup = BeautifulSoup(html, 'html.parser')
    data = extract_scholarship_from_soup(soup, selectors)
    data['scholarship_url'] = url

    # Relaxed validation: just log a warning if name is missing
    if not data.get('scholarship_name'):
        logger.warning(f"scholarship_name is missing for URL: {url}")

    db = SessionLocal()
    try:
        # Let Supabase/Postgres handle UUID generation
        db_obj = ScholarshipModel(
            **{k: v for k, v in data.items() if hasattr(ScholarshipModel, k)})
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

    # Convert SQLAlchemy object to Pydantic schema for response
    return ScholarshipResponse.model_validate(db_obj)
