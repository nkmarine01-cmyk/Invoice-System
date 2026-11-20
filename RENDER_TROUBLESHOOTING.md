# "Unable to Connect" Error - Troubleshooting Guide

## 🔴 Error: "Unable to connect. Please try again."

This error means the frontend cannot reach the backend API. Here's how to fix it:

---

## ✅ Step-by-Step Fix

### Step 1: Check Backend Service Status

1. Go to your **Render Dashboard**: https://dashboard.render.com
2. Find your **backend service** (e.g., `invoice-system-backend`)
3. Check the status:
   - 🟢 **Live**: Service is running → Go to Step 2
   - 🔴 **Failed/Suspended**: Service crashed → Check logs for errors
   - ⏸️ **Building**: Wait for deployment to finish

**If backend is NOT running:**
- Check the logs tab for error messages
- Most common issue: `MONGO_URI` not set or invalid
- Fix: Add/update environment variables (see Step 4)

---

### Step 2: Find Your Backend URL

1. In Render dashboard, click on your **backend service**
2. Copy the URL at the top (e.g., `https://invoice-backend-xyz.onrender.com`)
3. Test it by visiting: `https://your-backend-url.onrender.com/`
4. You should see: **"API running"**

**If you don't see "API running":**
- Backend is not responding
- Check service logs
- Verify environment variables are set

---

### Step 3: Update Frontend Environment Variable

Your frontend needs to know where the backend is!

#### Option A: Update in Render Dashboard (Recommended)
1. Go to your **frontend service** in Render
2. Click **"Environment"** tab
3. Add/update this variable:
   ```
   REACT_APP_API_URL = https://your-actual-backend-url.onrender.com
   ```
4. Click **"Save Changes"**
5. Render will automatically redeploy

#### Option B: Update in Code (Alternative)
1. Edit `client/.env.production` locally:
   ```env
   REACT_APP_API_URL=https://your-actual-backend-url.onrender.com
   ```
2. Commit and push:
   ```bash
   git add client/.env.production
   git commit -m "Update backend URL"
   git push nkmarine main
   ```
3. Render will auto-deploy

---

### Step 4: Verify Backend Environment Variables

Your backend needs these environment variables set in Render:

```
MONGO_URI = mongodb+srv://username:password@cluster.mongodb.net/invoice_management?retryWrites=true&w=majority
JWT_SECRET = your-32-character-random-secret-key
PORT = 5000
NODE_ENV = production
FRONTEND_URL = https://your-frontend-url.onrender.com
```

**To set/check:**
1. Go to backend service → **Environment** tab
2. Verify all variables are present
3. Click **"Save Changes"** if you made updates

**Generate JWT_SECRET:**
```powershell
# Windows PowerShell:
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

---

### Step 5: Check MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. Verify cluster is **active** (not paused)
3. Check **Network Access**:
   - Click "Network Access" in left menu
   - Should have entry: `0.0.0.0/0` (Allow from anywhere)
   - If not, click "Add IP Address" → "Allow Access from Anywhere"
4. Check **Database Access**:
   - User exists with read/write permissions
   - Password is correct in `MONGO_URI`

---

### Step 6: Test Backend Manually

Use browser or curl to test:

**Test 1: Health Check**
```
https://your-backend-url.onrender.com/
```
Expected: "API running"

**Test 2: Setup Status**
```
https://your-backend-url.onrender.com/api/setup/status
```
Expected: JSON with `{"success": true, "setupCompleted": true}`

**Test 3: Create Admin User (if needed)**
```bash
# Use Postman or curl:
POST https://your-backend-url.onrender.com/api/setup/init
```
Expected: Admin user created

---

### Step 7: Check CORS Settings

The backend must allow requests from your frontend URL.

1. Go to backend service → **Environment**
2. Verify `FRONTEND_URL` is set to your frontend URL
3. Example: `FRONTEND_URL=https://invoice-system-2.bwaj.onrender.com`

---

## 🚨 Common Issues & Solutions

### Issue 1: Backend Shows "Service Unavailable"
**Cause**: Service is starting up (cold start)
**Solution**: Wait 30-60 seconds and try again

### Issue 2: MongoDB Connection Error in Logs
**Cause**: Invalid `MONGO_URI` or network access blocked
**Solution**: 
- Verify connection string is correct
- Check MongoDB Atlas network access
- Ensure password in URI doesn't contain special characters (URL encode if needed)

### Issue 3: CORS Error in Browser Console
**Cause**: Backend doesn't recognize frontend URL
**Solution**: Set `FRONTEND_URL` environment variable in backend service

### Issue 4: "Invalid username or password"
**Cause**: Admin user doesn't exist in production database
**Solution**: 
- Check backend logs for "✅ Admin user created"
- If not found, call `/api/setup/init` endpoint
- Or use Render Shell: `node seedUser.js`

### Issue 5: Frontend Shows Old URL
**Cause**: Frontend cached with old backend URL
**Solution**:
- Update `REACT_APP_API_URL` in frontend service
- Clear browser cache
- Hard refresh (Ctrl + Shift + R)

---

## 🔍 Debug Checklist

Before asking for help, verify:

- [ ] Backend service is **Live** (green) in Render
- [ ] Backend URL returns "API running" when visited
- [ ] Frontend `REACT_APP_API_URL` matches backend URL
- [ ] Backend `MONGO_URI` is set correctly
- [ ] MongoDB Atlas cluster is active
- [ ] MongoDB network access allows 0.0.0.0/0
- [ ] Backend `JWT_SECRET` is set (32+ characters)
- [ ] Backend `FRONTEND_URL` matches frontend URL
- [ ] Checked backend logs for errors
- [ ] Tried `/api/setup/status` endpoint
- [ ] Cleared browser cache

---

## 📊 Quick Diagnosis Flow

```
Frontend shows "Unable to connect"
        ↓
Visit backend URL directly
        ↓
┌───────────────────┐
│ Shows "API running"? │
└───────────────────┘
   ↓           ↓
  YES         NO
   ↓           ↓
CORS issue   Backend issue
   ↓           ↓
Check       Check logs
FRONTEND    Fix MONGO_URI
_URL        Restart service
```

---

## 🛠️ Emergency Fix Script

If nothing works, try this complete reset:

### Backend Service:
1. Go to backend service → **Manual Deploy**
2. Click **"Clear build cache & deploy"**
3. Wait for deployment
4. Check logs for "✅ Admin user created"

### Frontend Service:
1. Verify `REACT_APP_API_URL` environment variable
2. Go to frontend service → **Manual Deploy**
3. Click **"Clear build cache & deploy"**
4. Wait for deployment
5. Clear browser cache and try again

---

## 📞 Still Not Working?

### Check Backend Logs:
1. Go to backend service
2. Click **"Logs"** tab  
3. Look for errors (red text)
4. Common errors:
   - "MongoDB connection error" → Fix MONGO_URI
   - "Port already in use" → Restart service
   - "JWT_SECRET not defined" → Add environment variable

### Check Frontend Logs:
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for errors
4. Common errors:
   - CORS error → Fix FRONTEND_URL in backend
   - Network error → Check backend URL
   - 404 error → Backend service down

---

## ✅ Success Indicators

When everything is working:
1. Backend URL shows "API running"
2. `/api/setup/status` returns success
3. Login page loads without errors
4. Login with admin/admin123 works
5. Dashboard loads with data

---

## 🎯 Your Current URLs

Based on your screenshot:
- **Frontend**: https://invoice-system-2.bwaj.onrender.com

You need to:
1. Find your backend URL in Render dashboard
2. Update frontend's `REACT_APP_API_URL` to point to backend
3. Update backend's `FRONTEND_URL` to point to frontend
4. Redeploy both services
5. Try logging in again

---

## 📝 Next Steps After Fix

Once login works:
1. ✅ Change admin password
2. ✅ Test invoice creation
3. ✅ Test PDF download
4. ✅ Verify all features work
5. ✅ Set up monitoring
6. ✅ Configure backups

Good luck! 🚀
