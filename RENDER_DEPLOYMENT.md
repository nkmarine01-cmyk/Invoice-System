# Render Deployment Guide

## Prerequisites
- GitHub account with repository: https://github.com/supratok/Invoice
- Render account: https://render.com
- MongoDB Atlas account for production database

## Step 1: Deploy Backend on Render

### 1.1 Create New Web Service
1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `supratok/Invoice`
4. Configure service:
   - **Name**: `invoice-system-backend` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free (or paid for better performance)

### 1.2 Configure Environment Variables
Add these environment variables in Render dashboard:

```
NODE_ENV=production
PORT=5000
MONGO_URI=<your-mongodb-atlas-connection-string>
JWT_SECRET=<generate-strong-random-secret-key>
FRONTEND_URL=<will-add-after-frontend-deployment>
```

**Important Notes:**
- **MONGO_URI**: Get from MongoDB Atlas (create cluster if needed)
  - Format: `mongodb+srv://username:password@cluster.mongodb.net/invoice_management?retryWrites=true&w=majority`
- **JWT_SECRET**: Generate a strong random string (at least 32 characters)
  - Example: `openssl rand -base64 32` on terminal

### 1.3 Deploy Backend
1. Click **"Create Web Service"**
2. Wait for deployment (first deploy takes 5-10 minutes)
3. **Copy your backend URL**: `https://invoice-system-backend.onrender.com` (example)

## Step 2: Deploy Frontend on Render

### 2.1 Update Frontend Environment
Before deploying frontend, update the backend URL in your local code:

1. Open `client/.env.production`
2. Replace with your actual backend URL:
   ```
   REACT_APP_API_URL=https://invoice-system-backend.onrender.com
   ```

### 2.2 Commit and Push Changes
```bash
git add client/.env.production
git commit -m "Update production API URL for Render"
git push origin main
```

### 2.3 Create Frontend Web Service
1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Connect same GitHub repository
3. Configure service:
   - **Name**: `invoice-system-frontend` (or your preferred name)
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Root Directory**: `client`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free

### 2.4 Configure Frontend Environment Variables (Optional)
```
NODE_ENV=production
```

### 2.5 Deploy Frontend
1. Click **"Create Web Service"**
2. Wait for deployment
3. **Copy your frontend URL**: `https://invoice-system-frontend.onrender.com` (example)

## Step 3: Update Backend CORS Settings

### 3.1 Add Frontend URL to Backend
1. Go to backend service in Render dashboard
2. Click **"Environment"** tab
3. Update `FRONTEND_URL` environment variable:
   ```
   FRONTEND_URL=https://invoice-system-frontend.onrender.com
   ```
4. Save changes (backend will automatically redeploy)

## Step 4: Setup MongoDB Atlas (if not done)

### 4.1 Create MongoDB Atlas Cluster
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up/Login
3. Create a new cluster (Free M0 tier available)
4. Click **"Connect"** → **"Connect your application"**
5. Copy connection string
6. Replace `<password>` with your database user password

### 4.2 Whitelist Render IPs
1. In MongoDB Atlas, go to **Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Or add specific Render IP ranges for better security

### 4.3 Create Database User
1. Go to **Database Access**
2. Create user with read/write permissions
3. Use these credentials in MONGO_URI

## Step 5: Seed Initial Admin User

After backend is deployed, you need to create an admin user:

### Option 1: Using Render Shell
1. Go to backend service in Render
2. Click **"Shell"** tab
3. Run:
   ```bash
   node seedUser.js
   ```

### Option 2: Create API Endpoint
Add a one-time setup endpoint (remove after first use):
```javascript
// In server.js (temporary)
app.post('/api/setup-admin', async (req, res) => {
  // Add admin creation logic here
});
```

## Step 6: Test Your Deployment

1. Visit your frontend URL: `https://invoice-system-frontend.onrender.com`
2. You should see the login page
3. Login with admin credentials
4. Test all features:
   - Create invoice
   - Create quotation
   - Download PDF
   - View dashboards

## Troubleshooting

### Backend Issues
- **503 Service Unavailable**: Backend is starting (wait 30 seconds)
- **MongoDB Connection Error**: Check MONGO_URI and IP whitelist
- **CORS Error**: Verify FRONTEND_URL in backend environment variables

### Frontend Issues
- **Can't connect to backend**: Check REACT_APP_API_URL in build
- **401 Unauthorized**: Clear browser cache and localStorage
- **White screen**: Check browser console for errors

### Common Fixes
1. **Restart Services**: Click "Manual Deploy" → "Clear build cache & deploy"
2. **Check Logs**: View logs in Render dashboard for errors
3. **Environment Variables**: Verify all required env vars are set

## Important Notes

### Free Tier Limitations
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month free (enough for one service 24/7)

### Performance Tips
- Use paid tier for production ($7/month per service)
- Enable auto-deploy on git push
- Set up custom domain
- Add health check endpoints

## URLs After Deployment

- **Frontend**: https://invoice-system-frontend.onrender.com
- **Backend API**: https://invoice-system-backend.onrender.com
- **GitHub**: https://github.com/supratok/Invoice

## Security Recommendations

1. **Change Default Credentials**: Update admin password after first login
2. **Use Strong JWT Secret**: Generate cryptographically secure random string
3. **Enable HTTPS Only**: Render provides SSL by default
4. **Restrict MongoDB Access**: Whitelist only Render IPs
5. **Regular Backups**: Setup MongoDB Atlas backups
6. **Environment Variables**: Never commit secrets to Git

## Monitoring

1. **Render Dashboard**: View logs, metrics, and deployment status
2. **MongoDB Atlas**: Monitor database performance and usage
3. **Error Tracking**: Consider adding Sentry or similar service

## Next Steps

1. ✅ Setup custom domain (optional)
2. ✅ Configure automated backups
3. ✅ Add monitoring and alerting
4. ✅ Setup CI/CD pipeline
5. ✅ Add rate limiting for API
6. ✅ Implement proper logging
