# Quick Start Guide - LaafiTech

## 🚀 Starting the Application Locally

### Prerequisites
- Node.js 16+ (for frontend)
- Python 3.9+ (for backend)
- Git

### Step 1: Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm start
```

Frontend will be available at: **http://localhost:3000**

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment (Windows)
.\venv\Scripts\Activate.ps1

# Activate virtual environment (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
cd app
uvicorn main:app --reload
```

Backend API will be available at: **http://localhost:8000**
API Documentation (Swagger UI): **http://localhost:8000/docs**

---

## 📱 Accessing the Platform

### Main Pages
- **Dashboard**: http://localhost:3000/
- **Communities**: http://localhost:3000/communities
- **Campaigns**: http://localhost:3000/campaigns
- **Donors**: http://localhost:3000/donors
- **Analytics**: http://localhost:3000/analytics

### Backend API Endpoints
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🔧 Common Development Tasks

### Frontend Development
```bash
cd frontend

# Start dev server with hot reload
npm start

# Run tests
npm test

# Build for production
npm run build

# Format code with Prettier
npm run format

# Lint code
npm run lint
```

### Backend Development
```bash
cd backend
source venv/bin/activate  # or .\venv\Scripts\Activate.ps1 on Windows

# Run server with auto-reload
uvicorn app.main:app --reload

# Run tests
pytest

# Run tests with coverage
pytest --cov=app

# Format code
black app/

# Lint code
flake8 app/

# Type checking
mypy app/
```

---

## 📁 Key Files & Directories

### Frontend
- `src/pages/` - Main page components
- `src/components/` - Reusable React components
- `src/store/` - Redux state management
- `src/services/` - API client services
- `package.json` - Dependencies and scripts

### Backend
- `app/main.py` - Application entry point
- `app/api/v1/endpoints/` - API route handlers
- `app/models/` - SQLAlchemy database models
- `app/schemas/` - Pydantic validation schemas
- `app/core/` - Configuration and utilities
- `app/ml/` - Machine learning modules
- `requirements.txt` - Python dependencies

---

## 🔐 Environment Variables

### Frontend (.env)
Create `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_ENV=development
```

### Backend (.env)
Create `backend/app/.env`:
```
DATABASE_URL=sqlite:///./laafitech.db
JWT_SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=True
```

---

## 🐛 Troubleshooting

### Frontend Issues

**Error: "Cannot find module 'react'"**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Port 3000 already in use**
```bash
# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Backend Issues

**Python module not found**
```bash
cd backend
.\venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate      # macOS/Linux
pip install -r requirements.txt
```

**Port 8000 already in use**
```bash
# On Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# On macOS/Linux
lsof -ti:8000 | xargs kill -9
```

---

## 📚 Documentation

- **React**: https://react.dev
- **FastAPI**: https://fastapi.tiangolo.com
- **Material-UI**: https://mui.com
- **Redux**: https://redux.js.org
- **TypeScript**: https://www.typescriptlang.org/docs

---

## 💡 Next Steps

1. ✅ Both frontend and backend are running
2. ⏳ Create sample campaigns and communities
3. ⏳ Test API endpoints using Swagger UI
4. ⏳ Integrate ML prediction features
5. ⏳ Deploy to production

---

## 📞 Support

For issues or questions:
- Check the DEVELOPMENT_GUIDE.md for detailed architecture info
- Review API documentation at http://localhost:8000/docs
- Check component stories and examples in the frontend

---

**Happy Developing! 🎉**
