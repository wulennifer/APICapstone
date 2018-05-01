const PF_ENDPOINT = 'https://api.petfinder.com/';
const PF_KEY = '21932220ec6653a1bd95d471bf57a22a';
const GM_KEY = 'AIzaSyBF7QvTB30q44YdyF3DTGQMaMfZZfIWhr0';

let zipcode;
let map;

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 41.881832, lng: -87.6298},
  		zoom: 10,
  		zoomControl: true
	});
}

function watchLocationSubmit() {

	$('.search').on('click', '.submitButton', function(e) {
	  console.log("submitButton clicked");
		e.preventDefault();
		/*$('.landing-page').hide();*/
		/*$('.js-output').show();*/
		
		// get zipcode
		zipcode = $('input[name=zipcode]').val();
		console.log("Zip entered: " + zipcode);
		// reset input field
		$('input[name=zipcode]').val('');
		getShelters(zipcode, showShelters);
	});
}

function getShelters(zipcode, callback) {
	let method = 'shelter.find';
	let url = PF_ENDPOINT + method;
	console.log("url: " + url);

  $.ajax({
			url: url,
			jsonp: 'callback',
			dataType: 'jsonp',
			data: {
				key: PF_KEY,
				'location': zipcode,
				count: 10,
				output: 'basic',
				format: 'json'
			},
			success: callback
			
			/*function(response) {
			  console.log("success");
			}*/,
			error: function(xhr){
        console.log('Request Status: ' + xhr.status + ' Status Text: ' + xhr.statusText + ' ' + xhr.responseText);
			}
	});
}

function showShelters(data) {
  console.log("data is: " + JSON.stringify(data, null, 4));

  //loop through each shelter returned
/*  for (let i = 0; i < data.petfinder.shelters.shelter.length; i++) {
    let lat = data.petfinder.shelters.shelter[i].latitude.$t;
  	  console.log("Lat is: " + lat);
  	let lng = data.petfinder.shelters.shelter[i].longitude.$t;
  	  console.log("Lng is: " + lng);
  	let shelterId = data.petfinder.shelters.shelter[i].id.$t;
  	  console.log("shelterId is: " + shelterId);
  	let shelterName = data.petfinder.shelters.shelter[i].name.$t;
  	  console.log("shelterName is: " + shelterName);
  	let shelterEmail = data.petfinder.shelters.shelter[i].email.$t;
  	  console.log("shelterEmail is: " + shelterEmail);
  	let shelterPhone = data.petfinder.shelters.shelter[i].phone.$t;
  	  console.log("shelterPhone is: " + shelterPhone);
  }*/
  
  data.petfinder.shelters.shelter.forEach((shltr,index) => {
    $('.shelter-results').append(renderShelter(shltr));
  });

}

function renderShelter(shltr) {
	return `
	<div class='shelter-container'>
		<h2 id='shelter-name'>${shltr.name.$t}</h2>
		<h2 id='shelter-address'>${shltr.address1.$t} 
			${shltr.city.$t}
			${shltr.state.$t}
			${shltr.zip.$t}
			${shltr.country.$t}</h2>
		<h2 id='shelter-phone'>${shltr.phone.$t}</h2>
		<a href='mailto:${shltr.email.$t}' id='shelter-email'>${shltr.email.$t}</a>
	</div>
	`;
}

function nothingToShow() {
  
}

watchLocationSubmit();