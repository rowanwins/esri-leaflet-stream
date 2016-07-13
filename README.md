# Esri Leaflet Socket
A plugin for Esri Leaflet that enables consuming streaming data from a socket connection service published by ArcGIS Server.

### Usage
**Step 1.** Include the required js in your document. 

```html
   	<script src="dist/esriSocket.min.js"></script>
```

**Step 2.** Create a socket connection using the `L.esri.socketFeatureLayer` function and start the connection by calling the subscribe method.

``` js
	var buses = L.esri.socketFeatureLayer({
		url: 'wss://geoeventsample3.esri.com:8443/arcgis/ws/services/SeattleBus/StreamServer',
		idField: 'BusNo'
	}).addTo(map);

	buses.subscribe();
```

### Options
| Option        | Type   | Description   | 
| ------------- |--------|---------------|
| url | String | **Required** The socket url eg wss://geoeventsample3.esri.com:8443/arcgis/ws/services/SeattleBus/StreamServer.|
| idField  | String | **Required** An attribute to use at the unique id.|
| useMapViewExtent | Boolean | Applies a grographic filter meaning data is only sent for the current map view (*note:* the extent updates as the map is panned and zoomed). Defaults to false. |
| customExtent | [Envelope Object](http://resources.arcgis.com/en/help/arcgis-rest-api/index.html#//02r3000000n1000000) | An Esri envelope to spatial restrict the features. Not set by default. |
| where | String | An optional expression to filter features server side. String values should be denoted using single quotes ie: where: "FIELDNAME = 'field value'"; More information about valid SQL syntax can be found here. |

#### Example
```` js
	var buses = L.esri.socketFeatureLayer({
		url: 'wss://geoeventsample3.esri.com:8443/arcgis/ws/services/SeattleBus/StreamServer',
		idField: 'BusNo',
		useMapViewExtent: true,
		where: "BusNo='2679'",
		pointToLayer: function (geojson, latlng) {
			return L.circleMarker(latlng, {
				fillColor: createRandomFill(),
				fillOpacity: 0.8,
				color: "#cccccc",
				weight: 2
			});
		},
	}).addTo(map);

````

### Methods
| Method        | Description   | 
| ------------- |---------------|
| subscribe | Opens the socket connection ready to recieve data. |
| unsubscribe | Closes the socket connection. |
| setCustomExtent | Set a new custom extent. **Note:** this is not applied automatically and needs to be followed by a call to `updateSocketParams`. |
| removeCustomExtent | Removes the custom extent meaning no geographic filter will be applied to the connection. **Note:** this is not applied automatically and needs to be followed by a call to `updateSocketParams`. |
| removeMapViewExtentListener | Removes the map view extent setting. **Note:** this is not applied automatically and needs to be followed by a call to `updateSocketParams`. |
| setWhere | Sets the where clause of the socket connection. **Note:** this is not applied automatically and needs to be followed by a call to `updateSocketParams`. |
| updateSocketParams | Updates the socket connection parameters. |

#### Example
````js
	buses.setWhere("BusNo='3452'");
	buses.removeMapViewExtentListener();
	buses.updateSocketParams();
````

### Events
| Event        | Description   | 
| ------------ |---------------|
| socketConnected | The socket connection has successfully connection. |
| socketError | The socket connection failed to connection. |
| socketMessage | A message was received by the socket connection, returns an object containing the geojson feature as well as the resulting leaflet layer. |

#### Example
```` js
	function msgEvent (evt) {
		console.log(evt.feature);
		console.log(evt.layer);
	}

	buses.on('socketMessage', msgEvent);
````

### Acknowledgements
Huge hats off go to [mourner](https://github.com/mourner) and all the [contributors](https://github.com/Leaflet/Leaflet/graphs/contributors) to the leaflet.js project, it's an amazing piece of open source software!