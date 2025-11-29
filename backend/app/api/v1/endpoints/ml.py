"""ML/Analytics endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schemas import (
    DonorMatchRequest, DonorMatchResponse,
    ImpactPredictionRequest, ImpactPredictionResponse,
    StoryGenerationRequest, StoryGenerationResponse,
    DashboardMetrics
)
from app.ml.predictor import DonorMatcher, ImpactPredictor, StoryGenerator

router = APIRouter(prefix="/ml", tags=["machine-learning"])


# Initialize ML components
donor_matcher = DonorMatcher()
impact_predictor = ImpactPredictor()
story_generator = StoryGenerator()


@router.post("/match-donors", response_model=list[DonorMatchResponse])
def match_donors(
    request: DonorMatchRequest,
    db: Session = Depends(get_db)
):
    """
    Get donor recommendations for campaigns based on donor profile and preferences.
    Uses collaborative filtering and similarity matching.
    """
    try:
        matches = donor_matcher.find_matches(request.donor_id, request.limit, db)
        return matches
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error in donor matching: {str(e)}"
        )


@router.post("/predict-impact", response_model=ImpactPredictionResponse)
def predict_impact(
    request: ImpactPredictionRequest,
    db: Session = Depends(get_db)
):
    """
    Predict the impact of a campaign based on funding and timeline.
    Uses historical data and ML models to forecast outcomes.
    """
    try:
        prediction = impact_predictor.predict(
            request.campaign_id,
            request.current_funding,
            request.days_remaining,
            db
        )
        return prediction
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error in impact prediction: {str(e)}"
        )


@router.post("/generate-story", response_model=StoryGenerationResponse)
def generate_story(
    request: StoryGenerationRequest,
    db: Session = Depends(get_db)
):
    """
    Generate AI-powered narrative for a campaign using data about the community.
    Uses NLP to create compelling storytelling content.
    """
    try:
        story = story_generator.generate(
            request.community_id,
            request.campaign_title,
            request.goal_amount,
            request.tone,
            db
        )
        return story
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error in story generation: {str(e)}"
        )


@router.get("/dashboard-metrics", response_model=DashboardMetrics)
def get_dashboard_metrics(db: Session = Depends(get_db)):
    """Get dashboard metrics and KPIs."""
    from app.models.models import Community, Campaign, Donation, User
    
    total_communities = db.query(Community).count()
    active_campaigns = db.query(Campaign).filter(
        Campaign.status == "active"
    ).count()
    total_funding = db.query(Donation).filter(
        Donation.status == "completed"
    ).with_entities(
        lambda: db.func.sum(Donation.amount)
    ).scalar() or 0
    
    return DashboardMetrics(
        total_communities=total_communities,
        active_campaigns=active_campaigns,
        total_funding=float(total_funding),
        girls_helped=0,  # To be calculated from impact metrics
        pads_distributed=0,  # To be calculated from impact metrics
        avg_campaign_success_rate=0.72,  # Placeholder
        top_donors=[],
        trending_campaigns=[]
    )
