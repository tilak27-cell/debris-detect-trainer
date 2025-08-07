# Deployment Guide

## Backend Deployment on Render

### Step 1: Prepare Backend Code
1. Create a new folder `backend/` in your project
2. Copy all backend files (`main.py`, `requirements.txt`, `Dockerfile`, `render.yaml`)
3. Add your trained YOLOv8 model file as `best.pt` in the backend folder

### Step 2: Deploy to Render
1. Push your backend code to a GitHub repository
2. Go to [Render](https://render.com) and sign up/login
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `marine-debris-api`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Free tier is fine for testing
6. Click "Create Web Service"
7. Wait for deployment (first deploy may take 10-15 minutes)
8. Copy your API URL (e.g., `https://marine-debris-api.onrender.com`)

## Frontend Deployment on Netlify

### Step 1: Update API URL
1. In your frontend code, update the API base URL to your Render URL
2. Build the project: `npm run build`

### Step 2: Deploy to Netlify

#### Option A: Drag & Drop
1. Go to [Netlify](https://netlify.com)
2. Drag your `dist/` folder to the deploy area
3. Your site will be live instantly

#### Option B: GitHub Integration
1. Push your frontend code to GitHub
2. In Netlify, click "New site from Git"
3. Connect GitHub and select your repository
4. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click "Deploy site"

### Step 3: Environment Variables (if needed)
1. In Netlify dashboard, go to Site settings → Environment variables
2. Add `VITE_API_URL` with your Render API URL

## Testing the Deployment

1. Visit your Netlify site URL
2. Upload a satellite image
3. Verify the detection works with your backend API

## Custom Domains (Optional)

### Backend (Render)
1. In Render dashboard → Settings → Custom Domains
2. Add your domain and configure DNS

### Frontend (Netlify)  
1. In Netlify dashboard → Domain settings → Add custom domain
2. Configure DNS with your domain provider

## Troubleshooting

### Backend Issues
- Check Render logs for Python/dependency errors
- Ensure your YOLOv8 model file is included
- Verify CORS settings allow your frontend domain

### Frontend Issues
- Check browser console for API connection errors
- Verify the API URL is correctly configured
- Ensure build process completed successfully

### Common Fixes
- **CORS errors**: Update `allow_origins` in FastAPI CORS middleware
- **Model loading errors**: Check if `best.pt` file is in backend directory
- **Build failures**: Verify all dependencies in `requirements.txt`

## Production Optimization

### Backend
- Use Render's paid plans for better performance
- Enable persistent storage for large models
- Add proper logging and monitoring

### Frontend
- Optimize images and assets
- Enable Netlify's CDN features
- Set up proper caching headers (already in `netlify.toml`)

## Security Notes

- Configure CORS properly for production
- Add rate limiting to prevent API abuse
- Use environment variables for sensitive data
- Enable HTTPS (automatic on both platforms)