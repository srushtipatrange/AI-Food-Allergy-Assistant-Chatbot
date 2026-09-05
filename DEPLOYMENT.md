# Deployment Guide - Food Allergy Assistant

## Quick Start Development

### Prerequisites
- Node.js 18+ (for Next.js frontend)
- Python 3.8+ (for FastAPI backend)
- npm/pnpm (for Node.js package management)
- pip/uv (for Python package management)

### Local Development Setup

#### 1. Frontend Development
```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Visit http://localhost:3000
```

#### 2. Backend Development
```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
python app.py

# API docs available at http://localhost:8000/docs
```

#### 3. Testing the Integration
1. Open frontend at http://localhost:3000
2. Select your allergies from the sidebar
3. Speak or type ingredients
4. The app will send requests to the backend and display results

---

## Production Deployment

### Option 1: Deploy to Vercel (Recommended)

#### Frontend on Vercel
```bash
# 1. Connect your GitHub repository to Vercel
# 2. Click "Deploy"
# 3. Vercel automatically detects Next.js configuration

# If you have environment variables:
# - Add them in Vercel Dashboard > Settings > Environment Variables
```

The frontend will be deployed at: `https://your-project.vercel.app`

#### Backend on Railway/Heroku

**Deploy to Railway:**
1. Push code to GitHub
2. Go to railway.app
3. Create new project
4. Select GitHub repository
5. Railway auto-detects Python/FastAPI
6. Set environment variables if needed
7. Deploy!

Backend will be at: `https://your-project.up.railway.app`

**Deploy to Heroku:**
1. Create Procfile in backend/:
```
web: uvicorn app:app --host 0.0.0.0 --port $PORT
```

2. Create runtime.txt in backend/:
```
python-3.11.0
```

3. Deploy:
```bash
heroku create your-app-name
heroku config:set PYTHONUNBUFFERED=1
git push heroku main
```

### Option 2: Self-Hosted Deployment

#### Using Docker

**Create Dockerfile for Frontend (Next.js):**
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

**Create Dockerfile for Backend (FastAPI):**
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .

EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Docker Compose (backend/ directory):**
```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - USDA_API_KEY=${USDA_API_KEY}
```

#### Using AWS

**EC2 Deployment:**
1. Launch EC2 instance (Ubuntu 22.04)
2. Install Node.js and Python
3. Clone repository
4. Build frontend: `npm run build`
5. Run backend: `python app.py`
6. Use Nginx as reverse proxy
7. Set up SSL with Let's Encrypt

---

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)
```
USDA_API_KEY=your_api_key_here
DEBUG=false
```

---

## CI/CD Pipeline Example (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm run build
      - uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up --service backend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## Performance Optimization

### Frontend
- Enable Next.js Image Optimization
- Use dynamic imports for code splitting
- Enable compression in Vercel settings

### Backend
- Add caching headers
- Implement rate limiting
- Use async/await for concurrent requests

---

## Monitoring & Logging

### Frontend
- Use Vercel Analytics
- Monitor with Sentry

### Backend
- Use application logging
- Monitor API response times
- Set up error alerts

---

## Security Checklist

- [ ] Enable HTTPS everywhere
- [ ] Set CORS headers correctly
- [ ] Validate all user inputs
- [ ] Use environment variables for secrets
- [ ] Keep dependencies updated
- [ ] Enable rate limiting on API
- [ ] Add authentication if needed
- [ ] Regular security audits

---

## Scaling Considerations

1. **Database Layer**: Currently using in-memory allergen data. Consider:
   - PostgreSQL for user profiles
   - Redis for caching allergen queries

2. **API Rate Limiting**: Implement token-based rate limiting

3. **Load Balancing**: Use load balancer for multiple backend instances

4. **CDN**: Use Cloudflare or AWS CloudFront for static assets

---

## Troubleshooting Deployment

### Frontend Issues
- Clear Vercel cache: Settings > Deployments > Clear Cache
- Check environment variables in Vercel dashboard
- Review build logs for errors

### Backend Issues
- Check logs: `railway logs` or `heroku logs --tail`
- Verify environment variables are set
- Test API endpoints with curl or Postman
- Check port configuration (usually 8000)

### Connection Issues
- Verify CORS settings in FastAPI
- Check API_URL environment variable
- Test network connectivity
- Review browser console for errors

---

## Cost Estimates

- **Vercel**: Free tier for frontend (pay-as-you-grow)
- **Railway**: Free tier includes $5 credit/month
- **Heroku**: $7-50/month depending on usage
- **AWS EC2**: $5-20/month for small instances

---

## Maintenance

- Monitor error logs weekly
- Update dependencies monthly
- Backup user data if applicable
- Review performance metrics
- Plan feature updates

---

For additional help, refer to:
- Next.js Docs: https://nextjs.org/docs
- FastAPI Docs: https://fastapi.tiangolo.com
- Vercel Deployment: https://vercel.com/docs
