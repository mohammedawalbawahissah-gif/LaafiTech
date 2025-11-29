# LaafiTech - Period-Poverty Campaign Platform
## Development Setup & Architecture Guide

### 🎯 Project Overview
LaafiTech is an AI-enabled web platform designed to automate and optimize period-poverty campaigns. The platform uses intelligent data gathering, storytelling tools, and predictive analytics to match high-need communities with potential donors, NGOs, and corporate sponsors.

### ✨ Platform Objectives
- **Visibility**: Increase visibility of underserved communities
- **Sustainability**: Drive sustainable funding through intelligent matching
- **Health Access**: Improve girls' access to menstrual pads and essential medications
- **Education**: Empower girls to stay healthy and remain in school
- **Scale**: Provide a scalable digital solution to close the menstrual health gap

---

## 🏗️ Architecture Overview

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI)
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Charts**: Recharts for data visualization
- **Build Tool**: Create React App

### Backend (FastAPI + Python)
- **Framework**: FastAPI (modern async Python web framework)
- **Database ORM**: SQLAlchemy
- **Authentication**: JWT tokens with python-jose
- **Validation**: Pydantic models
- **Server**: Uvicorn (ASGI server)
- **ML**: scikit-learn, TensorFlow, pandas, numpy

---

## 📁 Project Structure

```
LaafiTech/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── pages/           # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Communities.tsx
│   │   │   ├── Campaigns.tsx
│   │   │   ├── CampaignDetail.tsx
│   │   │   ├── CreateCampaign.tsx
│   │   │   ├── Donors.tsx
│   │   │   └── Analytics.tsx
│   │   ├── components/      # Reusable components
│   │   │   └── Navigation.tsx
│   │   ├── store/          # Redux store
│   │   │   ├── index.ts
│   │   │   └── slices/
│   │   │       ├── campaignSlice.ts
│   │   │       ├── communitySlice.ts
│   │   │       └── donorSlice.ts
│   │   ├── types/          # TypeScript types
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # Application entry point
│   │   ├── api/            # API routes
│   │   │   └── v1/
│   │   │       └── endpoints/
│   │   │           ├── campaigns.py
│   │   │           ├── communities.py
│   │   │           └── ml.py
│   │   ├── core/           # Core functionality
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   ├── models/         # SQLAlchemy models
│   │   │   └── models.py
│   │   ├── schemas/        # Pydantic schemas
│   │   │   └── schemas.py
│   │   ├── services/       # Business logic
│   │   ├── ml/            # ML modules
│   │   │   └── predictor.py
│   │   └── __init__.py
│   ├── tests/             # Unit tests
│   ├── requirements.txt   # Python dependencies
│   ├── Dockerfile
│   └── venv/             # Python virtual environment
│
├── ml-models/            # Pre-trained ML models
├── infrastructure/       # Docker & deployment configs
├── docs/                # Documentation
└── README.md           # Project documentation
```

---

## 🚀 Getting Started

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install --legacy-peer-deps
```

2. **Start Development Server**
```bash
npm start
```
The frontend runs on `http://localhost:3000`

3. **Build for Production**
```bash
npm run build
```

### Backend Setup

1. **Create Virtual Environment**
```bash
cd backend
python -m venv venv
```

2. **Activate Virtual Environment**
```bash
# On Windows
.\venv\Scripts\Activate.ps1

# On macOS/Linux
source venv/bin/activate
```

3. **Install Dependencies**
```bash
pip install -r requirements.txt
```

4. **Run Backend Server**
```bash
cd app
uvicorn main:app --reload
```
The backend API runs on `http://localhost:8000`
API documentation available at `http://localhost:8000/docs`

---

## 🔑 Frontend Features & Pages

### Dashboard (`/`)
- Real-time campaign metrics
- Community statistics
- Funding trends visualization
- Impact distribution charts

### Communities (`/communities`)
- Search and filter communities by region
- View community details and need levels
- See active programs
- Create campaigns for specific communities

### Campaigns (`/campaigns`)
- Browse all campaigns
- View funding progress
- Filter by status (active, completed, upcoming)
- Support campaigns through donations

### Campaign Detail (`/campaigns/:id`)
- Complete campaign information
- Funding progress and timeline
- Campaign updates feed
- Donor information

### Create Campaign (`/create-campaign`)
- Form to create new campaigns
- Community selection
- Set funding goals
- Define target beneficiaries

### Donors (`/donors`)
- Browse individual, corporate, and NGO donors
- Search by name or location
- View contribution history
- View areas of interest

### Analytics (`/analytics`)
- Community beneficiary completion rates
- Funding trend analysis
- AI-powered funding predictions
- Key performance insights

---

## 🔌 Backend API Endpoints

### Campaigns
- `GET /api/v1/campaigns` - List all campaigns
- `POST /api/v1/campaigns` - Create new campaign
- `GET /api/v1/campaigns/{id}` - Get campaign details
- `PUT /api/v1/campaigns/{id}` - Update campaign
- `DELETE /api/v1/campaigns/{id}` - Delete campaign

### Communities
- `GET /api/v1/communities` - List all communities
- `POST /api/v1/communities` - Add community
- `GET /api/v1/communities/{id}` - Get community details
- `PUT /api/v1/communities/{id}` - Update community

### ML Predictions
- `POST /api/v1/ml/predict-match` - Get donor-community matches
- `POST /api/v1/ml/predict-funding` - Predict funding trends
- `GET /api/v1/ml/recommendations` - Get ML recommendations

---

## 🤖 ML & Analytics Features

### Intelligent Matching
- Match high-need communities with donors/sponsors
- Predict successful campaign-donor pairs
- Recommendation engine based on historical data

### Predictive Analytics
- Forecast funding trends
- Estimate campaign success rates
- Predict retention and completion rates
- Community need level assessment

### Data Processing
- Aggregate community data
- Process donor profiles
- Analyze campaign performance
- Generate insights and recommendations

---

## 🔐 Authentication & Security

### JWT-Based Authentication
- Secure token-based authentication
- Password hashing with bcrypt
- Token refresh mechanism
- Role-based access control (RBAC)

### Protected Endpoints
- Campaign management (admin only)
- Community data updates (admin only)
- Donor sensitive information (user verified)
- Analytics dashboard (authenticated users)

---

## 📊 Redux State Management

### Campaign Slice
```typescript
{
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
}
```

### Community Slice
```typescript
{
  communities: Community[];
  loading: boolean;
  error: string | null;
}
```

### Donor Slice
```typescript
{
  donors: Donor[];
  loading: boolean;
  error: string | null;
}
```

---

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
python -m pytest
```

### Coverage Report
```bash
pytest --cov=app
```

---

## 🐳 Docker Deployment

### Build Backend Container
```bash
cd backend
docker build -t laafitech-backend .
```

### Build Frontend Container
```bash
cd frontend
docker build -t laafitech-frontend .
```

### Run with Docker Compose
```bash
docker-compose up
```

---

## 📦 Dependencies

### Frontend Key Packages
- react@18.x
- react-router-dom@6.x
- @reduxjs/toolkit
- @mui/material
- recharts
- typescript@5.x

### Backend Key Packages
- fastapi==0.122.0
- uvicorn==0.38.0
- sqlalchemy==2.0.44
- pydantic==2.12.5
- scikit-learn==1.7.2
- pandas==2.3.3
- numpy==2.3.5
- nltk==3.9.2

---

## 🔄 Development Workflow

1. **Create Feature Branch**
```bash
git checkout -b feature/new-feature
```

2. **Make Changes**
- Frontend: Update React components/pages
- Backend: Create new endpoints/models

3. **Run Tests**
```bash
# Frontend
npm test

# Backend
pytest
```

4. **Commit & Push**
```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

5. **Create Pull Request**
- Link to related issues
- Describe changes clearly
- Request review from team

---

## 🎓 Code Standards

### Frontend (TypeScript/React)
- Use functional components with hooks
- Type all props and state
- Follow naming conventions: PascalCase for components
- Use Redux for global state
- MUI for consistent styling

### Backend (Python)
- Use type hints in all functions
- Follow PEP 8 style guide
- Use Pydantic models for validation
- Implement proper error handling
- Add docstrings to functions

---

## 🤝 Contributing

1. Follow the code standards above
2. Write tests for new features
3. Update documentation
4. Submit pull requests with clear descriptions
5. Ensure all tests pass before submission

---

## 📞 Support & Resources

- **Frontend Docs**: https://react.dev
- **Backend Docs**: https://fastapi.tiangolo.com
- **UI Components**: https://mui.com
- **Redux**: https://redux.js.org
- **SQLAlchemy**: https://docs.sqlalchemy.org

---

## 📝 Environment Variables

### Backend (.env)
```
DATABASE_URL=sqlite:///./laafitech.db
JWT_SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_ENV=development
```

---

## 🎯 Next Steps

1. ✅ Frontend and backend environments are configured
2. ✅ Core pages and components created
3. ⏳ Connect frontend to backend API
4. ⏳ Implement authentication flows
5. ⏳ Set up database and models
6. ⏳ Develop ML prediction engines
7. ⏳ Deploy to production

---

**Happy Coding! 🚀**
