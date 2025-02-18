document.addEventListener("DOMContentLoaded", () => {
  const elements = {
    form: document.querySelector("#weather-form"),
    searchInput: document.querySelector("#weather-search"),
    weatherInfo: document.querySelector("#weather-info"),
    forecastContainer: document.querySelector("#forecast-container"),
    introSection: document.querySelector("#intro-section"),
    location: document.querySelector("#location"),
    date: document.querySelector("#date"),
    temperature: document.querySelector("#temperature"),
    feelsLike: document.querySelector("#feels-like"),
    mainIcon: document.querySelector("#main-icon"),
    windSpeed: document.querySelector("#wind-speed"),
    humidity: document.querySelector("#humidity"),
    conditions: document.querySelector("#conditions"),
    fahrenheit: document.querySelector("#fahrenheit"),
    loadingSpinner: document.querySelector("#loading-spinner"),
  };

  let currentData = null;
  let isCelsius = true;

  elements.form.addEventListener("submit", handleSubmit);
  elements.fahrenheit.addEventListener("click", toggleUnit);

  async function handleSubmit(event) {
    event.preventDefault();
    elements.loadingSpinner.style.display = "block";

    const data = await getData(elements.searchInput.value);
    currentData = data;
    isCelsius = true;
    elements.fahrenheit.textContent = "Switch to Fahrenheit";
    updateUI(data);

    elements.loadingSpinner.style.display = "none";
  }

  async function getData(searchTerm) {
    try {
      const response = await fetch(
        `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${searchTerm}?unitGroup=metric&key=7WAQUA6C6NPPFALWDVMS9FMDP&contentType=json`,
        { mode: "cors" }
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return processData(await response.json());
    } catch (error) {
      alert("Unable to fetch weather data");
      console.error("Error:", error);
      elements.loadingSpinner.style.display = "none";
    }
  }

  function processData(data) {
    return {
      location: data.resolvedAddress,
      current: processCurrent(data.currentConditions),
      forecast: data.days.slice(0, 6).map(processForecast),
    };
  }

  function processCurrent(current) {
    return {
      tempC: Math.round(current.temp),
      tempF: Math.round((current.temp * 9) / 5 + 32),
      feelsLikeC: Math.round(current.feelslike),
      feelsLikeF: Math.round((current.feelslike * 9) / 5 + 32),
      conditions: current.conditions,
      humidity: current.humidity,
      windSpeed: current.windspeed,
      icon: getWeatherIcon(current.conditions),
    };
  }

  function processForecast(day) {
    return {
      dayName: new Date(day.datetime).toLocaleDateString("en-US", {
        weekday: "long",
      }),
      date: new Date(day.datetime).toLocaleDateString("en-US"),
      tempC: Math.round(day.temp),
      tempF: Math.round((day.temp * 9) / 5 + 32),
      conditions: day.conditions,
      icon: getWeatherIcon(day.conditions),
    };
  }

  function getWeatherIcon(conditions) {
    const icons = {
      cloud: "icons/cloud.png",
      rain: "icons/rain.png",
      snow: "icons/snow.png",
      overcast: "icons/cloud.png",
    };
    return (
      Object.entries(icons).find(([key]) =>
        conditions.toLowerCase().includes(key)
      )?.[1] || "icons/sun.png"
    );
  }

  function updateUI(data) {
    elements.location.textContent = data.location;
    elements.date.textContent = new Date().toLocaleDateString("en-US");

    elements.temperature.textContent = `${
      isCelsius ? data.current.tempC : data.current.tempF
    }°${isCelsius ? "C" : "F"}`;
    elements.feelsLike.textContent = `${
      isCelsius ? data.current.feelsLikeC : data.current.feelsLikeF
    }°${isCelsius ? "C" : "F"}`;

    elements.mainIcon.src = data.current.icon;
    elements.windSpeed.textContent = `${data.current.windSpeed} km/h`;
    elements.humidity.textContent = `${data.current.humidity} %`;
    elements.conditions.textContent = data.current.conditions;

    elements.forecastContainer.innerHTML = data.forecast
      .map((day) => {
        const tempDisplay = isCelsius ? day.tempC : day.tempF;
        const tempClass = getTemperatureClass(tempDisplay, isCelsius);
        return `
          <div class="forecast-day">
            <img src="${day.icon}" alt="${day.conditions}">
            <div>
              <div class="day-name">${capitalizeFirstLetter(day.dayName)}</div>
              <div class="date">${day.date}</div>
            </div>
            <div class="conditions ${tempClass}">${tempDisplay}°${
          isCelsius ? "C" : "F"
        }</div>
          </div>
        `;
      })
      .join("");

    elements.weatherInfo.style.display = "grid";
    elements.introSection.style.display = "none";
  }

  function getTemperatureClass(temp, isCelsius) {
    if (isCelsius) {
      if (temp > 25) return "temp-warm";
      if (temp > 15) return "temp-mild";
      return "temp-cool";
    } else {
      if (temp > 77) return "temp-warm";
      if (temp > 59) return "temp-mild";
      return "temp-cool";
    }
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function toggleUnit(event) {
    event.preventDefault();
    isCelsius = !isCelsius;
    elements.fahrenheit.textContent = isCelsius
      ? "Switch to Fahrenheit"
      : "Switch to Celsius";
    if (currentData) updateUI(currentData);
  }
});
