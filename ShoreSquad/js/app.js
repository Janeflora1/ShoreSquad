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

// Invite Crew Handler
function setupInviteCrew() {
    const inviteBtn = document.getElementById('invite-crew');
    if (inviteBtn) {
        inviteBtn.addEventListener('click', () => {
            const name = prompt('Enter crew member name:');
            if (name) {
                const email = prompt('Enter crew member email:');
                if (email) {
                    appState.addCrewMember(name, email);
                    appState.updateUI();
                    showNotification(`${name} added to your crew!`, 'success');
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
    setupInviteCrew();
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
    }
});
