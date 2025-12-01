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

### Installation

1. **Clone or download the project:**
   ```bash
   cd ShoreSquad
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```
   This launches Live Server at `http://localhost:8080`

4. **Alternative: Quick start without npm:**
   - Simply open `index.html` in your browser
   - Or use any local server (Python, PHP, etc.)

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
