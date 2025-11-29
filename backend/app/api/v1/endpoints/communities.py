"""Community endpoints."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Community
from app.schemas.schemas import CommunityCreate, CommunityUpdate, CommunityResponse

router = APIRouter(prefix="/communities", tags=["communities"])


@router.get("", response_model=List[CommunityResponse])
def list_communities(
    skip: int = 0,
    limit: int = 100,
    country: str = None,
    db: Session = Depends(get_db)
):
    """List all communities with optional filtering."""
    query = db.query(Community)
    
    if country:
        query = query.filter(Community.country == country)
    
    communities = query.offset(skip).limit(limit).all()
    return communities


@router.post("", response_model=CommunityResponse, status_code=status.HTTP_201_CREATED)
def create_community(
    community: CommunityCreate,
    db: Session = Depends(get_db)
):
    """Create a new community."""
    db_community = Community(**community.dict())
    db.add(db_community)
    db.commit()
    db.refresh(db_community)
    return db_community


@router.get("/{community_id}", response_model=CommunityResponse)
def get_community(
    community_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific community by ID."""
    community = db.query(Community).filter(Community.id == community_id).first()
    if not community:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Community not found"
        )
    return community


@router.put("/{community_id}", response_model=CommunityResponse)
def update_community(
    community_id: int,
    community_update: CommunityUpdate,
    db: Session = Depends(get_db)
):
    """Update a community."""
    community = db.query(Community).filter(Community.id == community_id).first()
    if not community:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Community not found"
        )
    
    update_data = community_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(community, key, value)
    
    db.commit()
    db.refresh(community)
    return community


@router.delete("/{community_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_community(
    community_id: int,
    db: Session = Depends(get_db)
):
    """Delete a community."""
    community = db.query(Community).filter(Community.id == community_id).first()
    if not community:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Community not found"
        )
    
    db.delete(community)
    db.commit()
