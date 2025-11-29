# LaafiTech - AI-Enabled Period-Poverty Campaign Platform

## Mission
Automate and optimize period-poverty campaigns using intelligent data gathering, storytelling tools, and predictive analytics to match high-need communities with potential donors, NGOs, and corporate sponsors.

## Vision
Close the menstrual health gap and empower girls to stay healthy and remain in school by streamlining campaign creation, driving sustainable funding, and improving access to menstrual pads and essential medications.

## Key Features

### 1. Intelligent Data Gathering
- Automated community data collection and validation
- Integration with public health datasets
- Real-time need assessment algorithms
- Geographic and demographic analysis

### 2. Campaign Storytelling Tools
- AI-powered narrative generation
- Media asset management (images, videos)
- Multi-language support for diverse communities
- Customizable campaign templates

### 3. Predictive Analytics
- ML-based donor-community matching
- Funding outcome predictions
- Campaign impact forecasting
- Donor behavior analysis

### 4. Donor & Partner Management
- NGO and corporate sponsor database
- Intelligent matching algorithm
- Partnership tracking and ROI measurement
- Impact reporting dashboards

### 5. Campaign Management
- Drag-and-drop campaign builder
- Real-time fundraising tracking
- Multi-channel distribution (web, mobile, social)
- Community engagement tools

## Tech Stack

### Backend
- **Framework**: Python FastAPI
- **Database**: PostgreSQL + Redis
- **ML/AI**: TensorFlow, Scikit-learn, NLTK
- **APIs**: RESTful architecture

### Frontend
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Components**: Material-UI, Recharts for analytics

### ML/Analytics
- **Data Processing**: Pandas, NumPy
- **Models**: Community Need Prediction, Donor Matching, Impact Forecasting
- **NLP**: Text generation for storytelling
- **Visualization**: Plotly, Matplotlib

### Infrastructure
- **Cloud**: AWS/GCP (scalable deployment)
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: ELK Stack / CloudWatch

## Project Structure

```
LaafiTech/
├── backend/               # FastAPI application
│   ├── app/
│   │   ├── core/         # Config, security, settings
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   ├── api/          # API routes
│   │   ├── ml/           # ML integrations
│   │   └── main.py
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/              # React application
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API clients
│   │   ├── store/        # Redux state
│   │   ├── utils/        # Utilities
│   │   └── App.tsx
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── ml-models/            # Machine learning models
│   ├── community-needs/  # Need prediction models
│   ├── donor-matching/   # Donor matching algorithm
│   ├── storytelling/     # NLP & content generation
│   ├── impact/          # Impact forecasting
│   └── notebooks/       # Jupyter notebooks for R&D
├── infrastructure/       # DevOps & deployment
│   ├── docker-compose.yml
│   ├── kubernetes/      # K8s manifests
│   ├── terraform/       # IaC
│   └── monitoring/      # Prometheus, Grafana configs
├── docs/                 # Documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── SETUP.md
│   └── DEPLOYMENT.md
└── docker-compose.yml   # Main orchestration file
```

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 16+
- Docker & Docker Compose
- PostgreSQL 13+

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/mohammedawalbawahissah-gif/LaafiTech.git
   cd LaafiTech
   ```

2. **Set up backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Set up frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

## API Endpoints (Overview)

### Communities
- `GET /api/v1/communities` - List communities
- `POST /api/v1/communities` - Create community profile
- `GET /api/v1/communities/{id}` - Get community details
- `PUT /api/v1/communities/{id}` - Update community

### Campaigns
- `GET /api/v1/campaigns` - List campaigns
- `POST /api/v1/campaigns` - Create campaign
- `GET /api/v1/campaigns/{id}` - Get campaign details
- `PUT /api/v1/campaigns/{id}` - Update campaign
- `POST /api/v1/campaigns/{id}/publish` - Publish campaign

### Donors & Partners
- `GET /api/v1/donors` - List donors
- `POST /api/v1/donors` - Register donor
- `GET /api/v1/ngos` - List NGOs
- `POST /api/v1/ngos` - Register NGO

### Analytics & Predictions
- `GET /api/v1/analytics/dashboard` - Dashboard metrics
- `POST /api/v1/ml/match-donors` - Get donor matches
- `POST /api/v1/ml/predict-impact` - Forecast impact
- `POST /api/v1/ml/generate-story` - Generate campaign narrative

## Development Guidelines

### Code Standards
- Follow PEP 8 for Python
- ESLint + Prettier for JavaScript/TypeScript
- Pre-commit hooks for quality checks
- Unit tests required for all features

### Git Workflow
1. Create feature branch: `git checkout -b feature/feature-name`
2. Commit with conventional commits: `feat:`, `fix:`, `docs:`, etc.
3. Push and create pull request
4. Require code review before merge

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - See LICENSE.md

## Contact & Support

- **Project Lead**: Mohammed Awal Bawahissah
- **Email**: contact@laafitech.org
- **Website**: www.laafitech.org

## Roadmap

### Phase 1 (MVP)
- [ ] Community data management
- [ ] Basic campaign creation
- [ ] Simple donor matching
- [ ] Dashboard analytics

### Phase 2
- [ ] Advanced storytelling tools
- [ ] NLP-based narrative generation
- [ ] Mobile app (React Native)
- [ ] Multi-language support

### Phase 3
- [ ] Advanced ML models
- [ ] Real-time campaign optimization
- [ ] Global expansion
- [ ] API marketplace for partners

---

**Last Updated**: November 2025
**Status**: Initial Setup
