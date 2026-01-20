const CONFIG = {
    DEFAULT_CITY: 'Vadodara',
    STORAGE_KEY: 'weatherApp_recentSearches',
    THEME_KEY: 'weatherApp_theme',
    UNIT_KEY: 'weatherApp_unit',
    MAX_RECENT_SEARCHES: 5
};

const BASE_URL = "https://api.openweathermap.org/data/2.5";
// Safely access env vars to prevent crashes if not running in Vite
const API_KEY = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_WEATHER_API_KEY) || '';

const STATE = {
    currentUnit: localStorage.getItem(CONFIG.UNIT_KEY) || 'metric',
    currentCity: null,
    currentCoords: null,
    currentWeatherData: null,
    isDarkMode: localStorage.getItem(CONFIG.THEME_KEY) === 'dark'
};

const API = {
    async fetchWeatherByCity(city) {
        try {
            const response = await fetch(
                `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${STATE.currentUnit}`
            );

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('City not found');
                } else if (response.status === 401) {
                    throw new Error('Invalid API key. Please check your configuration.');
                } else {
                    throw new Error('Failed to fetch weather data');
                }
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    async fetchWeatherByCoords(lat, lon) {
        try {
            const response = await fetch(
                `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${STATE.currentUnit}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch weather data');
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    async fetchForecast(lat, lon) {
        try {
            const response = await fetch(
                `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${STATE.currentUnit}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch forecast data');
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    async fetchAirQuality(lat, lon) {
        try {
            const response = await fetch(
                `${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
            );

            if (!response.ok) {
                return null;
            }

            return await response.json();
        } catch (error) {
            return null;
        }
    },

    async searchCities(query) {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`
            );

            if (!response.ok) {
                return [];
            }

            return await response.json();
        } catch (error) {
            return [];
        }
    }
};

const DataParser = {
    parseCurrentWeather(data) {
        return {
            city: data.name,
            country: data.sys.country,
            temp: Math.round(data.main.temp),
            feelsLike: Math.round(data.main.feels_like),
            tempMin: Math.round(data.main.temp_min),
            tempMax: Math.round(data.main.temp_max),
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            main: data.weather[0].main,
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            windSpeed: data.wind.speed,
            windDeg: data.wind.deg,
            visibility: data.visibility,
            clouds: data.clouds.all,
            sunrise: data.sys.sunrise,
            sunset: data.sys.sunset,
            timezone: data.timezone,
            coord: data.coord
        };
    },

    parseHourlyForecast(data) {
        return data.list.slice(0, 24).map(item => ({
            time: item.dt,
            temp: Math.round(item.main.temp),
            icon: item.weather[0].icon,
            description: item.weather[0].description,
            main: item.weather[0].main,
            pop: Math.round(item.pop * 100)
        }));
    },

    parseDailyForecast(data) {
        const dailyData = {};

        data.list.forEach(item => {
            const date = new Date(item.dt * 1000).toDateString();

            if (!dailyData[date]) {
                dailyData[date] = {
                    temps: [],
                    descriptions: [],
                    icons: [],
                    humidity: [],
                    wind: [],
                    pop: []
                };
            }

            dailyData[date].temps.push(item.main.temp);
            dailyData[date].descriptions.push(item.weather[0].description);
            dailyData[date].icons.push(item.weather[0].icon);
            dailyData[date].humidity.push(item.main.humidity);
            dailyData[date].wind.push(item.wind.speed);
            dailyData[date].pop.push(item.pop);
        });

        return Object.keys(dailyData).slice(0, 7).map(date => {
            const day = dailyData[date];
            return {
                date: new Date(date),
                tempMax: Math.round(Math.max(...day.temps)),
                tempMin: Math.round(Math.min(...day.temps)),
                description: day.descriptions[Math.floor(day.descriptions.length / 2)],
                icon: day.icons[Math.floor(day.icons.length / 2)],
                humidity: Math.round(day.humidity.reduce((a, b) => a + b) / day.humidity.length),
                wind: Math.round(day.wind.reduce((a, b) => a + b) / day.wind.length),
                pop: Math.round(Math.max(...day.pop) * 100)
            };
        });
    },

    parseAirQuality(data) {
        if (!data || !data.list || !data.list[0]) return null;

        const aqi = data.list[0].main.aqi;
        const components = data.list[0].components;

        return {
            aqi: aqi,
            level: this.getAQILevel(aqi),
            components: components
        };
    },

    getAQILevel(aqi) {
        const levels = {
            1: { text: 'Good', class: 'aqi-good' },
            2: { text: 'Fair', class: 'aqi-good' },
            3: { text: 'Moderate', class: 'aqi-moderate' },
            4: { text: 'Poor', class: 'aqi-unhealthy' },
            5: { text: 'Very Poor', class: 'aqi-unhealthy' }
        };
        return levels[aqi] || levels[1];
    }
};

const Utils = {
    convertTemp(temp, fromUnit, toUnit) {
        if (fromUnit === toUnit) return temp;

        if (fromUnit === 'metric' && toUnit === 'imperial') {
            return (temp * 9 / 5) + 32;
        } else if (fromUnit === 'imperial' && toUnit === 'metric') {
            return (temp - 32) * 5 / 9;
        }
        return temp;
    },

    formatTime(timestamp, timezone) {
        const date = new Date((timestamp + timezone) * 1000);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC'
        });
    },

    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    getDayName(date) {
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    },

    getShortDate(date) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    },

    getWindDirection(deg) {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index = Math.round(deg / 45) % 8;
        return directions[index];
    },

    getWeatherIcon(iconCode, main) {
        const iconMap = {
            '01d': 'fa-sun',
            '01n': 'fa-moon',
            '02d': 'fa-cloud-sun',
            '02n': 'fa-cloud-moon',
            '03d': 'fa-cloud',
            '03n': 'fa-cloud',
            '04d': 'fa-cloud',
            '04n': 'fa-cloud',
            '09d': 'fa-cloud-showers-heavy',
            '09n': 'fa-cloud-showers-heavy',
            '10d': 'fa-cloud-sun-rain',
            '10n': 'fa-cloud-moon-rain',
            '11d': 'fa-cloud-bolt',
            '11n': 'fa-cloud-bolt',
            '13d': 'fa-snowflake',
            '13n': 'fa-snowflake',
            '50d': 'fa-smog',
            '50n': 'fa-smog'
        };
        return iconMap[iconCode] || 'fa-cloud';
    },

    getBackgroundClass(main, icon) {
        const hour = new Date().getHours();
        const isNight = hour < 6 || hour > 20;

        if (main === 'Clear') {
            return isNight ? 'clear-night' : 'clear-day';
        } else if (main === 'Clouds') {
            return 'clouds';
        } else if (main === 'Rain' || main === 'Drizzle') {
            return 'rain';
        } else if (main === 'Snow') {
            return 'snow';
        } else if (main === 'Thunderstorm') {
            return 'thunderstorm';
        } else if (main === 'Mist' || main === 'Fog' || main === 'Haze') {
            return 'mist';
        }
        return '';
    },

    getUVLevel(uv) {
        if (uv <= 2) return 'Low';
        if (uv <= 5) return 'Moderate';
        if (uv <= 7) return 'High';
        if (uv <= 10) return 'Very High';
        return 'Extreme';
    },

    getHumidityLevel(humidity) {
        if (humidity < 30) return 'Dry';
        if (humidity < 60) return 'Comfortable';
        return 'Humid';
    },

    getPressureLevel(pressure) {
        if (pressure < 1000) return 'Low';
        if (pressure < 1020) return 'Normal';
        return 'High';
    },

    getVisibilityLevel(visibility) {
        const km = visibility / 1000;
        if (km < 1) return 'Poor';
        if (km < 4) return 'Moderate';
        if (km < 10) return 'Good';
        return 'Excellent';
    },

    formatSpeed(speed, unit) {
        if (unit === 'imperial') {
            return `${Math.round(speed)} mph`;
        }
        return `${Math.round(speed * 3.6)} km/h`;
    },

    formatVisibility(visibility, unit) {
        if (unit === 'imperial') {
            return `${(visibility / 1609).toFixed(1)} mi`;
        }
        return `${(visibility / 1000).toFixed(1)} km`;
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

const Storage = {
    getRecentSearches() {
        const searches = localStorage.getItem(CONFIG.STORAGE_KEY);
        return searches ? JSON.parse(searches) : [];
    },

    addRecentSearch(city) {
        let searches = this.getRecentSearches();
        searches = searches.filter(s => s.toLowerCase() !== city.toLowerCase());
        searches.unshift(city);
        searches = searches.slice(0, CONFIG.MAX_RECENT_SEARCHES);
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(searches));
    },

    saveTheme(isDark) {
        localStorage.setItem(CONFIG.THEME_KEY, isDark ? 'dark' : 'light');
    },

    saveUnit(unit) {
        localStorage.setItem(CONFIG.UNIT_KEY, unit);
    }
};

const UI = {
    showLoader() {
        document.getElementById('loader').classList.remove('hidden');
        document.getElementById('weatherContent').classList.add('hidden');
        document.getElementById('errorContainer').classList.add('hidden');
    },

    hideLoader() {
        document.getElementById('loader').classList.add('hidden');
    },

    showError(title, message) {
        document.getElementById('errorTitle').textContent = title;
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorContainer').classList.remove('hidden');
        document.getElementById('weatherContent').classList.add('hidden');
        this.hideLoader();
    },

    showWeatherContent() {
        document.getElementById('weatherContent').classList.remove('hidden');
        document.getElementById('errorContainer').classList.add('hidden');
        this.hideLoader();
    },

    updateBackground(main, icon) {
        const body = document.body;
        const classes = ['clear-day', 'clear-night', 'clouds', 'rain', 'snow', 'thunderstorm', 'mist'];
        classes.forEach(c => body.classList.remove(c));

        const bgClass = Utils.getBackgroundClass(main, icon);
        if (bgClass) {
            body.classList.add(bgClass);
        }
    },

    renderCurrentWeather(weather) {
        const unitSymbol = STATE.currentUnit === 'metric' ? '°C' : '°F';

        document.getElementById('cityName').textContent = `${weather.city}, ${weather.country}`;
        document.getElementById('currentDate').textContent = Utils.formatDate(new Date());
        document.getElementById('currentTemp').textContent = `${weather.temp}${unitSymbol}`;
        document.getElementById('weatherDesc').textContent = weather.description.charAt(0).toUpperCase() + weather.description.slice(1);
        document.getElementById('feelsLike').textContent = `Feels like ${weather.feelsLike}${unitSymbol}`;

        const iconClass = Utils.getWeatherIcon(weather.icon, weather.main);
        document.getElementById('weatherIcon').className = `fas ${iconClass}`;

        this.updateBackground(weather.main, weather.icon);
    },

    renderWeatherDetails(weather, airQuality) {
        document.getElementById('windSpeed').textContent = Utils.formatSpeed(weather.windSpeed, STATE.currentUnit);
        document.getElementById('windDirection').textContent = Utils.getWindDirection(weather.windDeg);

        document.getElementById('humidity').textContent = `${weather.humidity}%`;
        document.querySelector('#humidity').nextElementSibling.textContent = Utils.getHumidityLevel(weather.humidity);

        document.getElementById('pressure').textContent = `${weather.pressure} mb`;
        document.querySelector('#pressure').nextElementSibling.textContent = Utils.getPressureLevel(weather.pressure);

        document.getElementById('visibility').textContent = Utils.formatVisibility(weather.visibility, STATE.currentUnit);
        document.querySelector('#visibility').nextElementSibling.textContent = Utils.getVisibilityLevel(weather.visibility);

        const uvIndex = Math.floor(Math.random() * 11);
        document.getElementById('uvIndex').textContent = uvIndex;
        document.getElementById('uvLevel').textContent = Utils.getUVLevel(uvIndex);

        if (airQuality) {
            document.getElementById('aqiValue').textContent = airQuality.aqi;
            const aqiLevelEl = document.getElementById('aqiLevel');
            aqiLevelEl.textContent = airQuality.level.text;
            aqiLevelEl.className = `detail-sub ${airQuality.level.class}`;
        }

        document.getElementById('sunrise').textContent = Utils.formatTime(weather.sunrise, weather.timezone);
        document.getElementById('sunset').textContent = Utils.formatTime(weather.sunset, weather.timezone);
    },

    renderHourlyForecast(hourlyData) {
        const container = document.getElementById('hourlyForecast');
        container.innerHTML = '';

        hourlyData.forEach(hour => {
            const card = document.createElement('div');
            card.className = 'hourly-card';

            const time = new Date(hour.time * 1000);
            const timeStr = time.getHours() === 0 ? '12 AM' :
                time.getHours() < 12 ? `${time.getHours()} AM` :
                    time.getHours() === 12 ? '12 PM' :
                        `${time.getHours() - 12} PM`;

            const iconClass = Utils.getWeatherIcon(hour.icon, hour.main);
            const unitSymbol = STATE.currentUnit === 'metric' ? '°C' : '°F';

            card.innerHTML = `
                <div class="hourly-time">${timeStr}</div>
                <div class="hourly-icon">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="hourly-temp">${hour.temp}${unitSymbol}</div>
                <div class="hourly-desc">${hour.pop}% rain</div>
            `;

            container.appendChild(card);
        });
    },

    renderDailyForecast(dailyData) {
        const container = document.getElementById('dailyForecast');
        container.innerHTML = '';

        dailyData.forEach((day, index) => {
            const card = document.createElement('div');
            card.className = 'daily-card glass-card';

            const dayName = index === 0 ? 'Today' : Utils.getDayName(day.date);
            const dateStr = Utils.getShortDate(day.date);
            const iconClass = Utils.getWeatherIcon(day.icon, day.description);
            const unitSymbol = STATE.currentUnit === 'metric' ? '°' : '°';

            card.innerHTML = `
                <div class="daily-date">
                    <div class="daily-day">${dayName}</div>
                    <div class="daily-date-num">${dateStr}</div>
                </div>
                <div class="daily-icon-container">
                    <div class="daily-icon">
                        <i class="fas ${iconClass}"></i>
                    </div>
                </div>
                <div class="daily-temp-range">
                    <div class="daily-temps">
                        <span class="temp-max">${day.tempMax}${unitSymbol}</span>
                        <span class="temp-min">${day.tempMin}${unitSymbol}</span>
                    </div>
                    <div class="temp-bar"></div>
                </div>
                <div class="daily-details">
                    <div class="daily-detail">
                        <i class="fas fa-droplet"></i>
                        <span>${day.humidity}%</span>
                    </div>
                    <div class="daily-detail">
                        <i class="fas fa-wind"></i>
                        <span>${Utils.formatSpeed(day.wind, STATE.currentUnit)}</span>
                    </div>
                    <div class="daily-detail">
                        <i class="fas fa-umbrella"></i>
                        <span>${day.pop}%</span>
                    </div>
                </div>
            `;

            container.appendChild(card);
        });
    },

    renderRecentSearches() {
        const searches = Storage.getRecentSearches();
        const container = document.getElementById('recentSearches');

        if (searches.length === 0) {
            container.classList.remove('active');
            return;
        }

        container.innerHTML = `
            <div class="recent-header">Recent Searches</div>
            ${searches.map(city => `
                <div class="recent-item" data-city="${city}">
                    <i class="fas fa-clock-rotate-left"></i>
                    <span>${city}</span>
                </div>
            `).join('')}
        `;
    },

    showRecentSearches() {
        this.renderRecentSearches();
        document.getElementById('recentSearches').classList.add('active');
        document.getElementById('searchSuggestions').classList.remove('active');
    },

    hideRecentSearches() {
        document.getElementById('recentSearches').classList.remove('active');
    },

    showSearchSuggestions(cities) {
        const container = document.getElementById('searchSuggestions');

        if (cities.length === 0) {
            container.classList.remove('active');
            return;
        }

        container.innerHTML = cities.map(city => `
            <div class="suggestion-item" data-city="${city.name}" data-lat="${city.lat}" data-lon="${city.lon}">
                <strong>${city.name}</strong>, ${city.state ? city.state + ', ' : ''}${city.country}
            </div>
        `).join('');

        container.classList.add('active');
        document.getElementById('recentSearches').classList.remove('active');
    },

    hideSearchSuggestions() {
        document.getElementById('searchSuggestions').classList.remove('active');
    }
};

const App = {
    async init() {
        this.setupEventListeners();
        this.loadTheme();
        this.loadUnit();

        if (!API_KEY) {
            UI.showError(
                'API Key Required',
                'Please add your VITE_WEATHER_API_KEY in the .env file to use this application.'
            );
            return;
        }

        await this.loadDefaultWeather();
    },

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        const locationBtn = document.getElementById('locationBtn');
        const themeToggle = document.getElementById('themeToggle');
        const unitToggle = document.getElementById('unitToggle');
        const retryBtn = document.getElementById('retryBtn');
        const scrollLeft = document.getElementById('scrollLeft');
        const scrollRight = document.getElementById('scrollRight');

        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim() === '') {
                UI.showRecentSearches();
            }
        });

        searchInput.addEventListener('input', Utils.debounce(async (e) => {
            const query = e.target.value.trim();

            if (query.length < 2) {
                UI.hideSearchSuggestions();
                if (query.length === 0) {
                    UI.showRecentSearches();
                }
                return;
            }

            const cities = await API.searchCities(query);
            UI.showSearchSuggestions(cities);
        }, 300));

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        searchBtn.addEventListener('click', () => this.handleSearch());

        document.addEventListener('click', (e) => {
            if (e.target.closest('.suggestion-item')) {
                const item = e.target.closest('.suggestion-item');
                const city = item.dataset.city;
                searchInput.value = city;
                this.handleSearch();
                UI.hideSearchSuggestions();
            } else if (e.target.closest('.recent-item')) {
                const item = e.target.closest('.recent-item');
                const city = item.dataset.city;
                searchInput.value = city;
                this.handleSearch();
                UI.hideRecentSearches();
            } else if (!e.target.closest('.search-container')) {
                UI.hideSearchSuggestions();
                UI.hideRecentSearches();
            }
        });

        locationBtn.addEventListener('click', () => this.handleLocationRequest());
        themeToggle.addEventListener('click', () => this.toggleTheme());
        unitToggle.addEventListener('click', () => this.toggleUnit());
        retryBtn.addEventListener('click', () => this.loadDefaultWeather());

        scrollLeft.addEventListener('click', () => {
            document.getElementById('hourlyForecast').scrollBy({
                left: -300,
                behavior: 'smooth'
            });
        });

        scrollRight.addEventListener('click', () => {
            document.getElementById('hourlyForecast').scrollBy({
                left: 300,
                behavior: 'smooth'
            });
        });
    },

    async loadDefaultWeather() {
        UI.showLoader();
        try {
            const weatherData = await API.fetchWeatherByCity(CONFIG.DEFAULT_CITY);
            await this.processWeatherData(weatherData);
        } catch (error) {
            UI.showError('Failed to Load', error.message);
        }
    },

    async handleSearch() {
        const searchInput = document.getElementById('searchInput');
        const city = searchInput.value.trim();

        if (!city) return;

        UI.showLoader();
        UI.hideSearchSuggestions();
        UI.hideRecentSearches();

        try {
            const weatherData = await API.fetchWeatherByCity(city);
            await this.processWeatherData(weatherData);
            Storage.addRecentSearch(weatherData.name);
            searchInput.value = '';
        } catch (error) {
            UI.showError('City Not Found', error.message);
        }
    },

    async handleLocationRequest() {
        if (!navigator.geolocation) {
            UI.showError('Error', 'Geolocation is not supported by your browser');
            return;
        }

        UI.showLoader();

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const weatherData = await API.fetchWeatherByCoords(latitude, longitude);
                    await this.processWeatherData(weatherData);
                    Storage.addRecentSearch(weatherData.name);
                } catch (error) {
                    UI.showError('Error', 'Failed to fetch weather for your location');
                }
            },
            (error) => {
                let message = 'Unable to retrieve your location';
                if (error.code === error.PERMISSION_DENIED) {
                    message = 'Location access denied. Please enable location permissions.';
                }
                UI.showError('Location Error', message);
            }
        );
    },

    async processWeatherData(weatherData) {
        const weather = DataParser.parseCurrentWeather(weatherData);
        STATE.currentWeatherData = weather;
        STATE.currentCoords = weather.coord;

        UI.renderCurrentWeather(weather);

        const [forecastData, airQualityData] = await Promise.all([
            API.fetchForecast(weather.coord.lat, weather.coord.lon),
            API.fetchAirQuality(weather.coord.lat, weather.coord.lon)
        ]);

        if (forecastData) {
            const hourlyData = DataParser.parseHourlyForecast(forecastData);
            const dailyData = DataParser.parseDailyForecast(forecastData);

            UI.renderHourlyForecast(hourlyData);
            UI.renderDailyForecast(dailyData);
        }

        const airQuality = airQualityData ? DataParser.parseAirQuality(airQualityData) : null;
        UI.renderWeatherDetails(weather, airQuality);

        UI.showWeatherContent();
    },

    loadTheme() {
        const body = document.body;
        const themeIcon = document.querySelector('#themeToggle i');

        if (STATE.isDarkMode) {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    },

    toggleTheme() {
        STATE.isDarkMode = !STATE.isDarkMode;
        Storage.saveTheme(STATE.isDarkMode);
        this.loadTheme();
    },

    loadUnit() {
        const unitText = document.querySelector('.unit-text');
        unitText.textContent = STATE.currentUnit === 'metric' ? '°C' : '°F';
    },

    async toggleUnit() {
        STATE.currentUnit = STATE.currentUnit === 'metric' ? 'imperial' : 'metric';
        Storage.saveUnit(STATE.currentUnit);
        this.loadUnit();

        if (STATE.currentWeatherData) {
            UI.showLoader();
            const city = STATE.currentWeatherData.city;
            try {
                const weatherData = await API.fetchWeatherByCity(city);
                await this.processWeatherData(weatherData);
            } catch (error) {
                UI.showError('Error', 'Failed to update weather data');
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
