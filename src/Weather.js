import React,{ useState, useEffect } from "react";
import axios from "axios";

const Weather= () => {
  const[city, setCity]= useState(localStorage.getItem("lastCity") || "");
  const[weather, setWeather]= useState(null);
  const[loading, setLoading]= useState(false);
  const[error, setError]= useState("");

  const fetchWeather= async () => {
    if(!city) return;
    setLoading(true);
    setError("");
    
    try{
      const API_KEY= process.env.REACT_APP_WEATHER_API_KEY;
      const response= await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
      );
      setWeather(response.data);
      localStorage.setItem("lastCity",city);
    } catch(err) {
      setError("City not found. Please enter a valid city.");
      setWeather(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    if(city) fetchWeather();
  }, []);

  const getBackgroundClass= () => {
    if(!weather) return "bg-gray-200";
    const condition= weather.weather[0].main.toLowerCase();
    if(condition.includes("clear")) return "bg-blue-400";
    if(condition.includes("cloud")) return "bg-gray-400";
    if(condition.includes("rain")) return "bg-blue-700";
    if(condition.includes("snow")) return "bg-gray-300";
    return "bg-gray-200";
  };

  return (
    <div className={`max-w-md mx-auto p-6 rounded-lg shadow-xl text-center ${getBackgroundClass()} bg-opacity-70 backdrop-blur-lg`}>
      <h1 className="text-3xl font-bold text-white mb-4">Weather Dashboard</h1>

      <div className="flex items-center justify-center space-x-2 mb-4">
        <input
          type="text"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={fetchWeather}
          className="bg-white hover:bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg transition duration-300"
        >
          Search
        </button>
      </div>

      {loading && <p className="text-white text-lg">Loading...</p>}

      {error && <p className="text-red-500 font-semibold">{error}</p>}

      {weather && (
        <div className="mt-6 p-6 bg-white bg-opacity-30 backdrop-blur-lg rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-white">{weather.name}, {weather.sys.country}</h2>
          <p className="text-white text-lg">
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
              alt="Weather icon"
              className="inline-block w-12 h-12"
            />
            <span className="font-bold">{weather.weather[0].description}</span>
          </p>
          <p className="text-white text-lg">Temperature: <span className="font-bold">{weather.main.temp}°C</span></p>
          <p className="text-white text-lg">Feels Like: <span className="font-bold">{weather.main.feels_like}°C</span></p>
          <p className="text-white text-lg">Humidity: <span className="font-bold">{weather.main.humidity}%</span></p>
          <p className="text-white text-lg">Wind Speed: <span className="font-bold">{weather.wind.speed} m/s</span></p>
        </div>
      )}
    </div>
  );
};
export default Weather;
