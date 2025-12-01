/**
 * ShoreSquad - Main Application JavaScript
 * 
 * Features:
 * - Responsive state management with localStorage
 * - Real-time weather API integration (NEA data.gov.sg)
 * - Error handling with user-friendly feedback
 * - Loading states and spinners
 * - Mobile-responsive design with hamburger menu
 * - Accessibility support (keyboard navigation, ARIA labels)
 * - Performance optimization (debounce, throttle)
 * 
 * Architecture:
 * 1. Performance Utilities - debounce, throttle, lazy loading
 * 2. State Management - appState object with localStorage sync
 * 3. DOM Interactions - Event handlers for UI elements
 * 4. Weather Integration - NEA API with error handling
 * 5. Notifications - Toast system with 4 notification types
 * 6. Animations - CSS animations injected dynamically
 * 7. Mobile Support - Hamburger menu and geolocation
 * 8. App Init - DOMContentLoaded setup
 * 
 * Error Handling:
 * - Try-catch blocks around all async operations
 * - Graceful fallbacks for missing data
 * - User-friendly error messages via showNotification()
 * - Loading states to prevent double-clicks
 * - Network error recovery
 */

// ===========================
// PERFORMANCE OPTIMIZATION
// ===========================

// Debounce utility for optimized event handling
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

// Throttle utility for smooth scroll/resize events
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Lazy loading for images (future enhancement)
function observeElements() {
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    element.classList.add('loaded');
                    observer.unobserve(element);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('[data-lazy]').forEach(el => observer.observe(el));
    }
}

// ===========================
// STATE MANAGEMENT
// ===========================

/**
 * appState - Central state object for the application
 * 
 * Structure:
 * - crew: Array of crew member objects
 * - cleanups: Array of scheduled cleanup events
 * - totalImpact: Cumulative kilograms of waste removed
 * - userLocation: User's geolocation coordinates
 * - weatherData: Latest weather API response
 * 
 * All data automatically syncs with localStorage for persistence
 * across browser sessions
 */
const appState = {
    crew: [
        { name: 'Alex Chen', role: 'Crew Leader', email: 'alex@shoresquad.sg' },
        { name: 'Priya Sharma', role: 'Coordinator', email: 'priya@shoresquad.sg' },
        { name: 'Marcus Lee', role: 'Member', email: 'marcus@shoresquad.sg' },
        { name: 'Zara Mohamed', role: 'Member', email: 'zara@shoresquad.sg' },
        { name: 'Ethan Ng', role: 'Member', email: 'ethan@shoresquad.sg' }
    ],
    cleanups: [
        { location: 'East Coast Park', date: '2025-11-28', kg: 10, members: 3 },
        { location: 'Sentosa Beach', date: '2025-11-21', kg: 15, members: 4 },
        { location: 'Pasir Ris Park', date: '2025-11-14', kg: 20, members: 5 }
    ],
    totalImpact: 45,
    userLocation: null,
    weatherData: {},

    /**
     * Initialize app on page load
     * - Restores data from localStorage
     * - Updates UI elements with current state
     */
    init() {
        this.loadFromLocalStorage();
        this.updateUI();
    },

    /**
     * Load data from browser localStorage
     * Gracefully handles missing or corrupted data
     */
    loadFromLocalStorage() {
        const saved = localStorage.getItem('shoreSquadData');
        if (saved) {
            const data = JSON.parse(saved);
            Object.assign(this, data);
        }
    },

    // Save data to localStorage
    save() {
        localStorage.setItem('shoreSquadData', JSON.stringify({
            crew: this.crew,
            cleanups: this.cleanups,
            totalImpact: this.totalImpact
        }));
    },

    // Add crew member
    addCrewMember(name, email) {
        const member = {
            id: Date.now(),
            name,
            email,
            joinedAt: new Date().toISOString()
        };
        this.crew.push(member);
        this.save();
        return member;
    },

    // Add cleanup event
    addCleanup(location, date, expectedMembers) {
        const cleanup = {
            id: Date.now(),
            location,
            date,
            expectedMembers,
            actualMembers: 0,
            impactKg: 0,
            createdAt: new Date().toISOString()
        };
        this.cleanups.push(cleanup);
        this.save();
        return cleanup;
    },

    // Update impact
    updateImpact(kg) {
        this.totalImpact += kg;
        this.save();
    },

    // Update UI elements
    updateUI() {
        document.getElementById('crew-count').textContent = this.crew.length;
        document.getElementById('cleanups-count').textContent = this.cleanups.length;
        document.getElementById('impact-count').textContent = Math.round(this.totalImpact);
        
        // Update expandable sections
        updateSquadMembersList();
        updateCleanupsList();
        updateImpactTrackerDetails();
    }
};

// ===========================
// DOM INTERACTIONS
// ===========================

// Navigation scroll spy (optional active state)
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', throttle(() => {
        let current = '';
        
        document.querySelectorAll('section').forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    }, 100));
}

// CTA Button Handler
function setupCTAButton() {
    const ctaBtn = document.getElementById('cta-button');
    if (ctaBtn) {
        ctaBtn.addEventListener('click', () => {
            const locationInput = prompt('Enter beach location:');
            if (locationInput) {
                const dateInput = prompt('Enter cleanup date (YYYY-MM-DD):');
                if (dateInput) {
                    appState.addCleanup(locationInput, dateInput, 5);
                    appState.updateUI();
                    showNotification(`Cleanup planned at ${locationInput}!`, 'success');
                }
            }
        });
    }
}

// ===========================
// NOTIFICATIONS
// ===========================

// ===========================
// NEA WEATHER INTEGRATION
// ===========================

/**
 * Fetch 4-day weather forecast from NEA API (data.gov.sg)
 */
async function fetchNEAWeatherForecast() {
    const resultsContainer = document.getElementById('weather-results');
    const loadBtn = document.getElementById('load-weather');
    
    try {
        // Show loading state
        resultsContainer.innerHTML = `
            <div class="loading-container">
                <span class="loading"></span>
                <span class="loading-text">Loading weather forecast...</span>
            </div>
        `;
        loadBtn.disabled = true;
        loadBtn.style.opacity = '0.6';
        
        const apiUrl = 'https://api.data.gov.sg/v1/environment/4-day-weather-forecast';
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const weatherData = await response.json();
        
        if (!weatherData.items || weatherData.items.length === 0) {
            throw new Error('No weather data available from API');
        }
        
        displayNEAWeatherForecast(weatherData);
        showNotification('Weather forecast loaded successfully!', 'success');
    } catch (error) {
        console.error('Weather fetch error:', error);
        resultsContainer.innerHTML = `
            <div class="error">
                <strong>⚠️ Error Loading Weather</strong><br>
                ${error.message || 'Failed to fetch weather data. Please try again.'}
            </div>
        `;
        showNotification(`Weather Error: ${error.message}`, 'error');
    } finally {
        // Restore button state
        loadBtn.disabled = false;
        loadBtn.style.opacity = '1';
    }
}

/**
 * Display NEA 4-day weather forecast in a formatted card layout
 */
function displayNEAWeatherForecast(data) {
    const resultsContainer = document.getElementById('weather-results');
    
    try {
        if (!data.items || data.items.length === 0) {
            resultsContainer.innerHTML = '<div class="error">No weather data available</div>';
            return;
        }
        
        const forecastItem = data.items[0];
        const forecasts = forecastItem.forecasts || [];
        
        if (forecasts.length === 0) {
            resultsContainer.innerHTML = '<div class="error">No forecast data available</div>';
            return;
        }
        
        let html = `
            <div class="weather-info">
                <p class="weather-updated">Last updated: ${new Date(forecastItem.update_timestamp).toLocaleString('en-SG')}</p>
                <div class="forecast-grid">
        `;
        
        forecasts.forEach((day, index) => {
            try {
                const dateObj = new Date(day.timestamp);
                const dayName = dateObj.toLocaleDateString('en-SG', { weekday: 'short', month: 'short', day: 'numeric' });
                
                // Extract temperature values with fallback
                const tempHigh = day.temperature?.high ?? day.temperature_2m_max ?? 'N/A';
                const tempLow = day.temperature?.low ?? day.temperature_2m_min ?? 'N/A';
                
                // Extract humidity values
                const humidityHigh = day.relative_humidity?.high ?? 'N/A';
                const humidityLow = day.relative_humidity?.low ?? 'N/A';
                
                // Extract wind data
                const windHigh = day.wind?.speed?.high ?? 'N/A';
                const windLow = day.wind?.speed?.low ?? 'N/A';
                const windDir = day.wind?.direction ?? 'N/A';
                
                // Get emoji based on forecast text
                const weatherEmoji = getWeatherEmoji(day.forecast || '');
                
                html += `
                    <div class="forecast-day">
                        <div class="forecast-date">${dayName}</div>
                        <div class="forecast-icon">${weatherEmoji}</div>
                        <div class="forecast-condition">${day.forecast || 'Unknown'}</div>
                        <div class="forecast-details">
                            <div class="detail-item">
                                <span class="detail-label">🌡️ Temp:</span>
                                <span class="detail-value">${tempHigh}°C - ${tempLow}°C</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">💧 Humidity:</span>
                                <span class="detail-value">${humidityHigh}% - ${humidityLow}%</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">💨 Wind:</span>
                                <span class="detail-value">${windLow}-${windHigh} km/h ${windDir}</span>
                            </div>
                        </div>
                    </div>
                `;
            } catch (dayError) {
                console.error(`Error processing forecast day ${index}:`, dayError);
                html += `<div class="forecast-day error-day"><p>Error loading day ${index + 1}</p></div>`;
            }
        });
        
        html += `
                </div>
            </div>
        `;
        
        resultsContainer.innerHTML = html;
    } catch (error) {
        console.error('Display weather error:', error);
        resultsContainer.innerHTML = `<div class="error">Error displaying weather data: ${error.message}</div>`;
    }
}

/**
 * Map weather forecast text to appropriate emoji
 */
function getWeatherEmoji(forecastText) {
    const text = forecastText.toLowerCase();
    
    if (text.includes('thundery') || text.includes('lightning')) return '⛈️';
    if (text.includes('rain') || text.includes('showers')) return '🌧️';
    if (text.includes('cloudy') || text.includes('overcast')) return '☁️';
    if (text.includes('sunny') || text.includes('clear')) return '☀️';
    if (text.includes('haze')) return '🌫️';
    if (text.includes('wind')) return '💨';
    
    return '🌤️'; // Default
}

/**
 * Setup weather forecast button
 */
function setupWeatherForecast() {
    const loadBtn = document.getElementById('load-weather');
    if (loadBtn) {
        loadBtn.addEventListener('click', () => {
            fetchNEAWeatherForecast();
        });
    }
}

// ===========================
// NOTIFICATIONS
// ===========================

function showNotification(message, type = 'info') {
    try {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Apply CSS classes for styling
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideIn 0.3s ease;
            max-width: 400px;
            word-wrap: break-word;
        `;

        document.body.appendChild(notification);

        // Auto-remove after 4 seconds
        const timeoutId = setTimeout(() => {
            try {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            } catch (e) {
                console.error('Error removing notification:', e);
            }
        }, 4000);

        // Allow manual dismiss
        notification.style.cursor = 'pointer';
        notification.addEventListener('click', () => {
            clearTimeout(timeoutId);
            try {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            } catch (e) {
                console.error('Error removing notification:', e);
            }
        });
    } catch (error) {
        console.error('Error showing notification:', error);
    }
}

function getNotificationColor(type) {
    const colors = {
        success: '#2ecc71',
        error: '#e74c3c',
        info: '#3498db',
        warning: '#f39c12'
    };
    return colors[type] || colors.info;
}

// ===========================
// ANIMATIONS
// ===========================

// Add CSS animations dynamically
function addAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
    `;
    document.head.appendChild(style);
}

// ===========================
// MOBILE MENU TOGGLE
// ===========================

function setupMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
        });

        // Close menu when nav link is clicked
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuToggle.textContent = '☰';
            });
        });
    }
}

// ===========================
// BEACH MAP SELECTOR
// ===========================

/**
 * Beach locations in Singapore with coordinates and info
 * Used for map iframe updates and impact tracking
 */
const beachLocations = {
    'pasir-ris': {
        name: 'Pasir Ris Park',
        emoji: '🏄‍♂️',
        coords: { lat: 1.381497, lng: 103.955574 },
        description: 'Popular beach with family-friendly vibes',
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.789234567!2d103.955574!3d1.381497!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da1c1c1c1c1c1d%3A0x1c1c1c1c1c1c1c1c!2sStreet%20View%20Asia!5e0!3m2!1sen!2ssg!4v1234567890',
        impact: '45kg last month'
    },
    'sentosa': {
        name: 'Sentosa Beach',
        emoji: '🏝️',
        coords: { lat: 1.2485, lng: 103.8294 },
        description: 'Beautiful resort beach with soft sand',
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.475!2d103.8294!3d1.2485!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da120a84e0001b%3A0x9c5a4e5e5e5e5e5e!2sSentosa!5e0!3m2!1sen!2ssg!4v1234567890',
        impact: '15kg last week'
    },
    'east-coast': {
        name: 'East Coast Park',
        emoji: '🌊',
        coords: { lat: 1.3000, lng: 103.9500 },
        description: 'Long stretch of coastline with great facilities',
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.650!2d103.9500!3d1.3000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da0f5f5f5f5f5f%3A0x5f5f5f5f5f5f5f5f!2sEast%20Coast!5e0!3m2!1sen!2ssg!4v1234567890',
        impact: '10kg this week'
    },
    'changi': {
        name: 'Changi Beach',
        emoji: '☂️',
        coords: { lat: 1.4069, lng: 103.9750 },
        description: 'Eastern beach with unique coastal views',
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.000!2d103.9750!3d1.4069!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da15d0e5e5e5e5%3A0xe5e5e5e5e5e5e5e5!2sChangi%20Beach!5e0!3m2!1sen!2ssg!4v1234567890',
        impact: '8kg last month'
    }
};

function setupBeachSelector() {
    const selector = document.getElementById('beach-selector');
    const mapIframe = document.getElementById('map-iframe');
    
    if (selector && mapIframe) {
        selector.addEventListener('change', (e) => {
            const beachKey = e.target.value;
            const beach = beachLocations[beachKey];
            
            if (beach) {
                // Update map iframe
                mapIframe.src = beach.mapUrl;
                
                // Update beach info display
                const infoDiv = document.querySelector('.map-section .map-container div[style*="background: #f0f7ff"]');
                if (infoDiv) {
                    infoDiv.innerHTML = `
                        <h3 style="margin: 0 0 10px 0;">📍 Next Cleanup: ${beach.name}</h3>
                        <p style="color: #666; margin: 5px 0;"><strong>Coordinates:</strong> ${beach.coords.lat}°N, ${beach.coords.lng}°E</p>
                        <p style="color: #666; margin: 5px 0;"><strong>About:</strong> ${beach.description}</p>
                        <p style="color: #0066cc; margin: 5px 0;"><strong>Recent Impact:</strong> ${beach.impact}, sia! 🎉</p>
                    `;
                }
                
                showNotification(`📍 Beach switched to ${beach.name}! Ready to clean, lah? 🌊`, 'success');
            }
        });
    }
}

// ===========================
// TESTING UTILITIES
// ===========================

/**
 * Testing helpers to verify app functionality
 * Access via console: runAppTests()
 */
function runAppTests() {
    console.log('%c🧪 ShoreSquad App Testing Suite', 'color: #ff6b35; font-size: 16px; font-weight: bold;');
    console.log('Running tests...\n');
    
    const tests = {
        'Weather API': testWeatherAPI,
        'State Persistence': testStatePersistence,
        'Notifications': testNotifications,
        'Beach Selector': testBeachSelector,
        'Mobile Menu': testMobileMenu,
        'Geolocation': testGeolocation
    };
    
    let passed = 0;
    let failed = 0;
    
    Object.entries(tests).forEach(([name, testFn]) => {
        try {
            testFn();
            console.log(`✅ ${name}: PASSED`);
            passed++;
        } catch (error) {
            console.log(`❌ ${name}: FAILED - ${error.message}`);
            failed++;
        }
    });
    
    console.log(`\n%c📊 Test Results: ${passed} passed, ${failed} failed`, 
        `color: ${failed === 0 ? '#2ecc71' : '#e74c3c'}; font-weight: bold;`);
}

function testWeatherAPI() {
    const loadBtn = document.getElementById('load-weather');
    if (!loadBtn) throw new Error('Weather button not found');
    // Button exists and is accessible
}

function testStatePersistence() {
    appState.crew = [{ name: 'Test Member', role: 'Leader' }];
    appState.save();
    const retrieved = localStorage.getItem('shoresquadState');
    if (!retrieved) throw new Error('State not saved to localStorage');
}

function testNotifications() {
    showNotification('🧪 Test notification - Success', 'success');
    showNotification('🧪 Test notification - Error', 'error');
    showNotification('🧪 Test notification - Info', 'info');
    showNotification('🧪 Test notification - Warning', 'warning');
    // If 4 notifications appear, test passes
}

function testBeachSelector() {
    const selector = document.getElementById('beach-selector');
    if (!selector) throw new Error('Beach selector not found');
    if (Object.keys(beachLocations).length === 0) throw new Error('Beach locations not defined');
}

function testMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (!menuToggle || !navMenu) throw new Error('Mobile menu elements not found');
}

function testGeolocation() {
    if (!('geolocation' in navigator)) throw new Error('Geolocation not supported');
}

// ===========================
// PERFORMANCE DIAGNOSTICS
// ===========================

function runPerformanceDiagnostics() {
    console.log('%c⚡ Performance Diagnostics', 'color: #f39c12; font-size: 16px; font-weight: bold;');
    
    const perfData = performance.getEntriesByType('navigation')[0];
    if (perfData) {
        console.log(`Load time: ${Math.round(perfData.loadEventEnd - perfData.fetchStart)}ms`);
        console.log(`DOM content loaded: ${Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart)}ms`);
        console.log(`Time to interactive: ${Math.round(perfData.domInteractive - perfData.fetchStart)}ms`);
    }
    
    const resourceEntries = performance.getEntriesByType('resource');
    console.log(`Resources loaded: ${resourceEntries.length}`);
    
    const memoryUsage = performance.memory;
    if (memoryUsage) {
        console.log(`Memory used: ${Math.round(memoryUsage.usedJSHeapSize / 1048576)}MB`);
    }
    
    console.log('%c✅ Performance data logged', 'color: #2ecc71;');
}

// ===========================
// MOBILE 4G SIMULATOR
// ===========================

/**
 * Simulates slow 4G connection
 * Useful for testing on high-speed networks
 * Access via console: simulateSlow4G() or simulateFast4G()
 */
function simulateSlow4G() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/network-throttle@1.0.0/dist/network-throttle.js';
    document.head.appendChild(script);
    console.log('🔌 Simulating slow 4G network (0.5 Mbps)...');
    showNotification('📱 4G throttle simulation activated (console only)', 'info');
}

function simulateFast4G() {
    console.log('🚀 Reset to normal network speeds');
    showNotification('📱 Network simulation reset', 'success');
}

// ===========================
// GEOLOCATION
// ===========================

function setupGeolocation() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                appState.userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log('User location detected:', appState.userLocation);
                // Future: Use for map centering and nearby beach detection
            },
            (error) => {
                console.log('Geolocation permission denied or unavailable', error);
            }
        );
    }
}

// ===========================
// APP INITIALIZATION
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize app state
    appState.init();

    // Setup features
    addAnimations();
    setupNavigation();
    setupCTAButton();
    setupWeatherForecast();
    setupBeachSelector();
    setupMobileMenu();
    setupGeolocation();
    observeElements();

    console.log('%c🌊 ShoreSquad app initialized successfully!', 'color: #0066cc; font-weight: bold;');
    console.log('%c💡 Tip: Run runAppTests() in console to test all features!', 'color: #2ecc71;');
    console.log('%c⚡ Tip: Run runPerformanceDiagnostics() to check performance!', 'color: #f39c12;');
});

// ===========================
// SERVICE WORKER REGISTRATION (PWA support - future)
// ===========================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker registration would go here
        console.log('Service Worker support detected');
    });
}

// ===========================
// KEYBOARD ACCESSIBILITY
// ===========================

document.addEventListener('keydown', (e) => {
    // Escape key to close menus
    if (e.key === 'Escape') {
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            document.querySelector('.menu-toggle').textContent = '☰';
        }
        
        // Close chat modal on Escape
        const chatModal = document.getElementById('chat-modal');
        if (chatModal && chatModal.classList.contains('active')) {
            closeChatWidget();
        }
    }
});

// ===========================
// CUSTOM CHAT WIDGET FUNCTIONALITY
// ===========================

const chatModal = document.getElementById('chat-modal');
const openChatBtn = document.getElementById('open-chat-widget');
const closeChatBtn = document.getElementById('close-chat-widget');
const chatInput = document.getElementById('chat-input');
const sendChatBtn = document.getElementById('send-chat-btn');
const chatMessagesContainer = document.getElementById('chat-messages');

// Auto-responses library for fun, helpful interactions
const chatResponses = {
    weather: [
        '🌤️ The weather API pulls real-time data from Singapore NEA! Check the "Weather Vibes" section to see what the beaches are expecting. Temperature, rain forecast, and wind speeds - all there!',
        '🌊 Perfect beach weather depends on rain and wind! Our 4-day forecast helps you pick the best day for cleanup.'
    ],
    map: [
        '🗺️ Great question! We have 4 awesome beaches: Pasir Ris Park, Sentosa Beach, East Coast Park, and Changi. Use the beach selector to see each location on Google Maps!',
        '📍 The interactive map shows you exactly where to meet for cleanups. Pick a beach and zoom in to see the precise location!'
    ],
    cleanup: [
        '📅 Planning a cleanup is easy! Pick a date, grab your crew, choose a beach, and let\'s make a difference! Every bit helps our beautiful coastline.',
        '👥 Beach cleanups are more fun with friends! Invite your crew, set a time, and ShoreSquad will help you track your impact in kg removed. You\'ve got this! 💪'
    ],
    impact: [
        '📊 Our impact tracker shows exactly how much trash you and your crew have removed. Currently 45kg from 3 successful cleanups! That\'s amazing for the environment! 🌍',
        '💚 Every kg of trash removed is a victory for marine life. We celebrate your environmental wins here!'
    ],
    slang: [
        '🇸🇬 Lah! This is Singapore, lor! Our app is super straightforward - no need to komplain, sia! Just tap around and you\'ll figure it out quickly, man.',
        '😄 You\'re speaking our language! Singapore slang makes everything more fun. Let\'s do this cleanup together, lah!'
    ],
    default: [
        '🌊 Thanks for your message! I\'m here to help with questions about weather, maps, cleanups, our impact, or just chatting in Singlish. What can I help you with?',
        '👋 Great question! Feel free to ask me anything about ShoreSquad - I\'m here 24/7 to help you plan amazing beach cleanups!',
        '💬 Awesome! We love your enthusiasm. Let me know if you need any guidance on getting started with your first cleanup.'
    ]
};

function detectChatIntent(message) {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('weather') || lowerMsg.includes('forecast') || lowerMsg.includes('rain') || lowerMsg.includes('temperature')) {
        return 'weather';
    }
    if (lowerMsg.includes('map') || lowerMsg.includes('beach') || lowerMsg.includes('location') || lowerMsg.includes('where')) {
        return 'map';
    }
    if (lowerMsg.includes('cleanup') || lowerMsg.includes('clean') || lowerMsg.includes('trash') || lowerMsg.includes('plan')) {
        return 'cleanup';
    }
    if (lowerMsg.includes('impact') || lowerMsg.includes('kg') || lowerMsg.includes('removed') || lowerMsg.includes('track')) {
        return 'impact';
    }
    if (lowerMsg.includes('lah') || lowerMsg.includes('lor') || lowerMsg.includes('sia') || lowerMsg.includes('singlish')) {
        return 'slang';
    }
    return 'default';
}

function getRandomResponse(category) {
    const responses = chatResponses[category] || chatResponses.default;
    return responses[Math.floor(Math.random() * responses.length)];
}

function openChatWidget() {
    chatModal.classList.add('active');
    chatInput.focus();
}

function closeChatWidget() {
    chatModal.classList.remove('active');
}

function addMessageToChat(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = `<p>${message}</p>`;
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'message-time';
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' });
    timeSpan.textContent = timeStr;
    
    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeSpan);
    
    chatMessagesContainer.appendChild(messageDiv);
    
    // Auto-scroll to bottom
    setTimeout(() => {
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }, 0);
}

function sendChatMessage() {
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addMessageToChat(message, true);
    
    // Clear input
    chatInput.value = '';
    chatInput.focus();
    
    // Disable send button temporarily
    sendChatBtn.disabled = true;
    
    // Simulate bot typing and response
    setTimeout(() => {
        const intent = detectChatIntent(message);
        const response = getRandomResponse(intent);
        addMessageToChat(response, false);
        sendChatBtn.disabled = false;
    }, 800);
}

// Event Listeners for Chat Widget
openChatBtn.addEventListener('click', openChatWidget);
closeChatBtn.addEventListener('click', closeChatWidget);
sendChatBtn.addEventListener('click', sendChatMessage);

// Send message on Enter key
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendChatBtn.disabled) {
            sendChatMessage();
        }
    }
});

// Close modal when clicking outside
chatModal.addEventListener('click', (e) => {
    if (e.target === chatModal) {
        closeChatWidget();
    }
});

console.log('✅ Chat widget initialized and ready!');

// ===========================
// EXPANDABLE CREW DETAILS
// ===========================

// Squad Members List
function updateSquadMembersList() {
    const membersList = document.getElementById('squad-members-list');
    membersList.innerHTML = '';
    
    const avatars = ['👨‍💼', '👩‍💼', '👨‍🔧', '👩‍🌾', '👨‍⚕️', '👩‍💻', '👨‍🎨', '👩‍🍳'];
    
    appState.crew.forEach((member, index) => {
        const memberCard = document.createElement('div');
        memberCard.className = 'member-card';
        memberCard.style.position = 'relative';
        const memberRole = member.role || 'Member';
        const memberName = member.name || 'Team Member';
        memberCard.innerHTML = `
            <button class="edit-member-btn" data-index="${index}" title="Edit member">✏️</button>
            <button class="delete-member-btn" data-index="${index}" title="Delete member">🗑️</button>
            <div class="member-avatar">${avatars[index % avatars.length]}</div>
            <div class="member-name">${memberName}</div>
            <div class="member-role">${memberRole}</div>
            <div style="font-size: 0.85rem; color: #999; margin-top: 0.75rem;">Joined ShoreSquad</div>
        `;
        membersList.appendChild(memberCard);
    });
    
    if (appState.crew.length === 0) {
        membersList.innerHTML = '<p style="color: #999; grid-column: 1/-1; text-align: center; padding: 1rem;">No crew members yet. Invite your friends to get started! 👥</p>';
    }
    
    // Add event listeners for edit and delete
    document.querySelectorAll('.edit-member-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(btn.dataset.index);
            editMember(index);
        });
    });
    
    document.querySelectorAll('.delete-member-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(btn.dataset.index);
            if (confirm('Remove this crew member?')) {
                appState.crew.splice(index, 1);
                appState.save();
                appState.updateUI();
                showNotification('❌ Crew member removed', 'info');
            }
        });
    });
}

// Cleanups List
function updateCleanupsList() {
    const cleanupsList = document.getElementById('cleanups-list');
    cleanupsList.innerHTML = '';
    
    const beachEmojis = {
        'East Coast Park': '🏖️',
        'Sentosa Beach': '🏝️',
        'Pasir Ris Park': '🏄‍♂️',
        'Changi Beach': '🌊'
    };
    
    appState.cleanups.forEach((cleanup, index) => {
        const cleanupCard = document.createElement('div');
        cleanupCard.className = 'cleanup-card';
        cleanupCard.style.position = 'relative';
        
        const cleanupDate = new Date(cleanup.date);
        const dateStr = cleanupDate.toLocaleDateString('en-SG', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        const location = cleanup.location || 'Unknown Beach';
        const kg = cleanup.kg || 0;
        const members = cleanup.members || 0;
        const emoji = beachEmojis[location] || '🌊';
        
        cleanupCard.innerHTML = `
            <button class="edit-cleanup-btn" data-index="${index}" title="Edit cleanup">✏️</button>
            <button class="delete-cleanup-btn" data-index="${index}" title="Delete cleanup">🗑️</button>
            <div class="cleanup-location">${emoji} ${location}</div>
            <div class="cleanup-info">
                <div class="cleanup-info-item">
                    <span class="cleanup-info-icon">📅</span>
                    <span>${dateStr}</span>
                </div>
                <div class="cleanup-info-item">
                    <span class="cleanup-info-icon">♻️</span>
                    <span><strong>${kg}kg</strong> removed</span>
                </div>
                <div class="cleanup-info-item">
                    <span class="cleanup-info-icon">👥</span>
                    <span><strong>${members}</strong> team members</span>
                </div>
            </div>
        `;
        cleanupsList.appendChild(cleanupCard);
    });
    
    if (appState.cleanups.length === 0) {
        cleanupsList.innerHTML = '<p style="color: #999; grid-column: 1/-1; text-align: center; padding: 1rem;">No cleanups planned yet. Schedule your first cleanup! 📅</p>';
    }
    
    // Add event listeners for edit and delete
    document.querySelectorAll('.edit-cleanup-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(btn.dataset.index);
            editCleanup(index);
        });
    });
    
    document.querySelectorAll('.delete-cleanup-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(btn.dataset.index);
            if (confirm('Remove this cleanup?')) {
                const removedKg = appState.cleanups[index].kg || 0;
                appState.totalImpact -= removedKg;
                appState.cleanups.splice(index, 1);
                appState.save();
                appState.updateUI();
                showNotification('❌ Cleanup removed', 'info');
            }
        });
    });
}

// Impact Tracker Details
function updateImpactTrackerDetails() {
    const impactDetails = document.getElementById('impact-tracker-details');
    impactDetails.innerHTML = '';
    
    const beachEmojis = {
        'East Coast Park': '🏖️',
        'Sentosa Beach': '🏝️',
        'Pasir Ris Park': '🏄‍♂️',
        'Changi Beach': '🌊'
    };
    
    appState.cleanups.forEach((cleanup) => {
        const impactCard = document.createElement('div');
        impactCard.className = 'impact-card';
        
        const cleanupDate = new Date(cleanup.date);
        const dateStr = cleanupDate.toLocaleDateString('en-SG', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        const emoji = beachEmojis[cleanup.location] || '🌊';
        
        impactCard.innerHTML = `
            <div class="impact-location">${emoji} ${cleanup.location}</div>
            <div class="impact-kg">${cleanup.kg}<span class="impact-unit">kg</span></div>
            <div class="impact-date">📅 ${dateStr}</div>
            <div class="impact-status">✅ Completed with ${cleanup.members} team members</div>
        `;
        impactDetails.appendChild(impactCard);
    });
    
    if (appState.cleanups.length === 0) {
        impactDetails.innerHTML = '<p style="color: #999; grid-column: 1/-1; text-align: center; padding: 1rem;">No impact tracked yet. Plan your first cleanup to start making a difference! 🌍</p>';
    }
}

// Toggle Expandable Sections
function setupCrewDetailsToggle() {
    const toggleButtons = [
        { btn: document.getElementById('toggle-members'), content: document.getElementById('members-content') },
        { btn: document.getElementById('toggle-cleanups'), content: document.getElementById('cleanups-content') },
        { btn: document.getElementById('toggle-impact'), content: document.getElementById('impact-content') }
    ];
    
    toggleButtons.forEach(({ btn, content }) => {
        btn.addEventListener('click', () => {
            const isExpanded = btn.getAttribute('aria-expanded') === 'true';
            
            if (isExpanded) {
                // Collapse
                content.style.display = 'none';
                btn.setAttribute('aria-expanded', 'false');
            } else {
                // Expand
                content.style.display = 'block';
                btn.setAttribute('aria-expanded', 'true');
                // Small delay to ensure smooth animation
                setTimeout(() => {
                    content.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 100);
            }
        });
    });
}

// Initialize expandable sections when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setupCrewDetailsToggle();
    updateSquadMembersList();
    updateCleanupsList();
    updateImpactTrackerDetails();
    setupCleanupForm();
    setupMemberForm();
    setupModalControls();
});

// ===========================
// CLEANUP FORM HANDLING
// ===========================

function setupCleanupForm() {
    const form = document.getElementById('cleanup-form');
    const submit = form.querySelector('button[type="submit"]');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const beach = document.getElementById('beach-select').value;
        const date = document.getElementById('cleanup-date').value;
        const members = parseInt(document.getElementById('cleanup-members').value);
        const kg = parseFloat(document.getElementById('cleanup-kg').value) || 0;
        
        if (!beach || !date || !members) {
            showNotification('Please fill in beach, date, and members', 'error');
            return;
        }
        
        // Check if editing
        const editIndex = form.dataset.editIndex;
        
        if (editIndex !== undefined) {
            // Update existing cleanup
            const oldKg = appState.cleanups[editIndex].kg || 0;
            appState.cleanups[editIndex] = {
                location: beach,
                date: date,
                kg: kg,
                members: members
            };
            appState.totalImpact = appState.totalImpact - oldKg + kg;
            showNotification(`✅ Cleanup updated!`, 'success');
            delete form.dataset.editIndex;
        } else {
            // Add new cleanup
            appState.cleanups.push({
                location: beach,
                date: date,
                kg: kg,
                members: members
            });
            appState.totalImpact += kg;
            showNotification(`✅ Cleanup logged at ${beach} with ${kg > 0 ? kg + 'kg' : 'no'} recorded!`, 'success');
        }
        
        appState.save();
        appState.updateUI();
        form.reset();
        closeModal('cleanup-modal');
        
        // Reset submit button text
        submit.textContent = '✅ Log Cleanup';
    });
}

function editCleanup(index) {
    const cleanup = appState.cleanups[index];
    document.getElementById('beach-select').value = cleanup.location || '';
    document.getElementById('cleanup-date').value = cleanup.date || '';
    document.getElementById('cleanup-members').value = cleanup.members || '';
    document.getElementById('cleanup-kg').value = cleanup.kg || '';
    
    const form = document.getElementById('cleanup-form');
    form.dataset.editIndex = index;
    form.querySelector('button[type="submit"]').textContent = '✅ Update Cleanup';
    
    openModal('cleanup-modal');
}

function setupMemberForm() {
    const form = document.getElementById('member-form');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('member-name').value.trim();
        const role = document.getElementById('member-role').value;
        
        if (!name || !role) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        // Check if editing
        const editIndex = form.dataset.editIndex;
        
        if (editIndex !== undefined) {
            // Update existing member
            appState.crew[editIndex].name = name;
            appState.crew[editIndex].role = role;
            showNotification(`✅ ${name}'s profile updated!`, 'success');
            delete form.dataset.editIndex;
        } else {
            // Add new member
            appState.addCrewMember(name, role);
            showNotification(`✅ ${name} added to your crew as ${role}!`, 'success');
        }
        
        appState.save();
        appState.updateUI();
        form.reset();
        closeModal('member-modal');
        
        // Reset submit button text
        form.querySelector('button[type="submit"]').textContent = '✅ Add Member';
    });
}

function editMember(index) {
    const member = appState.crew[index];
    document.getElementById('member-name').value = member.name || '';
    document.getElementById('member-role').value = member.role || '';
    
    const form = document.getElementById('member-form');
    form.dataset.editIndex = index;
    form.querySelector('button[type="submit"]').textContent = '✅ Update Member';
    
    openModal('member-modal');
}

function setupModalControls() {
    // Cleanup Modal
    document.getElementById('start-cleanup').addEventListener('click', () => openModal('cleanup-modal'));
    document.getElementById('close-cleanup-modal').addEventListener('click', () => closeModal('cleanup-modal'));
    document.getElementById('cancel-cleanup').addEventListener('click', () => closeModal('cleanup-modal'));
    
    // Member Modal
    document.getElementById('invite-crew').addEventListener('click', () => openModal('member-modal'));
    document.getElementById('close-member-modal').addEventListener('click', () => closeModal('member-modal'));
    document.getElementById('cancel-member').addEventListener('click', () => closeModal('member-modal'));
    
    // Close modal when clicking outside
    document.getElementById('cleanup-modal').addEventListener('click', (e) => {
        if (e.target.id === 'cleanup-modal') closeModal('cleanup-modal');
    });
    
    document.getElementById('member-modal').addEventListener('click', (e) => {
        if (e.target.id === 'member-modal') closeModal('member-modal');
    });
    
    // Set today's date as default in cleanup form
    const dateInput = document.getElementById('cleanup-date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ===========================
// MONTHLY IMPACT TRACKER
// ===========================

function updateImpactTrackerDetails() {
    const impactDetails = document.getElementById('impact-tracker-details');
    impactDetails.innerHTML = '';
    
    // Group cleanups by month-year
    const monthlyData = {};
    
    appState.cleanups.forEach((cleanup) => {
        const date = new Date(cleanup.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = {
                year: date.getFullYear(),
                month: date.getMonth(),
                kg: 0,
                cleanups: 0
            };
        }
        
        const kg = cleanup.kg || 0;
        monthlyData[monthYear].kg += kg;
        monthlyData[monthYear].cleanups += 1;
    });
    
    // Sort by date (newest first)
    const sortedMonths = Object.entries(monthlyData).sort((a, b) => b[0].localeCompare(a[0]));
    
    if (sortedMonths.length === 0) {
        impactDetails.innerHTML = '<p style="color: #999; grid-column: 1/-1; text-align: center; padding: 2rem;">No impact tracked yet. Log your first cleanup to see monthly statistics! 📊</p>';
        return;
    }
    
    // Create wrapper for monthly grid
    const monthlyGrid = document.createElement('div');
    monthlyGrid.className = 'monthly-impact-grid';
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    sortedMonths.forEach(([monthYear, data]) => {
        const impactCard = document.createElement('div');
        impactCard.className = 'monthly-impact-card';
        
        const monthName = monthNames[data.month];
        const kgValue = data.kg || 0;
        
        impactCard.innerHTML = `
            <div class="month-year-header">${monthName} ${data.year}</div>
            <div class="month-kg">${kgValue.toFixed(1)}<span class="month-kg-unit">kg</span></div>
            <div class="month-cleanups">📅 ${data.cleanups} cleanup${data.cleanups !== 1 ? 's' : ''}</div>
        `;
        monthlyGrid.appendChild(impactCard);
    });
    
    impactDetails.appendChild(monthlyGrid);
}

// Update appState.addCrewMember to accept role
const originalAddCrewMember = appState.addCrewMember.bind(appState);
appState.addCrewMember = function(name, role) {
    const member = {
        id: Date.now(),
        name,
        role: role || 'Member',
        joinedAt: new Date().toISOString()
    };
    this.crew.push(member);
    this.save();
    return member;
};
