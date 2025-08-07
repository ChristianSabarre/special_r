# 💕 Monthsary Dashboard

A beautiful, romantic dashboard for tracking your relationship milestones with photo storage capabilities.

## ✨ Features

- **Romantic Login System**: Secure authentication for Nads
- **Data Analytics**: Visualize your relationship data with charts
- **Interactive Calendar**: Click any date to view events and add photos
- **Photo Storage**: Upload and manage photos for specific dates
- **Special Animations**: Beautiful animations for special moments
- **Responsive Design**: Works perfectly on all devices

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone or download the project**
2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   ```bash
   cp env.example .env
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

5. **Open your browser** and go to `http://localhost:3000`

## 🔐 Login Credentials

- **Username**: `Nads`
- **Password**: `chrispogi`

## 📸 Photo Features

- **Upload Photos**: Click any date and upload photos
- **View Gallery**: See all photos for each date
- **Delete Photos**: Hover over photos to delete them
- **Server Storage**: Photos are stored securely on the server
- **Cross-device Access**: Photos available on any device

## 🌐 Deployment Options

### Option 1: Heroku (Recommended)

1. **Create Heroku account** and install Heroku CLI
2. **Login to Heroku**:
   ```bash
   heroku login
   ```

3. **Create Heroku app**:
   ```bash
   heroku create your-monthsary-app
   ```

4. **Set environment variables**:
   ```bash
   heroku config:set JWT_SECRET=your-super-secret-key
   heroku config:set NODE_ENV=production
   ```

5. **Deploy**:
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push heroku main
   ```

### Option 2: Railway

1. **Connect your GitHub repo** to Railway
2. **Set environment variables** in Railway dashboard
3. **Deploy automatically** on every push

### Option 3: Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

## 🔧 Environment Variables

Create a `.env` file with:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## 📁 Project Structure

```
monthsary_final/
├── index.html          # Main HTML file
├── app.js             # Frontend JavaScript
├── styles.css         # Custom CSS styles
├── server.js          # Express server
├── package.json       # Node.js dependencies
├── env.example        # Environment variables template
├── uploads/           # Photo storage directory
│   └── Nads/         # User-specific photos
└── README.md         # This file
```

## 🎨 Customization

### Colors and Theme
- Edit `styles.css` to change the pink aesthetic
- Modify Tailwind classes in `index.html`

### Data Sources
- Replace CSV files with your own data
- Update chart configurations in `app.js`

### Special Dates
- Add more special animations in `showEventDetails()`
- Customize the first meeting animation

## 🔒 Security Features

- **JWT Authentication**: Secure token-based login
- **Password Hashing**: Bcrypt for password security
- **File Upload Validation**: Secure photo uploads
- **User-specific Storage**: Photos isolated per user

## 📊 Data Visualization

The dashboard includes:
- **Weekly Message Activity**: Line chart
- **Most Used Phrases**: Doughnut chart
- **Love & Miss Comparison**: Bar chart
- **Interactive Calendar**: Event timeline

## 🎭 Special Features

- **Personalized Greeting**: Random compliments for Nads
- **First Meeting Animation**: Special animation for June 1st, 2025
- **Floating Hearts**: Romantic background effects
- **Photo Gallery**: Beautiful photo management

## 🛠️ Development

### Local Development
```bash
npm run dev  # Start with nodemon for auto-reload
```

### API Endpoints
- `POST /api/login` - User authentication
- `POST /api/photos/upload` - Upload photos
- `GET /api/photos/:dateKey` - Get photos for date
- `DELETE /api/photos/:dateKey/:photoId` - Delete photo
- `GET /api/photos` - Get all user photos

## 💝 Made with Love

This dashboard was created with:
- **Frontend**: HTML5, CSS3, JavaScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Charts**: Chart.js
- **Icons**: Font Awesome
- **Storage**: File system + JWT authentication

## 📞 Support

For questions or issues:
1. Check the console for error messages
2. Ensure all dependencies are installed
3. Verify environment variables are set correctly
4. Check that the server is running on the correct port

---

**💕 Enjoy your romantic monthsary dashboard! 💕** 