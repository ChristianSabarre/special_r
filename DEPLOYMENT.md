# 🚀 Deploy Your Monthsary Dashboard

## Option 1: Heroku (Recommended)

### Step 1: Install Heroku CLI
1. Download from: https://devcenter.heroku.com/articles/heroku-cli
2. Install and login: `heroku login`

### Step 2: Create Heroku App
```bash
# In your project directory
heroku create your-monthsary-app-name
```

### Step 3: Set Environment Variables
```bash
heroku config:set JWT_SECRET=your-super-secret-key-change-this
heroku config:set NODE_ENV=production
```

### Step 4: Deploy
```bash
git add .
git commit -m "Initial deployment"
git push heroku main
```

### Step 5: Open Your App
```bash
heroku open
```

## Option 2: Railway (Easy Alternative)

### Step 1: Connect GitHub
1. Go to https://railway.app
2. Connect your GitHub account
3. Import your repository

### Step 2: Set Environment Variables
In Railway dashboard:
- `JWT_SECRET`: your-super-secret-key
- `NODE_ENV`: production

### Step 3: Deploy
Railway will automatically deploy on every push!

## Option 3: Vercel

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Deploy
```bash
vercel
```

## 🔐 After Deployment

### Your App Will Be Available At:
- **Heroku**: `https://your-app-name.herokuapp.com`
- **Railway**: `https://your-app-name.railway.app`
- **Vercel**: `https://your-app-name.vercel.app`

### Login Credentials:
- **Username**: `Nads`
- **Password**: `chrispogi`

## 📸 Photo Storage

✅ **Photos will be saved permanently** on the server
✅ **Accessible from any device** with internet
✅ **Secure storage** with JWT authentication
✅ **Cross-device sync** - upload on phone, view on laptop

## 🛠️ Troubleshooting

### If deployment fails:
1. Check all files are committed: `git status`
2. Verify package.json is correct
3. Check environment variables are set
4. View logs: `heroku logs --tail`

### If photos don't upload:
1. Check file size (max 10MB recommended)
2. Verify internet connection
3. Try refreshing the page

## 💕 Your Romantic Dashboard is Ready!

Once deployed, you can:
- Share the URL with your loved one
- Upload photos from any device
- Access your memories anywhere
- Keep your relationship data safe and secure

**Happy monthsary! 💕** 