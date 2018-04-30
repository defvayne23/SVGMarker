/*! SVGMarker v0.8.1 - https://github.com/defvayne23/SVGMarker */
SVGMarker.prototype = new google.maps.OverlayView();

/** @constructor */
function SVGMarker(options) {
  var default_ = {
    clickable: true,
    cursor: 'pointer',
    draggable: false,
    icon: {
      anchor: new google.maps.Point(0, 0),
      size: new google.maps.Size(30,30),
      url: '',
      text: {
        content: '',
        font: 'Helvetica, sans-serif',
        color: '#000',
        size: '10px',
        weight: '400',
        position: [0,0]
      },
      class: 'SVGMarker',
      html: ''
    },
    map: '',
    opacity: 1,
    position: '',
    title: '',
    visible: true,
    zIndex: '',
  }

  // Merge options with default
  for(var key in options) {
    if(typeof default_[key] === 'object') {
      for(var key2 in options[key]) {
        if(typeof default_[key][key2] === 'object') {
          for(var key3 in options[key][key2]) {
            if(options[key][key2].hasOwnProperty(key3)) {
              default_[key][key2][key3] = options[key][key2][key3];
            }
          }
        } else {
          if(options[key].hasOwnProperty(key2)) {
            default_[key][key2] = options[key][key2];
          }
        }
      }
    } else {
      if(options.hasOwnProperty(key)) {
        default_[key] = options[key];
      }
    }
  }
  this.setValues(default_);

  // Explicitly call setMap on this overlay
  if('map' in options) {
    this.setMap(options.map);
  }
}

/**
 * onAdd is called when the map's panes are ready and the overlay has been
 * added to the map.
 */
SVGMarker.prototype.onAdd = function() {
  var self = this;

  // Create container with no visible styles
  var container = document.createElement('div');
  container.style.border = 'none';
  container.style.borderWidth = '0px';
  container.style.position = 'absolute';

  // Set class
  if(this.get('icon').class !== '') {
    container.setAttribute('class', this.get('icon').class);
  }

  this.classList = container.classList;

  // Set zIndex
  if(this.get('zIndex') !== '') {
    container.style.zIndex = this.get('zIndex');
  }

  // Set if marker is visible when added
  if(this.get('visible') === false) {
    container.style.visibility = 'hidden';
  }

  // Set marker opacity
  if(this.get('opacity') >= 0 && this.get('opacity') <= 1) {
    container.style.opacity = this.get('opacity');
  }

  // Add click event to container
  if(this.get('clickable') === true) {
    google.maps.event.addDomListener(container, 'click', function(event) {
      google.maps.event.trigger(self, 'click', event);
    });
  }

  // Add drag start and end to container
  if(this.get('draggable') === true) {
    google.maps.event.addDomListener(container, 'drag', function(event) {
      google.maps.event.trigger(self, 'drag', event);
    });

    google.maps.event.addDomListener(container, 'mousedown', function(event){
      google.maps.event.trigger(self, 'dragstart', event);

      this.style.cursor='move';
      self.get('map').set('draggable',false);

      var origin = event;

      self.moveHandler  = google.maps.event.addDomListener(self.get('map').getDiv(), 'mousemove', function(event){
        google.maps.event.trigger(self, 'drag', event);

        var left   = origin.clientX-event.clientX,
            top    = origin.clientY-event.clientY,
            pos    = self.getProjection().fromLatLngToDivPixel(self.get('position')),
            latLng = self.getProjection().fromDivPixelToLatLng(new google.maps.Point(pos.x-left,pos.y-top));

        origin = event;
        self.set('position', latLng);
        self.draw();
      });
    });

    google.maps.event.addDomListener(container, 'mouseup', function(event){
      google.maps.event.trigger(self, 'dragend', event);
      self.get('map').set('draggable',true);
      this.style.cursor='default';
      google.maps.event.removeListener(self.moveHandler);
    });

    google.maps.event.addDomListener(this.get('map').getDiv(), 'mouseleave', function(event){
      google.maps.event.trigger(container, 'mouseup', event);
    });
  }

  google.maps.event.addDomListener(container, 'mouseover', function(event){
    google.maps.event.trigger(self, 'mouseover', event);
  });

  google.maps.event.addDomListener(container, 'mouseout', function(event){
    google.maps.event.trigger(self, 'mouseout', event);
  });

  // Create the img element
  var img = document.createElement('img');
  img.src = this.get('icon').url;
  img.classList.add('SVGMarkerIcon');
  img.style.width = this.get('icon').size.width+'px';
  img.style.height = this.get('icon').size.height+'px';
  img.style.display = 'block';
  img.setAttribute('alt', this.get('title'));

  // Attach image to div
  container.appendChild(img);

  if(this.get('icon').text.content !== '') {
    var text = document.createElement('span');
    text.textContent = this.get('icon').text.content;
    text.style.fontFamily = this.get('icon').text.font;
    text.style.fontSize = this.get('icon').text.size;
    text.style.fontWeight = this.get('icon').text.weight;
    text.style.color = this.get('icon').text.color;
    text.style.position = 'absolute';
    text.style.top = this.get('icon').text.position[0] + 'px';
    text.style.left = this.get('icon').text.position[1] + 'px';
    text.style.transform = 'translate(-50%, -50%)';
    this.get('container').appendChild(text);
  }

  if(this.get('icon').html !== '') {
    container.appendChild( this.get('icon').html );
  }

  // Add the element to the "overlayImage" pane.
  this.set('container', container);
  this.getPanes().overlayImage.appendChild(container);
};

SVGMarker.prototype.draw = function() {
  var overlayProjection = this.getProjection();
  var coords = overlayProjection.fromLatLngToDivPixel(this.get('position'));

  this.get('container').style.left = (coords.x - this.get('icon').anchor.x) + 'px';
  this.get('container').style.top = (coords.y - this.get('icon').anchor.y) + 'px';

  this.get('container').style.cursor = this.get('cursor');
};

SVGMarker.prototype.onRemove = function() {
  this.get('container').parentNode.removeChild(this.get('container'));
  this.set('container', null);
};

SVGMarker.prototype.setZIndex = function(zindex) {
  if (this.get('container')) {
    this.get('container').style.zIndex = zindex;
  }
};

SVGMarker.prototype.setOpacity = function(opacity_value) {
  if (this.get('container')) {
    this.get('container').style.opacity = opacity_value;
  }
};

SVGMarker.prototype.setIcon = function(new_icon) {
  var current_icon = this.get('icon');

  // Make sure this isn't being called during init
  if(current_icon) {
    // Marge icon with default
    for(var key in new_icon) {
      if(typeof current_icon[key] === 'object') {
        for(var key2 in new_icon[key]) {
          if(typeof current_icon[key][key2] === 'object') {
            for(var key3 in new_icon[key][key2]) {
              if(new_icon[key][key2].hasOwnProperty(key3)) {
                current_icon[key][key2][key3] = new_icon[key][key2][key3];
              }
            }
          } else {
            if(new_icon[key].hasOwnProperty(key2)) {
              current_icon[key][key2] = new_icon[key][key2];
            }
          }
        }
      } else {
        if(new_icon.hasOwnProperty(key)) {
          current_icon[key] = new_icon[key];
        }
      }
    }
    this.set('icon', current_icon);

    // Update image
    var img = this.get('container').querySelector('img.SVGMarkerIcon');
    img.src = current_icon.url;
    img.style.width = current_icon.size.width+'px';
    img.style.height = current_icon.size.height+'px';

    // Update anchor
    var overlayProjection = this.getProjection();
    var coords = overlayProjection.fromLatLngToDivPixel(this.get('position'));

    this.get('container').style.left = (coords.x - current_icon.anchor.x) + 'px';
    this.get('container').style.top = (coords.y - current_icon.anchor.y) + 'px';
  } else {
    this.set('icon', new_icon);
  }
};

SVGMarker.prototype.hide = function() {
  if (this.get('container')) {
    this.get('container').style.visibility = 'hidden';
  }
};

SVGMarker.prototype.show = function() {
  if (this.get('container')) {
    this.get('container').style.visibility = 'visible';
  }
};

SVGMarker.prototype.toggle = function() {
  if (this.get('container')) {
    if (this.get('container').style.visibility === 'hidden') {
      this.show();
    } else {
      this.hide();
    }
  }
};

SVGMarker.prototype.getPosition = function() {
  return this.get('position');
};

// Detach from map
SVGMarker.prototype.toggleDOM = function() {
  if (this.getMap()) {
    // Note: Calls onRemove()
    this.setMap(null);
  } else {
    // Note: Calls onAdd()
    this.setMap(this.get('map'));
  }
};
