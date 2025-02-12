document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#weather-form");

  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // Empêche le rechargement de la page
    const searchTerm = document.querySelector("#weather-search").value;
    await getData(searchTerm);
  });
});

async function getData(searchTerm) {
  try {
    const response = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${searchTerm}?unitGroup=us&key=7WAQUA6C6NPPFALWDVMS9FMDP&contentType=json`,
      {
        mode: "cors",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const requiredData = dataProcess(data);
    console.log(requiredData);
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
}

function dataProcess(data) {
  const requiredData = {
    location: data.resolvedAddress,
    currentConditions: {
      temperature: data.currentConditions.temp,
      conditions: data.currentConditions.conditions,
      humidity: data.currentConditions.humidity,
      windSpeed: data.currentConditions.windspeed,
    },
    forecast: data.days.map((day) => ({
      date: day.datetime,
      tempMax: day.tempmax,
      tempMin: day.tempmin,
      conditions: day.conditions,
    })),
  };

  return requiredData;
}
