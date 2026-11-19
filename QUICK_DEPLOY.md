# Quick Deployment Checklist

## ✅ Git Push Complete
Your code is now on GitHub: https://github.com/supratok/Invoice

## 🚀 Deploy to Render - Quick Steps

### 1. Deploy Backend (5 mins)
1. Go to https://render.com → New → Web Service
2. Connect GitHub repo: `supratok/Invoice`
3. Settings:
   - **Root Directory**: `server`
   - **Build**: `npm install`
   - **Start**: `node server.js`
4. Add Environment Variables:
   ```
   MONGO_URI = <your-mongodb-atlas-connection>
   JWT_SECRET = <generate-random-32-char-string>
   PORT = 5000
   ```
5. Click **Create** → Copy backend URL

### 2. Update Frontend Config (2 mins)
1. Edit `client/.env.production`:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   ```
2. Push to git:
   ```bash
   git add client/.env.production
   git commit -m "Update backend URL"
   git push origin main
   ```

### 3. Deploy Frontend (5 mins)
1. Render → New → Web Service
2. Connect same repo
3. Settings:
   - **Root Directory**: `client`
   - **Build**: `npm install && npm run build`
   - **Start**: `node server.js`
4. Click **Create** → Copy frontend URL

### 4. Update Backend CORS (1 min)
1. Go to backend service → Environment
2. Add:
   ```
   FRONTEND_URL = https://your-frontend-url.onrender.com
   ```
3. Save (auto-redeploys)

### 5. Create Admin User
Using Render Shell on backend service:
```bash
node seedUser.js
```

## 🎉 Done!
Visit your frontend URL and login with admin credentials.

## 📖 Detailed Guide
See `RENDER_DEPLOYMENT.md` for comprehensive instructions.
