const $form = document.getElementById('form'),
	$input = document.getElementById('input-place'),
	$weatherImg = document.getElementById('weather-img'),
	$weatherIcon = document.getElementById('weather-icon'),
	$weatherDescription = document.getElementById('weather-description'),
	$weatherPlace = document.getElementById('weather-place'),
	$weatherTemp = document.getElementById('weather-temp'),
	$weatherDateTime = document.getElementById('weather-datetime'),
	$weatherCloudy = document.getElementById('weather-cloudy'),
	$weatherHumidity = document.getElementById('weather-humidity'),
	$weatherWind = document.getElementById('weather-wind'),
	$loader = document.getElementById('loader');
const key = '8c9fcb7a328362b6325eef63a706146c';

const conditionCodes = {
	Clouds: {
		icon: 'icons/clouds.svg',
		cover: 'img/clouds.jpg',
	},
	Clear: {
		icon: 'icons/clear.svg',
		cover: 'img/clear.jpg',
	},
	Snow: {
		icon: 'icons/snow.svg',
		cover: 'img/snow.jpg',
	},
	Rain: {
		icon: 'icons/rain.svg',
		cover: 'img/rain.jpg',
	},
	Drizzle: {
		icon: 'icons/drizzle.svg',
		cover: 'img/drizzle.jpg',
	},
	Thunderstorm: {
		icon: 'icons/thunderstorm.svg',
		cover: 'img/thunderstorm.jpg',
	},
	Fog: {
		icon: 'icons/fog.svg',
		cover: 'img/fog.jpg',
	},
};

const months = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Nov',
	'Oct',
	'Dec',
];

const days = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
];

const renderResult = (result) => {
	console.log(result);
	const { weather, main, name, clouds, wind } = result;
	let code = weather[0].main;
	code = code === 'Mist' ? 'Fog' : code;
	const { cover, icon } = conditionCodes[code];
	$weatherImg.src = cover;
	$weatherIcon.src = icon;
	$weatherDescription.innerText = weather[0].main;
	$weatherTemp.innerHTML = `
    ${main.temp}<sup class="weather__grades">°</sup>
  `;
	$weatherPlace.innerText = name;
	$weatherCloudy.innerText = clouds.all + '%';
	$weatherHumidity.innerText = main.humidity + '%';
	$weatherWind.innerText = (wind.speed * 3.6).toFixed(2) + 'Km/h';
};

const getWeather = async (place) => {
	try {
		const response = await fetch(
			`https://api.openweathermap.org/data/2.5/weather?q=${encodeURI(
				place
			)}&units=metric&appid=${key}`
		);
		const data = await response.json();
		renderResult(data);
	} catch (err) {
		console.log(err);
	}
};

const getWeatherByCoords = async (lat, lon) => {
	try {
		const response = await fetch(
			`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`
		);
		const data = await response.json();
		renderResult(data);
		$loader.remove();
	} catch (err) {
		console.log(err);
	}
};

const handleSubmit = (e) => {
	e.preventDefault();
	const place = $input.value.trim();
	if (!place) {
		return;
	}
	getWeather(place);
	$form.reset();
};

const generateDateTime = () => {
	const date = new Date(),
		year = date.getUTCFullYear().toString().substring(2),
		month = months[date.getMonth()],
		day = days[date.getDay()],
		dateM = date.getDate(),
		hour = date.getHours(),
		min = date.getMinutes();

	$weatherDateTime.innerText = `${hour < 10 ? '0' + hour : hour}:${
		min < 10 ? '0' + min : min
	} - ${day}, ${dateM < 10 ? '0' + dateM : dateM} ${month} ${year}`;
};

const getPosition = ($alert) => {
	let alert;
	if ($alert) {
		alert = document.getElementById('alert');
		alert.firstElementChild.remove();
	}
	navigator.geolocation.getCurrentPosition(
		({ coords }) => {
			if (alert) {
				alert.remove();
			}
			getWeatherByCoords(coords.latitude, coords.longitude);
			localStorage.setItem('allowLocation', true);
		},
		(err) => console.log(err)
	);
};

const requestPositionAccess = () => {
	const $alert = document.createElement('div');
	$alert.className = 'overlay';
	$alert.id = 'alert';
	$alert.innerHTML = `
    <div class="alert">
    <p>For use the app, please allow the access of your location. This is neccesary for give you a initial weather info</p>
      <button class="btn--access" onclick="getPosition(true)">Allow</button>
    </div>
  `;
	document.body.appendChild($alert);
};

let allowLocation = JSON.parse(localStorage.getItem('allowLocation')) || false;
console.log(allowLocation);
if (!allowLocation) {
	requestPositionAccess();
} else {
	getPosition();
}
generateDateTime();
setInterval(generateDateTime, 60000);

$form.addEventListener('submit', handleSubmit);
