var StreamFeatureLayer = L.esri.FeatureLayer.extend({

  options: {
    useCors: false,
    useMapViewExtent: false,
    customExtent: null,
    where: '1=1',
    wss: false
  },

  // PUBLIC METHODS

  onAdd: function (map) {

    // Remove the event handlers added by the feature layer
    this._map.removeEventListener(this.getEvents(), this);

    // Retrieve the service metadata to get some of the required attributes to hook up the service
    this.metadata(function (error, response) {
      if(error){
        console.log(error);
      } else {
        if (response.timeInfo.trackIdField) {
          this.idField = response.timeInfo.trackIdField;
        }
        this.streamUrl = response.streamUrls[0].urls[0];
        if (this.options.wss) {
          for (var i = 0; i < response.streamUrls[0].urls.length; i++) {
            if (response.streamUrls[0].urls[i].indexOf('wss') > -1) {
              this.streamUrl = response.streamUrls[0].urls[i]
            }
          }
        }
        this.socketReady = false;
        this._subscribe();
      }
    }, this);
  },

  onRemove: function (map) {
    this._unsubscribe();
    this._map.removeEventListener(this.getEvents(), this);
  },

  clearCustomExtent: function () {
    this.options.customExtent = null;
    this._updateSocketParams();
  },

  useMapViewExtent: function (boolean) {
    this.options.useMapViewExtent = boolean;
    if (this.options.useMapViewExtent){
      this._map.addEventListener('moveend', this._updateSocketToMapZoom, this);
    } else {
     this._map.removeEventListener('moveend', this._updateSocketToMapZoom);
   }
   this._updateSocketParams();
 },

 setCustomExtent: function (extent) {
  if (!extent.xmin || !extent.ymin || !extent.xmax || !!extent.ymax) {
    return console.log('Esri-Leaflet-Stream: Not a valid extent object');
  }
  this.options.customExtent = extent;
  this._updateSocketParams();
},

setWhere: function (whereClause) {
  this.options.where = whereClause;
  this._updateSocketParams();
},

clearWhere: function () {
  this.options.where = '1=1';
  this._updateSocketParams();
},

clearLayers: function () {
  for (var i in this._layers) {
    this._map.removeLayer(this._layers[i]);
    delete this._layers[i];
  }
},

  // PRIVATE METHODS

  _subscribe: function () {

    this._socket = new WebSocket(this.streamUrl + '/subscribe');
    
    // Handle the various events thrown by the socket 
    var mine = this;
    
    this._socket.onopen = function () {
      mine._updateSocketParams();
      mine.fire('socketConnected', mine); 
    };

    this._socket.onerror = function () {
      mine.fire('socketError');
    };

    this._socket.onmessage = function (e) {
      mine._onMessage(e);
    };

  },

  _unsubscribe: function() {
    this._socket.close();
    this._socket = null;
  },

  _updateSocketParams: function() {
    this.socketReady = false;
    this._socket.send(this._generateQueryParams());
  },

  _updateSocketToMapZoom: function (){
    if (!this.socketReady) {
      return
    }
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

    if (this.options.customExtent === null || !this.options.useMapViewExtent) {
      filter.geometry = null;
    }

    if (this.options.useMapViewExtent) {
      var mapBounds = this._map.getBounds();
      filter.geometry = L.esri.Util.boundsToExtent(mapBounds);
      this._map.addEventListener('moveend', this._updateSocketToMapZoom, this);
    }

    return JSON.stringify({filter: filter});
  },

  _onMessage: function (e) {
    var msg = JSON.parse(e.data)
    
    if (msg.filter) {
      this.fire('socketUpdated');
      this.socketReady = true;
      return;
    }
    
    if (!this.socketReady) {
      return
    }

    var geojson;
    if (msg.geometry) {
      geojson = L.esri.Util.arcgisToGeoJSON(msg);
    }
    


    // If we need to update features based on some id field
    if (this.idField) {
      geojson.id = geojson.properties[this.idField];
    }

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

L.esri.streamFeatureLayer = function (options) {
  if (options.useMapViewExtent && options.customExtent) {
    return console.warn('Esri-Leaflet-Stream: Layer must either use map view extent or a custom extent, not both.')
  }
  return new StreamFeatureLayer(options);
};