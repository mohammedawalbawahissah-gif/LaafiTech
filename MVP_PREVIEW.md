# LaafiTech MVP - Project Preview & Architecture Overview

**Last Updated**: November 29, 2025  
**Status**: ✅ Scaffolded & Ready for Integration

---

## 🎯 Executive Summary

**LaafiTech** is an AI-enabled web platform designed to automate and optimize period-poverty campaigns. The MVP focuses on:

- 📊 **Campaign Management**: Create, track, and manage fundraising campaigns
- 🎯 **Community Matching**: Connect high-need communities with donors
- 📈 **Analytics Dashboard**: Real-time insights on campaigns and donors
- 🔐 **Secure Authentication**: JWT-based role-based access control (RBAC)
- 🤖 **ML-Ready**: Foundation for predictive analytics and donor matching

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    LaafiTech Platform                        │
└─────────────────────────────────────────────────────────────┘
         │                                      │
         ▼                                      ▼
    ┌─────────────┐                    ┌──────────────────┐
    │   Frontend  │                    │   Backend API    │
    │   (React)   │◄───────────────►   │   (FastAPI)      │
    │             │      REST API      │                  │
    └─────────────┘                    └──────────────────┘
         │                                      │
         ▼                                      ▼
    • Dashboard                         • SQLAlchemy ORM
    • Campaign Mgmt                      • JWT Auth
    • Community Mgmt                     • Async FastAPI
    • Donor Directory                    • Pydantic Schemas
    • Analytics                          • ML Integration
    • Redux Store                        • Redis Cache
```

---

## 🚀 Frontend (React + TypeScript)

### Tech Stack
- **Framework**: React 18.2.0 with TypeScript 5.3.3
- **State**: Redux Toolkit for global state management
- **Routing**: React Router v6
- **UI Components**: Material-UI (MUI) v5.14.10
- **Charts**: Recharts v2.10.3
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios v1.6.2
- **Build Tool**: Vite v5.0.7

### Project Structure

```
frontend/
├── src/
│   ├── pages/                    # Main page components
│   │   ├── Dashboard.tsx         # Main dashboard with metrics & charts
│   │   ├── Communities.tsx       # Community list & search
│   │   ├── Campaigns.tsx         # Campaign browser
│   │   ├── CampaignDetail.tsx    # Individual campaign view
│   │   ├── CreateCampaign.tsx    # Campaign creation form
│   │   ├── Donors.tsx            # Donor directory
│   │   └── Analytics.tsx         # Advanced analytics & forecasting
│   │
│   ├── components/               # Reusable components
│   │   └── Navigation.tsx        # App navigation bar (MUI AppBar)
│   │
│   ├── store/                    # Redux state management
│   │   ├── index.ts              # Store configuration
│   │   └── slices/
│   │       ├── campaignSlice.ts  # Campaign state (CRUD, loading, errors)
│   │       ├── communitySlice.ts # Community state
│   │       └── donorSlice.ts     # Donor state
│   │
│   ├── services/
│   │   └── api.ts                # Axios-based API client
│   │                             # Base URL: http://localhost:8000/api/v1
│   │
│   ├── App.tsx                   # Root component with routes
│   └── index.tsx                 # Entry point
│
├── public/                       # Static assets
├── package.json                  # Dependencies
└── tsconfig.json                 # TypeScript config
```

### Pages & Features

#### 1. **Dashboard** (`/`)
- Real-time campaign metrics (active, completed, pending)
- Community statistics by region
- Funding trends (line chart)
- Impact distribution (pie chart)
- Top campaigns overview

#### 2. **Communities** (`/communities`)
- Search & filter communities by region/name
- Community cards with need level indicators
- Community details with active programs
- Quick actions to create campaigns

#### 3. **Campaigns** (`/campaigns`)
- Campaign list with progress bars
- Filter by status (active, completed, upcoming)
- Campaign funding status
- Quick view and donation options

#### 4. **Campaign Detail** (`/campaigns/:id`)
- Full campaign information
- Funding progress bar
- Timeline of updates
- Donor contributions list
- Call-to-action buttons

#### 5. **Create Campaign** (`/create-campaign`)
- Multi-step form
- Community selection
- Funding goal setup
- Beneficiary definition
- Launch settings

#### 6. **Donors** (`/donors`)
- Donor directory (individuals, NGOs, corporates)
- Search by name/location
- Contribution history
- Areas of interest
- Contact information

#### 7. **Analytics** (`/analytics`)
- Community beneficiary completion rates
- Funding trend analysis
- Donor contribution charts
- Impact forecasting visualizations

---

## 🔧 Backend (FastAPI + Python)

### Tech Stack
- **Framework**: FastAPI 0.104.1 (async)
- **Server**: Uvicorn 0.24.0 (ASGI)
- **ORM**: SQLAlchemy 2.0.23
- **Database**: PostgreSQL (configured in .env)
- **Cache**: Redis 5.0.1
- **Authentication**: JWT (python-jose + bcrypt)
- **Validation**: Pydantic 2.5.0
- **ML Libraries**: TensorFlow, scikit-learn, pandas, numpy
- **NLP**: NLTK

### Project Structure

```
backend/
├── app/
│   ├── main.py                  # FastAPI app entry point
│   │
│   ├── core/
│   │   ├── config.py            # App configuration & settings
│   │   ├── security.py          # JWT & auth logic
│   │   └── database.py          # SQLAlchemy setup
│   │
│   ├── models/
│   │   └── models.py            # SQLAlchemy ORM models
│   │                            # - Campaign, Community, Donor, User
│   │                            # - Relationships defined
│   │
│   ├── schemas/
│   │   └── schemas.py           # Pydantic request/response schemas
│   │
│   ├── api/
│   │   └── v1/
│   │       └── endpoints/
│   │           ├── campaigns.py     # POST, GET, PUT, DELETE campaigns
│   │           ├── communities.py   # Community CRUD & listing
│   │           ├── ml.py            # ML prediction endpoints
│   │           └── __init__.py
│   │
│   ├── services/                # Business logic layer
│   │   └── (to be implemented)
│   │
│   ├── ml/
│   │   └── predictor.py         # ML model integration
│   │                            # - Donor-community matching
│   │                            # - Funding predictions
│   │                            # - Impact forecasting
│   │
│   └── __init__.py
│
├── tests/                       # Unit tests (pytest)
├── requirements.txt             # Python dependencies
├── Dockerfile                   # Docker image config
└── venv/                        # Python virtual environment
```

### Core API Endpoints

#### **Campaigns**
```
GET    /api/v1/campaigns              → List all campaigns
POST   /api/v1/campaigns              → Create new campaign
GET    /api/v1/campaigns/{id}         → Get campaign details
PUT    /api/v1/campaigns/{id}         → Update campaign
DELETE /api/v1/campaigns/{id}         → Delete campaign
```

#### **Communities**
```
GET    /api/v1/communities            → List communities
POST   /api/v1/communities            → Add new community
GET    /api/v1/communities/{id}       → Get community details
PUT    /api/v1/communities/{id}       → Update community
```

#### **ML Predictions**
```
POST   /api/v1/ml/predict-match       → Get donor-community matches
POST   /api/v1/ml/predict-funding     → Predict funding outcomes
GET    /api/v1/ml/recommendations     → Get recommendations
```

#### **Authentication** (to be implemented)
```
POST   /api/v1/auth/register          → User registration
POST   /api/v1/auth/login             → User login (JWT token)
POST   /api/v1/auth/refresh           → Refresh JWT token
```

### Data Models (Planned)

```python
# Campaign
- id: UUID
- title: str
- description: str
- community_id: FK → Community
- funding_goal: Decimal
- funding_raised: Decimal
- status: Enum[active, completed, paused]
- created_at: DateTime
- updated_at: DateTime

# Community
- id: UUID
- name: str
- region: str
- need_level: Enum[critical, high, medium, low]
- population: int
- health_metrics: JSON
- created_at: DateTime

# Donor
- id: UUID
- name: str
- email: str
- type: Enum[individual, ngo, corporate]
- total_contributed: Decimal
- interests: JSON
- created_at: DateTime

# User (for auth)
- id: UUID
- email: str
- hashed_password: str
- role: Enum[admin, moderator, donor, community_rep]
- is_active: bool
```

---

## 📦 State Management (Redux)

### Redux Store Structure

```typescript
{
  campaigns: {
    items: Campaign[];
    loading: boolean;
    error: string | null;
    selectedId: UUID | null;
  },
  communities: {
    items: Community[];
    loading: boolean;
    error: string | null;
    selectedId: UUID | null;
  },
  donors: {
    items: Donor[];
    loading: boolean;
    error: string | null;
  }
}
```

### Actions (per slice)
- `setCampaigns(payload)` — Set campaigns list
- `addCampaign(payload)` — Add single campaign
- `updateCampaign(payload)` — Update campaign
- `deleteCampaign(id)` — Remove campaign
- `setLoading(boolean)` — Set loading state
- `setError(message)` — Set error message

---

## 🔐 Authentication & Security

**Planned Implementation**:
- JWT tokens (access + refresh tokens)
- Bcrypt password hashing
- Role-based access control (RBAC)
  - Admin: full platform access
  - Moderator: campaign oversight
  - Donor: donor dashboard
  - Community Rep: community data mgmt

**Protected Endpoints**:
- Campaign management (admin/moderator only)
- Community data updates (admin/moderator)
- Donor information (authenticated users)
- Analytics dashboard (all authenticated users)

---

## 🤖 ML/AI Integration (Foundation Ready)

### ML Module (`backend/app/ml/predictor.py`)

**Planned Models**:
1. **Donor-Community Matcher**
   - Input: Donor profile + Community needs
   - Output: Match score + compatibility factors

2. **Funding Predictor**
   - Input: Campaign characteristics
   - Output: Predicted funding amount + timeline

3. **Impact Forecaster**
   - Input: Campaign parameters + community data
   - Output: Expected impact metrics

4. **Campaign Narrative Generator** (NLP)
   - Input: Campaign data
   - Output: AI-generated campaign story/description

**Current Status**: Placeholder functions ready for model integration

---

## 📊 Environment Configuration

### Backend (.env)
```
DATABASE_URL=sqlite:///./laafitech.db    # SQLite for local dev
JWT_SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REDIS_URL=redis://localhost:6379
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_ENV=development
```

---

## 🚀 Getting Started (Local Development)

### 1. Start Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd app
uvicorn main:app --reload
```

**Backend runs on**: `http://localhost:8000`  
**API Docs**: `http://localhost:8000/docs` (Swagger UI)

### 2. Start Frontend

```powershell
cd frontend
npm install --legacy-peer-deps
npm run dev
```

**Frontend runs on**: `http://localhost:5173` (Vite dev server)

### 3. Test API Connection

```bash
# From terminal, test an endpoint
curl http://localhost:8000/api/v1/campaigns

# Response (if backend is running)
[]
```

---

## ✅ MVP Completion Status

### Completed ✅
- [x] Frontend project structure & pages (7 pages)
- [x] React Router navigation
- [x] Redux state slices & store
- [x] Axios API client setup
- [x] Material-UI component integration
- [x] Recharts for analytics visualizations
- [x] Backend FastAPI scaffold
- [x] SQLAlchemy ORM setup
- [x] ML predictor placeholder module
- [x] Core configuration files
- [x] Environment templates
- [x] Documentation (DEVELOPMENT_GUIDE.md)
- [x] Type safety (TypeScript + Pydantic)

### In Progress 🔄
- [ ] Complete backend CRUD endpoints
- [ ] Implement JWT authentication
- [ ] Wire frontend ↔ backend API calls
- [ ] Database migrations & seeding
- [ ] Unit tests for frontend & backend
- [ ] ML model training/integration

### Planned 📋
- [ ] Admin dashboard
- [ ] Real-time notifications
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Advanced ML models
- [ ] CI/CD pipeline
- [ ] Deployment to cloud (AWS/GCP)

---

## 📚 Key Files Quick Reference

| File | Purpose |
|------|---------|
| `frontend/src/App.tsx` | Main app router & layout |
| `frontend/src/store/index.ts` | Redux store configuration |
| `backend/app/main.py` | FastAPI app entry point |
| `backend/app/core/config.py` | App settings & env vars |
| `DEVELOPMENT_GUIDE.md` | Comprehensive setup instructions |
| `.markdownlint.json` | Markdown lint configuration |

---

## 🎓 Next Recommended Steps

1. **Implement Backend Endpoints**
   - Create POST/GET/PUT/DELETE for campaigns, communities, donors
   - Add database migrations using Alembic

2. **Connect Frontend to Backend**
   - Update API client with real endpoints
   - Wire Redux actions to API calls
   - Add loading/error handling in components

3. **Implement Authentication**
   - Backend: JWT token generation & validation
   - Frontend: Login form, token storage, protected routes
   - Add user context/store

4. **Seed Test Data**
   - Create database fixtures for campaigns, communities, donors
   - Generate sample analytics data

5. **Write Tests**
   - Unit tests for Redux slices
   - API endpoint tests (pytest)
   - E2E tests for critical flows

6. **Deploy Locally with Docker**
   - Build Docker images for frontend & backend
   - Run with `docker-compose up`

---

## 📞 Support Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com
- **React Docs**: https://react.dev
- **Redux Toolkit**: https://redux-toolkit.js.org
- **Material-UI**: https://mui.com
- **SQLAlchemy**: https://docs.sqlalchemy.org
- **Recharts**: https://recharts.org

---

**Project Status**: MVP Foundation Ready for Development  
**Maintained By**: LaafiTech Team  
**Last Updated**: November 29, 2025
