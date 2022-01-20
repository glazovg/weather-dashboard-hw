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
const weatherForecast = $('.weather-forecast');
const weatherCards = $('.weather-forecast .card-body');
const historyButtons = $('.history button');
let maxHistory = 8;
// let count = localStorage.getItem('count') ? localStorage.getItem('count') : 0;
let count = 0;

async function getWeatherInfo(city) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${API_KEY}`;

    $.ajax(weatherUrl)
        .done(function (response) {
            const lat = response.coord.lat;
            const lon = response.coord.lon;
            const oneCallUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=imperial&appid=${API_KEY}`;
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

            $.ajax(oneCallUrl)
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
                    } else if (uvIndex < 11) {
                        cityUvEl.css('background-color', 'red');
                        cityUvEl.css('color', 'snow');
                    } else if (uvIndex >= 11) {
                        cityUvEl.css('background-color', 'purple');
                        cityUvEl.css('color', 'snow');
                    }

                    //For with fixed loop since forecast data is only for 5 days
                    for (let i = 0; i < 5; i++) {
                        //Since daily[0] is for current day, it'll be taken from 1-5 to get 5 days forecast
                        const forecastImgSrc = `http://openweathermap.org/img/wn/${response.daily[i + 1].weather[0].icon}.png`;
                        const date = moment.unix(response.daily[i + 1].dt).format("MM/DD/YYYY");
                        const temp = response.daily[i + 1].temp.day;
                        const wind = response.daily[i + 1].wind_speed;
                        const humidity = response.daily[i + 1].humidity;

                        $(weatherCards[i]).find('.card-title').html(`${date}<i><img src="${forecastImgSrc}" alt="Weather icon"></i>`);
                        $(weatherCards[i]).find('.temperature').text(`Temp: ${temp} °F`);
                        $(weatherCards[i]).find('.wind').text(`Wind: ${wind} MPH`);
                        $(weatherCards[i]).find('.humidity').text(`Humidity: ${humidity} %`);
                    }
                })

            welcomeMsg.addClass('d-none');
            weatherInfo.removeClass('d-none');
            weatherForecast.removeClass('d-none');
            //saveSearch(city);
        })
        .fail(function (e) {
            alert(`There was a problem: ${e.responseJSON.message}`);
        });
}

function saveSearch(search) {
    for (const button of historyButtons) {
        if($(button).text() === search) return;
    };

    if (count === 8) count = 0;

    $(historyButtons[count]).text(search);
    $(historyButtons[count]).removeClass('d-none');
    search = search.toLowerCase().trim();

    localStorage.setItem(`history-${count}`, search);
    count++;
    localStorage.setItem('count', count);
}

for (let i = 0; i < maxHistory; i++) {
    if (localStorage.getItem(`history-${i}`)) {
        const city = localStorage.getItem(`history-${i}`);
        const capitalizeCity = city.charAt(0).toUpperCase() + city.slice(1);

        $(historyButtons[i]).text(capitalizeCity);
        $(historyButtons[i]).removeClass('d-none');
    }
}

inputSearchEl.autocomplete({
    source: cities
});

inputSearchEl.on('keypress', function (e) {
    if (e.which == 13) {
        try {
            getWeatherInfo(inputSearchEl.val());
        } catch (error) {
            return;
        }
        saveSearch(inputSearchEl.val());
        //getWeatherInfo(inputSearchEl.val());
    }
});

searchButton.on('click', function () {
    try {
        getWeatherInfo(inputSearchEl.val());
        //saveSearch(city);
    } catch (error) {
        return;
    }
    saveSearch(inputSearchEl.val());
    //getWeatherInfo(inputSearchEl.val());
});

for (const button of historyButtons) {
    $(button).on('click', function () {
        getWeatherInfo($(button).text());
    });
}