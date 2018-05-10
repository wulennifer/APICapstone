const PF_ENDPOINT = 'https://api.petfinder.com/';
const PF_KEY = '21932220ec6653a1bd95d471bf57a22a';
const GM_KEY = 'AIzaSyBF7QvTB30q44YdyF3DTGQMaMfZZfIWhr0';

let zipcode;
let map;
let geocoder;
let shelterId;
let isEmpty = true;
let prevInfoWindow = false;

function initMap() {
  geocoder = new google.maps.Geocoder();
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 41.881832, lng: -87.6298},
  		zoom: 12,
  		zoomControl: true
	});
}

function refreshMap(zipcode) {
  geocoder.geocode( { 'address': zipcode}, function(results, status) {
      if (status == 'OK') {
        map.setCenter(results[0].geometry.location);
        /* map.setZoom(14); */
        } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
  });
}

function IsValidZipCode(zipcode) {
    let isValid = /^[0-9]{5}(?:-[0-9]{4})?$/.test(zipcode);
    if (!isValid) {
        document.getElementById("ErrorDiv").innerHTML = "Invalid";
        return false;
    } else {
        document.getElementById("ErrorDiv").innerHTML = "";
        return true;
    }
}

function watchLocationSubmit() {

	$('.search').on('click', '.submitButton', function(e) {
		e.preventDefault();
    // hide modal
		$('.modal').css('display','none');
    // empty shelter-results
    $('.shelter-results').empty();
		// get zipcode
		zipcode = $('input[name=zipcode]').val();
		// reset input field
		$('input[name=zipcode]').val('');
		getShelters(zipcode, showShelters);
    refreshMap(zipcode);
	});
}

function getShelters(zipcode, callback) {
	const method = 'shelter.find';
	const url = PF_ENDPOINT + method;

  $.ajax({
			url: url,
			jsonp: 'callback',
			dataType: 'jsonp',
			data: {
				key: PF_KEY,
				'location': zipcode,
				count: 20,
				output: 'basic',
				format: 'json'
			},
			success: callback,
			error: function(xhr){
        console.log('Request Status: ' + xhr.status + ' Status Text: ' + xhr.statusText + ' ' + xhr.responseText);
			}
	});
}

function getPets(id, callback) {
  const method = 'shelter.getPets';
  const url = PF_ENDPOINT + method;
  
  $.ajax({
			url: url,
			jsonp: 'callback',
			dataType: 'jsonp',
			data: {
				key: PF_KEY,
				'id': id,
				/* count: 5, */
				output: 'basic',
				format: 'json'
			},
			success: function(response) {
			  console.log(response);
        // pass array of pets to callback function
        callback(response.petfinder.pets.pet);
			},
			error: function(xhr){
        console.log('Request Status: ' + xhr.status + ' Status Text: ' + xhr.statusText + ' ' + xhr.responseText);
			}
	});
}

function showShelters(data) {
  //console.log("data is: " + JSON.stringify(data, null, 4));

  data.petfinder.shelters.shelter.forEach((shltr,index) => {
    $('.shelter-results').append(renderShelter(shltr));
    createMarker(shltr);
    shelterId = shltr.id.$t;
  });
  watchShelterClick();
}

function showPets(data) {
  // unhide the modal
  $('.modal').css('display','block');
  $('.modal').append('<div class="pet-content"></div>');

  data.forEach((p, index) => {
    // populate with renderPet
    $('.pet-content').append(renderPet(p));
    isEmpty = false;
  });
}

function renderModal() {
  $('main').append(`
  <div id="petModal" class="modal">
    <header class="modal-header"> 
      <span onclick="document.getElementById('petModal').style.display='none'"
        class="exit-button">&times;</span>
      <h2>Available Pets</h2>
    </header>
  </div>
  `);
}
 
function renderShelter(shltr) {
	return `
	<div class='shelter-container' id='${shltr.id.$t}'>
		<h2 class='shelter-name'>${shltr.name.$t}</h2>
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

function watchShelterClick(){
	$('.shelter-results').on('click', '.shelter-container', function(e) {
    e.preventDefault();
    // empty .pet-container of any results
    if(!isEmpty) {
      $('.pet-content').remove();
      isEmpty = true;
    }

    shelterId = $(this).attr('id');    
    getPets(shelterId, showPets);
	});
}

function renderPet(p) {
//console.log("pet: " + JSON.stringify(p, null, 4));

// ternary operator - if p.description exists then set the value to $t, if not make it an empty string 
/* const description = p.description ? p.description.$t : 'None Available.'; */

	return `
	<div class='pet-container'>
	  <img src='${p.media.photos.photo[1].$t}' id='pet-picture'/>
		<h3 id='pet-name'>Name: ${p.name.$t}</h3>
		<h3 id='pet-status'>Status: ${p.status.$t}</h3>
		<h3 id='pet-age'>Age: ${p.age.$t}</h3>
		<h3 id='pet-size'>Size: ${p.size.$t}</h3>
		<h3 id='pet-sex'>Sex: ${p.sex.$t}</h3>
		<h3 id='pet-breed'>Breed: ${p.breeds.breed.$t}</h3>
	</div>
	`;
}

function createMarker(shltr) {
  let position = new google.maps.LatLng(shltr.latitude.$t, shltr.longitude.$t);

  let infoWindow = new google.maps.InfoWindow();
  infoWindow.setContent('<h3>' + shltr.name.$t + '</h3><h4>' + shltr.email.$t + '</h4><h4>' + shltr.phone.$t + '</h4>'); 
  
  let marker = new google.maps.Marker({ position: position, map: map }); marker.addListener('click', function() { 
    // check to see if another infoWindow is open
    if (prevInfoWindow) {
      prevInfoWindow.close();
    }
    prevInfoWindow = infoWindow;
    infoWindow.open(map, marker);
    });
}

// $() makes sure page is loaded before calling function
$(watchLocationSubmit());
$(renderModal());