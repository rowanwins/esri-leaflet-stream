var SocketFeatureLayer = L.esri.FeatureLayer.extend({
    
    options: {
      useCors: false,
      useMapViewExtent: false,
      customExtent: 'undefined'
    },
    
    subscribe: function(url) {
      var mine = this;

      if (this.options.useMapViewExtent) {
        this._map.addEventListener('moveend', this._updateSocketToMapZoom, this);
      }   

      this._socket = new WebSocket(this.options.url + 'subscribe');

      this._socket.onopen = function () {
        mine.updateSocketParams();
        mine.fire('socketConnected', mine); 
      };

      this._socket.onerror = function () {
        mine.fire('socketError');
      };
      
      this._socket.onmessage = function (e) {
        mine._onMessage(e);
      };

    },

    unsubscribe: function() {
      this._socket.close();
      this._socket = null;
    },

    removeCustomExtent: function () {
      this.options.customExtent = undefined;
    },

    removeMapViewExtentListener: function () {
        this._map.removeEventListener('moveend', this._updateSocketToMapZoom);
    },

    setCustomExtent: function (extent) {
      if (!extent.xmin || !extent.ymin || !extent.xmax || !!extent.ymax) {
        return console.log('Esri-Leaflet-Steam: Not a valid extent object');
      }
      this.options.customExtent = extent;
    },

    updateSocketParams: function() {
      this._socket.send(this._generateQueryParams());
    },

    _updateSocketToMapZoom: function (){
      var mapBounds = this._map.getBounds();
      var esriBB = L.esri.Util.boundsToExtent(mapBounds);
      var filter = {};
      filter.geometry = esriBB;
      this._socket.send(JSON.stringify({filter: filter}));
    },

    _generateQueryParams: function () {
      var filter = {
        where: this.options.where,
        outFields: this.options.fields.toString(),
        geometry: null
      };
      
      if (this.options.where === '1=1'){
        filter.where = null;
      }
      
      if (this.options.fields[0] === '*'){
        filter.outFields = null;
      }

      if (this.options.customExtent === 'undefined' || !this.options.useMapViewExtent) {
        filter.geometry = null;
      }

      if (this.options.useMapViewExtent) {
        var mapBounds = this._map.getBounds();
        filter.geometry = L.esri.Util.boundsToExtent(mapBounds);
      }

      return JSON.stringify({filter: filter});
    },

    _onMessage: function (e) {
      var geojson = L.esri.Util.arcgisToGeoJSON(JSON.parse(e.data));
      
      // This caters for us sending the socket some information
      if (typeof geojson.geometry == 'undefined'){
        return;
      }

      geojson.id = geojson.properties[this.options.idField];
      var layer = this._layers[geojson.id];

      if (layer) {
        this._updateLayer(layer, geojson);
      } else {
        this.createLayers([geojson]);
        layer = this._layers[geojson.id];
      }

      this.fire('socketMessage', {
        feature: geojson,
        layer: layer
      });
    }
  });

L.esri.socketFeatureLayer = function (options) {
  if (options.url.includes('http:')){
    return console.warn('Esri-Leaflet-Stream: Please set your url to the socket url eg. "wss://geoeventsample3.esri.com:8443/arcgis/ws/services/SeattleBus/StreamServer"')
  }
  if (!options.idField) {
    return console.warn('Esri-Leaflet-Stream: Layer options must contain an idField property.')
  }

  if (options.useMapViewExtent && options.customExtent) {
    return console.warn('Esri-Leaflet-Stream: Layer must either use map view extent or a custom extent, not both.')
  }
  return new SocketFeatureLayer(options);
};

function objectToQuerystring (obj) {
  return Object.keys.reduce(function (str, key, i) {
    var delimiter, val;
    delimiter = (i === 0) ? '?' : '&';
    key = encodeURIComponent(key);
    val = encodeURIComponent(obj[key]);
    return [str, delimiter, key, '=', val].join('');
  }, '');
}