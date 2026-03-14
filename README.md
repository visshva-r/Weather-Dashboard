# Weather Dashboard

A React app for current weather and 5-day forecast by city name or geolocation. Built with Create React App.

## Features

- **Current weather** – Temperature, feels like, humidity, wind, and conditions by city
- **5-day forecast** – Day-by-day outlook with temps and descriptions
- **Search by city** – Type a city name and press Enter or click Search
- **Use my location** – Get weather for your current position (browser location)
- **°C / °F toggle** – Preference saved in the browser
- **Favorites** – Star a city to save it; quick-select from the favorites bar
- **Empty state & errors** – Clear messages when no data, API key missing, or city not found

## Setup

### 1. Clone and install

```bash
git clone https://github.com/visshva-r/Weather-Dashboard.git
cd Weather-Dashboard
npm install
```

### 2. API key

The app uses [OpenWeatherMap](https://openweathermap.org/api). Get a free API key and add it locally:

1. Sign up at [OpenWeatherMap](https://openweathermap.org/api) and create an API key.
2. In the project root, create a `.env` file (see `.env.example`):
   ```env
   REACT_APP_WEATHER_API_KEY=your_api_key_here
   ```
3. Restart the dev server if it’s already running.

Never commit `.env`; it’s listed in `.gitignore`.

## Available scripts

| Command | Description |
|--------|-------------|
| `npm start` | Run the app in development at [http://localhost:3000](http://localhost:3000) |
| `npm test` | Run tests (use `npm test -- --watchAll=false` for a single run) |
| `npm run build` | Production build into the `build` folder |
| `npm run deploy` | Build and deploy to GitHub Pages (via `gh-pages`) |

## Tech stack

- React 19
- Axios (API calls)
- Tailwind CSS 4
- OpenWeatherMap API (weather + forecast)

## License

Private / use as you like.
