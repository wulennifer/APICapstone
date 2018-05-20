const PF_ENDPOINT = 'https://api.petfinder.com/';
const PF_KEY = '21932220ec6653a1bd95d471bf57a22a';
const GM_KEY = 'AIzaSyBF7QvTB30q44YdyF3DTGQMaMfZZfIWhr0';

let zipcode;
let map;
let geocoder;
let shelterId;
let isEmpty = true;
let prevInfoWindow = false;

// Initiate map when page loads
function initMap() {
  geocoder = new google.maps.Geocoder();
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 41.881832, lng: -87.6298},
  		zoom: 12,
  		zoomControl: true
	});
}

// Refresh map when new zipcode is input into form
function refreshMap(zipcode) {
  geocoder.geocode( { 'address': zipcode}, function(results, status) {
      if (status == 'OK') {
        map.setCenter(results[0].geometry.location);
        } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
  });
}

// Check whether or not a zipcode is valid against Regular Expression
function isValidZip(zipcode) {
    const pattern = new RegExp(/^([0-9]{5})(-[0-9]{4})?$/i);
    return pattern.test(zipcode);
};

// Watch for search form submit
function watchLocationSubmit() {
	$('.search').on('click', '.submitButton', function(e) {
    // If zipcode field is empty
    if($('#search-zipcode').val()=='') {
      alert('Please enter a zipcode.');
      return false;
    }
    // If zipcode is not valid
    else if(!isValidZip($('#search-zipcode').val())) {
      alert('Please enter a valid USA zipcode.');
      return false;
    }

		e.preventDefault();
    removeAndCloseModal();
    // Empty shelter-results
    $('.shelter-results').empty();
		// Get zipcode
		zipcode = $('input[name=zipcode]').val();
		// Reset input field
		$('input[name=zipcode]').val('');
		getShelters(zipcode, showShelters);
    refreshMap(zipcode);
	});
}

function addBlur() {
  $('.header, .landing-page, .map, .shelter-results').addClass('blur-filter');
}

function removeBlur() {
  $('.header, .landing-page, .map, .shelter-results').removeClass('blur-filter');
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
				output: 'basic',
				format: 'json'
			},
			success: function(response) {
        // Pass array of pets to callback function
        callback(response.petfinder.pets.pet);
			},
			error: function(xhr){
        console.log('Request Status: ' + xhr.status + ' Status Text: ' + xhr.statusText + ' ' + xhr.responseText);
			}
	});
}

function showShelters(data) {
  data.petfinder.shelters.shelter.forEach((shltr,index) => {
    $('.shelter-results').append(renderShelter(shltr));
    createMarker(shltr);
    shelterId = shltr.id.$t;
  });
  watchShelterClick();
}

function showPets(data) {
  // Unhide the modal
  openModal();
  $('.modal').html(`
    <header class="modal-header">
      <h2>Available Pets</h2>
      <span onclick="exitModal()" class="exit-button">&times;</span>
    </header><div class="pet-content"></div>`
  );
  
  if (data.length == undefined) {
    $('.pet-content').append(`
    <h2 class='nothing-to-show'>No available pets at this time. :( </h2>`);
  } else {
      data.forEach((p, index) => {
      // Populate with renderPet()
      $('.pet-content').append(renderPet(p));
      isEmpty = false;
    });
  }
}

function renderModal() {
  $('main').append(`
    <div id="petModal" class="modal" aria-live='assertive'></div>
  `);
}

function removeModalContent() {
  // Empty .pet-content of any results
  $('.pet-content').remove();
}

function openModal() {
  $('.modal').css('display','block');
}

function closeModal() {
  // Hide modal
  $('.modal').css('display','none'); 
}

function removeAndCloseModal() {
  removeModalContent();
  closeModal();
}

function exitModal() {
  $('main').on('click', '.exit-button', function(e) {
    e.preventDefault();
    removeAndCloseModal();
    removeBlur();
	});
}

function isUndefined(field) {
  if (field === undefined) {
    return "";
  } else {
    return field;
  }
}

function isUndefinedBreak(field) {
  if (field === undefined) {
    return "<br>";
  } else {
    return field;
  }
}
 
function renderShelter(shltr) {
	return `
	<div class='shelter-container' id='${shltr.id.$t}'>
		<h2 class='shelter-name'>${isUndefinedBreak(shltr.name.$t)}</h2>
		<h2 id='shelter-address'>${isUndefined(shltr.address1.$t)} 
			${isUndefined(shltr.city.$t)}
			${isUndefined(shltr.state.$t)}
			${isUndefined(shltr.zip.$t)}
			${isUndefined(shltr.country.$t)}</h2>
		<h2 id='shelter-phone'>${isUndefinedBreak(shltr.phone.$t)}</h2>
		<a href='mailto:${isUndefinedBreak(shltr.email.$t)}' id='shelter-email'>${isUndefinedBreak(shltr.email.$t)}</a>
	</div>
	`;
}

function watchShelterClick(){
	$('.shelter-results').on('click', '.shelter-container', function(e) {
    e.preventDefault();
    // Empty .pet-content of any results
    if(!isEmpty) {
      removeModalContent();
      isEmpty = true;
    }

    shelterId = $(this).attr('id');    
    getPets(shelterId, showPets);
    addBlur();
	});
}

function renderPet(p) {
  // Ternary operator - if p.description exists then set the value to $t, if not make it an empty string 
  //const description = p.description ? p.description.$t : 'None Available.';

  let animalBreed = `${isUndefinedBreak(p.breeds.breed.$t)}`;
  let firstTwoBreed = animalBreed.split(' ').slice(0,2).join(' ');

	return `
	<div class='pet-container'>
	  <img src='${isUndefinedBreak(p.media.photos.photo[2].$t)}' id='pet-picture' alt='Picture of available pet.'/>
		<h3 id='pet-name'>Name: ${p.name.$t}</h3>
		<h3 id='pet-age'>Age: ${p.age.$t}</h3>
		<h3 id='pet-size'>Size: ${p.size.$t}</h3>
		<h3 id='pet-sex'>Sex: ${p.sex.$t}</h3>
		<h3 id='pet-breed'>${firstTwoBreed}</h3>
	</div>
	`;
}

function createMarker(shltr) {
  let position = new google.maps.LatLng(shltr.latitude.$t, shltr.longitude.$t);

  let infoWindow = new google.maps.InfoWindow();
  infoWindow.setContent('<h3>' + shltr.name.$t + '</h3><h4>' + shltr.email.$t + '</h4><h4>' + shltr.phone.$t + '</h4>'); 
  
  let marker = new google.maps.Marker({ position: position, map: map }); marker.addListener('click', function() { 
    // Check to see if another infoWindow is open
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
