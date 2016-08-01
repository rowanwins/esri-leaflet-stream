# Esri Leaflet Stream
A plugin for Esri Leaflet that enables consuming [Stream Services](http://server.arcgis.com/en/geoevent-extension/latest/process-event-data/stream-services.htm) published by ArcGIS for Server. [View Demo](https://rowanwins.github.io/esri-leaflet-stream/example/)

### Basic Usage
**Step 1.** Include the required js in your document. 

```html
   	<script src="dist/esri-leaflet-stream.min.js"></script>
```

**Step 2.** Create a stream layer using the `L.esri.streamFeatureLayer` function, the socket connection is started automatically when the layer is added to the map.

```js
	var buses = L.esri.streamFeatureLayer({
		url: 'https://geoeventsample3.esri.com:6443/arcgis/rest/services/SeattleBus/StreamServer'
	}).addTo(map);
```

### Background Information
[Esri Stream Services](http://server.arcgis.com/en/geoevent-extension/latest/process-event-data/stream-services.htm) provide a convenient way to consume streaming data published via the GeoEvent Extension with ArcGIS for Server. Basically they continually send data to the website which you can then use however you'd like. For more information also check out the [REST API](http://resources.arcgis.com/en/help/arcgis-rest-api/index.html#//02r300000288000000).



### Options
| Option        | Type   | Description   | 
| ------------- |--------|---------------|
| url | String | **Required** The service url of a streaming layer eg 'https://geoeventsample3.esri.com:6443/arcgis/rest/services/SeattleBus/StreamServer'.|
| useMapViewExtent | Boolean | Applies a geographic filter meaning data is only sent for the current map view (*note:* the extent updates as the map is panned and zoomed). Defaults to false. |
| customExtent | [Envelope Object](http://resources.arcgis.com/en/help/arcgis-rest-api/index.html#//02r3000000n1000000) | An Esri envelope to spatial restrict the features. Not set by default. |
| where | String | An optional expression to filter features server side. String values should be denoted using single quotes ie: where: "FIELDNAME = 'field value'"; More information about [valid SQL syntax](http://resources.arcgis.com/en/help/main/10.2/index.html#/SQL_reference_for_query_expressions_used_in_ArcGIS/00s500000033000000/) can be found here. |
| fields | Array | An array of fieldnames to pull from the service. Includes all fields by default. |

#### Example
```js
	var buses = L.esri.streamFeatureLayer({
		url: 'https://geoeventsample3.esri.com:6443/arcgis/rest/services/SeattleBus/StreamServer',
		useMapViewExtent: true,
		where: "BusNo='2679'",
		fields: ['BusNo', 'Heading'],
		pointToLayer: function (geojson, latlng) {
			return L.circleMarker(latlng, {
				fillColor: createRandomFill(),
				fillOpacity: 0.8,
				color: "#cccccc",
				weight: 2
			});
		},
	}).addTo(map);

```

### Methods
| Method        | Description   | 
| ------------- |---------------|
| setCustomExtent(<[Envelope Object](http://resources.arcgis.com/en/help/arcgis-rest-api/index.html#//02r3000000n1000000)>) | Set a new custom extent for the socket connection. |
| clearCustomExtent() | Removes the custom extent meaning no geographic filter will be applied to the socket connection. |
| useMapViewExtent(Boolean) | Set whether to use the map view extent as a geographic filter for the socket connection, this updates automatically as the map is zoomed and panned. |
| setWhere(String) | Sets a where clause on the socket connection to limit data received by the socket connection. |
| clearWhere() | Remove the where clause from the socket connection. |
| clearLayers() | Clears the layers drawn by the socket connection. |


#### Example
```js
	var buses = L.esri.streamFeatureLayer({
		url: 'https://geoeventsample3.esri.com:6443/arcgis/rest/services/SeattleBus/StreamServer'
	}).addTo(map);
	buses.setWhere("BusNo='3452'");
	buses.useMapViewExtent(false);
```

### Events
| Event        | Description   | 
| ------------ |---------------|
| socketConnected | The socket connection has successfully connected. |
| socketError | The socket connection failed to connect. |
| socketMessage | A message was received by the socket connection, returns an object containing the geojson feature as well as the resulting leaflet layer. |
| socketUpdated | A message confirming that the socket connection has been updated, triggered when the filters change. |

#### Example
```js
	function msgEvent (msgDetails) {
		console.log(msgDetails.feature);
		console.log(msgDetails.layer);
	}
	buses.on('socketMessage', msgDetails);
```

### Acknowledgements
Huge hats off go to [mourner](https://github.com/mourner) and all the [contributors](https://github.com/Leaflet/Leaflet/graphs/contributors) to the leaflet.js project! Additional thanks to the [folks](https://github.com/Esri/esri-leaflet/graphs/contributors) involved in [esri-leaflet](http://esri.github.io/esri-leaflet/) for making it super easy to work with services published from the Esri stack.