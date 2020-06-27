// add cards

//add location

// add weather api

// event listeners

//uv indicator

//weather icon indicator
var pastSearches = [];
var fiveDays = ["dayOne", "dayTwo", "dayThree", "dayFour", "dayFive"];

$(document).ready(function () {
    var APIKey = "400be8ef8a6a36c61d28d6827f773914";

    function displayWeather(place) {
        var queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${place}&units=imperial&appid=${APIKey}`;
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {


            var iconcode = response.weather[0].icon;
            var iconurl = `https://openweathermap.org/img/w/${iconcode}.png`;
            $('#forecast-img').attr("src", iconurl)

            var city = response.name;
            var country = response.sys.country
            var temp = Math.round(response.main.temp)
            var wind = Math.round(response.wind.speed * 10) / 10

            $("#city").text(`${city}, ${country}`);
            $("#windspeed").text(`${wind}mph`);
            $("#humidity").text(`${response.main.humidity}%`);
            $("#temperature").text(`${temp} °F`);

            var latitude = response.coord.lat;
            var longitude = response.coord.lon;
            displayUV(latitude, longitude);


            if (!pastSearches.includes(city)) {
                pastSearches.push(city)
                localStorage.setItem("pastSearches", JSON.stringify(pastSearches))
            }

            displayForecast(city);
            cityDisplay();
        });

    }

    function displayForecast(city) {
        $("#fiveDayForecast").empty()

        var queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${APIKey}&units=imperial`;

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            var forecast = response.list;
            var forecastArray = [8, 16, 24, 32, 39]

            for (let i = 0; i < fiveDays.length; i++) {
                var j = forecastArray[i]
                var longDate = forecast[j].dt;
                var date = new Date(longDate * 1000)
                date = date.toDateString()


                var weatherIcon = forecast[j].weather[0].icon;
                var iconurl = `https://openweathermap.org/img/w/${weatherIcon}.png`;

                var temp = Math.round(forecast[j].main.temp);
                var tempMax = Math.ceil(forecast[j].main.temp_max);
                var tempMin = Math.floor(forecast[j].main.temp_min);
                var humidity = Math.round(forecast[j].main.humidity)

                var description = forecast[j].weather[0].description;
                var day = fiveDays[i];
                var card = $(`<div class="card-flip-container"><div class="card-flip text-center" id=${day}><div class="frontcard bg-light border rounded-lg"><h6 class="my-2"></h6><img/><p></p><p></p></div><div class="backcard bg-info border rounded"><h6></h6><p></p><p></p></div></div></div>`)


                $("#fiveDayForecast").append(card)

                $(`#${day}>.frontcard>h6`).text(`${date}`)
                $(`#${day}>.frontcard>img`).attr("src", iconurl)
                $(`#${day}>.frontcard>p`).text(`Temperature: ${temp}°F`)
                $(`#${day}>.frontcard>p`).last().text(`Humidity: ${humidity}%`)

                $(`#${day}>.backcard>h6`).text(`${description}`)
                $(`#${day}>.backcard>p`).text(`Min Temperaure: ${tempMin}°F`)
                $(`#${day}>.backcard>p`).last().text(`Max Temperature: ${tempMax}°F`)
            }

        })

    }

    function initialize() {
        $('#date').text(moment().format("dddd, MMMM Do YYYY"));
        var storage = JSON.parse(localStorage.getItem("pastSearches"));

        if (storage) {
            pastSearches = storage;
            displayWeather(pastSearches[pastSearches.length - 1])
        } else {
            displayWeather("Berkeley")
        }

        cityDisplay();
    }

    function cityDisplay() {
        $("ul").empty();

        for (let i = 0; i < pastSearches.length; i++) {
            var li = $('<li>')
            li.text(pastSearches[i])
            li.addClass("list-group-item")
            $('ul').append(li)
        }
    }

    function displayUV(lat, lon) {
        var uvURL = `https://api.openweathermap.org/data/2.5/uvi/forecast?appid=${APIKey}&lat=${lat}&lon=${lon}&cnt=${1}`

        $.ajax({
            url: uvURL,
            method: "GET"
        }).then(function (response) {
            var uv = Math.round(response[0].value * 10) / 10;
            $('#uv').removeClass()
            $('#uv').text(uv)
            $('#uv').addClass("p-1 border-0 rounded-lg")

            if (uv > 8) {
                $('#uv').addClass("bg-danger")
            } else if (uv > 5) {
                $('#uv').addClass("bg-warning")
            } else {
                $('#uv').addClass("bg-light")
            }
        });

    }


    $('#searchBtn').on("click", function () {
        var place = $('#search-bar').val()
        $('#search-bar').val("")
        displayWeather(place)

    });

    $(document).on("click", "li", function () {
        var place = ($(this).text());
        displayWeather(place)

    })

    initialize();
})