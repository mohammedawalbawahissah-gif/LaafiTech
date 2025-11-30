# 🎬 LaafiTech Video Demo Script

**Duration**: 5-7 minutes  
**Format**: Screen recording with voiceover  
**Target Audience**: Investors, stakeholders, end users

---

## 📹 Production Guide

### Equipment Needed
- Screen recording software (OBS Studio, ScreenFlow, Camtasia)
- Microphone (USB or built-in)
- Video editing software (optional: Adobe Premiere, DaVinci Resolve)
- Frontend running on localhost:5173
- Backend running on localhost:8000

### Recording Settings
- **Resolution**: 1920x1080 (Full HD)
- **Frame Rate**: 30 fps
- **Audio**: 128 kbps, 48 kHz
- **Format**: MP4 (H.264)
- **Total File Size**: ~200-300 MB

---

## 🎯 Video Sections

### SECTION 1: Introduction & Hook (0:00 - 0:30)

**Visual**: Show LaafiTech logo with background of campaign images

**Script**:
> "Meet LaafiTech — the AI-powered platform transforming period-poverty campaigns across Africa. With just a few clicks, NGOs, donors, and communities can connect, collaborate, and create lasting change. Let's see how it works."

**Action**:
- Fade in LaafiTech branding
- Show quick clips of campaign imagery
- Transition to home screen

---

### SECTION 2: Landing & Navigation (0:30 - 1:15)

**Visual**: Dashboard page loads

**Script**:
> "When users log in, they're greeted with a comprehensive dashboard. Here they can see real-time campaign metrics, funding trends, and impact data at a glance."

**Actions**:
1. **At 0:30**: Show login screen (if built) or jump to dashboard
2. **At 0:45**: Hover over dashboard cards to show stats:
   - "24 Active Campaigns"
   - "47 Registered Communities"
   - "$250K Raised"
3. **At 1:00**: Scroll down to show:
   - Funding trend chart (animated line chart)
   - Impact distribution pie chart
   - Recent campaigns table
4. **At 1:15**: Click on navigation menu to show options:
   - Dashboard
   - Communities
   - Campaigns
   - Donors
   - Analytics

**Narration Tips**:
- Speak clearly and pause between sections
- Emphasize key metrics
- Highlight the visual data storytelling

---

### SECTION 3: Exploring Communities (1:15 - 2:00)

**Visual**: Navigate to Communities page

**Script**:
> "The Communities section connects NGOs with high-need regions. Each community shows population data, need levels, and active campaigns. Users can search, filter by region, and easily discover where their impact is needed most."

**Actions**:
1. **At 1:15**: Click "Communities" in navigation
2. **At 1:25**: Show community cards loading with:
   - Location emoji and name
   - Population statistics
   - Need status (color-coded)
   - Active campaign count
3. **At 1:40**: Use search box to search "Kampala"
   - Show real-time filtering
   - Highlight the smoothness
4. **At 1:50**: Click filter button to show filter options
   - Region filters (East Africa, West Africa)
   - Need level filters
5. **At 2:00**: Show pagination at bottom
   - Click next page to show more communities

**Screen Movement**:
- Smooth scrolling through cards
- Gradual transitions between filters
- Hover effects on cards (if Material-UI hover visible)

---

### SECTION 4: Browsing & Donating to Campaigns (2:00 - 3:15)

**Visual**: Navigate to Campaigns page

**Script**:
> "The Campaigns section is where the magic happens. Donors can browse active fundraising campaigns, see real-time progress, and make a difference. Each campaign shows funding goals, beneficiary counts, and days remaining."

**Actions**:
1. **At 2:00**: Click "Campaigns" in navigation
2. **At 2:10**: Show campaign cards with:
   - Campaign title with emoji
   - Location
   - Status badge (Active/Closing)
   - Funding progress bar with percentage
   - Goal vs raised amounts
   - Beneficiary count
3. **At 2:30**: Slowly scroll through 3-4 campaigns
   - Show variety: "School Supply", "Health Initiative", "Community Education"
   - Highlight one closing soon (urgency)
4. **At 2:45**: Click on a campaign card
   - Transition to Campaign Detail page
5. **At 2:50**: On Campaign Detail page, show:
   - Full campaign story
   - Beneficiary photos/description
   - Funding progress (animated fill)
   - Recent updates timeline
6. **At 3:05**: Scroll down to show donation section
7. **At 3:15**: Click "[💳 Donate Now]" button
   - Show donation modal appears
   - Don't actually complete (or use test payment)

**Narration**:
> "Donors can support specific campaigns, track their impact, and even follow updates as the campaign progresses. Every donation directly helps girls stay in school."

---

### SECTION 5: Campaign Creation Flow (3:15 - 4:30)

**Visual**: Navigate to Create Campaign

**Script**:
> "NGOs can easily create campaigns in just four steps. Let's walk through the creation process to show how simple it is to launch a new initiative."

**Actions**:
1. **At 3:15**: Click "Create Campaign" button or navigate to /create-campaign
2. **At 3:25**: Show Step 1 form:
   - Campaign title field (type: "Nairobi Youth Health Initiative")
   - Community dropdown (select: "Nairobi, Kenya")
   - Description field (type sample text)
   - Category checkboxes
   - Progress bar showing "1 of 4"
3. **At 3:50**: Click "Next Step →"
   - Progress bar animates to "2 of 4"
4. **At 4:00**: Show Step 2 form:
   - Funding goal input (type: "$8,000")
   - Campaign duration fields
   - Start/end date pickers
5. **At 4:15**: Click "Next Step →"
   - Progress bar to "3 of 4"
6. **At 4:20**: Show Step 3 form:
   - Number of beneficiaries (type: "750")
   - Average age
   - Target description
7. **At 4:25**: Click "Next Step →"
   - Progress bar to "4 of 4"
8. **At 4:30**: Show Step 4 Review screen
   - Display summary
   - Show "[Create Campaign]" button ready

**Narration**:
> "The intuitive form wizard guides NGOs through each step. They define their goal, timeline, and target beneficiaries. Then, with one click, their campaign goes live to thousands of potential donors."

---

### SECTION 6: Donor Management (4:30 - 5:15)

**Visual**: Navigate to Donors page

**Script**:
> "The Donors directory showcases the incredible community of givers supporting this mission. From individual supporters to corporate partners, every donor is making an impact."

**Actions**:
1. **At 4:30**: Click "Donors" in navigation
2. **At 4:40**: Show donor cards with:
   - Avatar (icon for type)
   - Name
   - Type (Individual, NGO, Corporate)
   - Location
   - Total contributed
   - Campaigns supported
   - Join date
3. **At 4:55**: Show filter options
   - Filter by type
   - Filter by region
4. **At 5:05**: Click on a donor card
   - Show donor profile (optional detail view)
5. **At 5:15**: Navigate back to show sort options
   - "Recently Active"
   - "Top Contributors"
   - "New Members"

**Narration**:
> "Our global community of donors ranges from individual supporters giving $5 to major corporations contributing $100K. Together, they're creating systemic change."

---

### SECTION 7: Analytics & Impact (5:15 - 6:15)

**Visual**: Navigate to Analytics page

**Script**:
> "The Analytics dashboard gives stakeholders a bird's-eye view of platform impact. Real-time metrics show how many girls are being reached, funding trends, and projected impact."

**Actions**:
1. **At 5:15**: Click "Analytics" in navigation
2. **At 5:25**: Show key metric cards:
   - Girls Reached: 12,450
   - Active Campaigns: 34
   - Total Funds Raised: $87,250
   - Avg Donation: $52.50
3. **At 5:35**: Show Beneficiary Completion Rate chart
   - Line chart animation
   - Show trend over months
4. **At 5:50**: Show Funding Trend Analysis
   - Bar/area chart
   - Show peaks and valleys
5. **At 6:00**: Show Donor Contribution Breakdown
   - Pie chart animation
   - Show 45% Individual, 35% Organizations, 20% Corporate
6. **At 6:10**: Show Impact Forecast section
   - Projected girls reached in 3 months
   - Confidence level
   - Goal progress indicator

**Narration**:
> "Beyond dollars raised, we track real impact. The platform projects that in the next three months, we'll reach 18,500 additional girls. With predictive analytics powered by AI, we can identify where resources are needed most."

---

### SECTION 8: Mobile Responsiveness (6:15 - 6:45)

**Visual**: Resize browser or show mobile view

**Script**:
> "Whether donors are on desktop or mobile, the experience is seamless. Our responsive design ensures campaigns can be supported from anywhere, anytime."

**Actions**:
1. **At 6:15**: Resize browser window to mobile size (375px width)
2. **At 6:25**: Show mobile dashboard
   - Stacked layout
   - Touch-friendly buttons
3. **At 6:30**: Navigate to campaigns on mobile
   - Show full-width cards
   - Demonstrate touch interactions
4. **At 6:40**: Show mobile donation button
5. **At 6:45**: Resize back to desktop

**Narration**:
> "Mobile optimization is built in from day one. Our users in Africa, where mobile-first internet is the norm, have full access to all platform features."

---

### SECTION 9: Call to Action & Closing (6:45 - 7:00)

**Visual**: Back to dashboard with overlay text

**Script**:
> "LaafiTech isn't just a platform — it's a movement. By connecting donors, NGOs, and communities, we're closing the menstrual health gap and keeping girls in school. Join us today at LaafiTech.org."

**Actions**:
1. **At 6:45**: Show dashboard page again
2. **At 6:50**: Overlay text appears:
   - "Join the movement"
   - "LaafiTech.org"
   - "Together, we close the menstrual health gap"
3. **At 7:00**: Fade to logo screen
   - Contact info if applicable

**Narration**:
> "Every campaign created, every donation made, and every girl supported brings us closer to a world where period poverty doesn't stop anyone from reaching their potential. Learn more at LaafiTech.org."

---

## 🎙️ Voiceover Script (Full)

### Full Script (Read-Through Time: ~6:50)

```
[SECTION 1 - INTRO]
Meet LaafiTech — the AI-powered platform transforming period-poverty campaigns across Africa. 
With just a few clicks, NGOs, donors, and communities can connect, collaborate, and create 
lasting change. Let's see how it works.

[SECTION 2 - DASHBOARD]
When users log in, they're greeted with a comprehensive dashboard. Here they can see real-time 
campaign metrics, funding trends, and impact data at a glance. The dashboard displays active 
campaigns, registered communities, and total funds raised. Below, interactive charts show funding 
trends and impact distribution, giving stakeholders an immediate sense of the platform's reach 
and progress.

[SECTION 3 - COMMUNITIES]
The Communities section connects NGOs with high-need regions. Each community card shows 
population data, need levels, and active campaigns. Users can search, filter by region, and 
easily discover where their impact is needed most. With just a few clicks, users can see that 
Kampala has 125,000 girls in need, Nairobi has 98,000, and communities across East Africa are 
waiting for support.

[SECTION 4 - CAMPAIGNS]
The Campaigns section is where the magic happens. Donors can browse active fundraising campaigns, 
see real-time progress, and make a difference. Each campaign shows funding goals, beneficiary 
counts, and days remaining. Donors are inspired by campaigns like the Kampala School Supply Drive, 
which has raised $4,000 of its $5,000 goal and is helping 500 girls. When donors click on a 
campaign, they see the full story — who they're helping, what they're supporting, and how their 
donation creates impact. Recent updates show exactly how their money is being used.

[SECTION 5 - CREATE CAMPAIGN]
NGOs can easily create campaigns in just four steps. First, they provide basic information — the 
campaign name, which community they're serving, and their campaign description. Next, they set 
the funding goal and campaign timeline. Then, they specify how many beneficiaries they're 
targeting and key details about them. Finally, they review everything and launch. Within minutes, 
a campaign that will help hundreds of girls is live for thousands of donors to see.

[SECTION 6 - DONORS]
The Donors directory showcases the incredible community of givers supporting this mission. From 
individual supporters giving $5 to major corporations contributing hundreds of thousands, every 
donor is making an impact. The platform celebrates these heroes and allows them to see all the 
campaigns they've supported and the real change they've created.

[SECTION 7 - ANALYTICS]
The Analytics dashboard gives stakeholders a bird's-eye view of platform impact. Real-time 
metrics show that over 12,000 girls have already been reached, with 34 active campaigns raising 
nearly $90,000. Funding trends reveal patterns and peaks. The donor breakdown shows that this 
is a truly grassroots movement — 45% from individuals, 35% from organizations, and 20% from 
corporate partners. Most importantly, our AI-powered predictive models forecast that in just 
three months, we'll reach nearly 20,000 more girls. We're on track to exceed our goals by 12%.

[SECTION 8 - MOBILE]
Whether donors are on desktop or mobile, the experience is seamless. Our responsive design ensures 
campaigns can be supported from anywhere, anytime. For the millions of users across Africa accessing 
the internet primarily through mobile phones, this isn't optional — it's essential.

[SECTION 9 - CLOSING]
LaafiTech isn't just a platform — it's a movement. By connecting donors, NGOs, and communities, 
we're closing the menstrual health gap and keeping girls in school. Every campaign created, every 
donation made, and every girl supported brings us closer to a world where period poverty doesn't 
stop anyone from reaching their potential. Learn more at LaafiTech.org. Together, we close the 
menstrual health gap.
```

---

## 📊 Scene-by-Scene Breakdown

| Timestamp | Scene | Duration | Key Points |
|-----------|-------|----------|-----------|
| 0:00-0:30 | Introduction | 30s | Hook, branding, mission |
| 0:30-1:15 | Dashboard | 45s | KPI metrics, charts, overview |
| 1:15-2:00 | Communities | 45s | Search, filter, discovery |
| 2:00-3:15 | Campaigns & Donation | 75s | Browse, details, CTA |
| 3:15-4:30 | Create Campaign | 75s | 4-step wizard, ease of use |
| 4:30-5:15 | Donors | 45s | Community, diversity, impact |
| 5:15-6:15 | Analytics | 60s | Metrics, forecasting, AI insights |
| 6:15-6:45 | Mobile | 30s | Responsiveness, accessibility |
| 6:45-7:00 | Closing | 15s | CTA, branding, mission |

**Total**: ~6:50 (under 7 minutes)

---

## 🎬 Recording Tips

### Before Recording
1. **Close unnecessary apps** (notifications, chat, email)
2. **Set display to 1920x1080** for consistency
3. **Have all pages loaded** but not visible (reduce load times)
4. **Test voiceover recording** separately
5. **Prepare test data** with meaningful campaigns/donors/metrics
6. **Enable dark theme** if brand-compliant (reduces eye strain on viewers)

### During Recording
1. **Move mouse smoothly** — use cursor effects sparingly
2. **Pause before clicks** (0.5-1 second) so viewers can see what's about to happen
3. **Scroll slowly** (2-3 seconds per screen height)
4. **Hover over elements** to show interactivity
5. **Record full clicks** (press and release visible)
6. **Keyboard interactions** — type visibly and slowly

### Recording Techniques
1. **Zoom In**: When showing details, zoom browser to 125% on dense areas
2. **Spotlight**: Use recording software's spotlight effect for important UI elements
3. **Arrows**: Draw arrows pointing to key features
4. **Captions**: Add on-screen text highlighting key metrics

---

## 🔊 Audio Production

### Voiceover Recording
1. **Record in quiet room** (minimize echo and background noise)
2. **Use noise gate** if using consumer mic
3. **Speak clearly and slowly** (110-130 WPM, not rushed)
4. **Vary tone and pace** — emphasize key points
5. **Pause between sections** for clarity
6. **Re-record sections** if mistakes occur (easier than editing in-timeline)

### Audio Mixing
1. **Background music**: Royalty-free, uplifting track at -18dB
   - Recommendation: YouTube Audio Library or Epidemic Sound
2. **Voiceover**: -3dB (dominant)
3. **UI sounds**: 
   - Click sounds: -6dB (subtle)
   - Notification sounds: -3dB
   - Chart animations: Fade in/out with music
4. **Silence**: 0-1 second between major sections (not awkward)

### Music Suggestions
- **Intro**: Bright, uplifting (10-15 seconds)
- **Main sections**: Calm, professional background (background level)
- **Closing**: Inspirational, emotional (builds over final 30 seconds)

---

## 🎨 Post-Production Editing

### Lower Thirds (Name/Title at Bottom)
```
┌────────────────────────────────────┐
│                                    │
│                                    │
│                                    │
│ ┌──────────────────────────────┐  │
│ │ Presenter Name               │  │
│ │ LaafiTech Co-Founder         │  │
│ └──────────────────────────────┘  │
└────────────────────────────────────┘
```

### Transitions
- **Dissolve** (0.3 seconds) between major sections
- **Fade to black** (0.5 seconds) for emphasis
- **Slide** for page transitions (0.5 seconds, not jarring)

### Graphics Overlays
1. **Metric callouts**: When KPI cards appear
   - Style: Semi-transparent box with white text
   - Duration: 2-3 seconds
   - Position: Top-right or bottom-left corner

2. **Stats lower-third**:
   - "12,450 Girls Reached"
   - "34 Active Campaigns"
   - "$87,250 Raised"

3. **Logo placement**:
   - Top-right corner throughout (watermark at 20% opacity)

### Color Correction
1. Ensure consistent white balance across all screens
2. Boost saturation slightly (+10-15%) for visual appeal
3. Ensure text is readable (high contrast)

---

## 📱 Platform-Specific Versions

### YouTube Version
- **Resolution**: 1920x1080 (landscape)
- **Aspect Ratio**: 16:9
- **Length**: 6:50
- **Thumbnail**: Bold title, key screenshot, LaafiTech branding
- **Description**: Include timestamps, links, call-to-action

**Thumbnail Example**:
```
┌──────────────────────────┐
│  LaafiTech              │
│                          │
│  🌍 Changing Girls' Lives│
│                          │
│  [PLAY DEMO]            │
└──────────────────────────┘
```

### LinkedIn Version
- **Resolution**: 1080x1080 (square, auto-plays)
- **Length**: 30-45 seconds (key highlights only)
- **Audio**: Included (LinkedIn users often watch muted)
- **Add captions** for silent viewing

**LinkedIn Captions**:
```
🌍 Transforming Period-Poverty Campaigns in Africa

✨ AI-powered platform connecting:
👥 Communities in need
💰 Donors wanting to help
🏢 NGOs driving change

🎯 Real impact, real data, real change

[Link to full demo]
```

### Twitter/X Version
- **Resolution**: 1920x1200 (landscape)
- **Length**: 15-20 seconds (ultra-short highlight)
- **Focus**: Most dramatic visuals only
- **Format**: GIF or video

### Email Marketing
- **Format**: MP4 embedded or link
- **Thumbnail**: Custom graphic with play button
- **Opening line**: "See LaafiTech in action (7 min demo)"

---

## 📊 Sample YouTube Description

```
🌍 LaafiTech - AI-Powered Period-Poverty Campaign Platform

Watch our 7-minute demo of LaafiTech, the revolutionary platform connecting 
donors, NGOs, and communities to close the menstrual health gap across Africa.

⏰ TIMELINE:
0:00 - Introduction
0:30 - Dashboard & Real-Time Metrics
1:15 - Community Explorer
2:00 - Campaign Browsing & Donations
3:15 - Create Campaign (4-Step Wizard)
4:30 - Donor Community
5:15 - Analytics & AI Forecasting
6:15 - Mobile Responsiveness
6:45 - Call to Action

🎯 KEY FEATURES:
✅ Real-time campaign tracking
✅ AI-powered donor-community matching
✅ Impact forecasting & analytics
✅ Mobile-first design
✅ Multi-language support (planned)
✅ Secure payment integration

📊 IMPACT:
• 12,450+ girls reached
• 34 active campaigns
• $87,250+ raised
• 1,200+ donors

🔗 LINKS:
Website: https://laafitech.org
GitHub: https://github.com/LaafiTech
Create Account: https://app.laafitech.org/signup

📧 CONTACT:
Email: info@laafitech.org
Twitter: @LaafiTech

---

LaafiTech is on a mission to close the menstrual health gap and keep girls in 
school. Every campaign created, every donation made, and every girl supported 
brings us closer to a world where period poverty doesn't stop anyone from 
reaching their potential.

Together, we close the menstrual health gap. 🌟

#MenstrualHealth #GirlsEducation #AI #SocialImpact #Africa #Nonprofit
```

---

## 🎯 Recording Checklist

Before you record, make sure:

- [ ] Frontend running on localhost:5173
- [ ] Backend running on localhost:8000 (if needed)
- [ ] All pages loaded and responsive
- [ ] Test data populated (campaigns, communities, donors)
- [ ] Voiceover script printed or on second screen
- [ ] Recording software (OBS/ScreenFlow) configured
- [ ] Microphone tested and levels checked
- [ ] Screen set to 1920x1080
- [ ] All notifications disabled
- [ ] Browser zoomed appropriately
- [ ] Mouse cursor style selected
- [ ] Frame rate set to 30fps
- [ ] Codec set to H.264
- [ ] Audio format checked (48 kHz, 128 kbps)
- [ ] Test recording made (30 seconds)

---

## 🚀 Distribution Strategy

### Week 1: Launch
- [ ] Upload to YouTube (unlisted first for preview)
- [ ] Share with team for feedback
- [ ] Make edits if needed
- [ ] Set to Public

### Week 2: Promotion
- [ ] Post on LinkedIn with custom description
- [ ] Share on Twitter with key highlight clips
- [ ] Email to investor list
- [ ] Add to website homepage
- [ ] Share in NGO networks

### Week 3: Amplification
- [ ] Create 30-second teaser for social media
- [ ] Share on TikTok/Instagram Reels (with captions)
- [ ] Feature in blog post
- [ ] Add to pitch deck
- [ ] Present at webinar/event

### Ongoing
- [ ] Embed in FAQ page
- [ ] Link in onboarding email
- [ ] Share with new donors
- [ ] Update for new features

---

## 💡 Pro Tips for Maximum Impact

1. **Show real data**: Use actual campaign, community, and donor numbers
2. **Smile while recording**: Voiceover energy comes through
3. **Multiple takes**: Record each section 2-3 times, pick the best
4. **User perspective**: Imagine you're the donor/NGO discovering the platform
5. **Emotional connection**: Emphasize the real girls being helped
6. **Call to action**: End with clear next steps (Sign up, Learn more, Donate)
7. **Accessibility**: Always add captions for hearing-impaired viewers
8. **Mobile preview**: Watch on mobile before publishing to ensure readability

---

## 📈 Expected Engagement Metrics

### YouTube Goals (First Month)
- Views: 500-1,000
- Click-through to website: 5-10%
- Sign-ups from video: 20-50
- Shares: 10-20
- Watch time: 85% completion rate

### LinkedIn Goals
- Views: 2,000-5,000
- Engagement rate: 3-5%
- Profile visits: 100-200
- Connection requests: 30-50

### Twitter Goals
- Views: 1,000-3,000
- Retweets: 20-50
- Replies: 10-20
- Link clicks: 50-100

---

## 🎬 Final Deliverables

### Outputs
1. **Full 6:50 video** (MP4, 1920x1080, ~250MB)
2. **30-second teaser** (MP4, 1920x1080, ~40MB)
3. **15-second highlight** (MP4, 1920x1080, ~20MB)
4. **Audio-only version** (MP3, voiceover only, for podcast)
5. **Voiceover transcript** (TXT, for accessibility)
6. **Still frames** (10-15 JPGs for social media thumbnails)

### Storage
- YouTube (public, unlisted, or private)
- Vimeo (backup, higher quality)
- AWS S3 (for website hosting)
- Google Drive (internal sharing)

---

## ✨ Success Criteria

A successful demo video will:
- ✅ Clearly explain the platform's value proposition
- ✅ Show all 7 core pages in action
- ✅ Demonstrate ease of use
- ✅ Evoke emotional response to the mission
- ✅ Include clear calls to action
- ✅ Be under 7 minutes (respects viewer time)
- ✅ Have professional audio and visuals
- ✅ Be accessible (captions, descriptive audio)
- ✅ Drive sign-ups or donations
- ✅ Be shareable (quality thumbnail, engaging title)

---

**Demo Video Status**: ✅ Script Complete, Ready for Recording  
**Estimated Production Time**: 2-4 hours (recording + editing + audio)  
**Launch Target**: Week of December 6, 2025

