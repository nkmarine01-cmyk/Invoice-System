# Deployment Guide for Render

## Prerequisites
- GitHub repository with your code (✅ Done: https://github.com/supratok/Invoice)
- MongoDB Atlas account (for production database)
- Render account (free tier available)

## Step-by-Step Deployment

### 1. Set Up MongoDB Atlas (Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up/Login
3. Create a new FREE cluster
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/invoice-db`)
6. Replace `<password>` with your actual password
7. Keep this connection string - you'll need it for Render

### 2. Deploy Backend to Render

1. Go to [Render](https://render.com/) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub account and select the `Invoice` repository
4. Configure the service:
   - **Name**: `invoice-system-api`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Add Environment Variables (click "Advanced" → "Add Environment Variable"):
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   JWT_SECRET=<generate-a-random-secret-key>
   ```
   
   To generate JWT_SECRET, run in terminal:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. Copy your backend URL (looks like: `https://invoice-system-api.onrender.com`)

### 3. Deploy Frontend to Render

1. In Render dashboard, click "New +" → "Static Site"
2. Select the same `Invoice` repository
3. Configure the site:
   - **Name**: `invoice-system-frontend`
   - **Branch**: `main`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

4. Add Environment Variable:
   ```
   REACT_APP_API_URL=<your-backend-url-from-step-2>
   ```
   Example: `REACT_APP_API_URL=https://invoice-system-api.onrender.com`

5. Click "Create Static Site"
6. Wait for deployment

### 4. Update Client API Configuration

You need to update your client to use the environment variable:

In `client/src/utils/axiosConfig.js`, make sure it uses:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

### 5. Seed Initial User (Optional)

After backend is deployed, you can seed the initial user:

1. In Render dashboard, go to your backend service
2. Click "Shell" tab
3. Run: `npm run seed:user`

Or use the MongoDB Atlas UI to manually create a user.

### 6. Test Your Deployment

1. Visit your frontend URL (from Render dashboard)
2. Try logging in with your seeded user
3. Create an invoice/quotation
4. Test PDF generation

## Important Notes

### Free Tier Limitations
- **Render Free**: Services spin down after 15 minutes of inactivity (first request may be slow)
- **MongoDB Atlas Free**: 512MB storage limit

### Environment Variables Reference

**Backend (.env)**:
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/invoice-db
JWT_SECRET=your-super-secret-jwt-key-here
FRONTEND_URL=https://invoice-system-frontend.onrender.com
```

**Frontend**:
```
REACT_APP_API_URL=https://invoice-system-api.onrender.com
```

## Troubleshooting

### Backend won't start
- Check environment variables are set correctly
- Verify MongoDB connection string is valid
- Check Render logs for errors

### Frontend can't connect to backend
- Verify REACT_APP_API_URL is set correctly
- Check CORS settings in server.js
- Ensure backend is running (check Render dashboard)

### Database connection issues
- Verify MongoDB Atlas cluster is running
- Check IP whitelist (set to 0.0.0.0/0 for allow all)
- Verify database user credentials

## Custom Domain (Optional)

To add a custom domain:
1. In Render dashboard, go to your service
2. Click "Settings" → "Custom Domain"
3. Follow the instructions to configure DNS

## Updates and Redeployment

Render automatically redeploys when you push to GitHub:
```bash
git add .
git commit -m "Update message"
git push origin main
```

Both services will automatically rebuild and redeploy.
