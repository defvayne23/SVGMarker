/*! SVGMarker v0.2.0 - https://github.com/defvayne23/SVGMarker */
SVGMarker.prototype = new google.maps.OverlayView();

/** @constructor */
function SVGMarker(options) {
  var default_ = {
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
      }
    },
    map: '',
    opacity: 1,
    position: '',
    title: '',
    visible: true,
    zindex: '',
  }

  // Merge options with default
  for(var key in options) {
    if(typeof default_[key] === 'object') {
      for(var key2 in options[key]) {
        if(options[key].hasOwnProperty(key2)) {
          default_[key][key2] = options[key][key2];
        }
      }
    } else {
      if(options.hasOwnProperty(key)) {
        default_[key] = options[key];
      }
    }
  }
  this.options_ = default_;

  // Define div container
  this.div_ = null;

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
  this.div_ = document.createElement('div');
  this.div_.style.border = 'none';
  this.div_.style.borderWidth = '0px';
  this.div_.style.position = 'absolute';

  // Set if marker is visible when added
  if(this.options_.visible === false) {
    this.div_.style.visibility = 'hidden';
  }

  // Set marker opacity
  if(this.options_.opacity >= 0 && this.options_.opacity <= 1) {
    this.div_.style.opacity = this.options_.opacity;
  }

  // Add click event to container
  if(this.options_.clickable === true) {
    google.maps.event.addDomListener(this.div_, 'click', function() {
      google.maps.event.trigger(self, 'click');
    });
  }

  // Add drag start and end to container
  if(this.options_.draggable === true) {
    // TODO: Add draggable
  }

  // Create the img element
  var img = document.createElement('img');
  img.src = this.options_.icon.url;
  img.style.width = this.options_.icon.size.width+'px';
  img.style.height = this.options_.icon.size.height+'px';
  img.setAttribute('alt', this.options_.title);

  // Attach image to div
  this.div_.appendChild(img);

  if(this.options_.icon.text.content !== '') {
    var text = document.createElement('span');
    text.textContent = this.options_.icon.text.content;
    text.style.fontFamily = this.options_.icon.text.font;
    text.style.fontSize = this.options_.icon.text.size;
    text.style.fontWeight = this.options_.icon.text.weight;
    text.style.color = this.options_.icon.text.color;
    text.style.position = 'absolute';
    text.style.top = this.options_.icon.text.position[0] + 'px';
    text.style.left = this.options_.icon.text.position[1] + 'px';
    text.style.transform = 'translate(-50%, -50%)';
    this.div_.appendChild(text);
  }

  google.maps.event.addDomListener(this.div_, 'click', function() {
    google.maps.event.trigger(self, 'click', self);
  });

  // Add the element to the "overlayImage" pane.
  var panes = this.getPanes();
  panes.overlayImage.appendChild(this.div_);
};

SVGMarker.prototype.draw = function() {
  var overlayProjection = this.getProjection();
  var coords = overlayProjection.fromLatLngToDivPixel(this.options_.position);

  this.div_.style.left = (coords.x - this.options_.icon.anchor.x) + 'px';
  this.div_.style.top = (coords.y - this.options_.icon.anchor.y) + 'px';

  this.div_.style.cursor = 'pointer'; // TODO: Only set this if clickable. Change if draggable.
};

SVGMarker.prototype.onRemove = function() {
  this.div_.parentNode.removeChild(this.div_);
  this.div_ = null;
};

// Set the visibility to 'hidden' or 'visible'.
SVGMarker.prototype.hide = function() {
  if (this.div_) {
    // The visibility property must be a string enclosed in quotes.
    this.div_.style.visibility = 'hidden';
  }
};

SVGMarker.prototype.show = function() {
  if (this.div_) {
    this.div_.style.visibility = 'visible';
  }
};

SVGMarker.prototype.toggle = function() {
  if (this.div_) {
    if (this.div_.style.visibility === 'hidden') {
      this.show();
    } else {
      this.hide();
    }
  }
};

SVGMarker.prototype.getPosition = function() {
  return this.options_.position;
};

// Detach from map
SVGMarker.prototype.toggleDOM = function() {
  if (this.getMap()) {
    // Note: Calls onRemove()
    this.setMap(null);
  } else {
    // Note: Calls onAdd()
    this.setMap(this.options_.map);
  }
};
