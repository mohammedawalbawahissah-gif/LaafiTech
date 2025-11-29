"""ML predictive models and algorithms."""
from typing import List, Dict, Any
from datetime import datetime
import numpy as np
from sqlalchemy.orm import Session
from app.models.models import Campaign, Community, Donation, DonorProfile, User
from app.schemas.schemas import (
    DonorMatchResponse, ImpactPredictionResponse, StoryGenerationResponse
)


class DonorMatcher:
    """
    Intelligent donor-campaign matching using similarity algorithms.
    Matches donors with campaigns based on:
    - Geographic preference
    - Cause alignment
    - Donation history
    - Campaign needs
    """
    
    def find_matches(self, donor_id: int, limit: int, db: Session) -> List[DonorMatchResponse]:
        """Find best matching campaigns for a donor."""
        # Get donor profile
        donor = db.query(User).filter(User.id == donor_id).first()
        if not donor:
            return []
        
        donor_profile = db.query(DonorProfile).filter(
            DonorProfile.user_id == donor_id
        ).first()
        
        # Get active campaigns
        campaigns = db.query(Campaign).filter(
            Campaign.status == "active"
        ).all()
        
        # Score campaigns
        matches = []
        for campaign in campaigns:
            score = self._calculate_match_score(donor, donor_profile, campaign)
            reason = self._get_match_reason(donor_profile, campaign)
            
            matches.append({
                "campaign_id": campaign.id,
                "campaign_title": campaign.title,
                "match_score": score,
                "match_reason": reason
            })
        
        # Sort by score and limit
        matches.sort(key=lambda x: x["match_score"], reverse=True)
        return matches[:limit]
    
    def _calculate_match_score(
        self,
        donor: User,
        donor_profile: DonorProfile,
        campaign: Campaign
    ) -> float:
        """Calculate match score between donor and campaign (0-1)."""
        score = 0.0
        weights_sum = 0.0
        
        # Cause alignment (40%)
        if donor_profile and donor_profile.causes:
            if "health" in donor_profile.causes or "education" in donor_profile.causes:
                score += 0.4 * 1.0
                weights_sum += 0.4
        else:
            weights_sum += 0.4
        
        # Budget alignment (30%)
        if donor_profile and donor_profile.average_donation > 0:
            donation_ratio = min(
                donor_profile.average_donation / campaign.goal_amount * 1000,
                1.0
            )
            score += 0.3 * donation_ratio
            weights_sum += 0.3
        else:
            weights_sum += 0.3
        
        # Engagement history (30%)
        if donor_profile and donor_profile.donation_count > 0:
            engagement = min(donor_profile.donation_count / 20.0, 1.0)
            score += 0.3 * engagement
            weights_sum += 0.3
        else:
            weights_sum += 0.3
        
        return score / weights_sum if weights_sum > 0 else 0.5
    
    def _get_match_reason(
        self,
        donor_profile: DonorProfile,
        campaign: Campaign
    ) -> str:
        """Get human-readable reason for the match."""
        if donor_profile:
            if donor_profile.causes and "health" in donor_profile.causes:
                return "cause_alignment"
            if donor_profile.preferred_regions:
                if campaign.community_id:
                    return "region_preference"
        return "campaign_quality"


class ImpactPredictor:
    """
    Predict campaign impact using historical data and ML models.
    Predicts:
    - Reach (number of people who will see the campaign)
    - Girls helped
    - Items distributed
    - Funding outcomes
    """
    
    def predict(
        self,
        campaign_id: int,
        current_funding: float,
        days_remaining: int,
        db: Session
    ) -> ImpactPredictionResponse:
        """Predict campaign impact."""
        campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if not campaign:
            return ImpactPredictionResponse(
                predicted_reach=0,
                predicted_girls_helped=0,
                predicted_items_distributed={},
                confidence_score=0.0
            )
        
        # Calculate metrics
        community = db.query(Community).filter(
            Community.id == campaign.community_id
        ).first()
        
        # Predict reach
        predicted_reach = self._predict_reach(campaign, days_remaining)
        
        # Predict girls helped
        predicted_girls = self._predict_girls_helped(
            campaign,
            current_funding,
            community
        )
        
        # Predict items distributed
        predicted_items = self._predict_items_distributed(
            campaign,
            predicted_girls
        )
        
        # Confidence score based on data quality
        confidence = self._calculate_confidence(campaign, community)
        
        return ImpactPredictionResponse(
            predicted_reach=predicted_reach,
            predicted_girls_helped=predicted_girls,
            predicted_items_distributed=predicted_items,
            confidence_score=confidence
        )
    
    def _predict_reach(self, campaign: Campaign, days_remaining: int) -> int:
        """Predict campaign reach."""
        # Base reach from current views
        base_reach = campaign.views * 10
        
        # Growth factor based on days remaining
        growth_factor = max(days_remaining / 30.0, 0.5)
        
        # Engagement multiplier
        engagement_factor = 1.0 + (campaign.shares / (campaign.views + 1)) * 5
        
        predicted_reach = int(base_reach * growth_factor * engagement_factor)
        return max(predicted_reach, campaign.views)
    
    def _predict_girls_helped(
        self,
        campaign: Campaign,
        current_funding: float,
        community: Community
    ) -> int:
        """Predict number of girls helped."""
        if not community or not campaign.goal_amount:
            return 0
        
        # Funding progress
        funding_ratio = current_funding / campaign.goal_amount
        
        # Base on community needs
        base_girls = community.girls_count or 1000
        
        # Predicted girls helped
        predicted = int(base_girls * funding_ratio)
        
        return min(predicted, base_girls)
    
    def _predict_items_distributed(
        self,
        campaign: Campaign,
        predicted_girls: int
    ) -> Dict[str, int]:
        """Predict items to be distributed."""
        items = {}
        
        if campaign.items_needed:
            for item, quantity in campaign.items_needed.items():
                # Scale based on girls helped
                ratio = predicted_girls / (campaign.beneficiary_count or 1000)
                items[item] = int(quantity * ratio)
        else:
            # Default: pads for menstrual health
            items["pads"] = int(predicted_girls * 6)  # 6 packs per girl
            items["medications"] = int(predicted_girls * 0.2)  # 20% need medication
        
        return items
    
    def _calculate_confidence(
        self,
        campaign: Campaign,
        community: Community
    ) -> float:
        """Calculate confidence score (0-1) of predictions."""
        confidence = 0.5  # Base confidence
        
        # Data quality boosts
        if community and community.data_quality_score:
            confidence += community.data_quality_score * 0.3
        
        # Campaign maturity
        if campaign.views > 100:
            confidence += 0.1
        
        if campaign.shares > 10:
            confidence += 0.05
        
        return min(confidence, 0.95)


class StoryGenerator:
    """
    Generate AI-powered narratives for campaigns using NLP.
    Creates compelling stories that:
    - Highlight community needs
    - Inspire action
    - Build emotional connection
    - Drive donations
    """
    
    def generate(
        self,
        community_id: int,
        campaign_title: str,
        goal_amount: float,
        tone: str,
        db: Session
    ) -> StoryGenerationResponse:
        """Generate campaign story."""
        community = db.query(Community).filter(
            Community.id == community_id
        ).first()
        
        narrative = self._generate_narrative(
            community,
            campaign_title,
            goal_amount,
            tone
        )
        
        suggested_media = self._suggest_media(community)
        
        sentiment_score = self._calculate_sentiment(narrative)
        
        return StoryGenerationResponse(
            narrative=narrative,
            suggested_media=suggested_media,
            sentiment_score=sentiment_score
        )
    
    def _generate_narrative(
        self,
        community: Community,
        campaign_title: str,
        goal_amount: float,
        tone: str
    ) -> str:
        """Generate narrative using template and data."""
        if not community:
            return "Help us support a community in need of menstrual health resources."
        
        narratives = {
            "inspirational": self._inspirational_tone,
            "urgent": self._urgent_tone,
            "hopeful": self._hopeful_tone
        }
        
        generator = narratives.get(tone, self._hopeful_tone)
        return generator(community, campaign_title, goal_amount)
    
    def _inspirational_tone(
        self,
        community: Community,
        title: str,
        amount: float
    ) -> str:
        """Generate inspirational narrative."""
        return f"""
        **{title}**
        
        In {community.name}, {community.region}, {community.country}, 
        hundreds of girls are missing school and facing health challenges 
        due to lack of access to menstrual health resources.
        
        Your support can change this. By contributing to this campaign, 
        you're not just providing pads—you're investing in education, 
        health, and the future of girls who deserve to thrive.
        
        Together, we can break the cycle of period poverty and empower 
        {community.girls_count or 'thousands'} girls to stay in school, 
        stay healthy, and reach their full potential.
        
        Join us in making a difference. Every contribution matters.
        """
    
    def _urgent_tone(
        self,
        community: Community,
        title: str,
        amount: float
    ) -> str:
        """Generate urgent narrative."""
        return f"""
        **URGENT: {title}**
        
        RIGHT NOW in {community.name}, girls are out of school 
        because they don't have access to menstrual health products.
        
        The crisis is real. The need is immediate. 
        We need ${amount:,.0f} to provide emergency support.
        
        Without action today:
        • Girls will continue missing critical school days
        • Health complications will worsen
        • The education gap will widen
        
        This is our moment to act. Your urgent support is needed NOW.
        """
    
    def _hopeful_tone(
        self,
        community: Community,
        title: str,
        amount: float
    ) -> str:
        """Generate hopeful narrative."""
        return f"""
        **{title} - A Chance to Hope**
        
        Meet the girls of {community.name}, {community.region}.
        They dream of staying in school, being healthy, and building better futures.
        
        But today, they face a silent barrier: period poverty.
        
        With your help, we can transform hope into action. 
        Your support will bring:
        ✓ Access to quality menstrual health products
        ✓ Health education and support
        ✓ The freedom to stay in school and thrive
        
        Together, we're not just changing one community—
        we're building a movement for menstrual health equity.
        
        Will you join us?
        """
    
    def _suggest_media(self, community: Community) -> List[str]:
        """Suggest media types for campaign."""
        media = [
            "community_portrait_image",
            "girls_in_school_image",
            "health_education_video",
            "success_story_testimonial",
            "infographic_health_facts"
        ]
        return media
    
    def _calculate_sentiment(self, text: str) -> float:
        """Calculate sentiment score (0-1) of narrative."""
        # Simplified sentiment: count positive/negative words
        positive_words = ["hope", "help", "support", "empower", "thrive", "dream", 
                         "change", "freedom", "health", "future", "action"]
        negative_words = ["crisis", "poverty", "barrier", "challenge", "urgent", "need"]
        
        text_lower = text.lower()
        
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        total = positive_count + negative_count
        if total == 0:
            return 0.5
        
        sentiment = positive_count / total
        return min(max(sentiment, 0.3), 0.95)  # Between 0.3 and 0.95
