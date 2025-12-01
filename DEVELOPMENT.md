# 🛠️ ShoreSquad Development Guide

## Quick Start

### Setup
```bash
npm install
npm start
```
Open `http://localhost:5500` in your browser

---

## 📚 Code Architecture

### JavaScript Structure (`js/app.js`)

#### 1. **Performance Optimization** (Lines 1-50)
- `debounce()` - Prevents rapid function calls (e.g., resize, scroll)
- `throttle()` - Limits function execution frequency
- `observeElements()` - Lazy loads images via IntersectionObserver

**Use Cases:**
```javascript
// Debounce: Wait until user finishes typing
const handleSearch = debounce(() => fetchWeatherData(), 300);

// Throttle: Update UI max 10x per second while scrolling
window.addEventListener('scroll', throttle(updateActiveNav, 100));
```

#### 2. **State Management** (Lines 51-120)
- `appState` object stores all app data
- `localStorage` persists crew and cleanup data
- `addCrewMember()` - Adds team member
- `addCleanup()` - Schedules cleanup events
- `updateUI()` - Syncs UI with state

**Data Flow:**
```
User Action → State Update → localStorage Save → UI Render
```

#### 3. **DOM Interactions** (Lines 121-200)
- `setupNavigation()` - Scroll spy for active nav link
- `setupCTAButton()` - "Start a Cleanup" functionality
- `setupInviteCrew()` - Crew invitation dialog
- `setupWeatherForecast()` - Weather button handler

**Event Listeners:**
- Button clicks trigger prompts for user input
- Data saved to `appState` and localStorage
- UI updates automatically via `updateUI()`

#### 4. **Weather Integration** (Lines 201-350)
- `fetchNEAWeatherForecast()` - Fetches 4-day forecast from NEA API
- Error handling with try-catch
- Loading spinner during fetch
- `displayNEAWeatherForecast()` - Renders forecast cards
- `getWeatherEmoji()` - Maps conditions to emojis

**API Details:**
```javascript
const apiUrl = 'https://api.data.gov.sg/v1/environment/4-day-weather-forecast';
// Response includes: temperature, humidity, wind, forecast condition
```

**Error Handling:**
```javascript
try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    // Validate data structure before rendering
} catch (error) {
    // Show user-friendly error message
    showNotification(`Error: ${error.message}`, 'error');
}
```

#### 5. **Notifications** (Lines 351-410)
- `showNotification()` - Toast notification system
- Supports 4 types: success, error, info, warning
- Auto-dismisses after 4 seconds
- Click to dismiss manually
- CSS-based styling from variables

**Usage:**
```javascript
showNotification('Data saved!', 'success');
showNotification('Network error', 'error');
showNotification('Loading...', 'info');
showNotification('Check this', 'warning');
```

#### 6. **Animations** (Lines 411-430)
- `addAnimations()` - Injects CSS @keyframes
- **slideIn/slideOut** - Toast notifications
- **fadeIn** - Generic fade effect
- **spin** - Loading spinner rotation

#### 7. **Mobile Support** (Lines 431-450)
- `setupMobileMenu()` - Hamburger toggle
- Close menu on link click
- Escape key to dismiss

#### 8. **Geolocation** (Lines 451-470)
- `setupGeolocation()` - Gets user's coordinates
- Stored in `appState.userLocation`
- Ready for future map centering

#### 9. **App Initialization** (Lines 471-490)
```javascript
document.addEventListener('DOMContentLoaded', () => {
    appState.init();              // Load from localStorage
    addAnimations();              // Inject CSS
    setupNavigation();            // Enable scroll spy
    setupCTAButton();             // Enable CTA
    setupInviteCrew();            // Enable crew invite
    setupWeatherForecast();       // Enable weather
    setupMobileMenu();            // Enable mobile menu
    setupGeolocation();           // Get location
    observeElements();            // Start lazy loading
});
```

---

## 🎨 CSS Architecture

### Variables System (`css/styles.css`)
```css
:root {
    /* Colors - Easy theming */
    --color-primary: #0066cc;
    --color-accent: #ff6b35;
    --color-success: #2ecc71;
    
    /* Spacing scale */
    --spacing-xs: 0.5rem;
    --spacing-sm: 1rem;
    --spacing-md: 1.5rem;
    --spacing-lg: 2rem;
    --spacing-xl: 3rem;
    
    /* Border radius */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 16px;
    
    /* Transitions */
    --transition: all 0.3s ease;
}
```

### Key Classes

#### Buttons
```css
.btn {
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-md);
    transition: var(--transition);
    cursor: pointer;
}

.btn-primary { background: var(--color-primary); }
.btn-primary:hover { background: var(--color-primary-dark); }

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
```

#### Loading Spinner
```css
.loading {
    width: 1.2em;
    height: 1.2em;
    border: 2px solid var(--color-primary);
    border-top-color: var(--color-accent);
    animation: spin 0.8s linear infinite;
}
```

#### Notifications
```css
.notification-success { background: #d4edda; color: #155724; }
.notification-error { background: #f8d7da; color: #721c24; }
.notification-info { background: #d1ecf1; color: #0c5460; }
```

#### Responsive
```css
@media (max-width: 768px) {
    .forecast-grid { grid-template-columns: 1fr; }
    .weather-widget { flex-direction: column; }
}

@media (max-width: 480px) {
    h1 { font-size: 1.5rem; }
}
```

---

## 🐛 Debugging Tips

### Console Logging
The app logs status messages:
```javascript
console.log('ShoreSquad app initialized successfully!');
console.error('Weather fetch error:', error);
```

### Browser DevTools
1. **Network tab** - Check NEA API calls
2. **Storage tab** - View localStorage data
3. **Console** - Debug errors and state
4. **Elements** - Inspect DOM/CSS

### Common Issues

#### Weather not loading?
- Check Network tab for API response
- Verify CORS is enabled (it is by default)
- Check browser console for errors
- Try refreshing the page

#### LocalStorage not working?
- Check Privacy settings in browser
- Disable extensions blocking storage
- Try Incognito mode (private browsing)

#### Mobile menu not working?
- Check if hamburger icon is visible (<768px)
- Verify event listeners in DevTools

---

## 📊 API Reference

### NEA Weather API
```javascript
// Endpoint
https://api.data.gov.sg/v1/environment/4-day-weather-forecast

// Response Structure
{
    items: [{
        update_timestamp: "2025-12-01T10:30:00+08:00",
        timestamp: "2025-12-01T10:30:00+08:00",
        forecasts: [
            {
                date: "2025-12-01",
                forecast: "Afternoon thundery showers",
                temperature: { high: 31, low: 24 },
                relative_humidity: { high: 90, low: 60 },
                wind: {
                    speed: { high: 25, low: 10 },
                    direction: "NW"
                }
            },
            // ... 3 more days
        ]
    }],
    api_info: { status: "healthy" }
}
```

### LocalStorage Data Structure
```javascript
// Key: "shoreSquadData"
{
    crew: [
        {
            id: 1701414600000,
            name: "Jane Doe",
            email: "jane@example.com",
            joinedAt: "2025-12-01T12:00:00.000Z"
        }
    ],
    cleanups: [
        {
            id: 1701414600001,
            location: "Pasir Ris",
            date: "2025-12-05",
            expectedMembers: 5,
            actualMembers: 0,
            impactKg: 0,
            createdAt: "2025-12-01T12:00:00.000Z"
        }
    ],
    totalImpact: 0
}
```

---

## 🚀 Deployment

### GitHub Pages
```bash
# Already configured in your repo!
# Just push to main branch
git push origin main
```

### Live Server Local Testing
```bash
npm start
# Visits http://localhost:5500
```

### Production Checklist
- [ ] Test on mobile devices
- [ ] Check API endpoints work
- [ ] Verify localStorage works
- [ ] Test error scenarios
- [ ] Check console for errors
- [ ] Test on different browsers
- [ ] Check accessibility (a11y)
- [ ] Optimize images

---

## 📝 Best Practices

### Adding New Features
1. **Update HTML** - Add markup in index.html
2. **Add CSS** - Style in styles.css (use variables!)
3. **Add JS** - Logic in app.js with try-catch
4. **Test** - Cross-browser and mobile
5. **Document** - Add comments and update README
6. **Commit** - Meaningful commit message

### Error Handling Pattern
```javascript
try {
    // API call or risky operation
    const data = await fetch(url);
    if (!data.ok) throw new Error('API failed');
    
    // Validate data
    if (!data.items) throw new Error('Invalid response');
    
    // Process and display
    displayData(data);
    showNotification('Success!', 'success');
} catch (error) {
    console.error('Detailed error:', error);
    showNotification(`Failed: ${error.message}`, 'error');
    // Show fallback UI
}
```

### Performance Tips
- Use `debounce` for frequent events
- Use `throttle` for scroll events
- Minimize DOM manipulation
- Batch updates to appState
- Cache API responses if possible

---

## 🧪 Testing Checklist

### Manual Testing
- [ ] Click all buttons
- [ ] Test weather API loading
- [ ] Add crew members
- [ ] Plan cleanups
- [ ] Check localStorage persistence
- [ ] Refresh page - data persists?
- [ ] Test on mobile
- [ ] Test without internet (graceful failure)

### Edge Cases
- [ ] Missing API data fields
- [ ] Network timeout
- [ ] Invalid JSON response
- [ ] Empty crew/cleanup lists
- [ ] Very long names/emails
- [ ] Multiple rapid button clicks
- [ ] Open DevTools and check console

---

## 🎓 Learning Resources

### Modern JavaScript
- [MDN Web Docs](https://developer.mozilla.org/)
- [JavaScript.info](https://javascript.info/)

### API Integration
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Error Handling](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch)

### CSS
- [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
- [Flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout)

### Web Performance
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

## 📞 Support

For issues or questions:
1. Check the console for errors
2. Review the main README.md
3. Check GitHub issues
4. Open a new issue with details

---

**Happy coding! 🌊**
