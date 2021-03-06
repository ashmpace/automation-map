/* Leaflet */
var statesmap = L.map('map1').setView([37.8, -96], 4);
var mapboxAccessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
    id: 'mapbox.light',
    attribution: ''
}).addTo(statesmap);

//Add quotients for all industry to the state feature property
function addIndustriesToFeature(feature, data) {
    for (var i=0; i<data.length; i++) {
        feature.properties[data[i].naics_title] = data[i];
    }
}
statesData.features.forEach(function(feature){
    addIndustriesToFeature(feature, allQuotients[feature.properties.name]);
}) 
console.log(statesData);

//Add states data
L.geoJson(statesData).addTo(statesmap);
//

//Define colours according to feature values
function getColor(d) {
    return d > 1.75 ? '#49006a' :
           d > 1.5  ? '#7a0177' :
           d > 1.25  ? '#ae017e' :
           d > 1  ? '#dd3497' :
           d > .75   ? '#f768a1' :
           d > .5   ? '#fa9fb5' :
           d > .25   ? '#fcc5c0' :
                      '#fde0dd';
}

//Initialize map with default industry
styleMapforIndustry('Manufacturing');

//Wrap up all map functions in one, starting here:
var info, legend;
function styleMapforIndustry(industry){
    //Add feature styling to map
    function style(feature) {
        return {
            fillColor: getColor(feature.properties[industry].locq),
            weight: 1,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.5
        };
    }
    L.geoJson(statesData, {style: style}).addTo(statesmap);

    //Define a mouseover highlight listener
    function highlightFeature(e) {
        var layer = e.target;
    //todo vm.data.selected = e.target
        layer.setStyle({
            weight: 3,
            color: '#3388ff',
            dashArray: '',
            fillOpacity: 0.9
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }

        info.update(layer.feature.properties);

    }
    //Define highlight reset
    function resetHighlight(e) {
        geojson.resetStyle(e.target);
        info.update()
    }

    //Add event listeners for interactivity
    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
        });
    }

    //Zoom to state
    function zoomToFeature(e) {
        statesmap.fitBounds(e.target.getBounds());
    }

    geojson = L.geoJson(statesData, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(statesmap);

    //Add info display panel
    if (info){ info.remove() } //clear if called before

    info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

    info.update = function (props) {
        this._div.innerHTML = '<h4>Automation Quotient By State</h4>' +  (props ?
            '<b>' + props.name + '</b><br />' + 'Quotient: ' + props[industry].locq.toFixed(4)
            : 'Hover over a state');
    };

    info.addTo(statesmap);

    //Add legend
    if (legend){ legend.remove() }
    legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, .25, .5, .75, 1.0, 1.25, 1.5, 1.75],
            labels = [];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i]+.25) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(statesmap);

}
