from .scholarships import router as scholarships
from .recommendations import router as recommendation_router
from .scraping import router as scraping_router

__all__ = ['scholarships', 'recommendation_router', 'scraping_router']
