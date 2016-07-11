# Esri Leaflet Socket
A plugin for Esri Leaflet that enables consuming data from a socket connection service published by ArcGIS Server.

### Usage
**Step 1.** Include the required js in your document. 

```html
   	<script src="dist/esriSocket.min.js"></script>
```

**Step 2.** Create a socket connection using the `L.esri.socketFeatureLayer` function and start the connection by calling the subscribe function

``` js
		var buses = L.esri.socketFeatureLayer({
			url: 'https://geoeventsample3.esri.com:6443/arcgis/rest/services/SeattleBus/StreamServer'
		}).addTo(map);

		buses.subscribe();

```


### Methods
| Method        | Description      | 
| ------------- |---------------|
| subscribe | Opens the socket connection ready to recieve data.|
| unsubscribe | Closes the socket connection.|


### Events
The plugin triggers a number of events related to the socket connection
| Event        | Description      | 
| ------------- |---------------|
| socketConnected | The socket connection has successfully connection.|
| socketError | The socket connection failed to connection.|
| socketMessage | A message was received by the socket connection, returns an object containing the geojson feature as well as the resulting leaflet layer.|

``` js
	function msgEvent (evt) {
		console.log(evt.feature);
		console.log(evt.layer);
	}

	buses.on('socketMessage', msgEvent);

```

### Acknowledgements
Huge hats off go to [mourner](https://github.com/mourner) and all the [contributors](https://github.com/Leaflet/Leaflet/graphs/contributors) to the leaflet.js project, it's an amazing piece of open source software!