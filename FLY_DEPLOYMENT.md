# Deploy to Fly.io - Complete Guide

Deploy GenieACS backend to Fly.io **completely free** with persistent storage.

---

## Why Fly.io?

✅ **Completely free** - $5/month credit covers GenieACS easily  
✅ **No auto-sleep** - Your app runs 24/7  
✅ **Persistent storage** - Database data survives restarts  
✅ **HTTPS by default** - Secure connections included  
✅ **Easy GitHub integration** - Auto-deploy on git push  
✅ **Perfect for MVP** - Scales easily when you grow

---

## Prerequisites

- GitHub account (already have it)
- MongoDB Atlas account (free 512MB - from previous setup)
- Fly.io account (free)

---

## Step 1: Create Fly.io Account (2 min)

1. Go to: https://fly.io
2. Sign up (GitHub recommended)
3. Authorize Fly.io to access GitHub
4. Done!

---

## Step 2: Install Flyctl CLI (3 min)

**On macOS:**
```bash
brew install flyctl
```

**On Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

**Verify installation:**
```bash
flyctl version
```

---

## Step 3: Login to Fly.io (1 min)

```bash
flyctl auth login
```

This opens a browser window. Authenticate and return to terminal.

---

## Step 4: Create Fly.io App (2 min)

From your project directory:

```bash
cd /Users/sbastola/Private/poc-home-security-app
flyctl launch
```

Answer the prompts:
- **App name:** `genieacs-api` (or your preference)
- **Region:** Choose closest to you (ord = Chicago, sin = Singapore, etc.)
- **PostgreSQL/Redis:** No (we don't need it)

---

## Step 5: Set Environment Variables (2 min)

You need to tell Fly.io about your MongoDB:

```bash
flyctl secrets set MONGODB_CONNECTION_URL="mongodb+srv://user:password@cluster.mongodb.net/genieacs?retryWrites=true&w=majority"
```

Replace with your actual MongoDB connection string from MongoDB Atlas.

**Verify it was set:**
```bash
flyctl secrets list
```

---

## Step 6: Deploy to Fly.io (5 min)

```bash
flyctl deploy
```

This will:
1. Build Docker image
2. Push to Fly.io
3. Deploy and start services
4. Give you a public URL

**Once done, you'll see:**
```
Visit your newly deployed app at: https://genieacs-api.fly.dev
```

---

## Step 7: Test It Works (2 min)

Get your app name:
```bash
flyctl apps list
```

Test the API:
```bash
curl https://your-app-name.fly.dev/devices
```

Should return: `[]`

---

## Step 8: Update Frontend to Use Fly.io URL

Now deploy React frontend to Vercel with the Fly.io URL:

1. Go to Vercel dashboard
2. Create new project from GitHub: `poc-home-security-app`
3. Set environment variable:
   ```
   VITE_NBI_URL = https://your-app-name.fly.dev
   ```
4. Deploy

---

## Step 9: Share the URL!

Your GenieACS API is now publicly accessible:
```
https://your-app-name.fly.dev
```

Share this with users! They can:
- Configure devices to connect to your ACS
- Use the REST API
- Monitor devices

---

## After Deployment

### View Logs

```bash
flyctl logs
```

### Monitor App Health

```bash
flyctl status
```

### Restart App

```bash
flyctl restart
```

### Update & Redeploy

```bash
git add .
git commit -m "Update something"
git push origin main
flyctl deploy
```

---

## Fly.io Free Tier Details

**What you get:**
- 3 free shared-cpu VMs
- 100GB monthly outbound data transfer
- 160GB persistent storage (for data)
- $5/month free credit

**For your use case:**
- 1 VM runs GenieACS (uses ~1 of 3 free VMs)
- Persistent storage saves MongoDB data
- 100GB monthly transfer is plenty for MVP

**Total cost: $0/month** (within free credit)

---

## Scaling Later

When you need more:
- Upgrade to dedicated CPU ($10-20/month)
- Add more VMs
- Upgrade storage

---

## Troubleshooting

### App won't start
```bash
flyctl logs --recent
```
Check logs for errors in MongoDB connection string.

### Can't connect to API
```bash
curl -v https://your-app-name.fly.dev/devices
```

Should show status 200 with `[]`

### MongoDB connection fails
Verify environment variable:
```bash
flyctl secrets list
```

Check connection string includes password correctly.

### Want to change region
```bash
flyctl regions list
flyctl regions set ord  # Change to different region
```

---

## Complete Deployment Summary

| Service | URL | Cost |
|---------|-----|------|
| **GenieACS API** | https://your-app-name.fly.dev | $0 |
| **React Frontend** | https://your-app.vercel.app | $0 |
| **MongoDB** | mongodb+srv://... | $0 |
| **TOTAL** | | **$0/month** |

---

## What Users Can Do

Once deployed, users can:

1. **Connect real devices** to your ACS:
   ```
   ACS URL: https://your-app-name.fly.dev/cwmp
   ```

2. **Use the REST API**:
   ```bash
   curl https://your-app-name.fly.dev/devices
   ```

3. **Access your dashboard**:
   ```
   https://your-app.vercel.app
   ```

---

## Next Steps

1. ✅ Have MongoDB Atlas URL
2. ⏳ Run: `flyctl launch`
3. ⏳ Set: `flyctl secrets set MONGODB_CONNECTION_URL="..."`
4. ⏳ Deploy: `flyctl deploy`
5. ⏳ Get your public URL
6. ⏳ Deploy React to Vercel with that URL
7. ✅ Share your dashboard with users!

---

**Ready? Start with Step 2: Install Flyctl** 🚀
