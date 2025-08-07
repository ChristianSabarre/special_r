// Login credentials
const ADMIN_CREDENTIALS = {
    username: 'Nads',
    password: 'chrispogi'
};

// Global variables
let timelineData = [];
let messageData = [];
let keywordsData = [];
let loveMissData = [];
let messageChart, keywordsChart;
let photoStorage = {}; // Store photos by date
let currentEventDate = null; // Track current event date for photo uploads
let authToken = null; // JWT token for API authentication

// DOM elements
const loginScreen = document.getElementById('loginScreen');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');

// Login functionality
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            loginScreen.classList.add('hidden');
            dashboard.classList.remove('hidden');
            loadData();
            showPersonalizedGreeting();
        } else {
            showLoginError(data.error || 'Invalid credentials. Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        showLoginError('Network error. Please try again.');
    }
});

// Personalized greeting for Nads
function showPersonalizedGreeting() {
    const compliments = ['beautiful', 'gorgeous', 'wonderful', 'smoking hot', 'sexy'];
    const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
    
    const greetingDiv = document.createElement('div');
    greetingDiv.className = 'fixed top-4 right-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-sm';
    greetingDiv.innerHTML = `
        <div class="flex items-center space-x-3">
            <div class="text-2xl">💕</div>
            <div>
                <p class="font-semibold">Hi my ${randomCompliment} girlfriend!</p>
                <p class="text-sm opacity-90">Welcome to your special dashboard 💖</p>
            </div>
        </div>
    `;
    document.body.appendChild(greetingDiv);
    
    setTimeout(() => {
        greetingDiv.remove();
    }, 5000);
}

// Logout functionality
logoutBtn.addEventListener('click', function() {
    dashboard.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    loginError.classList.add('hidden');
});

// Show login error
function showLoginError(message) {
    loginError.textContent = message;
    loginError.classList.remove('hidden');
    setTimeout(() => {
        loginError.classList.add('hidden');
    }, 3000);
}

// Show success message
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Load CSV data
async function loadData() {
    try {
        // Load photos from server
        await loadAllPhotos();
        
        // Show loading state
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
        loadingDiv.innerHTML = '<div class="bg-white p-6 rounded-lg"><div class="loading-spinner"></div><p class="mt-4 text-gray-600">Loading data...</p></div>';
        document.body.appendChild(loadingDiv);
        
        // Load timeline data
        const timelineResponse = await fetch('love_timeline.csv');
        const timelineText = await timelineResponse.text();
        timelineData = parseCSV(timelineText);
        
        // Load message data
        const messageResponse = await fetch('weekly_message_counts.csv');
        const messageText = await messageResponse.text();
        messageData = parseCSV(messageText);
        
        // Load keywords data
        const keywordsResponse = await fetch('monthsary_keywords.csv');
        const keywordsText = await keywordsResponse.text();
        keywordsData = parseCSV(keywordsText);
        
        // Load love/miss phrases data
        const loveMissResponse = await fetch('love_miss_phrases.csv');
        const loveMissText = await loveMissResponse.text();
        loveMissData = parseCSV(loveMissText);
        
        // Update dashboard
        updateStats();
        createCharts();
        createCalendar();
        
        // Remove loading state
        setTimeout(() => {
            loadingDiv.remove();
        }, 500);
        
    } catch (error) {
        console.error('Error loading data:', error);
        showLoginError('Error loading data. Please refresh the page.');
    }
}

// Parse CSV data
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const row = {};
        headers.forEach((header, index) => {
            row[header.trim()] = values[index] ? values[index].trim().replace(/"/g, '') : '';
        });
        data.push(row);
    }
    
    return data;
}

// Update statistics
function updateStats() {
    document.getElementById('totalEvents').textContent = timelineData.length;
    
    const totalMessages = messageData.reduce((sum, row) => sum + parseInt(row.message_count || 0), 0);
    document.getElementById('totalMessages').textContent = totalMessages.toLocaleString();
    
    const loveExpressions = keywordsData.reduce((sum, row) => {
        if (row.phrase && (row.phrase.includes('love') || row.phrase.includes('heart'))) {
            return sum + parseInt(row.count || 0);
        }
        return sum;
    }, 0);
    document.getElementById('loveExpressions').textContent = loveExpressions.toLocaleString();
    
    const sweetGestures = keywordsData.reduce((sum, row) => {
        if (row.phrase && (row.phrase.includes('mwa') || row.phrase.includes('kiss'))) {
            return sum + parseInt(row.count || 0);
        }
        return sum;
    }, 0);
    document.getElementById('sweetGestures').textContent = sweetGestures.toLocaleString();
}

// Create charts
function createCharts() {
    createMessageChart();
    createKeywordsChart();
    createComparisonChart();
}

// Create message activity chart
function createMessageChart() {
    const ctx = document.getElementById('messageChart');
    if (!ctx) return;
    
    const labels = messageData.map(row => {
        const date = new Date(row.week);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    const data = messageData.map(row => parseInt(row.message_count || 0));
    
    // Destroy existing chart if it exists
    if (messageChart) {
        messageChart.destroy();
    }
    
    messageChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Messages per Week',
                data: data,
                borderColor: '#EC4899',
                backgroundColor: 'rgba(236, 72, 153, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#EC4899',
                pointBorderColor: '#fff',
                pointBorderWidth: 1,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#6B7280',
                        maxTicksLimit: 6
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#6B7280',
                        maxTicksLimit: 8
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Create keywords chart
function createKeywordsChart() {
    const ctx = document.getElementById('keywordsChart').getContext('2d');
    
    const labels = keywordsData.map(row => row.phrase);
    const data = keywordsData.map(row => parseInt(row.count || 0));
    
    const colors = [
        '#EC4899', '#F472B6', '#F9A8D4', '#FBCFE8',
        '#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A'
    ];
    
    keywordsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

// Create comparison chart
function createComparisonChart() {
    const ctx = document.getElementById('comparisonChart');
    if (!ctx) return;
    
    // Process love/miss data for comparison
    const phrases = ['i love you', 'i love u', 'i miss you', 'i miss u', 'imu'];
    const chrisData = [];
    const nadsData = [];
    
    phrases.forEach(phrase => {
        const chrisCount = loveMissData.find(row => row.Phrase === phrase && row.Sender === 'chris')?.Count || 0;
        const nadsCount = loveMissData.find(row => row.Phrase === phrase && row.Sender === 'nads')?.Count || 0;
        chrisData.push(parseInt(chrisCount));
        nadsData.push(parseInt(nadsCount));
    });
    
    const comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['I Love You', 'I Love U', 'I Miss You', 'I Miss U', 'IMU'],
            datasets: [
                {
                    label: 'Chris',
                    data: chrisData,
                    backgroundColor: '#EC4899',
                    borderColor: '#EC4899',
                    borderWidth: 1
                },
                {
                    label: 'Nads',
                    data: nadsData,
                    backgroundColor: '#F472B6',
                    borderColor: '#F472B6',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#6B7280'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#6B7280'
                    }
                }
            }
        }
    });
}

// Calendar variables
let currentDate = new Date();
let eventsByDate = {};

// Create interactive calendar
function createCalendar() {
    console.log('Creating calendar with timelineData:', timelineData);
    
    // Group events by date
    eventsByDate = {};
    timelineData.forEach(event => {
        const date = new Date(event.Date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;
        if (!eventsByDate[dateKey]) {
            eventsByDate[dateKey] = [];
        }
        eventsByDate[dateKey].push(event);
    });
    
    console.log('Events grouped by date:', eventsByDate);
    
    renderCalendar();
    setupCalendarNavigation();
}

function renderCalendar() {
    const calendar = document.getElementById('calendar');
    const currentMonthEl = document.getElementById('currentMonth');
    
    // Clear calendar
    calendar.innerHTML = '';
    
    // Update month display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    currentMonthEl.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    // Create header
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    daysOfWeek.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'text-center py-2 font-semibold text-gray-600 text-sm';
        dayHeader.textContent = day;
        calendar.appendChild(dayHeader);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Create calendar days - only show current month
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'aspect-square p-1';
        const emptyContent = document.createElement('div');
        emptyContent.className = 'h-full w-full rounded-lg border border-gray-200 p-2 text-sm bg-gray-50';
        emptyDay.appendChild(emptyContent);
        calendar.appendChild(emptyDay);
    }
    
    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'aspect-square p-1';
        
        const dayContent = document.createElement('div');
        dayContent.className = 'h-full w-full rounded-lg border border-gray-200 p-2 text-sm relative';
        
        // Add day number
        dayContent.innerHTML = `<div class="text-right">${day}</div>`;
        
        // Check for events on this day
        const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        let hasEvents = eventsByDate[dateKey] && eventsByDate[dateKey].length > 0;
        let hasPhotos = photoStorage[dateKey] && photoStorage[dateKey].length > 0;
        
        if (hasEvents || hasPhotos) {
            dayContent.classList.add('cursor-pointer', 'hover:bg-pink-200');
            
            if (hasEvents) {
                dayContent.classList.add('bg-pink-100', 'border-pink-300');
                
                // Add event indicator
                const eventIndicator = document.createElement('div');
                eventIndicator.className = 'absolute bottom-1 left-1 w-2 h-2 bg-pink-500 rounded-full';
                dayContent.appendChild(eventIndicator);
            }
            
            if (hasPhotos) {
                // Add photo indicator
                const photoIndicator = document.createElement('div');
                photoIndicator.className = 'absolute bottom-1 right-1 w-2 h-2 bg-blue-500 rounded-full';
                dayContent.appendChild(photoIndicator);
                
                // Add photo count
                const photoCount = document.createElement('div');
                photoCount.className = 'absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 rounded-full';
                photoCount.textContent = photoStorage[dateKey].length;
                dayContent.appendChild(photoCount);
            }
            
            // Add click handler with proper event binding
            dayContent.addEventListener('click', function() {
                showEventDetails(dateKey);
            });
        }
        
        dayElement.appendChild(dayContent);
        calendar.appendChild(dayElement);
    }
}

function setupCalendarNavigation() {
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');
    
    prevBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    nextBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
}

async function showEventDetails(dateKey) {
    console.log('showEventDetails called with dateKey:', dateKey);
    const eventDetails = document.getElementById('eventDetails');
    const eventDetailsModal = document.getElementById('eventDetailsModal');
    const events = eventsByDate[dateKey];
    
    console.log('Events found:', events);
    
    // Set current event date for photo uploads
    currentEventDate = dateKey;
    
    if (events && events.length > 0) {
        const date = new Date(dateKey);
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Special animation for June 1st, 2025 (commented out for same vibe as other dates)
        // if (dateKey === '2025-06-01') {
        //     showFirstMeetingAnimation();
        //     return;
        // }
        
        let eventsHTML = '';
        events.forEach((event, index) => {
            eventsHTML += `
                <div class="mb-4 last:mb-0">
                    <div class="flex items-center mb-2">
                        <div class="w-3 h-3 bg-pink-500 rounded-full mr-3"></div>
                        <h5 class="font-semibold text-gray-800">Event ${index + 1}</h5>
                    </div>
                    <p class="text-gray-700 ml-6">${event.Event}</p>
                </div>
            `;
        });
        
        eventDetails.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <h4 class="text-lg font-semibold text-gray-800">${formattedDate}</h4>
                <button id="closeEventDetails" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            ${eventsHTML}
        `;
        
        // Show modal
        eventDetailsModal.classList.remove('hidden');
        
        // Setup photo upload functionality
        setupPhotoUpload();
        
        // Add close functionality
        document.getElementById('closeEventDetails').addEventListener('click', () => {
            eventDetailsModal.classList.add('hidden');
        });
        
        // Close modal when clicking outside
        eventDetailsModal.addEventListener('click', (e) => {
            if (e.target === eventDetailsModal) {
                eventDetailsModal.classList.add('hidden');
            }
        });
        
        console.log('Event details shown successfully');
    } else {
        // Show modal even for dates without events (for photo uploads)
        const date = new Date(dateKey);
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        eventDetails.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <h4 class="text-lg font-semibold text-gray-800">${formattedDate}</h4>
                <button id="closeEventDetails" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <p class="text-gray-500 mb-4">No events recorded for this day, but you can still add photos! 💕</p>
        `;
        
        // Show modal
        eventDetailsModal.classList.remove('hidden');
        
        // Setup photo upload functionality
        await setupPhotoUpload();
        
        // Add close functionality
        document.getElementById('closeEventDetails').addEventListener('click', () => {
            eventDetailsModal.classList.add('hidden');
        });
        
        // Close modal when clicking outside
        eventDetailsModal.addEventListener('click', (e) => {
            if (e.target === eventDetailsModal) {
                eventDetailsModal.classList.add('hidden');
            }
        });
        
        console.log('Event details shown successfully');
    }
}

// Photo upload functionality
async function setupPhotoUpload() {
    const photoUpload = document.getElementById('photoUpload');
    const selectPhotoBtn = document.getElementById('selectPhotoBtn');
    const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
    const photoPreview = document.getElementById('photoPreview');
    const previewImage = document.getElementById('previewImage');
    const existingPhotos = document.getElementById('existingPhotos');
    
    // Load existing photos for current date
    if (currentEventDate) {
        await loadPhotosForDate(currentEventDate);
    }
    
    // Select photo button
    selectPhotoBtn.addEventListener('click', () => {
        photoUpload.click();
    });
    
    // File selection
    photoUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImage.src = e.target.result;
                photoPreview.classList.remove('hidden');
                uploadPhotoBtn.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Upload photo button
    uploadPhotoBtn.addEventListener('click', async () => {
        if (currentEventDate && photoUpload.files[0]) {
            const file = photoUpload.files[0];
            
            try {
                const formData = new FormData();
                formData.append('photo', file);
                formData.append('dateKey', currentEventDate);
                
                const response = await fetch('/api/photos/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: formData
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Update display
                    await loadPhotosForDate(currentEventDate);
                    
                    // Reset form
                    photoUpload.value = '';
                    photoPreview.classList.add('hidden');
                    uploadPhotoBtn.classList.add('hidden');
                    
                    showSuccessMessage(data.message || 'Photo uploaded successfully! 💕');
                } else {
                    showLoginError(data.error || 'Failed to upload photo');
                }
            } catch (error) {
                console.error('Upload error:', error);
                showLoginError('Network error. Please try again.');
            }
        }
    });
}

// Load photos for a specific date from server
async function loadPhotosForDate(dateKey) {
    try {
        const response = await fetch(`/api/photos/${dateKey}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            photoStorage[dateKey] = data.photos || [];
            displayExistingPhotos(dateKey);
        } else {
            console.error('Failed to load photos:', data.error);
            photoStorage[dateKey] = [];
            displayExistingPhotos(dateKey);
        }
    } catch (error) {
        console.error('Load photos error:', error);
        photoStorage[dateKey] = [];
        displayExistingPhotos(dateKey);
    }
}

// Display existing photos for a date
function displayExistingPhotos(dateKey) {
    const existingPhotos = document.getElementById('existingPhotos');
    const photos = photoStorage[dateKey] || [];
    
    if (photos.length === 0) {
        existingPhotos.innerHTML = '<p class="text-gray-500 text-sm">No photos uploaded yet for this day.</p>';
        return;
    }
    
    existingPhotos.innerHTML = `
        <div class="mb-3">
            <h6 class="font-semibold text-gray-700 mb-2">Photos for this day (${photos.length}):</h6>
        </div>
        <div class="grid grid-cols-2 gap-3">
            ${photos.map((photo, index) => `
                <div class="relative group">
                    <img src="${photo.url}" alt="Photo ${index + 1}" class="w-full h-24 object-cover rounded-lg shadow-md">
                    <button onclick="deletePhoto('${dateKey}', ${photo.id})" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="text-xs text-gray-500 mt-1 truncate">${photo.originalName}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// Delete photo
async function deletePhoto(dateKey, photoId) {
    try {
        const response = await fetch(`/api/photos/${dateKey}/${photoId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Update display
            await loadPhotosForDate(dateKey);
            showSuccessMessage(data.message || 'Photo deleted successfully!');
        } else {
            showLoginError(data.error || 'Failed to delete photo');
        }
    } catch (error) {
        console.error('Delete photo error:', error);
        showLoginError('Network error. Please try again.');
    }
}

// Load all photos from server
async function loadAllPhotos() {
    try {
        const response = await fetch('/api/photos', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            photoStorage = data.photos || {};
        } else {
            console.error('Failed to load all photos:', data.error);
            photoStorage = {};
        }
    } catch (error) {
        console.error('Load all photos error:', error);
        photoStorage = {};
    }
}

// Special animation for the first meeting
function showFirstMeetingAnimation() {
    const animationModal = document.createElement('div');
    animationModal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50';
    animationModal.innerHTML = `
        <div class="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 text-center relative overflow-hidden">
            <button id="closeAnimation" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10">
                <i class="fas fa-times text-xl"></i>
            </button>
            
            <div class="mb-6">
                <h3 class="text-2xl font-bold text-gray-800 mb-2">June 1st, 2025</h3>
                <p class="text-gray-600">The day we first met...</p>
            </div>
            
            <div class="relative h-64 mb-6 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl overflow-hidden">
                <!-- Boy character -->
                <div class="absolute left-8 top-1/2 transform -translate-y-1/2 animate-slide-in-left">
                    <div class="text-6xl">👨</div>
                    <div class="text-xs text-gray-600 mt-1">Chris</div>
                </div>
                
                <!-- Girl character -->
                <div class="absolute right-8 top-1/2 transform -translate-y-1/2 animate-slide-in-right">
                    <div class="text-6xl">👩</div>
                    <div class="text-xs text-gray-600 mt-1">Nads</div>
                </div>
                
                <!-- Heart between them -->
                <div class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-heart-beat">
                    <div class="text-4xl">💕</div>
                </div>
                
                <!-- Sparkles -->
                <div class="absolute top-4 left-1/4 animate-sparkle">✨</div>
                <div class="absolute top-8 right-1/4 animate-sparkle-delayed">✨</div>
                <div class="absolute bottom-8 left-1/3 animate-sparkle">✨</div>
                <div class="absolute bottom-4 right-1/3 animate-sparkle-delayed">✨</div>
            </div>
            
            <div class="space-y-4">
                <div class="animate-fade-in-up">
                    <h4 class="text-lg font-semibold text-pink-600 mb-2">When we first met each other face to face at Jazz</h4>
                    <p class="text-gray-700">That magical moment when our eyes met and we knew something special was beginning... 💕</p>
                </div>
                
                <div class="flex justify-center space-x-4 mt-6 animate-fade-in-up-delayed">
                    <div class="text-2xl animate-bounce">💖</div>
                    <div class="text-2xl animate-bounce" style="animation-delay: 0.2s">💕</div>
                    <div class="text-2xl animate-bounce" style="animation-delay: 0.4s">💝</div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(animationModal);
    
    // Close functionality
    document.getElementById('closeAnimation').addEventListener('click', () => {
        animationModal.remove();
    });
    
    // Close when clicking outside
    animationModal.addEventListener('click', (e) => {
        if (e.target === animationModal) {
            animationModal.remove();
        }
    });
}

// Add some interactive features
document.addEventListener('DOMContentLoaded', function() {
    // Add click to copy functionality for stats
    const statCards = document.querySelectorAll('[id$="Events"], [id$="Messages"], [id$="Expressions"], [id$="Gestures"]');
    statCards.forEach(card => {
        card.addEventListener('click', function() {
            const text = this.textContent;
            navigator.clipboard.writeText(text).then(() => {
                showSuccessMessage('Copied to clipboard! 📋');
            });
        });
    });
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        if (dashboard.classList.contains('hidden')) {
            document.getElementById('username').focus();
        } else {
            logoutBtn.click();
        }
    }
});

// Add some romantic touches
function addRomanticEffects() {
    // Add floating hearts animation - reduced frequency for better performance
    setInterval(() => {
        if (!dashboard.classList.contains('hidden')) {
            createFloatingHeart();
        }
    }, 10000); // Changed from 5000 to 10000ms for better performance
}

function createFloatingHeart() {
    const heart = document.createElement('div');
    heart.innerHTML = '💕';
    heart.className = 'fixed text-xl animate-bounce z-40 pointer-events-none';
    heart.style.left = Math.random() * window.innerWidth + 'px';
    heart.style.top = window.innerHeight + 'px';
    heart.style.animationDuration = '2s';
    
    document.body.appendChild(heart);
    
    setTimeout(() => {
        heart.remove();
    }, 2000);
}

// Initialize romantic effects
addRomanticEffects();
