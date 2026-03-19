import os 
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import scholarships, recommendation_router, scraping_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API for scholarship recommendations and information scraping",
    version=settings.API_VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS] if settings.BACKEND_CORS_ORIGINS else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with versioned prefix
app.include_router(
    scholarships, prefix=f"{settings.API_V1_STR}/scholarships", tags=["scholarships"])
app.include_router(recommendation_router,
                   prefix=f"{settings.API_V1_STR}/recommendations", tags=["recommendations"])
app.include_router(
    scraping_router, prefix=f"{settings.API_V1_STR}/scraping", tags=["scraping"])


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": settings.API_VERSION,
        "environment": settings.ENVIRONMENT
    }


@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "version": settings.API_VERSION,
        "docs_url": f"/docs"
    }

if __name__ == "__main__": 
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))