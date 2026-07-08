# Deploy to Render.com - FREE FOREVER

Deploy GenieACS to **Render.com** - completely free, no trial limit, no credit card needed.

---

## Why Render.com?

✅ **Free forever** - No trial limit, no payment required  
✅ **Auto-sleeps** - Uses 0 resources when idle (wakes in ~10-30 seconds)  
✅ **No credit card** - Sign up with GitHub only  
✅ **Perfect for MVP** - Ideal for testing and sharing  
✅ **HTTPS included** - Secure connections  
✅ **Easy deployment** - One click from GitHub

---

## Cost

- **Render Free Tier**: $0/month (sleeps when not in use, wakes instantly)
- **MongoDB Atlas**: $0/month (512MB free)
- **Vercel Frontend**: $0/month
- **TOTAL: $0/month** ✅

---

## Prerequisites

- GitHub account (have it)
- MongoDB Atlas URL (from previous setup)
- Render.com account (free, no credit card)

---

## Step 1: Create Render Account (2 min)

1. Go to: https://render.com
2. Sign up with GitHub
3. Authorize Render to access GitHub
4. Done!

---

## Step 2: Create MongoDB Database (5 min)

If you haven't already:

1. Go to: https://www.mongodb.com/cloud/atlas
2. Sign up with GitHub
3. Create M0 Sandbox (free)
4. Get connection string: `mongodb+srv://user:pass@...`
5. Save it - you'll need it soon

---

## Step 3: Deploy to Render (5 min)

### Option A: Using render.yaml (Recommended)

We already created a `render.yaml` file in your repo. Render will auto-detect it!

1. Go to Render dashboard: https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Select **Build and deploy from a Git repository**
4. Choose **GitHub** → authorize
5. Find and select **poc-home-security-app**
6. Click **Connect**

Render will auto-detect `render.yaml` and show:
- Name: `genieacs-api`
- Region: Choose closest to you
- Plan: **Free**

7. Before deploying, scroll down to **Environment**
8. Add environment variable:
   ```
   Name: MONGODB_CONNECTION_URL
   Value: mongodb+srv://user:pass@cluster.mongodb.net/genieacs
   ```
   (Your actual MongoDB URL)

9. Click **Create Web Service**
10. Wait 5-10 minutes for deployment
11. Once done, you'll get a URL like: `https://genieacs-api.onrender.com`
12. Save this URL!

### Option B: Manual Setup (if render.yaml doesn't work)

If Render doesn't auto-detect render.yaml:

1. Click **New +** → **Web Service**
2. Connect GitHub repository
3. Fill in:
   - **Name**: `genieacs-api`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/bin/genieacs-cwmp & node dist/bin/genieacs-nbi & wait`
   - **Plan**: Free

4. Add environment variables (scroll down):
   ```
   MONGODB_CONNECTION_URL = mongodb+srv://user:pass@...
   NODE_ENV = production
   ```

5. Click **Create Web Service**

---

## Step 4: Test It Works (1 min)

```bash
curl https://genieacs-api.onrender.com/devices
```

Should return: `[]`

✅ Your backend is live!

---

## Step 5: Deploy Frontend to Vercel (8 min)

1. Go to: https://vercel.com
2. Sign up with GitHub (if not already)
3. Click **Add New** → **Project**
4. Select **Import Git Repository**
5. Find **poc-home-security-app** → Import

6. Set environment variable:
   - **Name**: `VITE_NBI_URL`
   - **Value**: `https://genieacs-api.onrender.com`
   (Use your actual Render URL)

7. Click **Deploy**
8. Wait 2-3 minutes
9. Get your Vercel URL: `https://your-app.vercel.app`

---

## Step 6: Test Everything (2 min)

1. Open your Vercel URL in browser
2. Should see: Home Security Dashboard
3. Click **Settings** (top right)
4. Verify **NBI URL** is set to your Render URL
5. Refresh page

✅ Your app is connected!

---

## Step 7: Share with Users! 🎉

Your public URLs:
```
Frontend: https://your-app.vercel.app
Backend API: https://genieacs-api.onrender.com
```

Users can:
- Access your dashboard
- Configure devices to connect to your ACS
- Monitor device status
- Send remote commands

---

## How Auto-Sleep Works

**What happens:**
- Service sleeps after **15 minutes of inactivity**
- Uses 0 resources while sleeping
- Wakes up instantly when someone accesses it (~10-30 seconds first time)

**Why it's perfect for MVP:**
- You pay $0
- It "feels" instant to users
- Great for testing and demos
- No degradation while asleep

---

## After Deployment

### View Logs

Render dashboard → Your service → **Logs** tab

### Restart Service

Render dashboard → Your service → **Settings** → **Restart service**

### Update Code

```bash
git add .
git commit -m "Update something"
git push origin main
```

Render auto-redeploys on git push!

### Check Service Status

Render dashboard → Your service → Status indicator (top right)

---

## Troubleshooting

### Service won't start

1. Check logs: Render dashboard → **Logs** tab
2. Usually MongoDB connection issue
3. Verify `MONGODB_CONNECTION_URL` is set correctly

### API returns 503 or error

Service might be waking up from sleep (first request takes 10-30 seconds).
Wait and try again!

### Can't connect from Vercel

1. Verify Vercel has correct `VITE_NBI_URL`
2. Test API directly: `curl https://genieacs-api.onrender.com/devices`
3. Check Render logs

### MongoDB connection fails

1. Check environment variable is set
2. Verify connection string has password correctly
3. Make sure MongoDB cluster allows connections from Render

---

## Free Tier Limits

- **1 free web service** per account (you can have multiple with paid account)
- **Auto-sleeps** after 15 min of inactivity
- **Wakes instantly** when accessed
- **Perfect for testing**

---

## Scaling Later

When you need paid tier:
- **Starter Plan** ($7/month) - No auto-sleep
- **Pro Plan** ($12/month) - Better performance
- But for MVP, free tier is perfect!

---

## Complete Deployment Checklist

- [ ] GitHub account (have it)
- [ ] MongoDB Atlas URL (from previous setup)
- [ ] Render account created
- [ ] GenieACS deployed to Render
- [ ] Environment variable set (MONGODB_CONNECTION_URL)
- [ ] API tested (`curl` returns `[]`)
- [ ] Frontend deployed to Vercel
- [ ] VITE_NBI_URL set to Render URL
- [ ] Dashboard loads in browser
- [ ] URLs saved and ready to share

---

## Summary

| Component | URL | Cost | Status |
|-----------|-----|------|--------|
| Frontend | https://your-app.vercel.app | $0 | ✅ Ready |
| Backend | https://genieacs-api.onrender.com | $0 | ✅ Ready |
| Database | MongoDB Atlas | $0 | ✅ Ready |
| **TOTAL** | | **$0/month** | ✅ Live! |

---

## What's Next?

1. Create Render account
2. Follow Step 3 to deploy backend
3. Follow Step 5 to deploy frontend
4. Share URLs with users!

**Your MVP is ready to go live!** 🚀
