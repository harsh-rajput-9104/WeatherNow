# WeatherNow - Premium Weather Forecast Application

A beautiful, production-ready weather application built with vanilla HTML, CSS, and JavaScript. Features real-time weather data, hourly and 7-day forecasts, air quality index, and a stunning glassmorphism UI with dark/light themes.

![Weather App Preview](https://via.placeholder.com/1200x600/667eea/ffffff?text=WeatherNow+Premium+Weather+App)

## Features

### Core Functionality
- **Real-time Weather Data** - Current temperature, conditions, and comprehensive weather metrics
- **Hourly Forecast** - Next 24 hours with scrollable carousel
- **7-Day Forecast** - Weekly weather outlook with detailed daily information
- **City Search** - Search any city worldwide with autocomplete suggestions
- **Location Detection** - Automatic weather for your current location using Geolocation API
- **Recent Searches** - Quick access to previously searched cities (stored in LocalStorage)

### Weather Metrics
- Current temperature with "feels like" reading
- Wind speed and direction
- Humidity levels
- Atmospheric pressure
- Visibility distance
- UV Index with safety levels
- Air Quality Index (AQI) with color-coded ratings
- Sunrise and sunset times
- Weather alerts (when available)

### Premium UI/UX
- **Glassmorphism Design** - Modern frosted glass effect cards
- **Dynamic Backgrounds** - Background changes based on weather conditions (clear, rain, snow, clouds, etc.)
- **Dark/Light Themes** - Toggle between dark and light modes
- **Smooth Animations** - Micro-interactions, hover effects, and transitions
- **Responsive Design** - Mobile-first approach, works on all devices
- **Loading States** - Skeleton loaders and smooth transitions
- **Error Handling** - User-friendly error messages with retry options

### Technical Features
- Temperature unit toggle (Celsius/Fahrenheit)
- Debounced search for optimal API usage
- LocalStorage for preferences and recent searches
- Async/await for clean asynchronous code
- Modular JavaScript architecture
- SEO-friendly semantic HTML5
- Accessible UI components

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom styling with Flexbox, Grid, animations, and glassmorphism
- **JavaScript ES6+** - Modular, clean code with async/await
- **OpenWeatherMap API** - Weather data provider
- **Font Awesome** - Icon library
- **Google Fonts** - Inter font family

## Setup Instructions

### 1. Get API Key

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to API Keys section
4. Generate a new API key (free tier includes 1,000 calls/day)

### 2. Configure Application

1. Open `script.js` in your code editor
2. Find the `CONFIG` object at the top of the file
3. Replace `YOUR_OPENWEATHERMAP_API_KEY` with your actual API key:

```javascript
const CONFIG = {
    API_KEY: 'your_actual_api_key_here',
    // ... other config options
};
```

### 3. Run the Application

#### Option A: Local Development
Simply open `index.html` in your web browser. No build process required!

#### Option B: Local Server
If you prefer using a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

### 4. Deploy

#### GitHub Pages
1. Create a new repository on GitHub
2. Push your code to the repository
3. Go to Settings > Pages
4. Select your branch and save
5. Your app will be live at `https://yourusername.github.io/repository-name`

#### Netlify
1. Drag and drop your project folder to [Netlify Drop](https://app.netlify.com/drop)
2. Your app is instantly live!

#### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Follow the prompts

## Project Structure

```
weather-app/
│
├── index.html          # Main HTML structure
├── style.css           # All styling and animations
├── script.js           # JavaScript logic and API calls
└── README.md           # Documentation
```

## Code Architecture

### JavaScript Modules

#### CONFIG
Global configuration including API key, URLs, and app settings.

#### STATE
Application state management for current data, units, and theme.

#### API Layer
- `fetchWeatherByCity(city)` - Get weather by city name
- `fetchWeatherByCoords(lat, lon)` - Get weather by coordinates
- `fetchForecast(lat, lon)` - Get hourly and daily forecast
- `fetchAirQuality(lat, lon)` - Get air quality data
- `searchCities(query)` - Search for cities (autocomplete)

#### Data Parser
- `parseCurrentWeather(data)` - Extract current weather data
- `parseHourlyForecast(data)` - Process 24-hour forecast
- `parseDailyForecast(data)` - Process 7-day forecast
- `parseAirQuality(data)` - Process air quality index

#### Utils
Helper functions for:
- Temperature conversion
- Time formatting
- Date formatting
- Wind direction calculation
- Weather icon mapping
- Background theme selection
- Metric/Imperial conversion
- Debounce function for search

#### Storage
LocalStorage management for:
- Recent searches
- Theme preference
- Temperature unit preference

#### UI
Rendering functions for:
- Current weather display
- Weather details grid
- Hourly forecast carousel
- 7-day forecast panel
- Search suggestions
- Recent searches
- Loading states
- Error messages

#### App
Main application controller:
- Initialization
- Event listeners
- Search handling
- Location detection
- Theme toggle
- Unit conversion

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Lazy loading of forecast data
- Debounced search to minimize API calls
- Optimized CSS animations
- Minimal external dependencies
- Fast initial load time

## API Usage

The free OpenWeatherMap tier includes:
- 1,000 API calls per day
- Current weather data
- 5-day / 3-hour forecast
- Air pollution data
- Geocoding for city search

This is sufficient for personal use and development.

## Customization

### Change Default City
Edit the `CONFIG` object in `script.js`:
```javascript
DEFAULT_CITY: 'YourCity'
```

### Modify Color Scheme
Edit CSS variables in `style.css`:
```css
:root {
    --bg-gradient-start: #667eea;
    --bg-gradient-end: #764ba2;
    --accent: #fbbf24;
    /* ... other colors */
}
```

### Add More Weather Backgrounds
Add new background classes in `style.css` and update the `getBackgroundClass()` function in `script.js`.

## Troubleshooting

### API Key Error
If you see "Invalid API key" error:
- Verify your API key is correct
- Check if the key is activated (can take a few minutes)
- Ensure no extra spaces in the key

### CORS Error
If testing locally with `file://` protocol, some browsers may block API requests. Use a local server instead (see Setup Instructions).

### City Not Found
- Check spelling
- Try including country code (e.g., "London, UK")
- Use the search suggestions

### Location Not Working
- Ensure browser location permissions are enabled
- Use HTTPS (some browsers require secure context for geolocation)

## Future Enhancements

- [ ] Weather maps and radar
- [ ] Severe weather notifications
- [ ] Historical weather data
- [ ] Weather comparison between cities
- [ ] Weather widgets for embedding
- [ ] Progressive Web App (PWA) with offline support
- [ ] Multiple language support
- [ ] Voice search capability
- [ ] Weather-based recommendations

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Credits

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Icons by [Font Awesome](https://fontawesome.com/)
- Fonts by [Google Fonts](https://fonts.google.com/)

## Author

Built with ❤️ by the WeatherNow Team

---

## Screenshots

### Light Mode
Beautiful light theme with dynamic backgrounds based on weather conditions.

### Dark Mode
Elegant dark theme perfect for nighttime usage.

### Mobile Responsive
Fully responsive design that works seamlessly on all devices.

---

**Enjoy your premium weather experience with WeatherNow!** ☀️🌤️⛈️❄️
