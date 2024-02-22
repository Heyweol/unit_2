// create map, set its view
var map;
//function to instantiate the Leaflet map
function createMap(){
    //create the map
    map = L.map('map', {
        center: [44.8, -90],
        zoom: 7
    });

    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData(map);
};


function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {

        // popup window: name and address
        popupContent += "<p>" + feature.properties["NAME"] + "</p>";
        popupContent += "<p>" + feature.properties["ADDRESS"] + ", "+feature.properties["CITY"] + ", " + feature.properties["ZIP"]+"</p>";

        layer.bindPopup(popupContent);
    };
};

var geojsonMarkerOptions = {
    radius: 4,
    fillColor: "#fc0101",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

function getData(map){
    //load the data
    fetch("data/Wisconsin_Hospitals.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(json, {
                onEachFeature: onEachFeature,
                pointToLayer: function (feature, latlng){
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
        })
};

// add layer to map
document.addEventListener('DOMContentLoaded',createMap)