import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE = "https://api.openweathermap.org/data/2.5";
const FAVORITES_KEY = "weatherFavorites";
const UNITS_KEY = "weatherUnits";
const LAST_CITY_KEY = "lastCity";

const loadFavorites = () => {
  try {
    const s = localStorage.getItem(FAVORITES_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
};

const saveFavorites = (list) => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
};

const getStoredUnits = () => localStorage.getItem(UNITS_KEY) || "metric";

const Weather = () => {
  const [city, setCity] = useState(localStorage.getItem(LAST_CITY_KEY) || "");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [units, setUnits] = useState(getStoredUnits);
  const [favorites, setFavorites] = useState(loadFavorites);
  const [activeTab, setActiveTab] = useState("current"); // current | forecast

  const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
  const isMetric = units === "metric";
  const tempUnit = isMetric ? "°C" : "°F";
  const speedUnit = isMetric ? "m/s" : "mph";

  const hasApiKey = Boolean(API_KEY && API_KEY.trim());

  const fetchWeatherByCoords = useCallback(
    async (lat, lon) => {
      if (!hasApiKey) return;
      setLoading(true);
      setError("");
      try {
        const [weatherRes, forecastRes] = await Promise.all([
          axios.get(
            `${API_BASE}/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`
          ),
          axios.get(
            `${API_BASE}/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`
          ),
        ]);
        setWeather(weatherRes.data);
        setForecast(forecastRes.data);
        setCity(weatherRes.data.name);
        localStorage.setItem(LAST_CITY_KEY, weatherRes.data.name);
      } catch (err) {
        const isNetwork = err.message === "Network Error" || !err.response;
        setError(
          isNetwork
            ? "Network error. Check your connection and try again."
            : "Unable to load weather for this location."
        );
        setWeather(null);
        setForecast(null);
      } finally {
        setLoading(false);
      }
    },
    [API_KEY, units, hasApiKey]
  );

  const fetchWeather = useCallback(
    async (searchCity) => {
      const name = (searchCity || city).trim();
      if (!name) return;
      if (!hasApiKey) {
        setError("API key is missing. Add REACT_APP_WEATHER_API_KEY to .env");
        return;
      }
      setLoading(true);
      setError("");
      try {
        const [weatherRes, forecastRes] = await Promise.all([
          axios.get(
            `${API_BASE}/weather?q=${encodeURIComponent(name)}&units=${units}&appid=${API_KEY}`
          ),
          axios.get(
            `${API_BASE}/forecast?q=${encodeURIComponent(name)}&units=${units}&appid=${API_KEY}`
          ),
        ]);
        setWeather(weatherRes.data);
        setForecast(forecastRes.data);
        setCity(weatherRes.data.name);
        localStorage.setItem(LAST_CITY_KEY, weatherRes.data.name);
      } catch (err) {
        const isNetwork = err.message === "Network Error" || !err.response;
        const is404 = err.response?.status === 404;
        setError(
          isNetwork
            ? "Network error. Check your connection and try again."
            : is404
            ? "City not found. Please enter a valid city name."
            : "Something went wrong. Please try again."
        );
        setWeather(null);
        setForecast(null);
      } finally {
        setLoading(false);
      }
    },
    [city, units, API_KEY, hasApiKey]
  );

  useEffect(() => {
    if (hasApiKey && city) fetchWeather(city);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unitsRef = React.useRef(units);
  useEffect(() => {
    if (unitsRef.current === units) return;
    unitsRef.current = units;
    if (hasApiKey && weather) fetchWeather(weather.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") fetchWeather();
  };

  const handleUnitsToggle = () => {
    const next = units === "metric" ? "imperial" : "metric";
    setUnits(next);
    localStorage.setItem(UNITS_KEY, next);
  };

  const toggleFavorite = () => {
    if (!weather) return;
    const name = weather.name;
    const next = favorites.includes(name)
      ? favorites.filter((f) => f !== name)
      : [...favorites, name];
    setFavorites(next);
    saveFavorites(next);
  };

  const useMyLocation = () => {
    if (!hasApiKey) {
      setError("API key is missing. Add REACT_APP_WEATHER_API_KEY to .env");
      return;
    }
    setError("");
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
      () => {
        setError("Location access denied or unavailable.");
        setLoading(false);
      }
    );
  };

  const getBackgroundClass = () => {
    if (!weather) return "bg-gray-500";
    const condition = weather.weather[0].main.toLowerCase();
    if (condition.includes("clear")) return "bg-blue-400";
    if (condition.includes("cloud")) return "bg-gray-400";
    if (condition.includes("rain")) return "bg-blue-700";
    if (condition.includes("snow")) return "bg-gray-300";
    return "bg-gray-500";
  };

  const forecastByDay = forecast
    ? forecast.list.reduce((acc, item) => {
        const date = item.dt_txt.split(" ")[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(item);
        return acc;
      }, {})
    : null;

  const forecastDays = forecastByDay ? Object.keys(forecastByDay).slice(0, 5) : [];

  const isEmpty = !weather && !loading && !error;
  const showEmptyState = isEmpty && !city.trim();

  return (
    <div
      className={`max-w-lg mx-auto p-6 rounded-xl shadow-2xl text-center ${getBackgroundClass()} bg-opacity-85 backdrop-blur-lg`}
      role="main"
    >
      <h1 className="text-3xl font-bold text-white mb-4">Weather Dashboard</h1>

      {!hasApiKey && (
        <p className="text-yellow-200 bg-black/30 rounded-lg p-3 mb-4" role="alert">
          Add REACT_APP_WEATHER_API_KEY to your .env file to use this app.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <label htmlFor="city-input" className="sr-only">
          City name
        </label>
        <input
          id="city-input"
          type="text"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-[140px] border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
          aria-describedby={error ? "weather-error" : undefined}
        />
        <button
          type="button"
          onClick={() => fetchWeather()}
          disabled={loading || !city.trim()}
          className="bg-white hover:bg-gray-200 disabled:opacity-60 text-gray-800 font-bold py-3 px-5 rounded-lg transition duration-300"
          aria-busy={loading}
        >
          Search
        </button>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={loading || !hasApiKey}
          className="bg-white/90 hover:bg-white text-gray-800 font-bold py-3 px-4 rounded-lg transition duration-300"
          title="Use my location"
        >
          📍
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-4">
        <button
          type="button"
          onClick={handleUnitsToggle}
          className="bg-white/80 hover:bg-white text-gray-800 text-sm font-semibold py-2 px-4 rounded-lg"
        >
          °C / °F
        </button>
        {favorites.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center">
            {favorites.slice(0, 5).map((fav) => (
              <button
                key={fav}
                type="button"
                onClick={() => {
                  setCity(fav);
                  fetchWeather(fav);
                }}
                className="bg-white/70 hover:bg-white text-gray-800 text-sm py-2 px-3 rounded-lg"
              >
                {fav}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <p className="text-white text-lg" role="status" aria-live="polite">
          Loading...
        </p>
      )}

      {error && (
        <p id="weather-error" className="text-red-100 font-semibold bg-black/30 rounded-lg p-2" role="alert">
          {error}
        </p>
      )}

      {showEmptyState && (
        <p className="text-white/90 text-lg mt-4" role="status">
          Enter a city name or use the location button to see the weather.
        </p>
      )}

      {weather && (
        <>
          <div className="flex gap-2 justify-center mb-3">
            <button
              type="button"
              onClick={() => setActiveTab("current")}
              className={`px-4 py-2 rounded-lg font-medium ${activeTab === "current" ? "bg-white text-gray-800" : "bg-white/50 text-white"}`}
            >
              Current
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("forecast")}
              className={`px-4 py-2 rounded-lg font-medium ${activeTab === "forecast" ? "bg-white text-gray-800" : "bg-white/50 text-white"}`}
            >
              5-Day
            </button>
            <button
              type="button"
              onClick={toggleFavorite}
              className="px-4 py-2 rounded-lg bg-white/50 hover:bg-white text-white"
              title={favorites.includes(weather.name) ? "Remove from favorites" : "Add to favorites"}
              aria-label={favorites.includes(weather.name) ? "Remove from favorites" : "Add to favorites"}
            >
              {favorites.includes(weather.name) ? "★" : "☆"}
            </button>
          </div>

          {activeTab === "current" && (
            <div className="mt-4 p-6 bg-white/25 backdrop-blur-lg rounded-xl shadow-lg text-left">
              <h2 className="text-2xl font-semibold text-white">
                {weather.name}, {weather.sys.country}
              </h2>
              <p className="text-white text-lg flex items-center gap-2 flex-wrap">
                <img
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
                  alt=""
                  className="w-12 h-12"
                />
                <span className="font-bold capitalize">{weather.weather[0].description}</span>
              </p>
              <p className="text-white text-lg">
                Temperature: <span className="font-bold">{weather.main.temp}{tempUnit}</span>
              </p>
              <p className="text-white text-lg">
                Feels Like: <span className="font-bold">{weather.main.feels_like}{tempUnit}</span>
              </p>
              <p className="text-white text-lg">
                Humidity: <span className="font-bold">{weather.main.humidity}%</span>
              </p>
              <p className="text-white text-lg">
                Wind: <span className="font-bold">{weather.wind.speed} {speedUnit}</span>
              </p>
            </div>
          )}

          {activeTab === "forecast" && forecastDays.length > 0 && (
            <div className="mt-4 space-y-3">
              {forecastDays.map((day) => {
                const items = forecastByDay[day];
                const mid = items[Math.floor(items.length / 2)];
                const d = new Date(day);
                const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
                return (
                  <div
                    key={day}
                    className="p-4 bg-white/25 backdrop-blur-lg rounded-xl flex items-center justify-between flex-wrap gap-2"
                  >
                    <span className="text-white font-semibold">{dayName}</span>
                    <img
                      src={`https://openweathermap.org/img/wn/${mid.weather[0].icon}.png`}
                      alt=""
                      className="w-10 h-10"
                    />
                    <span className="text-white font-bold">{mid.main.temp}{tempUnit}</span>
                    <span className="text-white/90 text-sm capitalize">{mid.weather[0].description}</span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Weather;
