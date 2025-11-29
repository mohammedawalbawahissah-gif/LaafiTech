"""Main FastAPI application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.api.v1.endpoints import communities, campaigns, ml

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize app
app = FastAPI(
    title=settings.app_name,
    description="AI-enabled period-poverty campaign platform",
    version=settings.app_version,
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(
    communities.router,
    prefix=settings.api_v1_prefix
)
app.include_router(
    campaigns.router,
    prefix=settings.api_v1_prefix
)
app.include_router(
    ml.router,
    prefix=settings.api_v1_prefix
)


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "message": "Welcome to LaafiTech",
        "version": settings.app_version,
        "docs": "/api/docs"
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )
