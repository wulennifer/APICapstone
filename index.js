'use strict';

const PF_ENDPOINT = 'http://api.petfinder.com/';
const GM_ENDPOINT = 'https://maps.googleapis.com/maps/api/geocode/json';
const YELP_ENDPOINT = 'https://api.yelp.com/v3/businesses/search';
const WIKI_ENDPOINT ='https://en.wikipedia.org/w/api.php';

let map;
let zipcode;

// Initiate Google Maps to 'map' <div>
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: -34.397, lng: 150.644},
  		zoom: 15,
  		zoomControl: true,
  		zoomControlOptions: {
  			position: google.maps.ControlPosition.LEFT_CENTER;
  		},
	});
}

// Retrieve zipcode from User and then initiate map based off of zipcode
function watchLocationSubmit() {
	const locationForm = $('form[name=zipcode-search]');
	const zipcodeField = $('input[name=zipcode]');

	locationForm.on('submit', function(e)) {
		e.preventDefault();
		// get zipcode
		zipcode = zipcodeField.val();
		// pass it to Google Maps endpoint
		fetchPFNearbyRescData(GM_ENDPOINT, zipcode);
		// reset input field
		zipcodeField.val('');
	}
}

// Create complete URL by adding zipcode to baseURL
function fetchPFNearbyRescData(baseURL, zipcode) {
}

// Given the zipcode, display all nearby rescues
function showRescues(zipcode) {
}