# 📱 Novelgram Deployment Guide - Mobile Only

## 🚀 Deploy from Your Phone (Android)

### Required Apps:
1. **Termux** (Terminal emulator)
2. **GitHub** (Official app)
3. **Chrome** (Browser)

---

## Step 1: Install Termux

```bash
# Open Termux and run:
pkg update
pkg upgrade

# Install required packages
pkg install git
pkg install nodejs
pkg install openssh

# Verify installations
git --version
node --version
npm --version
```

---

## Step 2: Setup GitHub

### In GitHub App:
1. Create new repository: `novelgram`
2. Make it **Public**
3. Copy repository URL

### In Termux:
```bash
# Configure git
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Clone your repository
git clone https://github.com/YOUR_USERNAME/novelgram.git
cd novelgram
```

---

## Step 3: Upload Project Files

### Method 1: Direct Upload (Easiest)
```bash
# Create project structure
mkdir -p src/{components,pages,hooks,context,types,utils,i18n}
mkdir -p supabase/migrations
mkdir -p public

# Copy files from ZIP
# (Use file manager to extract ZIP to Downloads, then)
cp -r /storage/emulated/0/Download/novelgram/* .

# Or use GitHub app to upload files
```

### Method 2: Using Git Commands
```bash
# Add all files
git add .

# Commit
git commit -m "Novelgram v3.0 - Initial deployment"

# Push to GitHub
git push origin main
```

---

## Step 4: Deploy to Vercel

### In Chrome Browser:
1. Go to **vercel.com**
2. Sign up with **GitHub**
3. Click **"Add New Project"**
4. Select **novelgram** repository
5. Click **"Deploy"**
6. Wait 2-3 minutes
7. ✅ **Your site is live!**

---

## Step 5: Configure Environment Variables

### In Vercel Dashboard:
1. Go to your project
2. Click **"Settings"**
3. Click **"Environment Variables"**
4. Add these variables:

```
VITE_SUPABASE_URL=https://svwkkdwzwjjxnlevvbaj.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_XA_dOqvLZZTwn9hsaUC4Aw_QuJFpVkc
VITE_BSCSCAN_API_KEY=YOUR_BSCSCAN_API_KEY
VITE_ADSENSE_CLIENT_ID=pub-6197166523645168
```

5. Click **"Save"**
6. Redeploy if needed

---

## Step 6: Setup Supabase Database

### In Chrome:
1. Go to **supabase.com**
2. Sign in to your project
3. Go to **SQL Editor**
4. Run the migration file:
   - `001_final_schema.sql`
5. Click **"Run"**
6. ✅ Database is ready!

---

## Step 7: Configure Google AdSense

### In Chrome:
1. Go to **adsense.google.com**
2. Sign in with your account
3. Add your Vercel domain
4. Get verification code
5. Add to your site
6. Wait for approval (1-3 days)

---

## 🔄 Updating Your Site

### When you make changes:
```bash
# In Termux
cd novelgram

# Pull latest changes
git pull origin main

# Make your changes
# (Edit files with nano or file manager)

# Add and commit
git add .
git commit -m "Update: description"
git push origin main

# Vercel will auto-deploy!
```

---

## 📱 Mobile Workflow (Daily)

### To update content:
```bash
# 1. Open Termux
# 2. Navigate to project
cd novelgram

# 3. Edit files (use nano or external editor)
nano src/pages/DiscoverPage.tsx

# 4. Save and push
git add .
git commit -m "Content update"
git push origin main

# 5. Vercel auto-deploys in 1-2 minutes
```

---

## 🛠️ Troubleshooting

### Issue: "git push fails"
```bash
# Solution: Set upstream
git push -u origin main
```

### Issue: "npm install fails"
```bash
# Solution: Clear cache
npm cache clean --force
npm install
```

### Issue: "Build fails on Vercel"
```bash
# Check locally first
npm run build

# Fix errors, then push
```

### Issue: "Supabase connection fails"
```bash
# Check environment variables in Vercel
# Verify Supabase project is active
# Check RLS policies
```

---

## 🎨 Customization

### Change Colors:
```bash
# Edit tailwind.config.js
nano tailwind.config.js

# Edit index.css
nano src/index.css
```

### Add Language:
```bash
# Create translation file
nano src/i18n/locales/new_lang.json

# Register in config
nano src/i18n/config.ts
```

### Update Content:
```bash
# Edit pages
nano src/pages/DiscoverPage.tsx

# Edit components
nano src/components/novels/NovelCard.tsx
```

---

## 📊 Monitoring

### In Vercel Dashboard:
- **Analytics**: View traffic
- **Logs**: Check errors
- **Deployments**: View history

### In Supabase:
- **Table Editor**: View data
- **SQL Editor**: Run queries
- **Auth**: Manage users

---

## 🚀 Advanced: Custom Domain

### In Vercel:
1. Go to **Settings**
2. Click **Domains**
3. Add your domain
4. Follow DNS instructions
5. Wait for SSL certificate

---

## 📱 Mobile-Only Tips

### Use External Editor:
- **Acode** (Android code editor)
- **Spck Editor** (Git integration)
- **Dcoder** (Online IDE)

### File Management:
- **Solid Explorer** (File manager)
- **Termux** (Command line)

### GitHub Workflow:
- **GitHub App** (Mobile interface)
- **Termux** (Command line)

---

## ✅ Checklist

```
□ Termux installed
□ GitHub account created
□ Repository created
□ Files uploaded
□ Vercel account connected
□ Environment variables set
□ Supabase database configured
□ Google AdSense configured
□ Site deployed successfully
□ Domain configured (optional)
```

---

## 🎉 Success!

Your Novelgram site is now live!

**URL:** `https://your-project.vercel.app`

**Features:**
- ✅ 25+ Languages
- ✅ BSC Payments
- ✅ Google AdSense
- ✅ Premium Chapters
- ✅ Direct Support
- ✅ Mobile Optimized

---

## 📞 Support

- **Vercel Docs**: vercel.com/docs
- **Supabase Docs**: supabase.com/docs
- **React Docs**: react.dev
- **GitHub Help**: docs.github.com

---

## 🚀 Next Steps

1. **Share your site** with friends
2. **Add content** (novels, chapters)
3. **Promote** on social media
4. **Monitor** analytics
5. **Scale** as you grow

---

**Built with ❤️ for the global reading community**
