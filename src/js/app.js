const $app = document.getElementById('app'),
	$form = document.getElementById('form'),
	$input = document.getElementById('input-place'),
	$weatherIcon = document.getElementById('weather-icon'),
	$weatherDescription = document.getElementById('weather-description'),
	$weatherPlace = document.getElementById('weather-place'),
	$weatherTemp = document.getElementById('weather-temp'),
	$weatherDateTime = document.getElementById('weather-datetime'),
	$weatherCloudy = document.getElementById('weather-cloudy'),
	$weatherHumidity = document.getElementById('weather-humidity'),
	$weatherWind = document.getElementById('weather-wind'),
	$loader = document.getElementById('loader');

let $weatherImg = document.getElementById('weather-img');

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

const permissionKey = 'allowLocation';

const showToast = (text) => {
	const $toast = document.createElement('div');
	$toast.className = 'toast';
	$toast.innerText = text;
	document.body.appendChild($toast);
	setTimeout(() => {
		$toast.classList.add('fadeOutDown');
		setTimeout(() => {
			$toast.remove();
		}, 400);
	}, 2000);
};

const renderResult = (result, first) => {
	if (result.cod === '404') {
		return showToast('No results found');
	}
	const { weather, main, name, clouds, wind } = result;
	let code = weather[0].main;
	code = code === 'Mist' ? 'Fog' : code;
	const { cover, icon } = conditionCodes[code];
	if (first) {
		$weatherImg.src = cover;
	} else {
		const newImg = new Image(innerWidth, innerHeight);
		newImg.className = 'weather__img weather__img--in';
		newImg.alt = 'Weather cover';
		newImg.src = cover;
		newImg.id = 'weather-img';
		newImg.onload = () => {
			$app.insertAdjacentElement('afterbegin', newImg);
			$weatherImg.classList.add('weather__img--out');
			setTimeout(() => {
				$weatherImg.remove();
				$weatherImg = newImg;
				$weatherImg.classList.remove('weather__img--in');
			}, 400);
		};
	}

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
		renderResult(data, true);
		$loader.remove();
	} catch (err) {
		console.log(err);
	}
};

const handleSubmit = (e) => {
	e.preventDefault();
	const place = $input.value.trim();
	if (!place) {
		showToast('Please enter a location');
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
	navigator.geolocation.getCurrentPosition(
		({ coords }) => {
			if ($alert) {
				$alert.remove();
			}
			getWeatherByCoords(coords.latitude, coords.longitude);
		},
		(err) => {
			$alert.innerHTML = `
        <div class="alert">
          <p>Permission was denied, please configure the permission in your browser</p>
        </div>
      `;
		}
	);
};

const updatePermissions = ({ target }) => {
	localStorage.setItem(permissionKey, target.state === 'granted');
};

const requestPositionAccess = () => {
	const $alert = document.getElementById('alert');
	$alert.firstElementChild.remove();
	navigator.permissions
		.query({ name: 'geolocation' })
		.then(function (result) {
			result.onchange = updatePermissions;
			if (result.state === 'granted') {
				getPosition($alert);
			} else if (result.state === 'denied') {
				$alert.innerHTML = $alert.innerHTML = `
        <div class="alert">
        <p>Permission was denied, please configure the permission in your browser</p>
        </div>
      `;
			} else {
				getPosition($alert);
			}
		});
};

const showAlert = () => {
	const $alert = document.createElement('div');
	$alert.className = 'overlay';
	$alert.id = 'alert';
	$alert.innerHTML = `
  <div class="alert">
  <p>Please, provide access of your location for use the app.</p>
    <button class="btn--access" onclick="requestPositionAccess()">Allow</button>
  </div>
`;
	document.body.appendChild($alert);
};

const allowLocation = JSON.parse(localStorage.getItem(permissionKey)) || false;
if (!allowLocation) {
	showAlert();
} else {
	getPosition();
}
generateDateTime();
setInterval(generateDateTime, 60000);

$form.addEventListener('submit', handleSubmit);
