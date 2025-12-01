# 🌊 ShoreSquad

**Rally your crew, track weather, and hit the next beach cleanup with our dope map app!**

---

## 🎯 Project Overview

ShoreSquad is a web application designed to mobilize young people to clean beaches by combining:
- **Interactive Maps** - Locate nearby beaches and coordinate with crew
- **Real-time Weather Tracking** - Plan cleanups with optimal conditions
- **Social Features** - Invite friends, form teams, and celebrate impact
- **Impact Dashboard** - Track collective environmental progress

---

## 🎨 Brand Identity

### Color Palette

| Color | Hex | Purpose |
|-------|-----|---------|
| **Ocean Blue** | #0066cc | Primary brand color - trust & calm |
| **Sandy Beige** | #d4a574 | Secondary - warmth & approachability |
| **Coral Orange** | #ff6b35 | Accent - youth, energy & action |
| **Eco Green** | #2ecc71 | Success states - environmental action |

### Design Philosophy
- **Youthful & Energetic** - Bold colors and playful typography
- **Approachable** - Clean layouts and intuitive navigation
- **Environmental** - Green elements highlight eco-impact
- **Social** - Community-focused design elements

---

## 🚀 JavaScript Features

### Performance Optimization
- **Debounce & Throttle Utilities** - Optimized event handling for search and scroll events
- **Lazy Loading** - IntersectionObserver API for efficient resource loading
- **Local Storage Caching** - Persistent state management without backend
- **Efficient DOM Queries** - Minimized reflows and repaints

### Interactivity
- **Real-time Weather API Integration** - Open-Meteo free API (no authentication)
- **Dynamic Crew Management** - Add/track team members
- **Cleanup Event Scheduling** - Plan and track beach cleanup events
- **Toast Notifications** - User feedback system with animations
- **Mobile-Responsive Menu** - Touch-friendly navigation

### Progressive Enhancement
- **Geolocation Support** - Detect user location for nearby beaches
- **Service Worker Ready** - PWA foundation for offline support
- **Keyboard Accessibility** - Full navigation via keyboard
- **Semantic HTML** - Proper ARIA labels and semantic elements

---

## 🎯 UX Design Principles

### 1. **Usability**
- ✅ Clear information hierarchy
- ✅ Intuitive navigation with visual feedback
- ✅ Consistent button states (hover, focus, active)
- ✅ Contextual CTAs ("Start a Cleanup", "Invite Crew Member")

### 2. **Accessibility**
- ✅ WCAG 2.1 compliant color contrasts
- ✅ Semantic HTML structure
- ✅ ARIA labels on form inputs
- ✅ Keyboard navigation support
- ✅ Reduced motion support (`prefers-reduced-motion`)
- ✅ Focus indicators with 2px outline
- ✅ Touch-friendly button sizes (min 44x44px)

### 3. **Mobile-First Design**
- ✅ Responsive grid layouts
- ✅ Flexible navigation (hamburger menu on mobile)
- ✅ Optimized touch targets
- ✅ Fast load times
- ✅ Readable font sizes

### 4. **Performance**
- ✅ Minimal JavaScript bundle
- ✅ CSS variables for theming
- ✅ Smooth animations (60fps)
- ✅ Optimized images (future)
- ✅ Lazy loading support

### 5. **Robustness & Error Handling**
- ✅ Try-catch blocks for API calls
- ✅ Loading spinners during data fetch
- ✅ User-friendly error messages
- ✅ Graceful fallbacks for missing data
- ✅ Network error recovery
- ✅ Invalid data validation
- ✅ Toast notifications for user feedback

---

## 📁 Project Structure

```
ShoreSquad/
├── index.html          # Main HTML file (HTML5 boilerplate)
├── css/
│   └── styles.css      # Complete styling with CSS variables
├── js/
│   └── app.js          # Core application logic
├── package.json        # Dependencies & scripts
├── .gitignore          # Git configuration
└── README.md           # This file
```

---

## 🛠️ Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js 14+ (for Live Server)
- Git (optional, for version control)

### Installation & Running the App

#### Option 1: Using Live Server (Recommended)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```
   - Live Server opens at `http://localhost:5500` automatically
   - File changes auto-refresh the browser
   - Perfect for development

3. **Or use a specific port:**
   ```bash
   npm run dev
   ```

#### Option 2: Direct Browser Open
Simply double-click `index.html` to open in your browser
- Works offline for basic functionality
- No server required
- Some features may have limitations

#### Option 3: Python Simple Server
```bash
# Python 3
python -m http.server 8000

# Then visit: http://localhost:8000
```

#### Option 4: Node.js http-server
```bash
npm install -g http-server
http-server

# Then visit: http://localhost:8080
```

---

## 📖 Usage Guide

### 🗺️ Map & Location
1. Navigate to the **Map** section via the navbar
2. View the embedded Google Maps showing **Pasir Ris** (next cleanup location)
3. Coordinates: 1.381497, 103.955574

### ⛅ Weather Forecast
1. Click **"Load Weather Forecast"** button
2. View Singapore's 4-day forecast with:
   - Temperature range (°C)
   - Humidity percentage
   - Wind speed (km/h) and direction
   - Weather conditions with emoji
3. All data from official NEA API (data.gov.sg)

### 👥 Crew Management
1. Click **"Invite Crew Member"** in the My Crew section
2. Enter crew member's name and email
3. Stats update automatically:
   - Crew count
   - Cleanup events planned
   - Total kg of waste removed

### 🎯 Planning Cleanups
1. Click **"Start a Cleanup"** button on hero section
2. Enter beach location and cleanup date
3. Events saved to browser's local storage
4. Can be accessed anytime without backend

### 📊 Impact Tracking
- View collective crew statistics
- Total members and cleanups planned
- Cumulative kg removed (metric system)

---

## 🎨 Customization

### Change Colors
Edit CSS variables in `css/styles.css` (lines 2-22):
```css
:root {
    --color-primary: #0066cc;      /* Change from blue */
    --color-accent: #ff6b35;       /* Change from coral */
    --color-success: #2ecc71;      /* Change from green */
}
```

### Modify Map Location
Edit the iframe in `index.html` (line 70):
```html
<iframe src="https://www.google.com/maps/embed?pb=..."></iframe>
```

### Update Weather API
The app uses NEA's free API. No configuration needed!
- Endpoint: `https://api.data.gov.sg/v1/environment/4-day-weather-forecast`
- No authentication required
- Real-time Singapore weather data

---

## 🛡️ Error Handling & Robustness

### API Error Handling
- **Network Failures**: Graceful error messages with retry instructions
- **Invalid Data**: Fallback values (e.g., "N/A" for missing temp)
- **API Downtime**: User-friendly notifications
- **Loading States**: Visual spinner during fetch operations

### User Feedback System
1. **Success Messages**: Green toast notifications ✅
2. **Error Messages**: Red toast with details ⚠️
3. **Info Messages**: Blue notifications for loading 📘
4. **Warning Messages**: Yellow alerts ⚡

Example:
```javascript
showNotification('Weather forecast loaded!', 'success');
showNotification('Failed to load weather', 'error');
showNotification('Loading weather data...', 'info');
```

### Loading States
- **Spinner Animation**: Rotating blue spinner during data fetch
- **Button Disabled**: Prevents multiple requests
- **Visual Feedback**: Opacity change during loading
- **Auto-recovery**: Button re-enables after request completes

### Validation
- Checks for null/undefined values before rendering
- Validates API response structure
- Handles missing optional fields gracefully
- Array bounds checking in loops

---

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 📊 Features Breakdown

### Current Features ✅
1. **Responsive Hero Section** - Engaging landing page
2. **Feature Showcase** - 4 key value propositions
3. **Weather Search Widget** - Real-time weather integration
4. **Crew Management** - Add and track team members
5. **Impact Dashboard** - View collective metrics
6. **Mobile Navigation** - Hamburger menu
7. **Smooth Scrolling** - Enhanced navigation

### Future Features 🚀
1. **Google Maps Integration** - Interactive beach locations
2. **Push Notifications** - Cleanup reminders
3. **User Profiles** - Personal dashboards
4. **Photo Gallery** - Before/after cleanup photos
5. **Leaderboards** - Team rankings
6. **Donation Integration** - Support cleanup initiatives
7. **Dark Mode** - CSS variables ready

---

## 🔧 Configuration

### Live Server Setup
Live Server is configured via `package.json` scripts:
```json
{
  "scripts": {
    "start": "live-server",
    "dev": "live-server --port=3000"
  }
}
```

Run with: `npm start` or `npm run dev`

---

## 📝 Git Workflow

### Initial Setup
```bash
git init
git add .
git commit -m "Initial commit: ShoreSquad v1.0"
```

### Ignored Files
- `node_modules/` - Dependencies
- `.DS_Store` - macOS system files
- `Thumbs.db` - Windows thumbnails
- `.env` files - Environment variables
- IDE configs (`.vscode/`, `.idea/`)

---

## 🎓 Code Quality

- **Organized Structure** - Clear separation of concerns
- **Performance Focus** - Debounce, throttle, lazy loading
- **Accessibility First** - WCAG 2.1 compliance
- **Mobile Responsive** - Mobile-first approach
- **CSS Variables** - Easy theming and maintenance

---

## 📱 Mobile Experience

- **Touch-Friendly** - Large buttons (44x44px minimum)
- **Responsive Breakpoints**:
  - Desktop: 1200px+
  - Tablet: 768px - 1199px
  - Mobile: < 768px
  - Small Mobile: < 480px

- **Performance**:
  - Optimized for 3G connections
  - Minimal animations on mobile
  - Efficient event handling

---

## 🤝 Contributing

To extend ShoreSquad:

1. **Add new sections** in `index.html`
2. **Style in** `css/styles.css` (use CSS variables)
3. **Add interactions** in `js/app.js`
4. **Test** across devices and browsers

---

## 📄 License

MIT License - Feel free to use and modify!

---

## 🌊 Let's Clean Our Beaches!

ShoreSquad is built for young people who care about our oceans. Together, we can make a difference.

**Rally your crew. Start today. 🌊**

---

*Last Updated: December 2025*
