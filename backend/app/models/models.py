"""
Database models for LaafiTech platform.
"""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, DateTime,
    Boolean, Enum, ForeignKey, JSON, UniqueConstraint
)
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class UserRole(str, enum.Enum):
    """User role enumeration."""
    ADMIN = "admin"
    NGO = "ngo"
    DONOR = "donor"
    COMMUNITY_LEAD = "community_lead"
    PARTNER = "partner"


class CampaignStatus(str, enum.Enum):
    """Campaign status enumeration."""
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class User(Base):
    """User model."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    role = Column(Enum(UserRole), default=UserRole.DONOR)
    is_active = Column(Boolean, default=True)
    profile_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    organizations = relationship("Organization", back_populates="owner")
    campaigns = relationship("Campaign", back_populates="created_by_user")
    donations = relationship("Donation", back_populates="donor")


class Organization(Base):
    """Organization model (NGO, Corporate, etc.)."""
    __tablename__ = "organizations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(Text)
    organization_type = Column(String)  # NGO, Corporate, Government, etc.
    owner_id = Column(Integer, ForeignKey("users.id"))
    location = Column(String)
    website = Column(String, nullable=True)
    contact_email = Column(String)
    phone = Column(String, nullable=True)
    verification_status = Column(String, default="pending")  # pending, verified, rejected
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="organizations")
    campaigns = relationship("Campaign", back_populates="organization")


class Community(Base):
    """Community model."""
    __tablename__ = "communities"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    country = Column(String)
    region = Column(String)
    district = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    population = Column(Integer, nullable=True)
    girls_count = Column(Integer, nullable=True)  # Estimated girls needing support
    poverty_index = Column(Float, nullable=True)  # 0-1 scale
    menstrual_health_score = Column(Float, nullable=True)  # 0-100 scale
    school_enrollment_rate = Column(Float, nullable=True)
    health_facilities = Column(Integer, default=0)
    description = Column(Text, nullable=True)
    data_quality_score = Column(Float, default=0.5)  # 0-1 scale
    last_assessment_date = Column(DateTime, nullable=True)
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    campaigns = relationship("Campaign", back_populates="community")


class Campaign(Base):
    """Campaign model."""
    __tablename__ = "campaigns"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    community_id = Column(Integer, ForeignKey("communities.id"))
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    created_by = Column(Integer, ForeignKey("users.id"))
    status = Column(Enum(CampaignStatus), default=CampaignStatus.DRAFT)
    
    # Campaign Goals
    goal_amount = Column(Float)  # Target fundraising amount
    current_amount = Column(Float, default=0)
    beneficiary_count = Column(Integer, nullable=True)
    items_needed = Column(JSON)  # e.g., {"pads": 5000, "medications": 200}
    
    # Timeline
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    
    # Media & Storytelling
    story_title = Column(String)
    story_narrative = Column(Text)  # AI-generated or manual narrative
    media_assets = Column(JSON, nullable=True)  # URLs to images, videos
    
    # Analytics
    views = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    engagement_score = Column(Float, default=0)
    predicted_reach = Column(Integer, nullable=True)
    predicted_funding = Column(Float, nullable=True)
    
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    community = relationship("Community", back_populates="campaigns")
    organization = relationship("Organization", back_populates="campaigns")
    created_by_user = relationship("User", back_populates="campaigns")
    donations = relationship("Donation", back_populates="campaign")


class Donation(Base):
    """Donation model."""
    __tablename__ = "donations"
    
    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    donor_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float)
    currency = Column(String, default="USD")
    status = Column(String, default="completed")  # pending, completed, failed, refunded
    transaction_id = Column(String, unique=True, nullable=True)
    donor_message = Column(Text, nullable=True)
    is_anonymous = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    campaign = relationship("Campaign", back_populates="donations")
    donor = relationship("User", back_populates="donations")


class DonorProfile(Base):
    """Extended donor profile with preferences."""
    __tablename__ = "donor_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    total_donated = Column(Float, default=0)
    donation_count = Column(Integer, default=0)
    average_donation = Column(Float, default=0)
    causes = Column(JSON)  # ["education", "health", "girls"]
    preferred_regions = Column(JSON, nullable=True)
    budget_range = Column(String, nullable=True)  # "small", "medium", "large"
    last_donation_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class MatchingRecord(Base):
    """Record of donor-campaign matches."""
    __tablename__ = "matching_records"
    
    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("users.id"))
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    match_score = Column(Float)  # 0-1 scale
    match_reason = Column(String)  # e.g., "region_preference", "cause_alignment"
    status = Column(String, default="pending")  # pending, accepted, rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    accepted_at = Column(DateTime, nullable=True)


class ImpactMetric(Base):
    """Impact metrics for campaigns."""
    __tablename__ = "impact_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    metric_type = Column(String)  # e.g., "pads_distributed", "girls_enrolled", etc.
    value = Column(Float)
    unit = Column(String)  # e.g., "count", "percentage"
    verified = Column(Boolean, default=False)
    verification_source = Column(String, nullable=True)
    recorded_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
