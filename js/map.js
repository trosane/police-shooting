// Function to draw your map
var drawMap = function() {

	// Create map and set view

	var map = L.map('crime-map').setView([39.1273653, -97.6568094], 3);

	// Create a tile layer variable using the appropriate url

	var layer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png');

	// Add the layer to your map

	layer.addTo(map);
	 
	// Execute your function to get data
 	getData(map, layer);
}

// Function for getting data
var getData = function(map, layer) {
  // Execute an AJAX request to get the data in data/response.js
  $.ajax({
  	url: 'data/response.json',
  	dataType:'json',
  	data: 'get',
  	// When your request is successful, call your customBuild function
  	success: function(response) {
  		customBuild(map, layer, response);
  	}
  });
}

// Loop through your data and add the appropriate layers and points
var customBuild = function(map, layer, response) {
	var marker;
	var gunLowCount = 0; // counts victims armed with guns 39 years and younger
	var gunHighCount = 0; // counts victims armed with guns 40 years and older
	var otherLowCount = 0; // counts victims armed with non-guns 39 years and younger
	var otherHighCount = 0; // counts victims armed with non-guns 40 years and older
	// layers
	var gunLayer = new L.LayerGroup([]);
	var knifeLayer = new L.LayerGroup([]);
	var bluntLayer = new L.LayerGroup([]);
	var carLayer = new L.LayerGroup([]);
	var otherLayer = new L.LayerGroup([]);


	response.forEach(function(data) {
		// if the victim was armed with a firearm
		if (data['Weapon'] == "Handgun" || data['Weapon'] == "Firearm; not stated" || 
			data['Weapon'] == "Shotgun" || data['Weapon'] == "Other Gun") {
			marker = new L.circle([data.lat, data.lng], 500, {color:'black'}).addTo(gunLayer);
			(data['Victim\'s Age'] > 40) ? gunHighCount++ : gunLowCount++;
		} else {
			// if the victim had a knife
			if (data['Weapon'] == "Knife or cutting instrument") {
			marker = new L.circle([data.lat, data.lng], 250, {color:'red'}).addTo(knifeLayer);
			// if the victim had a blunt weapon
			} else if (data['Weapon'] == "Blunt object (clubs, hammers, etc.)") {
				marker = new L.circle([data.lat, data.lng], 250, {color:'orange'}).addTo(bluntLayer);
			// if the victim was driving
			} else if (data['Weapon'] == "Vehicle") {
				marker = new L.circle([data.lat, data.lng], 250, {color:'green'}).addTo(carLayer);
			// if the victim had another weapon
			} else {
				marker = new L.circle([data.lat, data.lng], 250, {color:'blue'}).addTo(otherLayer);
			}
			(data['Victim\'s Age'] > 40) ? otherHighCount++ : otherLowCount++;
		}

		//information for popups on markers

		var name = "Victim: " + data['Victim Name'];
		var date = "Date of Incident: " + data['Date Searched'];
		var city = data['City'];
		var state = data.State;
		// grabs the state abbreviation
		if (state != undefined) {
				var stateString = state.split(' - ');
				state = stateString[0];
			}
		var location = "City: " + city + ", " + state;
		marker.bindPopup(name + "<br>" + location + "<br>" + date);

	});

	// changes the counters for the cross tabulation

	document.getElementById('gunLow').innerHTML = gunLowCount;
	document.getElementById('gunHigh').innerHTML = gunHighCount;
	document.getElementById('otherLow').innerHTML = otherLowCount;
	document.getElementById('otherHigh').innerHTML = otherHighCount;

// Once layers are on the map, add a leaflet controller that shows/hides layers

	map.addLayer(gunLayer, knifeLayer, bluntLayer, carLayer, otherLayer);

		var overlayMaps = {
		    "Gun": gunLayer,
		    "Sharp": knifeLayer,
		    "Blunt": bluntLayer,
		    "Vehicle": carLayer,
		    "Unarmed": otherLayer
		};

	L.control.layers(overlayMaps).addTo(map);
}



