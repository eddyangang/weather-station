// add cards

//add location

// add weather api

// event listeners

//uv indicator

//weather icon indicator
var pastSearches = [];
var lastSearch = "";
var fiveDays = ["dayOne", "dayTwo", "dayThree", "dayFour", "dayFive"];

$(document).ready(function () {
    var APIKey = "400be8ef8a6a36c61d28d6827f773914";

    function displayWeather(place) {

        // ajax call for weather of user's choice in city
        var queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${place}&units=imperial&appid=${APIKey}`;
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            // get icon code for weather
            var iconcode = response.weather[0].icon;
            // // this is for OWM default icons
            // var iconurl = `https://openweathermap.org/img/w/${iconcode}.png`;

            // Using custom icons
            var iconurl = `assets/img/icons/${iconcode}.png`
            $('#forecast-img').html(`<img src="${iconurl}"/>`)

            // parse the data from response
            var city = response.name;
            var country = response.sys.country
            var temp = Math.round(response.main.temp)
            var wind = Math.round(response.wind.speed * 10) / 10

            // display the data to the user
            $("#city").text(`${city}, ${country}`);
            $("#windspeed").text(`${wind}mph`);
            $("#humidity").text(`${response.main.humidity}%`);
            $("#temperature").text(`${temp} °F`);

            // get the lat and lon of coordinate to retrieve UV index
            var latitude = response.coord.lat;
            var longitude = response.coord.lon;
            // get the UV index
            displayUV(latitude, longitude);

            // set the latest seach as last search
            lastSearch = city;

            // If the city was no in the array of pastSearches, then push it to the end
            if (!pastSearches.includes(city)) {
                pastSearches.push(city)
            }
            // save the searches into localstorage
            localStorage.setItem("WeatherSearches", JSON.stringify({
                pastSearches: pastSearches,
                lastSearch: lastSearch
            }))

            // display the 5 day forecast for that city
            displayForecast(city);

            // reset and display the city search history
            cityDisplay();
        });

    }

    function displayForecast(city) {
        // ajax call to retrieve 5-day forecast in 3hr increments
        var queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${APIKey}&units=imperial`;

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            // clear last 5-day forecastsearch
            $("#fiveDayForecast").empty();

            // get the forecast array
            var forecast = response.list;

            // used to get the forecast for subsequent days, except today
            var forecastIndex = [8, 16, 24, 32, 39]
            console.log(forecast);
            
            // create cards for 5-day forecast and display the content onto the card.
            for (let i = 0; i < fiveDays.length; i++) {
                // index for forecast
                var j = forecastIndex[i]
                // date in ms since 1970
                var longDate = forecast[j].dt;
                // convert date to standard form
                var date = new Date(longDate * 1000)
                // convert date to string
                date = date.toDateString()

                // get weather icon for each day in forecast
                var weatherIcon = forecast[j].weather[0].icon;

                // // Use this for OWM default icons
                // var iconurl = `https://openweathermap.org/img/w/${weatherIcon}.png`;
                // Using custom icons
                var iconurl = `assets/img/icons/${weatherIcon}.png`
                // set variables to main forcast data
                var temp = Math.round(forecast[j].main.temp);
                var tempMax = Math.ceil(forecast[j].main.temp_max);
                var tempMin = Math.floor(forecast[j].main.temp_min);
                var humidity = Math.round(forecast[j].main.humidity)
                var description = forecast[j].weather[0].description;
                var feelsLike = Math.round(forecast[j].main.feels_like)
                // for each day in 5-day forecast
                var day = fiveDays[i];
                // create a card and give the card an id of the day
                var card = $(`<div class="card-flip-container"><div class="card-flip text-center" id=${day}><div class="frontcard bg-light border rounded-lg"><h6 class="my-2"></h6><img/><p></p><p></p></div><div class="backcard bg-info border rounded"><h6></h6><p></p><p></p><p></p></div></div></div>`)

                // append card to html
                $("#fiveDayForecast").append(card)

                // display the data onto the front card
                $(`#${day}>.frontcard>h6`).text(`${date}`)
                $(`#${day}>.frontcard>img`).attr("src", iconurl)
                $(`#${day}>.frontcard>p`).text(`Temperature: ${temp}°F`)
                $(`#${day}>.frontcard>p`).last().text(`Humidity: ${humidity}%`)
                // display the data onto the back card
                $(`#${day}>.backcard>h6`).text(`${description}`)
                $(`#${day}>.backcard>p`).text(`Min Temperaure: ${tempMin}°F`)
                $(`#${day}>.backcard>p`).first().text(`Feels like: ${feelsLike}°F`)
                $(`#${day}>.backcard>p`).last().text(`Max Temperature: ${tempMax}°F`)
            }

        })

    }
    // Initialize
    function initialize() {
        // Get and set date from moment.js library
        $('#date').text(moment().format("dddd, MMMM Do YYYY"));

        // Retrieve past weather searches
        var storage = JSON.parse(localStorage.getItem("WeatherSearches"));

        // If there is localStorage then
        if (storage) {
            // Get the last city search from user
            lastSearch = storage.lastSearch
            // Get the past weather search from user
            pastSearches = storage.pastSearches;
            // display weather for last city search
            displayWeather(lastSearch)
        } else {
            // display the weather for berkeley
            displayWeather("Berkeley")
        }

    }

    function cityDisplay() {
        // clear old searches
        $("ul").empty();
        // reenter all cities
        for (let i = 0; i < pastSearches.length; i++) {
            var li = $('<li>')
            li.text(pastSearches[i])
            li.addClass("list-group-item")
            li.append(`<button type="button" class="close" aria-label="Close"><span id =${pastSearches[i]} aria-hidden="true">&times;</span></button>`)
            $('ul').append(li)
        }
    }

    function displayUV(lat, lon) {

        // Ajax call to retrive the UV index
        var uvURL = `https://api.openweathermap.org/data/2.5/uvi/forecast?appid=${APIKey}&lat=${lat}&lon=${lon}&cnt=${1}`

        $.ajax({
            url: uvURL,
            method: "GET"
        }).then(function (response) {

            // round the UV index
            var uv = Math.round(response[0].value * 10) / 10;

            // remove styling from last UV index
            $('#uv').removeClass()
            //set text for UV index
            $('#uv').text(uv)
            // add classes for the UV index
            $('#uv').addClass("p-1 border-0 rounded-lg")

            // Adjust UV highlight based on severity.
            if (uv > 8) {
                $('#uv').addClass("bg-danger")
            } else if (uv > 5) {
                $('#uv').addClass("bg-warning")
            } else {
                $('#uv').addClass("bg-light")
            }
        });

    }

    // Event listener for search button
    $('#searchBtn').on("click", function () {
        var place = $('#search-bar').val()
        $('#search-bar').val("")
        displayWeather(place)
    });

    // Event listener for list item clicks
    $(document).on("click", "li", function () {
        var place = ($(this).text());
        place = place.substring(0, place.length - 1)
        displayWeather(place)
    })

    // Event listener for close button
    $(document).on("click", ".close", function (e) {
        // Prevents event listener for list items from activating
        e.stopPropagation();

        // get close button 
        var closeBtn = e.target;

        // retrieve id of close button
        var id = closeBtn.id

        // Remove the city from array list.
        pastSearches = pastSearches.filter(a => a !== id)

        // set last search as first element in array to prevent deleted city for reappearing when page is refreshed.
        lastSearch = pastSearches[0];

        // save the searches into localstorage
        localStorage.setItem("WeatherSearches", JSON.stringify({
            pastSearches: pastSearches,
            lastSearch: lastSearch
        }))
        // get the list item for which the close btn was selcted for
        var listItem = closeBtn.parentNode.parentNode;
        // get parent of list items
        var ul = listItem.parentNode;

        // remove selcted list item from screen
        ul.removeChild(listItem)
    })

    // Initialize page
    initialize();

})