# Deploy Your App - Complete Guide

Deploy your home security dashboard in **30 minutes, completely free**.

---

## TL;DR (2 minutes)

Deploy to:
- **Frontend**: Vercel (free)
- **Backend**: Railway (free $5 credits)
- **Database**: MongoDB Atlas (free 512MB)

**Total cost: $0**

---

## Prerequisites

- GitHub account
- 30 minutes
- This guide

---

## Part 1: Create MongoDB Database (5 min)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (email or GitHub)
3. Create new project → Create Deployment
4. Select **M0 Sandbox** (free)
5. Choose region → Create
6. Wait 1-2 minutes
7. Click **Connect** → Drivers → Node.js
8. Copy connection string: `mongodb+srv://user:pass@...`
9. Replace `<password>` with your password
10. Save this URL as `MONGODB_URL`

---

## Part 2: Deploy Backend (Railway) - 10 min

1. Go to https://railway.app
2. Sign up with GitHub
3. Click **New Project** → **Deploy from GitHub**
4. Select your GitHub account → authorize
5. Find and select **poc-home-security-app**
6. Click **Deploy**

While building, add environment variables:

7. Go to **Variables** tab
8. Click **New Variable** twice and add:
   ```
   MONGODB_CONNECTION_URL = mongodb+srv://user:pass@...
   NODE_ENV = production
   ```
9. Wait 3-5 minutes for build/deployment
10. Copy the public URL that appears: `https://genieacs-abc123.railway.app`
11. Save this as `RAILWAY_URL`

**Test it works:**
```bash
curl https://your-railway-url/devices
# Should return: []
```

---

## Part 3: Deploy Frontend (Vercel) - 8 min

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click **Add New** → **Project**
4. Select **Import Git Repository**
5. Find and select **poc-home-security-app**

Add environment variable before deploying:

6. Find **Environment Variables** section
7. Add:
   ```
   VITE_NBI_URL = https://your-railway-url
   ```
   (Replace with your actual Railway URL from Part 2)
8. Click **Deploy**
9. Wait 2-3 minutes
10. Copy your Vercel URL: `https://your-app.vercel.app`

**Test it works:**
- Open your Vercel URL in browser
- You should see the Home Security Dashboard
- No errors in browser console (F12 → Console)

---

## Part 4: Connect Frontend to Backend - 2 min

1. In your app, click **Settings** (top right)
2. Update **NBI URL** field to your Railway URL
3. Click away (auto-saves)
4. Refresh page

Now your frontend can talk to your backend!

---

## Part 5: Test It Works - 3 min

Run a virtual device from your computer:

```bash
# From project directory
ACS_URL=https://your-railway-url node cpe-simulator.js
```

Wait 30-60 seconds. A device should appear in dashboard as **Online** (green).

---

## 🎉 Done! Your App is Live

- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-railway-url
- **Cost**: $0/month

---

## After Deployment

### Update Code

Everything auto-deploys on git push:

```bash
git add .
git commit -m "Update dashboard"
git push origin main

# Wait 2-3 minutes
# Check: vercel.com/dashboard and railway.app
```

### Monitor

- **Frontend logs**: vercel.com/dashboard → Project → Deployments
- **Backend logs**: railway.app → Project → Logs
- **Database**: cloud.mongodb.com
- **Cache**: redis.com/cloud

### Troubleshooting

**App shows blank:**
- Check browser console (F12)
- Verify Settings → NBI URL is correct

**"Connection refused" error:**
- Verify Railway URL in Settings
- Check Railway logs for errors

**Backend build failed:**
- Check Railway build logs
- Verify environment variables are set
- Redeploy by git push

**Devices not appearing:**
- Wait 30-60 seconds
- Run local CPE simulator to test
- Check Railway logs for SOAP Inform messages

---

## Scaling Later

When you outgrow free tier:

| Service | Upgrade Cost |
|---------|------------|
| Railway | ~$10-30/month |
| MongoDB | ~$57/month |
| Redis | ~$15/month |
| Vercel | ~$20/month (rarely needed) |

---

## Security Notes

Current setup is MVP. For production add:
- Authentication/login
- Rate limiting
- Input validation
- CORS proper configuration
- Audit logging

---

## What's Deployed

**Frontend (Vercel)**:
- React 18 dashboard
- TypeScript
- Tailwind CSS
- Auto-updates on git push

**Backend (Railway)**:
- GenieACS CWMP (device check-in port 7547)
- GenieACS NBI (REST API port 7557)
- MongoDB connection
- Redis connection

**Data Storage**:
- MongoDB Atlas: Device data, parameters
- Redis Cloud: Session cache

---

## Key URLs to Bookmark

| URL | Purpose |
|-----|---------|
| https://your-app.vercel.app | Your dashboard |
| https://vercel.com/dashboard | Frontend deployments |
| https://railway.app | Backend status |
| https://cloud.mongodb.com | Database |
| https://redis.com/cloud | Cache |

---

## Success Checklist

- [ ] MongoDB Atlas created and URL copied
- [ ] Redis Cloud created and URL copied
- [ ] Backend deployed on Railway with env vars set
- [ ] Frontend deployed on Vercel with VITE_NBI_URL set
- [ ] Vercel URL opens successfully
- [ ] Settings → NBI URL updated to Railway URL
- [ ] CPE simulator runs and devices appear
- [ ] Can click device and see parameters

---

## Need Help?

1. Check browser console for errors (F12)
2. Check Railway logs: railway.app → Logs
3. Check Vercel logs: vercel.com/dashboard
4. Test backend directly: `curl https://your-railway-url/devices`

---

**That's it! Your app is now production-ready and live on the internet.** 🚀
