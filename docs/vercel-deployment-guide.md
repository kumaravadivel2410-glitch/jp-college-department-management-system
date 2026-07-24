# Vercel Deployment Guide - J.P. College of Engineering ERP

This project is pre-configured for monorepo serverless deployment on Vercel.

## Option 1: Deploy via Vercel GitHub Integration (Recommended)

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "Production MERN Stack College ERP System"
   git push origin main
   ```
2. Open [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New > Project**.
3. Import your GitHub repository `jp-college-department-management-system`.
4. Leave Root Directory as `./` (Vercel automatically detects root `vercel.json`).
5. Under **Environment Variables**, add:
   - `MONGODB_URI`: Your MongoDB Atlas Connection String
   - `JWT_SECRET`: A secure random string (e.g. `jp_college_jwt_secret_2026`)
   - `NODE_ENV`: `production`
6. Click **Deploy**. Vercel will build the React Vite frontend and package the Node serverless function (`/api/index.js`).

## Option 2: Deploy via Vercel CLI

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```
2. Run deployment command in the project root:
   ```bash
   vercel
   ```
3. Follow prompts and provide environment variables when prompted.

## Verification
- API Health Check: `https://your-vercel-domain.vercel.app/api/health`
- Frontend Dashboard: `https://your-vercel-domain.vercel.app/dashboard`
