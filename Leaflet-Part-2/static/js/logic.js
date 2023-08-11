// Define the URLs for the earthquake and tectonic plates data
let earthquakeQueryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
let tectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the query URLs
Promise.all([d3.json(earthquakeQueryURL), d3.json(tectonicPlatesURL)]).then(function(data) {
    let earthquakeData = data[0];
    let tectonicPlatesData = data[1];

    createMap(earthquakeData, tectonicPlatesData);
});

function createMap(earthquakeData, tectonicPlatesData) {
    // Create base layers
    googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
        maxZoom: 20,
        subdomains:['mt0','mt1','mt2','mt3']
});

    let grayscaleMap = L.tileLayer(
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'",
    {
      attribution:
        'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    });



    let outdoorsMap = L.tileLayer('https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Create a map object
    let myMap = L.map("map", {
        center: [0.443182, -54.451200],
        zoom: 5,
        layers: [googleSat] // Start with googleSat as the base layer
    });

    // Define base maps for layer control
    let baseMaps = {
        "Satellite": googleSat,
        "Grayscale": grayscaleMap,
        "Outdoors": outdoorsMap
    };

    // Create overlay layers for earthquakes and tectonic plates
    let earthquakeLayer = L.geoJSON(earthquakeData, {
        onEachFeature: function(feature, layer) {
            let magnitude = feature.properties.mag;
            let depth = feature.geometry.coordinates[2];
            layer.bindPopup(
                `<h3>Location:</h3> ${feature.properties.place}<h3>Magnitude:</h3> ${magnitude}<h3>Depth:</h3> ${depth}`
            );
        },
        pointToLayer: createMarker
    });

    let tectonicPlatesLayer = L.geoJSON(tectonicPlatesData, {
        style: {
            color: "orange", //   color for the tectonic plates
            weight: 2.5
        }
    });

    // Define overlay layers for layer control
    let overlayMaps = {
        "Tectonic Plates": tectonicPlatesLayer,
        "Earthquakes": earthquakeLayer
    };

    // Add layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap); 
    

    // Add the tectonic plates and earthquakes layers to the map by default
    tectonicPlatesLayer.addTo(myMap);
    earthquakeLayer.addTo(myMap);

    // Create a legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function (myMap) {
        var div = L.DomUtil.create("div", "info legend");
        div.innerHTML += "<h4>Earthquake Depth</h4>";
        div.innerHTML +=
            '<div style="background: #99FF33;" class="color-index"></div><span> -10 to 10</span><br>';
        div.innerHTML +=
            '<div style="background: #CCFF66;" class="color-index"></div><span>10 to 30</span><br>';
        div.innerHTML +=
            '<div style="background: #FFCC33;" class="color-index"></div><span>30 to 50</span><br>';
        div.innerHTML +=
            '<div style="background: #FF9900;" class="color-index"></div><span>50 to 70</span><br>';
        div.innerHTML +=
            '<div style="background: #FF6600;" class="color-index"></div><span>70 to 90</span><br>';
        div.innerHTML += '<div style="background: #FF0000;" class="color-index"></div><span>90 +</span><br>';

        return div;
    };
    legend.addTo(myMap);

    
}
// including createMarker, markerSize, and markerColor functions
function createMarker(feature, latlng) {
    return L.circleMarker(latlng, {
        radius: markerSize(feature.properties.mag),
        fillColor: markerColor(feature.geometry.coordinates[2]),
        color: "#000",
        weight: 0.5,
        opacity: 0.5,
        fillOpacity: 1
    });
}

function markerSize(magnitude) {
    return magnitude * 3;
}

function markerColor(depth) {
    return depth > 90 ? '#d73027' :
        depth > 70 ? '#fc8d59' :
        depth > 50 ? '#fee08b' :
        depth > 30 ? '#d9ef8b' :
        depth > 10 ? '#91cf60' :
        '#1a9850';
}

