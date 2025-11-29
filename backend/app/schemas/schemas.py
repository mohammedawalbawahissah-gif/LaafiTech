"""Pydantic schemas for request/response validation."""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "donor"


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Organization Schemas
class OrganizationBase(BaseModel):
    name: str
    description: str
    organization_type: str
    location: str
    website: Optional[str] = None
    contact_email: EmailStr
    phone: Optional[str] = None


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationResponse(OrganizationBase):
    id: int
    owner_id: int
    verification_status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# Community Schemas
class CommunityBase(BaseModel):
    name: str
    country: str
    region: str
    district: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    population: Optional[int] = None
    girls_count: Optional[int] = None
    poverty_index: Optional[float] = None
    menstrual_health_score: Optional[float] = None
    school_enrollment_rate: Optional[float] = None
    description: Optional[str] = None


class CommunityCreate(CommunityBase):
    pass


class CommunityUpdate(BaseModel):
    poverty_index: Optional[float] = None
    menstrual_health_score: Optional[float] = None
    school_enrollment_rate: Optional[float] = None
    last_assessment_date: Optional[datetime] = None


class CommunityResponse(CommunityBase):
    id: int
    poverty_index: float
    menstrual_health_score: float
    data_quality_score: float
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Campaign Schemas
class CampaignBase(BaseModel):
    title: str
    description: str
    story_title: str
    story_narrative: str
    goal_amount: float
    beneficiary_count: Optional[int] = None
    items_needed: Dict[str, int] = {}


class CampaignCreate(CampaignBase):
    community_id: int
    organization_id: int
    start_date: datetime
    end_date: datetime


class CampaignUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    story_narrative: Optional[str] = None
    goal_amount: Optional[float] = None
    items_needed: Optional[Dict[str, int]] = None


class CampaignResponse(CampaignBase):
    id: int
    community_id: int
    organization_id: int
    status: str
    current_amount: float
    views: int
    shares: int
    predicted_funding: Optional[float]
    created_at: datetime
    
    class Config:
        from_attributes = True


# Donation Schemas
class DonationCreate(BaseModel):
    campaign_id: int
    amount: float
    donor_message: Optional[str] = None
    is_anonymous: bool = False


class DonationResponse(BaseModel):
    id: int
    campaign_id: int
    donor_id: int
    amount: float
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# ML Endpoints
class DonorMatchRequest(BaseModel):
    donor_id: int
    limit: int = 5


class DonorMatchResponse(BaseModel):
    campaign_id: int
    campaign_title: str
    match_score: float
    match_reason: str


class ImpactPredictionRequest(BaseModel):
    campaign_id: int
    current_funding: float
    days_remaining: int


class ImpactPredictionResponse(BaseModel):
    predicted_reach: int
    predicted_girls_helped: int
    predicted_items_distributed: Dict[str, int]
    confidence_score: float


class StoryGenerationRequest(BaseModel):
    community_id: int
    campaign_title: str
    goal_amount: float
    tone: str = "inspirational"  # inspirational, urgent, hopeful


class StoryGenerationResponse(BaseModel):
    narrative: str
    suggested_media: List[str]
    sentiment_score: float


# Analytics Schemas
class DashboardMetrics(BaseModel):
    total_communities: int
    active_campaigns: int
    total_funding: float
    girls_helped: int
    pads_distributed: int
    avg_campaign_success_rate: float
    top_donors: List[Dict[str, Any]]
    trending_campaigns: List[Dict[str, Any]]
