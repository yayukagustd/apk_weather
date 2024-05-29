import React, { useEffect, useState, useCallback } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [dateTime, setDateTime] = useState({ date: '', time: '' });
  const [location, setLocation] = useState('');
  const apiKey = '22b45438c064c52dee7e17bd34c64c0f';

  const updateDateTime = () => {
    const now = new Date();
    setDateTime({
      date: now.toDateString(),
      time: now.toLocaleTimeString()
    });
  };

  const fetchWeather = async (lat, lon) => {
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const fetchForecast = async (lat, lon) => {
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
      const data = await response.json();
      setForecastData(data.list.filter((reading, index) => index % 8 === 0)); // Get daily forecast
    } catch (error) {
      console.error('Error fetching forecast data:', error);
    }
  };

  const handleGeolocationError = (error) => {
    console.error('Error getting geolocation:', error);
  };

  const showPosition = useCallback(async (position) => {
    const newPosition = { latitude: position.coords.latitude, longitude: position.coords.longitude };
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${newPosition.latitude}&lon=${newPosition.longitude}&accept-language=en`
      );
      const location = response.data.display_name;
      setLocation(location);
      fetchWeather(newPosition.latitude, newPosition.longitude);
      fetchForecast(newPosition.latitude, newPosition.longitude);
    } catch (error) {
      console.error('Error fetching reverse geocoding data:', error);
    }
  }, []);

  const getLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(showPosition, handleGeolocationError, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      });
    } else {
      console.log('Geolocation is not supported by this browser.');
    }
  }, [showPosition]);

  useEffect(() => {
    getLocation();
    updateDateTime();
    const intervalId = setInterval(updateDateTime, 1000);
    return () => clearInterval(intervalId);
  }, [getLocation]);

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!weatherData || forecastData.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="weather-container">
      <h1>My Weather App</h1>
      <div className="date-time">
        <p id="currentDate">{dateTime.date}</p>
        <div className="clock-container">
          <div className="clock-section">{dateTime.time}</div>
        </div>
      </div>
      <div className="location">
        <p id="selectedCity">{location}</p> 
      </div>
      <div className="feels">
        <p id="temperature">{weatherData.main.temp}°C</p>
        <p><span className="label">Feels like: </span><span id="feelsLike">{weatherData.main.feels_like}°C</span></p>
      </div>
      <div className="icon">
        <img id="icon" src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`} alt="weather icon" />
      </div>
      <div className="weather-details">
        <p><span className="label">Pressure: </span><span id="pressure">{weatherData.main.pressure} hPa</span></p>
        <p><span className="label">Humidity: </span><span id="humidity">{weatherData.main.humidity}%</span></p>
        <p><span className="label">Wind Speed: </span><span id="windSpeed">{weatherData.wind.speed} m/s</span></p>
        <p><span className="label">Dew Point: </span><span id="dewPoint">{(weatherData.main.temp - ((100 - weatherData.main.humidity) / 5)).toFixed(2)}°C</span></p>
      </div>
      <div className="forecast-container">
        {forecastData.map((forecast, index) => (
          <div className="forecast-day" key={index}>
            <p className="day">{new Date(forecast.dt_txt).toLocaleDateString('en-US', { weekday: 'short' })}</p>
            <img src={`http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`} alt="weather icon" />
            <p className="temperature">{Math.round(forecast.main.temp)}°C</p>
          </div>
        ))}
      </div>
      <button id="refreshWeatherData" onClick={handleRefresh}>
        Refresh
      </button>
    </div>
  );
}

export default App;
