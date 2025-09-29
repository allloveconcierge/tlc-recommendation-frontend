# Deployment Guide

This guide will help you deploy both the backend (FastAPI) and frontend (React) applications to make them publicly accessible.

## Prerequisites

1. **API Keys**: You'll need API keys for your chosen LLM provider (Google Gemini, OpenAI, Claude, etc.)
2. **GitHub Account**: For connecting your repositories to deployment platforms
3. **Domain/URL**: You'll get URLs from the deployment platforms

## Backend Deployment (FastAPI)

### Option 1: Railway (Recommended)

1. **Sign up** at [railway.app](https://railway.app)
2. **Connect GitHub** and select your repository
3. **Create New Project** from your `tlc-ml-service` repository
4. **Set Environment Variables**:
   ```
   ENV=PROD
   LLM_PROVIDER=gemini
   GOOGLE_API_KEY=your_google_api_key_here
   ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app,https://your-frontend-domain.netlify.app
   ```
5. **Deploy**: Railway will automatically detect the Python app and deploy it
6. **Get Backend URL**: Railway will provide a URL like `https://your-app.railway.app`

### Option 2: Render

1. **Sign up** at [render.com](https://render.com)
2. **Create New Web Service** from your GitHub repository
3. **Configure**:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.asgi:app --host 0.0.0.0 --port $PORT`
4. **Set Environment Variables** (same as Railway)
5. **Deploy**

### Option 3: Heroku

1. **Install Heroku CLI** and login
2. **Create Heroku app**: `heroku create your-app-name`
3. **Set environment variables**:
   ```bash
   heroku config:set ENV=PROD
   heroku config:set LLM_PROVIDER=gemini
   heroku config:set GOOGLE_API_KEY=your_api_key
   heroku config:set ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
   ```
4. **Deploy**: `git push heroku main`

## Frontend Deployment (React/Vite)

### Option 1: Netlify (Recommended)

1. **Sign up** at [netlify.com](https://netlify.com)
2. **New Site from Git** → Connect GitHub
3. **Configure**:
   - Base directory: `present-ponder`
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **Set Environment Variables**:
   ```
   VITE_API_BASE_URL=https://your-backend-url.railway.app
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
   ```
5. **Deploy**

### Option 2: Vercel

1. **Sign up** at [vercel.com](https://vercel.com)
2. **Import Project** from GitHub
3. **Configure**:
   - Framework Preset: Vite
   - Root Directory: `present-ponder`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Set Environment Variables** (same as Netlify)
5. **Deploy**

## Full-Stack Deployment (Both Frontend + Backend)

### Option 1: Replit (All-in-One Solution)

Replit allows you to deploy both frontend and backend in a single application!

1. **Sign up** at [replit.com](https://replit.com)
2. **Create New Repl** → Import from GitHub
3. **Select your repository** (`tlc-ml-service`)
4. **Set Environment Variables**:
   ```
   ENV=PROD
   LLM_PROVIDER=gemini
   GOOGLE_API_KEY=your_google_api_key_here
   SERVE_FRONTEND=true
   VITE_API_BASE_URL=https://your-repl-url.replit.app
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
   ```
5. **Run the build script**:
   ```bash
   ./build_replit.sh
   ```
6. **Start the server**:
   ```bash
   python -m uvicorn app.asgi:app --host 0.0.0.0 --port 5000
   ```
7. **Deploy**: Click "Deploy" in Replit dashboard

**Benefits of Replit:**
- ✅ Single deployment for both frontend and backend
- ✅ Free tier available
- ✅ Built-in terminal and file editor
- ✅ Automatic HTTPS
- ✅ Easy environment variable management

## Environment Variables Reference

### Backend Variables
```bash
# Required
ENV=PROD
LLM_PROVIDER=gemini  # or openai, claude, etc.
GOOGLE_API_KEY=your_api_key  # or OPENAI_API_KEY, CLAUDE_API_KEY

# Optional
PORT=8000
WORKERS=1
TIMEOUT=130
LOGLEVEL=INFO
CONCURRENCY=50
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
```

### Frontend Variables
```bash
# Required
VITE_API_BASE_URL=https://your-backend-url.railway.app
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

## Testing Your Deployment

1. **Backend Health Check**: Visit `https://your-backend-url.railway.app/health`
2. **Frontend**: Visit your frontend URL and test the application
3. **API Integration**: Test that the frontend can communicate with the backend

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure `ALLOWED_ORIGINS` includes your frontend domain
2. **API Key Issues**: Verify your API keys are correctly set in environment variables
3. **Build Failures**: Check that all dependencies are in `requirements.txt`

### Logs
- **Railway**: Check logs in the Railway dashboard
- **Vercel**: Check function logs in Vercel dashboard
- **Render**: Check logs in Render dashboard

## Security Notes

1. **Never commit API keys** to your repository
2. **Use environment variables** for all sensitive data
3. **Update CORS settings** to only allow your frontend domains
4. **Consider rate limiting** for production use

## Cost Considerations

- **Railway**: Free tier available, pay-as-you-go
- **Netlify**: Free tier for personal projects
- **Replit**: Free tier available, great for full-stack apps
- **Vercel**: Free tier for personal projects
- **Render**: Free tier available with limitations
- **API Costs**: Monitor your LLM API usage and costs

## Next Steps

1. Set up monitoring and logging
2. Configure custom domains (optional)
3. Set up CI/CD for automatic deployments
4. Add health checks and monitoring
