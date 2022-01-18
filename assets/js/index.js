const API_KEY = '1909f245f9044ae84412f3cbc69c245a';
const inputSearchEl = $('#input-search');
const searchButton = $('button.searcher');
const cityTitleEl = $('.weather-info .city');
const weatherIcon = $('.weather-info .city-icon');
const cityTempEl = $('.weather-info .temperature');
const cityWindEl = $('.weather-info .wind');
const cityHumidityEl = $('.weather-info .humidity');
const cityUvEl = $('.weather-info .uv-index span');
const welcomeMsg = $('.welcome');
const weatherInfo = $('.weather-info');

function getWeatherInfo() {
    const getCountryInfo = `https://api.openweathermap.org/data/2.5/weather?q=${inputSearchEl.val()}&units=imperial&appid=${API_KEY}`;

    $.ajax(getCountryInfo)
        .done(function (response) {
            const lat = response.coord.lat;
            const lon = response.coord.lon;
            const getUvi = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&appid=${API_KEY}`;
            const cityName = response.name;
            const timeZone = parseInt(response.timezone) / 3600;
            const date = moment().utcOffset(timeZone).format('MM/DD/YYYY');
            const imgSrc = `https://openweathermap.org/img/wn/${response.weather[0].icon}.png`;
            const temp = response.main.temp;
            const wind = response.wind.speed;
            const humidity = response.main.humidity;

            cityTitleEl.html(`${cityName} (${date})<i class="weather-icon"><img src="${imgSrc}" alt="Weather icon"></i>`);
            cityTempEl.text(`Temp: ${temp} °F`);
            cityWindEl.text(`Wind: ${wind} MPH`);
            cityHumidityEl.text(`Humidity: ${humidity} %`);

            $.ajax(getUvi)
                .done(function (response) {
                    const uvIndex = response.current.uvi;

                    cityUvEl.text(`${uvIndex}`);

                    if (uvIndex < 3) {
                        cityUvEl.css('background-color', 'green');
                        cityUvEl.css('color', 'snow');
                    } else if (uvIndex < 6) {
                        cityUvEl.css('background-color', 'yellow');
                        cityUvEl.css('color', 'gray');
                    } else if (uvIndex < 8) {
                        cityUvEl.css('background-color', 'orange');
                        cityUvEl.css('color', 'snow');
                    } else if (uvIndex < 11){
                        cityUvEl.css('background-color', 'red');
                        cityUvEl.css('color', 'snow');
                    } else if (uvIndex >= 11) {
                        cityUvEl.css('background-color', 'purple');
                        cityUvEl.css('color', 'snow');
                    }
                })
        })
        .fail(function (e) {
            alert(`There was a problem: ${e.responseJSON.message}`);
        });

    welcomeMsg.addClass('d-none');
    weatherInfo.removeClass('d-none');
}

inputSearchEl.autocomplete({
    source: cities
});

inputSearchEl.on('keypress', function (e) {
    if (e.which == 13) {
        getWeatherInfo();
    }
});

searchButton.on('click', function () {
    getWeatherInfo();
});
