# Production Deployment Overview - J.P. College of Engineering ERP

## Architectural Architecture Summary
- **Frontend**: React 18/19 SPA built with Vite, CSS Modules / Custom Glassmorphic Styling System, Recharts, and Framer Motion.
- **Backend**: Node.js & Express REST API using ES Module (`import/export`) syntax, structured into modular controllers, routes, and Mongoose models.
- **Database**: MongoDB Atlas Cloud DB with automated schema validation and auto-seeding.
- **Deployment Platform**: Vercel Serverless Functions (`/api/index.js`) and static site hosting.

## Local Development Setup

1. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```
2. **Install Frontend Dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```
3. **Configure Environment File**:
   Copy `.env.example` to `.env` in backend:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=jp_college_secret_jwt_key_2026
   ```
4. **Launch Local Servers**:
   - Backend Server: `cd backend && npm run dev` (Runs on http://localhost:5000)
   - Frontend Vite Dev Server: `cd frontend && npm run dev` (Runs on http://localhost:5173)

## Production Build Verification

To verify that the application compiles without any build or lint errors before pushing:
```bash
cd frontend
npm run build
```
This produces optimized production bundles in `frontend/dist`.
