//ADDING LAYERS
//Adding Map
var map = L.map('map')


//Basemaps
var carto = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution:'&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors &copy; <a href="https://carto.com">CARTO</a>',
});

var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
osm.addTo(map);

var gHybrid = L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
});


var baseMaps = {
    "Carto Light":carto,
    "Open Street Map": osm,
    "Google Hybrid": gHybrid,
};

//MY DATA
//Roads Data
var aroadlayer = L.geoJSON(aroad, {
    style: function(feature) {
        return {
            color: "#969696",
            weight: 4,
            opacity: 1,
        };
    }
}).addTo(map);


var broadlayer = L.geoJSON(broad, {
    style: function(feature) {
        return {
            color: "#adadad",
            weight: 3,
            opacity: 1,
        };
    }
}).addTo(map);


var croadlayer = L.geoJSON(croad, {
    style: function(feature) {
        return {
            color: "#c4c4c4",
            weight: 2,
            opacity: 1,
        };
    }
}).addTo(map);


var otherroadlayer = L.geoJSON(otherroad, {
    style: function(feature) {
        return {
            color: "#dbdbdb",
            weight: 1,
            opacity: 1,
        };
    }
}).addTo(map);


//HEALTH FACILITIES 
//Health Icons
var hospitalIcon = L.icon({
    iconUrl:"images/ho1.png",
    iconSize:[18,18],
    iconAnchor:[9,18],
    popupAnchor:[0,-18]
});

var dispensaryIcon = L.icon({
    iconUrl:"images/di1.png",
    iconSize:[22,22],
    iconAnchor:[11,22],
    popupAnchor:[0,-22]
});

var nursingIcon = L.icon({
    iconUrl:"images/ot1.png",
    iconSize:[14,14],
    iconAnchor:[7,14],
    popupAnchor:[0,-14]
});


//Health Facilities Data
var hospitalslayer = L.geoJSON(hospitals, {
    pointToLayer: function(feature, latlng){
        return L.marker(latlng,{
            icon:hospitalIcon
        });
    },

    onEachFeature: function(feature, layer){
            layer.bindPopup(
            "<b>" + feature.properties.Facility_N + "</b>"+
            "<hr>"+
            "<b>Type:</b> Hospital<br>"+
            "<b>Level:</b> " + feature.properties.Level + "<br>"+
            "<b>Owner:</b> " + feature.properties.Owner + "<br>"+
            "<b>Ward:</b> " + feature.properties.Ward + "<br>"+
            "<b>Sub-County:</b> "+feature.properties.Sub_County,
            {
        className: "hospital-popup"
        }
        );
    }
}).addTo(map);



var dispensarieslayer = L.geoJSON(dispensaries, {
    pointToLayer: function(feature, latlng){
        return L.marker(latlng,{
            icon:dispensaryIcon
        });
    },

    onEachFeature: function(feature, layer){
        layer.bindPopup(
            "<b>" + feature.properties.Facility_N + "</b>"+
            "<hr>"+
            "<b>Type:</b> Dispensary<br>"+
            "<b>Level:</b> " + feature.properties.Level + "<br>"+
            "<b>Owner:</b> " + feature.properties.Owner + "<br>"+
            "<b>Ward:</b> " + feature.properties.Ward + "<br>"+
            "<b>Sub-County:</b> "+feature.properties.Sub_County,
            {
        className: "hospital-popup"
        }
        );
    }
}).addTo(map);



var nursinghomeslayer = L.geoJSON(nursinghomes, {
    pointToLayer: function(feature, latlng){
        return L.marker(latlng,{
            icon:nursingIcon
        });
    },

    onEachFeature: function(feature, layer){
        layer.bindPopup(
            "<b>" + feature.properties.Facility_N + "</b>"+
            "<hr>"+
            "<b>Type:</b> Nursing Home<br>"+
            "<b>Level:</b> " + feature.properties.Level + "<br>"+
            "<b>Owner:</b> " + feature.properties.Owner + "<br>"+
            "<b>Ward:</b> " + feature.properties.Ward + "<br>"+
            "<b>Sub-County:</b> "+feature.properties.Sub_County,
            {
        className: "hospital-popup"
        }
        );
    }
}).addTo(map);

// Health Facility Search
var facilitySearchData = [];

hospitals.features.forEach(function(feature) {
    facilitySearchData.push({
        name: feature.properties.Facility_N,
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
        type: "Hospital"
    });
});

dispensaries.features.forEach(function(feature) {
    facilitySearchData.push({
        name: feature.properties.Facility_N,
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
        type: "Dispensary"
    });
});

nursinghomes.features.forEach(function(feature) {
    facilitySearchData.push({
        name: feature.properties.Facility_N,
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
        type: "Nursing Home"
    });
});

var searchInput = document.getElementById("facilitySearch");
var searchResults = document.getElementById("searchResults");

searchInput.addEventListener("input", function() {

    var searchTerm = this.value.toLowerCase().trim();

    searchResults.innerHTML = "";

    if (searchTerm.length < 2) {
        searchResults.style.display = "none";
        return;
    }

    var matches = facilitySearchData.filter(function(facility) {
        return facility.name.toLowerCase().includes(searchTerm);
    });

    if (matches.length === 0) {
        searchResults.innerHTML =
            '<div class="search-result">No facility found</div>';

        searchResults.style.display = "block";
        return;
    }

    matches.slice(0, 10).forEach(function(facility) {

        var result = document.createElement("div");

        result.className = "search-result";

        result.innerHTML =
            "<b>" + facility.name + "</b><br>" +
            "<small>" + facility.type + "</small>";

        result.addEventListener("click", function() {

            map.setView(
                [facility.lat, facility.lng],
                15
            );

            searchInput.value = facility.name;

            searchResults.style.display = "none";

            // Open the appropriate facility popup
            if (facility.type === "Hospital") {
                hospitalslayer.eachLayer(function(layer) {
                    if (
                        layer.feature.properties.Facility_N === facility.name
                    ) {
                        layer.openPopup();
                    }
                });
            }

            else if (facility.type === "Dispensary") {
                dispensarieslayer.eachLayer(function(layer) {
                    if (
                        layer.feature.properties.Facility_N === facility.name
                    ) {
                        layer.openPopup();
                    }
                });
            }

            else if (facility.type === "Nursing Home") {
                nursinghomeslayer.eachLayer(function(layer) {
                    if (
                        layer.feature.properties.Facility_N === facility.name
                    ) {
                        layer.openPopup();
                    }
                });
            }

        });

        searchResults.appendChild(result);
    });

    searchResults.style.display = "block";
});



//Results (Accessibility Layer)
//Hierarchy  Colours for the 9 Classes
function getAccessibilityColor(gridcode){
    switch(gridcode){
        case 1: return "#00a651";
        case 2: return "#4db848";
        case 3: return "#8dc63f";
        case 4: return "#c4d82e";
        case 5: return "#f9ed32";
        case 6: return "#fbb040";
        case 7: return "#f7941d";
        case 8: return "#ed1c24";
        case 9: return "#c1272d";

        default: return "#999999";

    }

}

// Brief Label for Each Class
function getAccessibilityLabel(gridcode){
    switch(gridcode){
        case 1: return "Excellent Accessibility";
        case 2: return "Very High Accessibility";
        case 3: return "High Accessibility";
        case 4: return "Moderately High Accessibility";
        case 5: return "Moderate Accessibility";
        case 6: return "Moderately Low Accessibility";
        case 7: return "Low Accessibility";
        case 8: return "Very Low Accessibility";
        case 9: return "Poor Accessibility";

        default: return "Unknown";

    }

}

//Recommendation for Each Class
function getRecommendation(gridcode){
    switch(gridcode){
        case 1:
            return "Current healthcare service accessibility is excellent.";

        case 2:
            return "Healthcare services are generally accessible.";

        case 3:
            return "Healthcare services are relatively accessible.";

        case 4:
            return "Moderate accessibility, monitor for future service demand.";

        case 5:
            return "Accessibility is limited, could be improved.";

        case 6:
            return "Priority area for improving healthcare accessibility.";

        case 7:
            return "High priority for further assessment of healthcare access.";

        case 8:
            return "Very high priority for further assessment of healthcare access.";
        case 9:
            return "Critical accessibility gap requiring further assessment.";


        default:
            return "";

    }

}

//Styling Function with Colours
function styleAccessibility(feature){
    return{
        fillColor:getAccessibilityColor(feature.properties.gridcode),
        opacity:0,
        fillOpacity:1
    };
}

           
//Results Pop-up
function onEachAccessibility(feature,layer){
    layer.bindPopup(
        "<h3>Accessibility Assessment</h3>" +
        "<b>Class: " +
        feature.properties.gridcode + ' ('+ getAccessibilityLabel(feature.properties.gridcode) + ')</b>' +
        "<hr>" +
        getRecommendation(feature.properties.gridcode),
        {
        className: "accessibility-popup"
        }
    );
    }


var resultLayer = L.geoJSON(result, {
    style: styleAccessibility,
    onEachFeature: onEachAccessibility
}).addTo(map);


//Sub-Counties
function styleSubcounties(feature){
    return {
        color: "#333333",
        weight: 1,
        opacity: 1,
        fillOpacity: 0
    };
}

function onEachSubcounty(feature, layer){
    layer.bindTooltip(
        feature.properties.ADM2_EN,
        {
            permanent: true,
            direction: "center",
            className: "subcounty-label"
        }

    );

}

var wajirLayer = L.geoJSON(wajirdata,{
     onEachFeature: onEachSubcounty,
     style: styleSubcounties
}).addTo(map);



//Statistics in Sidebar
document.getElementById("stats").innerHTML =
    "<b>Hospitals:</b> " + hospitals.features.length + "<br>" +
    "<b>Dispensaries:</b> " + dispensaries.features.length + "<br>" +
    "<b>Nursing Homes:</b> " + nursinghomes.features.length;




//Map View
var initialBounds = resultLayer.getBounds();
map.fitBounds(initialBounds);

//Reset to Original View
var resetControl = L.control({position: "topright"});
resetControl.onAdd = function(map) {
    var div = L.DomUtil.create("div", "reset-control");
    div.innerHTML = "↻ Reset View";
    div.title = "Reset map to full study area";
    L.DomEvent.disableClickPropagation(div);
    div.onclick = function() {
        map.fitBounds(initialBounds);
    };
    return div;
};
resetControl.addTo(map);



//Overlay Maps
var overlayMaps = {
    "Accessibility": resultLayer,
    
    "Class A Roads": aroadlayer,
    "Class B Roads": broadlayer,
    "Class C Roads": croadlayer,
    "Other Roads": otherroadlayer,

    "Main Hospitals": hospitalslayer,
    "Dispensaries": dispensarieslayer,
    "Nursing Homes": nursinghomeslayer,
    "Sub-Counties": wajirLayer,
};


resultLayer.bringToFront();

aroadlayer.bringToFront();
broadlayer.bringToFront();
croadlayer.bringToFront();
otherroadlayer.bringToFront();

hospitalslayer.bringToFront();
dispensarieslayer.bringToFront();
nursinghomeslayer.bringToFront();

//Layer Control
L.control.layers(baseMaps, overlayMaps).addTo(map);


//Scale
L.control.scale({
    metric:true,
    imperial:false
}).addTo(map);


//Legend
var legend = L.control({position:'bottomleft'});
legend.onAdd = function(map){
var div = L.DomUtil.create('div','info legend');
div.innerHTML =
"<h4>Legend</h4>"+
"<i style='background:#969696' > </i> Class A Roads<br>"+
"<i style='background:#adadad' > </i> Class B Roads<br>"+
"<i style='background:#c4c4c4' > </i> Class C Roads<br>"+
"<i style='background:#dbdbdb' > </i> Other Roads<br><hr>"+

"<span style='display:inline-block; width:20px; text-align:center;'><img src='images/ho1.png' width='16'style='position:relative; bottom:-2px;'></span> Hospitals<br>"+
"<span style='display:inline-block; width:20px; text-align:center;'><img src='images/di1.png' width='20' style='position:relative; bottom:-4px;'></span> Dispensaries<br>"+
"<span style='display:inline-block; width:20px; text-align:center;'><img src='images/ot1.png' width='13'></span> Nursing Homes<br>"+

"<hr>Healthcare Accessibility<br>"+
"<i style='background:#00a651' > </i> Excellent<br>"+
"<i style='background:#4db848' > </i> Very High<br>"+
"<i style='background:#8dc63f' > </i> High<br>"+
"<i style='background:#c4d82e' > </i> Moderately High<br>"+
"<i style='background:#f9ed32' > </i> Moderate<br>"+
"<i style='background:#fbb040' > </i> Moderately Low<br>"+
"<i style='background:#f7941d' > </i> Low<br>"+
"<i style='background:#ed1c24' > </i> Very Low<br>"+
"<i style='background:#c1272d' > </i> Poor";
return div;
};
legend.addTo(map);


//Leaflet Events for coordinates
map.on('mousemove', function (e) {
    document.getElementsByClassName('coordinate')[0].innerHTML = 
    'lat:' + e.latlng.lat.toFixed(5) + ' ' + 
    'lng:' + e.latlng.lng.toFixed(5);
})
