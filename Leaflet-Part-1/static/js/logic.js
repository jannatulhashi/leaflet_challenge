// Define the URL for the earthquake data
let queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Perform a GET request to the query URL
d3.json(queryURL).then(function(data) {
    // Once we get a response, create the map and add markers
    createMap(data.features);
});

function createMap(earthquakeData) {
    // Create a base layer using Leaflet
    let baseMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Create a map object
    let myMap = L.map("map", {
        center: [65.813, -147.852],
        zoom: 5,
        layers: [baseMap]
    });

    // Function to determine marker size based on earthquake magnitude
    function markerSize(magnitude) {
        return magnitude * 5;
    }

    // Function to determine marker color based on earthquake depth
    function depthColor(depth) {
        let color;

        if (depth < 10) {
            color = "#99FF33";
        } else if (depth < 30) {
            color = "#CCFF66";
        } else if (depth < 50) {
            color = "#FFCC33";
        } else if (depth < 70) {
            color = "#FF9900";
        } else if (depth < 90) {
            color = "#FF6600";
        } else {
            color = "#FF0000";
        }

        return color;
    }

    // Loop through the earthquake data to create markers
    earthquakeData.forEach(function(earthquake) {
        let magnitude = earthquake.properties.mag;
        let depth = earthquake.geometry.coordinates[2];
        let location = [earthquake.geometry.coordinates[1], earthquake.geometry.coordinates[0]];

        // Create a circle marker with size and color based on magnitude and depth
        let circleMarker = L.circleMarker(location, {
            radius: markerSize(magnitude),
            fillColor: depthColor(depth),
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });

        // Add a popup with earthquake information
        circleMarker.bindPopup(
            `Magnitude: ${magnitude}<br>Depth: ${depth} km`
        );

        // Add the marker to the map
        circleMarker.addTo(myMap);
    });

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

    // Add legend to the map
    legend.addTo(myMap);
}
