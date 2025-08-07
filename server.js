const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve static files
app.use(express.static(path.join(__dirname)));

// In-memory storage for photos (will persist during deployment)
let photoStorage = {};
let users = {
    'Nads': {
        username: 'Nads',
        password: '$2a$10$JAy1iHTB4erLGklcW6ljvOElkbZ4kNhiFzisZzW/x6lSJve28G/ie', // hashed 'chrispogi'
        photos: {}
    }
};

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    const user = users[username];
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, username: user.username });
});

// Upload photo endpoint
app.post('/api/photos/upload', authenticateToken, multer().single('photo'), (req, res) => {
    try {
        const { dateKey } = req.body;
        const file = req.file;
        const username = req.user.username;

        if (!file) {
            return res.status(400).json({ error: 'No photo uploaded' });
        }

        if (!dateKey) {
            return res.status(400).json({ error: 'Date key required' });
        }

        // Create user photos directory if it doesn't exist
        const userPhotosDir = path.join(__dirname, 'uploads', username);
        if (!fs.existsSync(userPhotosDir)) {
            fs.mkdirSync(userPhotosDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = path.extname(file.originalname);
        const filename = `${dateKey}_${timestamp}${fileExtension}`;
        const filepath = path.join(userPhotosDir, filename);

        // Save file
        fs.writeFileSync(filepath, file.buffer);

        // Store photo metadata
        if (!photoStorage[username]) {
            photoStorage[username] = {};
        }
        if (!photoStorage[username][dateKey]) {
            photoStorage[username][dateKey] = [];
        }

        const photoData = {
            id: timestamp,
            filename: filename,
            originalName: file.originalname,
            dateUploaded: new Date().toISOString(),
            size: file.size,
            url: `/api/photos/${username}/${filename}`
        };

        photoStorage[username][dateKey].push(photoData);

        res.json({ 
            success: true, 
            photo: photoData,
            message: 'Photo uploaded successfully! 💕'
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload photo' });
    }
});

// Get photos for a specific date
app.get('/api/photos/:dateKey', authenticateToken, (req, res) => {
    try {
        const { dateKey } = req.params;
        const username = req.user.username;

        const photos = photoStorage[username]?.[dateKey] || [];
        res.json({ photos });

    } catch (error) {
        console.error('Get photos error:', error);
        res.status(500).json({ error: 'Failed to get photos' });
    }
});

// Get all photos for user
app.get('/api/photos', authenticateToken, (req, res) => {
    try {
        const username = req.user.username;
        const allPhotos = photoStorage[username] || {};
        res.json({ photos: allPhotos });

    } catch (error) {
        console.error('Get all photos error:', error);
        res.status(500).json({ error: 'Failed to get photos' });
    }
});

// Delete photo endpoint
app.delete('/api/photos/:dateKey/:photoId', authenticateToken, (req, res) => {
    try {
        const { dateKey, photoId } = req.params;
        const username = req.user.username;

        if (!photoStorage[username]?.[dateKey]) {
            return res.status(404).json({ error: 'Date not found' });
        }

        const photoIndex = photoStorage[username][dateKey].findIndex(p => p.id == photoId);
        if (photoIndex === -1) {
            return res.status(404).json({ error: 'Photo not found' });
        }

        const photo = photoStorage[username][dateKey][photoIndex];
        
        // Delete file from filesystem
        const filepath = path.join(__dirname, 'uploads', username, photo.filename);
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }

        // Remove from storage
        photoStorage[username][dateKey].splice(photoIndex, 1);

        // Remove date key if no photos left
        if (photoStorage[username][dateKey].length === 0) {
            delete photoStorage[username][dateKey];
        }

        res.json({ 
            success: true, 
            message: 'Photo deleted successfully!' 
        });

    } catch (error) {
        console.error('Delete photo error:', error);
        res.status(500).json({ error: 'Failed to delete photo' });
    }
});

// Serve uploaded photos
app.get('/api/photos/:username/:filename', (req, res) => {
    try {
        const { username, filename } = req.params;
        const filepath = path.join(__dirname, 'uploads', username, filename);
        
        if (fs.existsSync(filepath)) {
            res.sendFile(filepath);
        } else {
            res.status(404).json({ error: 'Photo not found' });
        }
    } catch (error) {
        console.error('Serve photo error:', error);
        res.status(500).json({ error: 'Failed to serve photo' });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Monthsary Dashboard API is running! 💕' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`💕 Monthsary Dashboard ready at http://localhost:${PORT}`);
}); 