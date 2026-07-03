const apiKey = "9f780e304b5f41328ed52633260207";
let getWeather = document.getElementById("getWeatherbtn");
let locationBtn = document.getElementById("locationBtn");
let cityInput = document.getElementById("cityInput");
let hourlyChart = null;
getWeather.addEventListener("click", function () {
    let cityName = document.getElementById("cityInput").value.trim();

    if (cityName === "") {
        alert("Please enter a valid city name");
        return;
    }

    fetchWeather(cityName);
});

cityInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        getWeather.click();
    }
});

locationBtn.addEventListener("click", function () {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported.");

        return;
    }

    navigator.geolocation.getCurrentPosition(
        function (position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            fetchWeather(latitude + "," + longitude);
        },

        function () {
            alert("Unable to get your location.");
        }
    );
});

function fetchWeather(cityName) {
    setLoading(true);
    setLoading(false);

    let url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${cityName}&days=7&aqi=no&alerts=no`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            getWeather.value = "Search";
            getWeather.disabled = false;
            if (data.error) {
                alert(data.error.message);
                return;
            }

            displayCurrentWeather(data);
            displayForecast(data);
            displayHourlyChart(data);
        })
        .catch((error) => {
            getWeather.value = "Search";
            getWeather.disabled = false;
            console.log(error);
        });
}

function setLoading(isLoading) {
    const btn = document.getElementById("getWeatherbtn");

    if (isLoading) {
        btn.value = "Loading...";
        btn.disabled = true;
        btn.style.opacity = "0.7";
    } else {
        btn.value = "Search";
        btn.disabled = false;
        btn.style.opacity = "1";
    }
}

function displayCurrentWeather(data) {
    document.getElementById("city").innerText = ` ${data.location.name}, ${data.location.country}`;
    document.getElementById("currentIcon").src = "https:" + data.current.condition.icon;
    document.getElementById("condition").innerText = data.current.condition.text;
    document.getElementById("temperature").innerText = ` ${data.current.temp_c}°C `;
    document.getElementById("feels").innerText = `${data.current.feelslike_c}°C`;
    document.getElementById("humidity").innerText = `${data.current.humidity}%`;
    document.getElementById("wind").innerText = `${data.current.wind_kph} km/h`;
    document.getElementById("pressure").innerText = `${data.current.pressure_mb} mb`;
    document.getElementById("uv").innerText = `${data.current.uv}`;
    document.getElementById("sunrise").innerText = data.forecast.forecastday[0].astro.sunrise;
    document.getElementById("sunset").innerText = data.forecast.forecastday[0].astro.sunset;
    document.getElementById("updatedTime").innerText = "Last Updated: " + data.current.last_updated;

    changeBackground(data.current.condition.text, data.current.is_day);

    const current = document.getElementById("current");

    current.classList.remove("fadeIn");
    void current.offsetWidth;
    current.classList.add("fadeIn");
}

function changeBackground(condition, isDay) {
    let background = "weather.png";

    if (!isDay) {
        background = "night.jpg";
    } else if (condition.includes("Sunny") || condition.includes("Clear")) {
        background = "sunny.png";
    } else if (condition.includes("Cloud") || condition.includes("Smoky Haze")) {
        background = "cloudy.jpg";
    } else if (condition.includes("Rain") || condition.includes("Drizzle") || condition.includes("Mist")) {
        background = "rain.jpg";
    } else if (condition.includes("Snow")) {
        background = "snow.png";
    }

    document.body.style.background = `url('${background}') center/cover no-repeat`;
}

function displayForecast(data) {
    let forecastContainer = document.getElementById("forecastContainer");
    forecastContainer.innerHTML = "";

    data.forecast.forecastday.forEach(function (day) {
        let emoji = "🌤️";

        if (day.day.condition.text.includes("Sunny")) {
            emoji = "☀️";
        } else if (day.day.condition.text.includes("Cloud")) {
            emoji = "☁️";
        } else if (day.day.condition.text.includes("Rain")) {
            emoji = "🌧️";
        } else if (day.day.condition.text.includes("Snow")) {
            emoji = "❄️";
        } else if (day.day.condition.text.includes("Thunder")) {
            emoji = "⛈️";
        }
        const dayName = new Date(day.date).toLocaleDateString("en-US", {
            weekday: "long"
        });
        let card = ` 
           <div class="forecast-card">
           <p>${dayName}</p>
           <h4>${day.day.maxtemp_c}°C</h4>
           <p class="minTemp">
           Min ${day.day.mintemp_c}°C
           </p>
           <img src="https:${day.day.condition.icon}" class="weatherIcon">
           <p>${emoji} ${day.day.condition.text}</p>
           <p>🌧 ${day.day.daily_chance_of_rain}%</p>
           </div>
           `;
        forecastContainer.innerHTML += card;
    });
    const forecast = document.getElementById("next");

    forecast.classList.remove("fadeIn");
    void forecast.offsetWidth;
    forecast.classList.add("fadeIn");
}

fetchWeather("Chandigarh");

function displayHourlyChart(data) {
    const hourlyData = data.forecast.forecastday[0].hour;
    const labels = hourlyData.map(function (hour) {
        return hour.time.split(" ")[1];
    });
    const temperatures = hourlyData.map(function (hour) {
        return hour.temp_c;
    });

    const canvas = document.getElementById("hourlyChart");
    const ctx = canvas.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);

    gradient.addColorStop(0, "rgba(59,130,246,0.6)");
    gradient.addColorStop(1, "rgba(59,130,246,0)");

    if (hourlyChart) {
        hourlyChart.destroy();
    }

    hourlyChart = new Chart(canvas, {
        type: "line",

        data: {
            labels: labels,

            datasets: [
                {
                    label: "Temperature (°C)",
                    data: temperatures,

                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    backgroundColor: gradient,
                    pointRadius: 4,
                    pointHoverRadius: 8,
                    borderColor: "#4ea5ff",
                    pointBackgroundColor: "#ffffff",
                    pointBorderColor: "#4ea5ff",
                    pointBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {
                x: {
                    ticks: {
                        color: "#ffffff"
                    },
                    grid: {
                        display: false
                    }
                },

                y: {
                    ticks: {
                        color: "#ffffff"
                    },
                    grid: {
                        color: "rgba(255,255,255,.1)"
                    }
                }
            }
        }
    });
    const chart = document.getElementById("chart");

    chart.classList.remove("fadeIn");
    void chart.offsetWidth;
    chart.classList.add("fadeIn");
}
