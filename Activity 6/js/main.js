// create map, set its view
var map;
//function to instantiate the Leaflet map
function createMap(){
    //create the map
    map = L.map('map', {
        center: [43.08, -89.4],
        zoom: 12
    });

    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData(map);
};


//function to convert markers to circle markers
function pointToLayer(feature, latlng,attributes){
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];
    //check
    console.log(attribute);
    //create marker options
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    // //build popup content string
    var popupContent = "<p><b>Location:</b> " + feature.properties.LOCATION_DESCRIPTION + "</p><p><b> Report Year: </b>"+feature.properties.AADT_RPTG_YR+"</p>   <p><b>" + "Annual average daily traffic" + ":</b> " + feature.properties.RDWY_AADT + "</p>";

    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius)
    });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};



//Add circle markers for point features to the map
function createPropSymbols(data, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 0.5;
    //Flannery Appearance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/500,0.5715) * minRadius

    return radius;
};


function createSequenceControls(attributes){
    //create range input element (slider)
    var slider = "<input class='range-slider' type='range'></input>";
    document.querySelector("#panel").insertAdjacentHTML('beforeend',slider);

//set slider attributes
    document.querySelector(".range-slider").max = 2;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;

    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="reverse">Reverse</button>');
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="forward">Forward</button>');

    //replace button content with images
    document.querySelector('#reverse').insertAdjacentHTML('beforeend',"<img src='img/reverse.png'>")
    document.querySelector('#forward').insertAdjacentHTML('beforeend',"<img src='img/forward.png'>")

    document.querySelectorAll('.step').forEach(function(step){
        step.addEventListener("click", function(){
            //sequence
        })
    })

    //Step 5: input listener for slider
    document.querySelector('.range-slider').addEventListener('input', function(){
        //Step 6: get the new index value
        var index = this.value;
        console.log(index)
        updatePropSymbols(attributes[index]);
    });

    document.querySelectorAll('.step').forEach(function(step){
        step.addEventListener("click", function(){
            var index = document.querySelector('.range-slider').value;

            //Step 6: increment or decrement depending on button clicked
            if (step.id == 'forward'){
                index++;
                //Step 7: if past the last attribute, wrap around to first attribute
                index = index > 6 ? 0 : index;
            } else if (step.id == 'reverse'){
                index--;
                //Step 7: if past the first attribute, wrap around to last attribute
                index = index < 0 ? 6 : index;
            };

            //Step 8: update slider
            document.querySelector('.range-slider').value = index;
            console.log(index);
            updatePropSymbols(attributes[index]);
        })
    })
};
//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //update the layer style and popup
            //Example 3.18 line 4
            if (layer.feature && layer.feature.properties[attribute]) {
                //access feature properties
                var props = layer.feature.properties;

                //update each feature's radius based on new attribute values
                var radius = calcPropRadius(props[attribute]);
                layer.setRadius(radius);

                //add city to popup content string
                var popupContent = "<p><b>Location:</b> " + props.LOCATION_DESCRIPTION + "</p>";

                //add formatted attribute to panel content string
                var year = attribute.split("_")[1];
                popupContent += "<p><b>Counts " + props[attribute] + " </p>";

                //update popup content
                popup = layer.getPopup();
                popup.setContent(popupContent).update();
            }


        };
    });
};
function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;
    // console.log(properties);
    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("_AADT") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    console.log(attributes);

    return attributes;
};

function getData(map){
    //load the data
    fetch("data/Traffic_Counts_Dane.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //create a Leaflet GeoJSON layer and add it to the map
            var attributes = processData(json);
            createPropSymbols(json, attributes);
            createSequenceControls(attributes);

        })
};



// add layer to map
document.addEventListener('DOMContentLoaded',createMap)