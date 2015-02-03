// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @externs_url http://closure-compiler.googlecode.com/svn/trunk/contrib/externs/maps/google_maps_api_v3.js
// ==/ClosureCompiler==

/**
* @name CSS3 InfoBubble with tabs for Google Maps API V3
* @version 0.8
* @author Luke Mahe
* @fileoverview
* This library is a CSS Infobubble with tabs. It uses css3 rounded corners and
* drop shadows and animations. It also allows tabs
*/

/*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


/**
* A CSS3 InfoBubble v0.8
* @param {Object.<string, *>=} opt_options Optional properties to set.
* @extends {google.maps.OverlayView}
* @constructor
*/
function InfoBubble(opt_options) {
  this.tabs_ = [];
  this.activeTab_ = null;
  this.baseZIndex_ = 100;
  this.isOpen_ = false;

  var options = opt_options || {};

  if (options['backgroundColor'] == undefined) {
    options['backgroundColor'] = this.BACKGROUND_COLOR_;
  }

  if (options['borderColor'] == undefined) {
    options['borderColor'] = this.BORDER_COLOR_;
  }

  if (options['borderRadius'] == undefined) {
    options['borderRadius'] = this.BORDER_RADIUS_;
  }

  if (options['borderWidth'] == undefined) {
    options['borderWidth'] = this.BORDER_WIDTH_;
  }

  if (options['padding'] == undefined) {
    options['padding'] = this.PADDING_;
  }

  if (options['arrowPosition'] == undefined) {
    options['arrowPosition'] = this.ARROW_POSITION_;
  }

  if (options['disableAutoPan'] == undefined) {
    options['disableAutoPan'] = false;
  }

  if (options['disableAnimation'] == undefined) {
    options['disableAnimation'] = false;
  }

  if (options['minWidth'] == undefined) {
    options['minWidth'] = this.MIN_WIDTH_;
  }

  if (options['shadowStyle'] == undefined) {
    options['shadowStyle'] = this.SHADOW_STYLE_;
  }

  if (options['arrowSize'] == undefined) {
    options['arrowSize'] = this.ARROW_SIZE_;
  }

  if (options['arrowStyle'] == undefined) {
    options['arrowStyle'] = this.ARROW_STYLE_;
  }

  this.buildDom_();

  this.setValues(options);
}
InfoBubble.prototype = new google.maps.OverlayView();
window['InfoBubble'] = InfoBubble;


/**
* Default arrow size
* @const
* @private
*/
InfoBubble.prototype.ARROW_SIZE_ = 15;


/**
* Default arrow style
* @const
* @private
*/
InfoBubble.prototype.ARROW_STYLE_ = 0;


/**
* Default shadow style
* @const
* @private
*/
InfoBubble.prototype.SHADOW_STYLE_ = 1;


/**
* Default min width
* @const
* @private
*/
InfoBubble.prototype.MIN_WIDTH_ = 50;


/**
* Default arrow position
* @const
* @private
*/
InfoBubble.prototype.ARROW_POSITION_ = 50;


/**
* Default padding
* @const
* @private
*/
InfoBubble.prototype.PADDING_ = 10;


/**
* Default border width
* @const
* @private
*/
InfoBubble.prototype.BORDER_WIDTH_ = 1;


/**
* Default border color
* @const
* @private
*/
InfoBubble.prototype.BORDER_COLOR_ = '#ccc';


/**
* Default border radius
* @const
* @private
*/
InfoBubble.prototype.BORDER_RADIUS_ = 10;


/**
* Default background color
* @const
* @private
*/
InfoBubble.prototype.BACKGROUND_COLOR_ = '#fff';


/**
* Builds the InfoBubble dom
* @private
*/
InfoBubble.prototype.buildDom_ = function() {
  var bubble = this.bubble_ = document.createElement('DIV');
  bubble.style['position'] = 'absolute';
  bubble.style['zIndex'] = this.baseZIndex_;

  var tabsContainer = this.tabsContainer_ = document.createElement('DIV');
  tabsContainer.style['position'] = 'relative';

  // Close button
  var close = this.close_ = document.createElement('IMG');
  close.style['position'] = 'absolute';
  close.style['width'] = this.px(12);
  close.style['height'] = this.px(12);
  close.style['border'] = 0;
  close.style['zIndex'] = this.baseZIndex_ + 1;
  close.style['cursor'] = 'pointer';
  close.src = 'http://maps.gstatic.com/intl/en_us/mapfiles/iw_close.gif';

  var that = this;
  google.maps.event.addDomListener(close, 'click', function() {
    that.close();
  });

  // Content area
  var contentContainer = this.contentContainer_ = document.createElement('DIV');
  contentContainer.style['overflowX'] = 'auto';
  contentContainer.style['overflowY'] = 'auto';
  contentContainer.style['cursor'] = 'default';
  contentContainer.style['clear'] = 'both';
  contentContainer.style['position'] = 'relative';

  var content = this.content_ = document.createElement('DIV');
  contentContainer.appendChild(content);

  // Arrow
  var arrow = this.arrow_ = document.createElement('DIV');
  arrow.style['position'] = 'relative';

  var arrowOuter = this.arrowOuter_ = document.createElement('DIV');
  var arrowInner = this.arrowInner_ = document.createElement('DIV');

  var arrowSize = this.getArrowSize_();

  arrowOuter.style['position'] = arrowInner.style['position'] = 'absolute';
  arrowOuter.style['left'] = arrowInner.style['left'] = '50%';
  arrowOuter.style['height'] = arrowInner.style['height'] = '0';
  arrowOuter.style['width'] = arrowInner.style['width'] = '0';
  arrowOuter.style['marginLeft'] = this.px(-arrowSize);
  arrowOuter.style['borderWidth'] = this.px(arrowSize);
  arrowOuter.style['borderBottomWidth'] = 0;

  // Shadow
  var bubbleShadow = this.bubbleShadow_ = document.createElement('DIV');
  bubbleShadow.style['position'] = 'absolute';

  // Hide the InfoBubble by default
  bubble.style['display'] = bubbleShadow.style['display'] = 'none';

  bubble.appendChild(this.tabsContainer_);
  bubble.appendChild(close);
  bubble.appendChild(contentContainer);
  arrow.appendChild(arrowOuter);
  arrow.appendChild(arrowInner);
  bubble.appendChild(arrow);

  var stylesheet = document.createElement('style');
  stylesheet.setAttribute('type', 'text/css');

  /**
  * The animation for the infobubble
  * @type {string}
  */
  this.animationName_ = '_ibani_' + Math.round(Math.random() * 10000);

  var css = '.' + this.animationName_ + '{-webkit-animation-name:' +
  this.animationName_ + ';-webkit-animation-duration:0.5s;' +
  '-webkit-animation-iteration-count:1;}' +
  '@-webkit-keyframes ' + this.animationName_ + ' {from {' +
  '-webkit-transform: scale(0)}50% {-webkit-transform: scale(1.2)}90% ' +
  '{-webkit-transform: scale(0.95)}to {-webkit-transform: scale(1)}}';

  stylesheet.textContent = css;
  document.getElementsByTagName('head')[0].appendChild(stylesheet);
};


/**
* Sets the background class name
*
* @param {string} className The class name to set.
*/
InfoBubble.prototype.setBackgroundClassName = function(className) {
  this.set('backgroundClassName', className);
};
InfoBubble.prototype['setBackgroundClassName'] =
InfoBubble.prototype.setBackgroundClassName;


/**
* changed MVC callback
*/
InfoBubble.prototype.backgroundClassName_changed = function() {
  this.content_.className = this.get('backgroundClassName');
};
InfoBubble.prototype['backgroundClassName_changed'] =
InfoBubble.prototype.backgroundClassName_changed;


/**
* Sets the class of the tab
*
* @param {string} className the class name to set.
*/
InfoBubble.prototype.setTabClassName = function(className) {
  this.set('tabClassName', className);
};
InfoBubble.prototype['setTabClassName'] =
InfoBubble.prototype.setTabClassName;


/**
* tabClassName changed MVC callback
*/
InfoBubble.prototype.tabClassName_changed = function() {
  this.updateTabStyles_();
};
InfoBubble.prototype['tabClassName_changed'] =
InfoBubble.prototype.tabClassName_changed;


/**
* Gets the style of the arrow
*
* @private
* @return {number} The style of the arrow.
*/
InfoBubble.prototype.getArrowStyle_ = function() {
  return parseInt(this.get('arrowStyle'), 10) || 0;
};


/**
* Sets the style of the arrow
*
* @param {number} style The style of the arrow.
*/
InfoBubble.prototype.setArrowStyle = function(style) {
  this.set('arrowStyle', style);
};
InfoBubble.prototype['setArrowStyle'] =
InfoBubble.prototype.setArrowStyle;


/**
* Arrow style changed MVC callback
*/
InfoBubble.prototype.arrowStyle_changed = function() {
  this.arrowSize_changed();
};
InfoBubble.prototype['arrowStyle_changed'] =
InfoBubble.prototype.arrowStyle_changed;


/**
* Gets the size of the arrow
*
* @private
* @return {number} The size of the arrow.
*/
InfoBubble.prototype.getArrowSize_ = function() {
  return parseInt(this.get('arrowSize'), 10) || 0;
};


/**
* Sets the size of the arrow
*
* @param {number} size The size of the arrow.
*/
InfoBubble.prototype.setArrowSize = function(size) {
  this.set('arrowSize', size);
};
InfoBubble.prototype['setArrowSize'] =
InfoBubble.prototype.setArrowSize;


/**
* Arrow size changed MVC callback
*/
InfoBubble.prototype.arrowSize_changed = function() {
  this.borderWidth_changed();
};
InfoBubble.prototype['arrowSize_changed'] =
InfoBubble.prototype.arrowSize_changed;


/**
* Set the position of the InfoBubble arrow
*
* @param {number} pos The position to set.
*/
InfoBubble.prototype.setArrowPosition = function(pos) {
  this.set('arrowPosition', pos);
};
InfoBubble.prototype['setArrowPosition'] =
InfoBubble.prototype.setArrowPosition;


/**
* Get the position of the InfoBubble arrow
*
* @private
* @return {number} The position..
*/
InfoBubble.prototype.getArrowPosition_ = function() {
  return parseInt(this.get('arrowPosition'), 10) || 0;
};


/**
* arrowPosition changed MVC callback
*/
InfoBubble.prototype.arrowPosition_changed = function() {
  var pos = this.getArrowPosition_();
  this.arrowOuter_.style['left'] = this.arrowInner_.style['left'] = pos + '%';

  this.redraw_();
};
InfoBubble.prototype['arrowPosition_changed'] =
InfoBubble.prototype.arrowPosition_changed;


/**
* Set the zIndex of the InfoBubble
*
* @param {number} zIndex The zIndex to set.
*/
InfoBubble.prototype.setZIndex = function(zIndex) {
  this.set('zIndex', zIndex);
};
InfoBubble.prototype['setZIndex'] = InfoBubble.prototype.setZIndex;


/**
* Get the zIndex of the InfoBubble
*
* @return {number} The zIndex to set.
*/
InfoBubble.prototype.getZIndex = function() {
  return parseInt(this.get('zIndex'), 10) || this.baseZIndex_;
};


/**
* zIndex changed MVC callback
*/
InfoBubble.prototype.zIndex_changed = function() {
  var zIndex = this.getZIndex_();

  this.bubble_.style['zIndex'] = this.baseZIndex_ = zIndex;
  this.close_.style['zIndex'] = zIndex_ + 1;
};
InfoBubble.prototype['zIndex_changed'] = InfoBubble.prototype.zIndex_changed;


/**
* Set the style of the shadow
*
* @param {number} shadowStyle The style of the shadow.
*/
InfoBubble.prototype.setShadowStyle = function(shadowStyle) {
  this.set('shadowStyle', shadowStyle);
};
InfoBubble.prototype['setShadowStyle'] = InfoBubble.prototype.setShadowStyle;


/**
* Get the style of the shadow
*
* @private
* @return {number} The style of the shadow.
*/
InfoBubble.prototype.getShadowStyle_ = function() {
  return parseInt(this.get('shadowStyle'), 10) || 0;
};


/**
* shadowStyle changed MVC callback
*/
InfoBubble.prototype.shadowStyle_changed = function() {
  var shadowStyle = this.getShadowStyle_();

  var display = '';
  var shadow = '';
  var backgroundColor = '';
  switch (shadowStyle) {
    case 0:
      display = 'none';
      break;
      case 1:
        shadow = '40px 15px 10px rgba(33,33,33,0.3)';
        backgroundColor = 'transparent';
        break;
        case 2:
          shadow = '0 0 2px rgba(33,33,33,0.3)';
          backgroundColor = 'rgba(33,33,33,0.35)';
          break;
        }
        this.bubbleShadow_.style['boxShadow'] =
        this.bubbleShadow_.style['webkitBoxShadow'] =
        this.bubbleShadow_.style['MozBoxShadow'] = shadow;
        this.bubbleShadow_.style['backgroundColor'] = backgroundColor;
        this.bubbleShadow_.style['display'] = display;
        this.draw();
      };
      InfoBubble.prototype['shadowStyle_changed'] =
      InfoBubble.prototype.shadowStyle_changed;


      /**
      * Show the close button
      */
      InfoBubble.prototype.showCloseButton = function() {
        this.set('hideCloseButton', false);
      };
      InfoBubble.prototype['showCloseButton'] = InfoBubble.prototype.showCloseButton;


      /**
      * Hide the close button
      */
      InfoBubble.prototype.hideCloseButton = function() {
        this.set('hideCloseButton', true);
      };
      InfoBubble.prototype['hideCloseButton'] = InfoBubble.prototype.hideCloseButton;


      /**
      * hideCloseButton changed MVC callback
      */
      InfoBubble.prototype.hideCloseButton_changed = function() {
        this.close_.style['display'] = this.get('hideCloseButton') ? 'none' : '';
      };
      InfoBubble.prototype['hideCloseButton_changed'] =
      InfoBubble.prototype.hideCloseButton_changed;


      /**
      * Set the background color
      *
      * @param {string} color The color to set.
      */
      InfoBubble.prototype.setBackgroundColor = function(color) {
        if (color) {
          this.set('backgroundColor', color);
        }
      };
      InfoBubble.prototype['setBackgroundColor'] =
      InfoBubble.prototype.setBackgroundColor;


      /**
      * backgroundColor changed MVC callback
      */
      InfoBubble.prototype.backgroundColor_changed = function() {
        var backgroundColor = this.get('backgroundColor');
        this.contentContainer_.style['backgroundColor'] = backgroundColor;

        this.arrowInner_.style['borderColor'] = backgroundColor +
        ' transparent transparent';
        this.updateTabStyles_();
      };
      InfoBubble.prototype['backgroundColor_changed'] =
      InfoBubble.prototype.backgroundColor_changed;


      /**
      * Set the border color
      *
      * @param {string} color The border color.
      */
      InfoBubble.prototype.setBorderColor = function(color) {
        if (color) {
          this.set('borderColor', color);
        }
      };
      InfoBubble.prototype['setBorderColor'] = InfoBubble.prototype.setBorderColor;


      /**
      * borderColor changed MVC callback
      */
      InfoBubble.prototype.borderColor_changed = function() {
        var borderColor = this.get('borderColor');

        var contentContainer = this.contentContainer_;
        var arrowOuter = this.arrowOuter_;
        contentContainer.style['borderColor'] = borderColor;

        arrowOuter.style['borderColor'] = borderColor +
        ' transparent transparent';

        contentContainer.style['borderStyle'] =
        arrowOuter.style['borderStyle'] =
        this.arrowInner_.style['borderStyle'] = 'solid';

        this.updateTabStyles_();
      };
      InfoBubble.prototype['borderColor_changed'] =
      InfoBubble.prototype.borderColor_changed;


      /**
      * Set the radius of the border
      *
      * @param {number} radius The radius of the border.
      */
      InfoBubble.prototype.setBorderRadius = function(radius) {
        this.set('borderRadius', radius);
      };
      InfoBubble.prototype['setBorderRadius'] = InfoBubble.prototype.setBorderRadius;


      /**
      * Get the radius of the border
      *
      * @private
      * @return {number} The radius of the border.
      */
      InfoBubble.prototype.getBorderRadius_ = function() {
        return parseInt(this.get('borderRadius'), 10) || 0;
      };


      /**
      * borderRadius changed MVC callback
      */
      InfoBubble.prototype.borderRadius_changed = function() {
        var borderRadius = this.getBorderRadius_();
        var borderWidth = this.getBorderWidth_();

        this.contentContainer_.style['borderRadius'] =
        this.contentContainer_.style['MozBorderRadius'] =
        this.contentContainer_.style['webkitBorderRadius'] =
        this.bubbleShadow_.style['borderRadius'] =
        this.bubbleShadow_.style['MozBorderRadius'] =
        this.bubbleShadow_.style['webkitBorderRadius'] = this.px(borderRadius);

        this.tabsContainer_.style['paddingLeft'] =
        this.tabsContainer_.style['paddingRight'] =
        this.px(borderRadius + borderWidth);

        this.redraw_();
      };
      InfoBubble.prototype['borderRadius_changed'] =
      InfoBubble.prototype.borderRadius_changed;


      /**
      * Get the width of the border
      *
      * @private
      * @return {number} width The width of the border.
      */
      InfoBubble.prototype.getBorderWidth_ = function() {
        return parseInt(this.get('borderWidth'), 10) || 0;
      };


      /**
      * Set the width of the border
      *
      * @param {number} width The width of the border.
      */
      InfoBubble.prototype.setBorderWidth = function(width) {
        this.set('borderWidth', width);
      };
      InfoBubble.prototype['setBorderWidth'] = InfoBubble.prototype.setBorderWidth;


      /**
      * borderWidth change MVC callback
      */
      InfoBubble.prototype.borderWidth_changed = function() {
        var borderWidth = this.getBorderWidth_();

        this.contentContainer_.style['borderWidth'] = this.px(borderWidth);
        this.tabsContainer_.style['top'] = this.px(borderWidth);

        this.updateArrowStyle_();
        this.updateTabStyles_();
        this.borderRadius_changed();
        this.redraw_();
      };
      InfoBubble.prototype['borderWidth_changed'] =
      InfoBubble.prototype.borderWidth_changed;


      /**
      * Update the arrow style
      * @private
      */
      InfoBubble.prototype.updateArrowStyle_ = function() {
        var borderWidth = this.getBorderWidth_();
        var arrowSize = this.getArrowSize_();
        var arrowStyle = this.getArrowStyle_();
        var arrowOuterSizePx = this.px(arrowSize);
        var arrowInnerSizePx = this.px(arrowSize - borderWidth);

        var outer = this.arrowOuter_;
        var inner = this.arrowInner_;

        this.arrow_.style['marginTop'] = this.px(-borderWidth);
        outer.style['borderTopWidth'] = arrowOuterSizePx;
        inner.style['borderTopWidth'] = arrowInnerSizePx;

        // Full arrow or arrow pointing to the left
        if (arrowStyle == 0 || arrowStyle == 1) {
          outer.style['borderLeftWidth'] = arrowOuterSizePx;
          inner.style['borderLeftWidth'] = arrowInnerSizePx;
        } else {
          outer.style['borderLeftWidth'] = inner.style['borderLeftWidth'] = 0;
        }

        // Full arrow or arrow pointing to the right
        if (arrowStyle == 0 || arrowStyle == 2) {
          outer.style['borderRightWidth'] = arrowOuterSizePx;
          inner.style['borderRightWidth'] = arrowInnerSizePx;
        } else {
          outer.style['borderRightWidth'] = inner.style['borderRightWidth'] = 0;
        }

        if (arrowStyle < 2) {
          outer.style['marginLeft'] = this.px(-(arrowSize));
          inner.style['marginLeft'] = this.px(-(arrowSize - borderWidth));
        } else {
          outer.style['marginLeft'] = inner.style['marginLeft'] = 0;
        }

        // If there is no border then don't show thw outer arrow
        if (borderWidth == 0) {
          outer.style['display'] = 'none';
        } else {
          outer.style['display'] = '';
        }
      };


      /**
      * Set the padding of the InfoBubble
      *
      * @param {number} padding The padding to apply.
      */
      InfoBubble.prototype.setPadding = function(padding) {
        this.set('padding', padding);
      };
      InfoBubble.prototype['setPadding'] = InfoBubble.prototype.setPadding;


      /**
      * Set the padding of the InfoBubble
      *
      * @private
      * @return {number} padding The padding to apply.
      */
      InfoBubble.prototype.getPadding_ = function() {
        return parseInt(this.get('padding'), 10) || 0;
      };


      /**
      * padding changed MVC callback
      */
      InfoBubble.prototype.padding_changed = function() {
        var padding = this.getPadding_();
        this.contentContainer_.style['padding'] = this.px(padding);
        this.updateTabStyles_();

        this.redraw_();
      };
      InfoBubble.prototype['padding_changed'] = InfoBubble.prototype.padding_changed;


      /**
      * Add px extention to the number
      *
      * @param {number} num The number to wrap.
      * @return {string|number} A wrapped number.
      */
      InfoBubble.prototype.px = function(num) {
        if (num) {
          // 0 doesn't need to be wrapped
          return num + 'px';
        }
        return num;
      };


      /**
      * Add events to stop propagation
      * @private
      */
      InfoBubble.prototype.addEvents_ = function() {
        // We want to cancel all the events so they do not go to the map
        var events = ['mousedown', 'mousemove', 'mouseover', 'mouseout', 'mouseup',
        'mousewheel', 'DOMMouseScroll', 'touchstart', 'touchend', 'touchmove',
        'dblclick', 'contextmenu'];

        var bubble = this.bubble_;
        this.listeners_ = [];
        for (var i = 0, event; event = events[i]; i++) {
          this.listeners_.push(
            google.maps.event.addDomListener(bubble, event, function(e) {
              e.cancelBubble = true;
              if (e.stopPropagation) {
                e.stopPropagation();
              }
            })
          );
        }
      };


      /**
      * On Adding the InfoBubble to a map
      * Implementing the OverlayView interface
      */
      InfoBubble.prototype.onAdd = function() {
        if (!this.bubble_) {
          this.buildDom_();
        }

        this.addEvents_();

        var panes = this.getPanes();
        if (panes) {
          panes.floatPane.appendChild(this.bubble_);
          panes.floatShadow.appendChild(this.bubbleShadow_);
        }
      };
      InfoBubble.prototype['onAdd'] = InfoBubble.prototype.onAdd;


      /**
      * Draw the InfoBubble
      * Implementing the OverlayView interface
      */
      InfoBubble.prototype.draw = function() {
        var projection = this.getProjection();

        if (!projection) {
          // The map projection is not ready yet so do nothing
          return;
        }

        var latLng = /** @type {google.maps.LatLng} */ (this.get('position'));

        if (!latLng) {
          this.close();
          return;
        }

        var tabHeight = 0;

        if (this.activeTab_) {
          tabHeight = this.activeTab_.offsetHeight;
        }

        var anchorHeight = this.getAnchorHeight_();
        var arrowSize = this.getArrowSize_();
        var arrowPosition = this.getArrowPosition_();

        arrowPosition = arrowPosition / 100;

        var pos = projection.fromLatLngToDivPixel(latLng);
        var width = this.contentContainer_.offsetWidth;
        var height = this.bubble_.offsetHeight;

        if (!width) {
          return;
        }

        // Adjust for the height of the info bubble
        var top = pos.y - (height + arrowSize);

        if (anchorHeight) {
          // If there is an anchor then include the height
          top -= anchorHeight;
        }

        var left = pos.x - (width * arrowPosition);

        this.bubble_.style['top'] = this.px(top);
        this.bubble_.style['left'] = this.px(left);

        var shadowStyle = parseInt(this.get('shadowStyle'), 10);

        switch (shadowStyle) {
          case 1:
            // Shadow is behind
            this.bubbleShadow_.style['top'] = this.px(top + tabHeight - 1);
            this.bubbleShadow_.style['left'] = this.px(left);
            this.bubbleShadow_.style['width'] = this.px(width);
            this.bubbleShadow_.style['height'] =
            this.px(this.contentContainer_.offsetHeight - arrowSize);
            break;
            case 2:
              // Shadow is below
              width = width * 0.8;
              if (anchorHeight) {
                this.bubbleShadow_.style['top'] = this.px(pos.y);
              } else {
                this.bubbleShadow_.style['top'] = this.px(pos.y + arrowSize);
              }
              this.bubbleShadow_.style['left'] = this.px(pos.x - width * arrowPosition);

              this.bubbleShadow_.style['width'] = this.px(width);
              this.bubbleShadow_.style['height'] = this.px(2);
              break;
            }
          };
          InfoBubble.prototype['draw'] = InfoBubble.prototype.draw;


          /**
          * Removing the InfoBubble from a map
          */
          InfoBubble.prototype.onRemove = function() {
            if (this.bubble_ && this.bubble_.parentNode) {
              this.bubble_.parentNode.removeChild(this.bubble_);
            }
            if (this.bubbleShadow_ && this.bubbleShadow_.parentNode) {
              this.bubbleShadow_.parentNode.removeChild(this.bubbleShadow_);
            }

            for (var i = 0, listener; listener = this.listeners_[i]; i++) {
              google.maps.event.removeListener(listener);
            }
          };
          InfoBubble.prototype['onRemove'] = InfoBubble.prototype.onRemove;


          /**
          * Is the InfoBubble open
          *
          * @return {boolean} If the InfoBubble is open.
          */
          InfoBubble.prototype.isOpen = function() {
            return this.isOpen_;
          };
          InfoBubble.prototype['isOpen'] = InfoBubble.prototype.isOpen;



          /**
          * Close the InfoBubble
          */
          InfoBubble.prototype.close = function() {
            if (this.bubble_) {
              this.bubble_.style['display'] = 'none';
              // Remove the animation so we next time it opens it will animate again
              this.bubble_.className =
              this.bubble_.className.replace(this.animationName_, '');
            }

            if (this.bubbleShadow_) {
              this.bubbleShadow_.style['display'] = 'none';
              this.bubbleShadow_.className =
              this.bubbleShadow_.className.replace(this.animationName_, '');
            }
            this.isOpen_ = false;
          };
          InfoBubble.prototype['close'] = InfoBubble.prototype.close;


          /**
          * Open the InfoBubble
          *
          * @param {google.maps.Map=} opt_map Optional map to open on.
          * @param {google.maps.MVCObject=} opt_anchor Optional anchor to position at.
          */
          InfoBubble.prototype.open = function(opt_map, opt_anchor) {
            if (opt_map) {
              this.setMap(map);
            }

            if (opt_anchor) {
              this.set('anchor', opt_anchor);
              this.bindTo('position', opt_anchor);
            }

            // Show the bubble and the show
            this.bubble_.style['display'] = this.bubbleShadow_.style['display'] = '';
            var animation = !!!this.get('disableAnimation');

            if (animation) {
              // Add the animation
              this.bubble_.className += ' ' + this.animationName_;
              this.bubbleShadow_.className += ' ' + this.animationName_;
            }

            this.redraw_();
            this.isOpen_ = true;

            var pan = !!!this.get('disableAutoPan');
            if (pan) {
              var that = this;
              window.setTimeout(function() {
                // Pan into view, done in a time out to make it feel nicer :)
                that.panToView();
              }, 200);
            }
          };
          InfoBubble.prototype['open'] = InfoBubble.prototype.open;


          /**
          * Set the position of the InfoBubble
          *
          * @param {google.maps.LatLng} position The position to set.
          */
          InfoBubble.prototype.setPosition = function(position) {
            if (position) {
              this.set('position', position);
            }
          };
          InfoBubble.prototype['setPosition'] = InfoBubble.prototype.setPosition;


          /**
          * Returns the position of the InfoBubble
          *
          * @return {google.maps.LatLng} the position.
          */
          InfoBubble.prototype.getPosition = function() {
            return /** @type {google.maps.LatLng} */ (this.get('position'));
          };
          InfoBubble.prototype['getPosition'] = InfoBubble.prototype.getPosition;


          /**
          * position changed MVC callback
          */
          InfoBubble.prototype.position_changed = function() {
            this.draw();
          };
          InfoBubble.prototype['position_changed'] =
          InfoBubble.prototype.position_changed;


          /**
          * Pan the InfoBubble into view
          */
          InfoBubble.prototype.panToView = function() {
            var projection = this.getProjection();

            if (!projection) {
              // The map projection is not ready yet so do nothing
              return;
            }

            if (!this.bubble_) {
              // No Bubble yet so do nothing
              return;
            }

            var anchorHeight = this.getAnchorHeight_();
            var height = this.bubble_.offsetHeight + anchorHeight;
            var map = this.get('map');
            var mapDiv = map.getDiv();
            var mapHeight = mapDiv.offsetHeight;

            var latLng = this.getPosition();
            var centerPos = projection.fromLatLngToContainerPixel(map.getCenter());
            var pos = projection.fromLatLngToContainerPixel(latLng);

            // Find out how much space at the top is free
            var spaceTop = centerPos.y - height;

            // Fine out how much space at the bottom is free
            var spaceBottom = mapHeight - centerPos.y;

            var needsTop = spaceTop < 0;
            var deltaY = 0;

            if (needsTop) {
              spaceTop *= -1;
              deltaY = (spaceTop + spaceBottom) / 1.8;
            }

            pos.y -= deltaY;
            latLng = projection.fromContainerPixelToLatLng(pos);

            if (map.getCenter() != latLng) {
              if ($(window).width() < 415) map.panToWithOffset(latLng, -70, 0);
              else map.panTo(latLng);
            }
          };
          InfoBubble.prototype['panToView'] = InfoBubble.prototype.panToView;


          /**
          * Converts a HTML string to a document fragment.
          *
          * @param {string} htmlString The HTML string to convert.
          * @return {Node} A HTML document fragment.
          * @private
          */
          InfoBubble.prototype.htmlToDocumentFragment_ = function(htmlString) {
            htmlString = htmlString.replace(/^\s*([\S\s]*)\b\s*$/, '$1');
            var tempDiv = document.createElement('DIV');
            tempDiv.innerHTML = htmlString;
            if (tempDiv.childNodes.length == 1) {
              return /** @type {!Node} */ (tempDiv.removeChild(tempDiv.firstChild));
            } else {
              var fragment = document.createDocumentFragment();
              while (tempDiv.firstChild) {
                fragment.appendChild(tempDiv.firstChild);
              }
              return fragment;
            }
          };


          /**
          * Removes all children from the node.
          *
          * @param {Node} node The node to remove all children from.
          * @private
          */
          InfoBubble.prototype.removeChildren_ = function(node) {
            if (!node) {
              return;
            }

            var child;
            while (child = node.firstChild) {
              node.removeChild(child);
            }
          };


          /**
          * Sets the content of the infobubble.
          *
          * @param {string|Node} content The content to set.
          */
          InfoBubble.prototype.setContent = function(content) {
            this.set('content', content);
          };
          InfoBubble.prototype['setContent'] = InfoBubble.prototype.setContent;


          /**
          * Get the content of the infobubble.
          *
          * @return {string|Node} The marker content.
          */
          InfoBubble.prototype.getContent = function() {
            return /** @type {Node|string} */ (this.get('content'));
          };
          InfoBubble.prototype['getContent'] = InfoBubble.prototype.getContent;


          /**
          * Sets the marker content and adds loading events to images
          */
          InfoBubble.prototype.content_changed = function() {
            if (!this.content_) {
              // The Content area doesnt exist.
              return;
            }

            this.removeChildren_(this.content_);
            var content = this.getContent();
            if (content) {
              if (typeof content == 'string') {
                content = this.htmlToDocumentFragment_(content);
              }
              this.content_.appendChild(content);

              var that = this;
              var images = this.content_.getElementsByTagName('IMG');
              for (var i = 0, image; image = images[i]; i++) {
                // Because we don't know the size of an image till it loads, add a
                // listener to the image load so the marker can resize and reposition
                // itself to be the correct height.
                google.maps.event.addDomListener(image, 'load', function() {
                  that.imageLoaded_();
                });
              }
              google.maps.event.trigger(this, 'domready');
            }
            this.redraw_();
          };
          InfoBubble.prototype['content_changed'] =
          InfoBubble.prototype.content_changed;


          /**
          * Image loaded
          * @private
          */
          InfoBubble.prototype.imageLoaded_ = function() {
            var pan = !!!this.get('disableAutoPan');
            this.redraw_();
            if (pan && (this.tabs_.length == 0 || this.activeTab_.index == 0)) {
              this.panToView();
            }
          };

          /**
          * Updates the styles of the tabs
          * @private
          */
          InfoBubble.prototype.updateTabStyles_ = function() {
            if (this.tabs_ && this.tabs_.length) {
              for (var i = 0, tab; tab = this.tabs_[i]; i++) {
                this.setTabStyle_(tab.tab);
              }
              this.activeTab_.style['zIndex'] = this.baseZIndex_;
              var borderWidth = this.getBorderWidth_();
              var padding = this.getPadding_() / 2;
              this.activeTab_.style['borderBottomWidth'] = 0;
              this.activeTab_.style['paddingBottom'] = this.px(padding + borderWidth);
            }
          };


          /**
          * Sets the style of a tab
          * @private
          * @param {Element} tab The tab to style.
          */
          InfoBubble.prototype.setTabStyle_ = function(tab) {
            var backgroundColor = this.get('backgroundColor');
            var borderColor = this.get('borderColor');
            var borderRadius = this.getBorderRadius_();
            var borderWidth = this.getBorderWidth_();
            var padding = this.getPadding_();

            var marginRight = this.px(-(Math.max(padding, borderRadius)));
            var borderRadiusPx = this.px(borderRadius);

            var index = this.baseZIndex_;
            if (tab.index) {
              index -= tab.index;
            }

            // The styles for the tab
            var styles = {
              'cssFloat': 'left',
              'position': 'relative',
              'cursor': 'pointer',
              'backgroundColor': backgroundColor,
              'border': this.px(borderWidth) + ' solid ' + borderColor,
              'padding': this.px(padding / 2) + ' ' + this.px(padding),
              'marginRight': marginRight,
              'whiteSpace': 'nowrap',
              'borderRadiusTopLeft': borderRadiusPx,
              'MozBorderRadiusTopleft': borderRadiusPx,
              'webkitBorderTopLeftRadius': borderRadiusPx,
              'borderRadiusTopRight': borderRadiusPx,
              'MozBorderRadiusTopright': borderRadiusPx,
              'webkitBorderTopRightRadius': borderRadiusPx,
              'zIndex': index
            };

            for (var style in styles) {
              tab.style[style] = styles[style];
            }

            var className = this.get('tabClassName');
            if (className != undefined) {
              tab.className += ' ' + className;
            }
          };


          /**
          * Add user actions to a tab
          * @private
          * @param {Object} tab The tab to add the actions to.
          */
          InfoBubble.prototype.addTabActions_ = function(tab) {
            var that = this;
            tab.listener_ = google.maps.event.addDomListener(tab, 'click', function() {
              that.setTabActive_(this);
            });
          };


          /**
          * Set a tab at a index to be active
          *
          * @param {number} index The index of the tab.
          */
          InfoBubble.prototype.setTabActive = function(index) {
            var tab = this.tabs_[index - 1];

            if (tab) {
              this.setTabActive_(tab.tab);
            }
          };
          InfoBubble.prototype['setTabActive'] = InfoBubble.prototype.setTabActive;


          /**
          * Set a tab to be active
          * @private
          * @param {Object} tab The tab to set active.
          */
          InfoBubble.prototype.setTabActive_ = function(tab) {
            if (!tab) {
              this.setContent('');
              return;
            }

            var padding = this.getPadding_() / 2;
            var borderWidth = this.getBorderWidth_();

            if (this.activeTab_) {
              var activeTab = this.activeTab_;
              activeTab.style['zIndex'] = this.baseZIndex_ - activeTab.index;
              activeTab.style['paddingBottom'] = this.px(padding);
              activeTab.style['borderBottomWidth'] = this.px(borderWidth);
            }

            tab.style['zIndex'] = this.baseZIndex_;
            tab.style['borderBottomWidth'] = 0;
            tab.style['paddingBottom'] = this.px(padding + borderWidth);

            this.setContent(this.tabs_[tab.index].content);

            this.activeTab_ = tab;

            this.redraw_();
          };


          /**
          * Set the max width of the InfoBubble
          *
          * @param {number} width The max width.
          */
          InfoBubble.prototype.setMaxWidth = function(width) {
            this.set('maxWidth', width);
          };
          InfoBubble.prototype['setMaxWidth'] = InfoBubble.prototype.setMaxWidth;


          /**
          * maxWidth changed MVC callback
          */
          InfoBubble.prototype.maxWidth_changed = function() {
            this.redraw_();
          };
          InfoBubble.prototype['maxWidth_changed'] =
          InfoBubble.prototype.maxWidth_changed;


          /**
          * Set the max height of the InfoBubble
          *
          * @param {number} height The max height.
          */
          InfoBubble.prototype.setMaxHeight = function(height) {
            this.set('maxHeight', height);
          };
          InfoBubble.prototype['setMaxHeight'] = InfoBubble.prototype.setMaxHeight;


          /**
          * maxHeight changed MVC callback
          */
          InfoBubble.prototype.maxHeight_changed = function() {
            this.redraw_();
          };
          InfoBubble.prototype['maxHeight_changed'] =
          InfoBubble.prototype.maxHeight_changed;


          /**
          * Set the min width of the InfoBubble
          *
          * @param {number} width The min width.
          */
          InfoBubble.prototype.setMinWidth = function(width) {
            this.set('minWidth', width);
          };
          InfoBubble.prototype['setMinWidth'] = InfoBubble.prototype.setMinWidth;


          /**
          * minWidth changed MVC callback
          */
          InfoBubble.prototype.minWidth_changed = function() {
            this.redraw_();
          };
          InfoBubble.prototype['minWidth_changed'] =
          InfoBubble.prototype.minWidth_changed;


          /**
          * Set the min height of the InfoBubble
          *
          * @param {number} height The min height.
          */
          InfoBubble.prototype.setMinHeight = function(height) {
            this.set('minHeight', height);
          };
          InfoBubble.prototype['setMinHeight'] = InfoBubble.prototype.setMinHeight;


          /**
          * minHeight changed MVC callback
          */
          InfoBubble.prototype.minHeight_changed = function() {
            this.redraw_();
          };
          InfoBubble.prototype['minHeight_changed'] =
          InfoBubble.prototype.minHeight_changed;


          /**
          * Add a tab
          *
          * @param {string} label The label of the tab.
          * @param {string|Element} content The content of the tab.
          */
          InfoBubble.prototype.addTab = function(label, content) {
            var tab = document.createElement('DIV');
            tab.innerHTML = label;

            this.setTabStyle_(tab);
            this.addTabActions_(tab);

            this.tabsContainer_.appendChild(tab);

            this.tabs_.push({
              label: label,
              content: content,
              tab: tab
            });

            tab.index = this.tabs_.length - 1;
            tab.style['zIndex'] = this.baseZIndex_ - tab.index;

            if (!this.activeTab_) {
              this.setTabActive_(tab);
            }

            tab.className = tab.className + ' ' + this.animationName_;

            this.redraw_();
          };
          InfoBubble.prototype['addTab'] = InfoBubble.prototype.addTab;


          /**
          * Remove a tab at a specific index
          *
          * @param {number} index The index of the tab to remove.
          */
          InfoBubble.prototype.removeTab = function(index) {
            if (!this.tabs_.length || index < 0 || index >= this.tabs_.length) {
              return;
            }

            var tab = this.tabs_[index];
            tab.tab.parentNode.removeChild(tab.tab);

            google.maps.event.removeListener(tab.tab.listener_);

            this.tabs_.splice(index, 1);

            delete tab;

            for (var i = 0, t; t = this.tabs_[i]; i++) {
              t.tab.index = i;
            }

            if (tab.tab == this.activeTab_) {
              // Removing the current active tab
              if (this.tabs_[index]) {
                // Show the tab to the right
                this.activeTab_ = this.tabs_[index].tab;
              } else if (this.tabs_[index - 1]) {
                // Show a tab to the left
                this.activeTab_ = this.tabs_[index - 1].tab;
              } else {
                // No tabs left to sho
                this.activeTab_ = undefined;
              }

              this.setTabActive_(this.activeTab_);
            }

            this.redraw_();
          };
          InfoBubble.prototype['removeTab'] = InfoBubble.prototype.removeTab;


          /**
          * Get the size of an element
          * @private
          * @param {Node|string} element The element to size.
          * @param {number=} opt_maxWidth Optional max width of the element.
          * @param {number=} opt_maxHeight Optional max height of the element.
          * @return {google.maps.Size} The size of the element.
          */
          InfoBubble.prototype.getElementSize_ = function(element, opt_maxWidth,
            opt_maxHeight) {
              var sizer = document.createElement('DIV');
              sizer.style['display'] = 'inline';
              sizer.style['position'] = 'absolute';
              sizer.style['visibility'] = 'hidden';

              if (typeof element == 'string') {
                sizer.innerHTML = element;
              } else {
                sizer.appendChild(element.cloneNode(true));
              }

              document.body.appendChild(sizer);
              var size = new google.maps.Size(sizer.offsetWidth, sizer.offsetHeight);

              // If the width is bigger than the max width then set the width and size again
              if (opt_maxWidth && size.width > opt_maxWidth) {
                sizer.style['width'] = this.px(opt_maxWidth);
                size = new google.maps.Size(sizer.offsetWidth, sizer.offsetHeight);
              }

              // If the height is bigger than the max height then set the height and size
              // again
              if (opt_maxHeight && size.height > opt_maxHeight) {
                sizer.style['height'] = this.px(opt_maxHeight);
                size = new google.maps.Size(sizer.offsetWidth, sizer.offsetHeight);
              }

              document.body.removeChild(sizer);
              delete sizer;
              return size;
            };


            /**
            * Redraw the InfoBubble
            * @private
            */
            InfoBubble.prototype.redraw_ = function() {
              this.figureOutSize_();
              this.positionCloseButton_();
              this.draw();
            };


            /**
            * Figure out the optimum size of the InfoBubble
            * @private
            */
            InfoBubble.prototype.figureOutSize_ = function() {
              var map = this.get('map');

              if (!map) {
                return;
              }

              var padding = this.getPadding_();
              var borderWidth = this.getBorderWidth_();
              var borderRadius = this.getBorderRadius_();
              var arrowSize = this.getArrowSize_();

              var mapDiv = map.getDiv();
              var gutter = arrowSize * 2;
              var mapWidth = mapDiv.offsetWidth - gutter;
              var mapHeight = mapDiv.offsetHeight - gutter - this.getAnchorHeight_();
              var tabHeight = 0;
              var width = /** @type {number} */ (this.get('minWidth') || 0);
              var height = /** @type {number} */ (this.get('minHeight') || 0);
              var maxWidth = /** @type {number} */ (this.get('maxWidth') || 0);
              var maxHeight = /** @type {number} */ (this.get('maxHeight') || 0);

              maxWidth = Math.min(mapWidth, maxWidth);
              maxHeight = Math.min(mapHeight, maxHeight);

              var tabWidth = 0;
              if (this.tabs_.length) {
                // If there are tabs then you need to check the size of each tab's content
                for (var i = 0, tab; tab = this.tabs_[i]; i++) {
                  var tabSize = this.getElementSize_(tab.tab, maxWidth, maxHeight);
                  var contentSize = this.getElementSize_(tab.content, maxWidth, maxHeight);

                  if (width < tabSize.width) {
                    width = tabSize.width;
                  }

                  // Add up all the tab widths because they might end up being wider than
                  // the content
                  tabWidth += tabSize.width;

                  if (height < tabSize.height) {
                    height = tabSize.height;
                  }

                  if (tabSize.height > tabHeight) {
                    tabHeight = tabSize.height;
                  }

                  if (width < contentSize.width) {
                    width = contentSize.width;
                  }

                  if (height < contentSize.height) {
                    height = contentSize.height;
                  }
                }
              } else {
                var content = /** @type {string|Node} */ (this.get('content'));
                if (typeof content == 'string') {
                  content = this.htmlToDocumentFragment_(content);
                }
                if (content) {
                  var contentSize = this.getElementSize_(content, maxWidth, maxHeight);

                  if (width < contentSize.width) {
                    width = contentSize.width;
                  }

                  if (height < contentSize.height) {
                    height = contentSize.height;
                  }
                }
              }

              if (maxWidth) {
                width = Math.min(width, maxWidth);
              }

              if (maxHeight) {
                height = Math.min(height, maxHeight);
              }

              width = Math.max(width, tabWidth);

              if (width == tabWidth) {
                width = width + 2 * padding;
              }

              arrowSize = arrowSize * 2;
              width = Math.max(width, arrowSize);

              // Maybe add this as a option so they can go bigger than the map if the user
              // wants
              if (width > mapWidth) {
                width = mapWidth;
              }

              if (height > mapHeight) {
                height = mapHeight - tabHeight;
              }

              if (this.tabsContainer_) {
                this.tabHeight_ = tabHeight;
                this.tabsContainer_.style['width'] = this.px(tabWidth);
              }

              this.contentContainer_.style['width'] = this.px(width);
              this.contentContainer_.style['height'] = this.px(height);
            };


            /**
            *  Get the height of the anchor
            *
            *  This function is a hack for now and doesn't really work that good, need to
            *  wait for pixelBounds to be correctly exposed.
            *  @private
            *  @return {number} The height of the anchor.
            */
            InfoBubble.prototype.getAnchorHeight_ = function() {
              var anchorHeight = 0;
              var anchor = this.get('anchor');
              if (anchor) {

                if (!anchorHeight && anchor.height) {
                  anchorHeight = anchor.height;
                }

                // HACK
                if (!anchorHeight) {
                  anchorHeight = 34;
                }
              }
              return anchorHeight;
            };


            /**
            * Position the close button in the right spot.
            * @private
            */
            InfoBubble.prototype.positionCloseButton_ = function() {
              var br = this.getBorderRadius_();
              var bw = this.getBorderWidth_();

              var right = 2;
              var top = 2;

              if (this.tabs_.length && this.tabHeight_) {
                top += this.tabHeight_;
              }

              top += bw;
              right += bw;

              var c = this.contentContainer_;
              if (c && c.clientHeight < c.scrollHeight) {
                // If there are scrollbars then move the cross in so it is not over
                // scrollbar
                right += 15;
              }

              this.close_.style['right'] = this.px(right);
              this.close_.style['top'] = this.px(top);
            };



// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @externs_url http://closure-compiler.googlecode.com/svn/trunk/contrib/externs/maps/google_maps_api_v3.js
// ==/ClosureCompiler==

/**
* @name CSS3 InfoBubble with tabs for Google Maps API V3
* @version 0.8
* @author Luke Mahe
* @fileoverview
* This library is a CSS Infobubble with tabs. It uses css3 rounded corners and
* drop shadows and animations. It also allows tabs
*/

/*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


//function InfoBubble(e){this.extend(InfoBubble,google.maps.OverlayView);this.tabs_=[];this.activeTab_=null;this.baseZIndex_=100;this.isOpen_=false;var t=e||{};if(t["backgroundColor"]==undefined){t["backgroundColor"]=this.BACKGROUND_COLOR_}if(t["borderColor"]==undefined){t["borderColor"]=this.BORDER_COLOR_}if(t["borderRadius"]==undefined){t["borderRadius"]=this.BORDER_RADIUS_}if(t["borderWidth"]==undefined){t["borderWidth"]=this.BORDER_WIDTH_}if(t["padding"]==undefined){t["padding"]=this.PADDING_}if(t["arrowPosition"]==undefined){t["arrowPosition"]=this.ARROW_POSITION_}if(t["disableAutoPan"]==undefined){t["disableAutoPan"]=false}if(t["disableAnimation"]==undefined){t["disableAnimation"]=false}if(t["minWidth"]==undefined){t["minWidth"]=this.MIN_WIDTH_}if(t["shadowStyle"]==undefined){t["shadowStyle"]=this.SHADOW_STYLE_}if(t["arrowSize"]==undefined){t["arrowSize"]=this.ARROW_SIZE_}if(t["arrowStyle"]==undefined){t["arrowStyle"]=this.ARROW_STYLE_}this.buildDom_();this.setValues(t)}window["InfoBubble"]=InfoBubble;InfoBubble.prototype.ARROW_SIZE_=15;InfoBubble.prototype.ARROW_STYLE_=0;InfoBubble.prototype.SHADOW_STYLE_=1;InfoBubble.prototype.MIN_WIDTH_=50;InfoBubble.prototype.ARROW_POSITION_=50;InfoBubble.prototype.PADDING_=10;InfoBubble.prototype.BORDER_WIDTH_=1;InfoBubble.prototype.BORDER_COLOR_="#ccc";InfoBubble.prototype.BORDER_RADIUS_=10;InfoBubble.prototype.BACKGROUND_COLOR_="#fff";InfoBubble.prototype.extend=function(e,t){return function(e){for(var t in e.prototype){this.prototype[t]=e.prototype[t]}return this}.apply(e,[t])};InfoBubble.prototype.buildDom_=function(){var e=this.bubble_=document.createElement("DIV");e.style["position"]="absolute";e.style["zIndex"]=this.baseZIndex_;var t=this.tabsContainer_=document.createElement("DIV");t.style["position"]="relative";var n=this.close_=document.createElement("IMG");n.style["position"]="absolute";n.style["width"]=this.px(12);n.style["height"]=this.px(12);n.style["border"]=0;n.style["zIndex"]=this.baseZIndex_+1;n.style["cursor"]="pointer";n.src="http://maps.gstatic.com/intl/en_us/mapfiles/iw_close.gif";var r=this;google.maps.event.addDomListener(n,"click",function(){r.close();google.maps.event.trigger(r,"closeclick")});var i=this.contentContainer_=document.createElement("DIV");i.style["overflowX"]="auto";i.style["overflowY"]="auto";i.style["cursor"]="default";i.style["clear"]="both";i.style["position"]="relative";var s=this.content_=document.createElement("DIV");i.appendChild(s);var o=this.arrow_=document.createElement("DIV");o.style["position"]="relative";var u=this.arrowOuter_=document.createElement("DIV");var a=this.arrowInner_=document.createElement("DIV");var f=this.getArrowSize_();u.style["position"]=a.style["position"]="absolute";u.style["left"]=a.style["left"]="50%";u.style["height"]=a.style["height"]="0";u.style["width"]=a.style["width"]="0";u.style["marginLeft"]=this.px(-f);u.style["borderWidth"]=this.px(f);u.style["borderBottomWidth"]=0;var l=this.bubbleShadow_=document.createElement("DIV");l.style["position"]="absolute";e.style["display"]=l.style["display"]="none";e.appendChild(this.tabsContainer_);e.appendChild(n);e.appendChild(i);o.appendChild(u);o.appendChild(a);e.appendChild(o);var c=document.createElement("style");c.setAttribute("type","text/css");this.animationName_="_ibani_"+Math.round(Math.random()*1e4);var h="."+this.animationName_+"{-webkit-animation-name:"+this.animationName_+";-webkit-animation-duration:0.5s;"+"-webkit-animation-iteration-count:1;}"+"@-webkit-keyframes "+this.animationName_+" {from {"+"-webkit-transform: scale(0)}50% {-webkit-transform: scale(1.2)}90% "+"{-webkit-transform: scale(0.95)}to {-webkit-transform: scale(1)}}";c.textContent=h;document.getElementsByTagName("head")[0].appendChild(c)};InfoBubble.prototype.setBackgroundClassName=function(e){this.set("backgroundClassName",e)};InfoBubble.prototype["setBackgroundClassName"]=InfoBubble.prototype.setBackgroundClassName;InfoBubble.prototype.backgroundClassName_changed=function(){this.content_.className=this.get("backgroundClassName")};InfoBubble.prototype["backgroundClassName_changed"]=InfoBubble.prototype.backgroundClassName_changed;InfoBubble.prototype.setTabClassName=function(e){this.set("tabClassName",e)};InfoBubble.prototype["setTabClassName"]=InfoBubble.prototype.setTabClassName;InfoBubble.prototype.tabClassName_changed=function(){this.updateTabStyles_()};InfoBubble.prototype["tabClassName_changed"]=InfoBubble.prototype.tabClassName_changed;InfoBubble.prototype.getArrowStyle_=function(){return parseInt(this.get("arrowStyle"),10)||0};InfoBubble.prototype.setArrowStyle=function(e){this.set("arrowStyle",e)};InfoBubble.prototype["setArrowStyle"]=InfoBubble.prototype.setArrowStyle;InfoBubble.prototype.arrowStyle_changed=function(){this.arrowSize_changed()};InfoBubble.prototype["arrowStyle_changed"]=InfoBubble.prototype.arrowStyle_changed;InfoBubble.prototype.getArrowSize_=function(){return parseInt(this.get("arrowSize"),10)||0};InfoBubble.prototype.setArrowSize=function(e){this.set("arrowSize",e)};InfoBubble.prototype["setArrowSize"]=InfoBubble.prototype.setArrowSize;InfoBubble.prototype.arrowSize_changed=function(){this.borderWidth_changed()};InfoBubble.prototype["arrowSize_changed"]=InfoBubble.prototype.arrowSize_changed;InfoBubble.prototype.setArrowPosition=function(e){this.set("arrowPosition",e)};InfoBubble.prototype["setArrowPosition"]=InfoBubble.prototype.setArrowPosition;InfoBubble.prototype.getArrowPosition_=function(){return parseInt(this.get("arrowPosition"),10)||0};InfoBubble.prototype.arrowPosition_changed=function(){var e=this.getArrowPosition_();this.arrowOuter_.style["left"]=this.arrowInner_.style["left"]=e+"%";this.redraw_()};InfoBubble.prototype["arrowPosition_changed"]=InfoBubble.prototype.arrowPosition_changed;InfoBubble.prototype.setZIndex=function(e){this.set("zIndex",e)};InfoBubble.prototype["setZIndex"]=InfoBubble.prototype.setZIndex;InfoBubble.prototype.getZIndex=function(){return parseInt(this.get("zIndex"),10)||this.baseZIndex_};InfoBubble.prototype.zIndex_changed=function(){var e=this.getZIndex();this.bubble_.style["zIndex"]=this.baseZIndex_=e;this.close_.style["zIndex"]=e+1};InfoBubble.prototype["zIndex_changed"]=InfoBubble.prototype.zIndex_changed;InfoBubble.prototype.setShadowStyle=function(e){this.set("shadowStyle",e)};InfoBubble.prototype["setShadowStyle"]=InfoBubble.prototype.setShadowStyle;InfoBubble.prototype.getShadowStyle_=function(){return parseInt(this.get("shadowStyle"),10)||0};InfoBubble.prototype.shadowStyle_changed=function(){var e=this.getShadowStyle_();var t="";var n="";var r="";switch(e){case 0:t="none";break;case 1:n="40px 15px 10px rgba(33,33,33,0.3)";r="transparent";break;case 2:n="0 0 2px rgba(33,33,33,0.3)";r="rgba(33,33,33,0.35)";break}this.bubbleShadow_.style["boxShadow"]=this.bubbleShadow_.style["webkitBoxShadow"]=this.bubbleShadow_.style["MozBoxShadow"]=n;this.bubbleShadow_.style["backgroundColor"]=r;if(this.isOpen_){this.bubbleShadow_.style["display"]=t;this.draw()}};InfoBubble.prototype["shadowStyle_changed"]=InfoBubble.prototype.shadowStyle_changed;InfoBubble.prototype.showCloseButton=function(){this.set("hideCloseButton",false)};InfoBubble.prototype["showCloseButton"]=InfoBubble.prototype.showCloseButton;InfoBubble.prototype.hideCloseButton=function(){this.set("hideCloseButton",true)};InfoBubble.prototype["hideCloseButton"]=InfoBubble.prototype.hideCloseButton;InfoBubble.prototype.hideCloseButton_changed=function(){this.close_.style["display"]=this.get("hideCloseButton")?"none":""};InfoBubble.prototype["hideCloseButton_changed"]=InfoBubble.prototype.hideCloseButton_changed;InfoBubble.prototype.setBackgroundColor=function(e){if(e){this.set("backgroundColor",e)}};InfoBubble.prototype["setBackgroundColor"]=InfoBubble.prototype.setBackgroundColor;InfoBubble.prototype.backgroundColor_changed=function(){var e=this.get("backgroundColor");this.contentContainer_.style["backgroundColor"]=e;this.arrowInner_.style["borderColor"]=e+" transparent transparent";this.updateTabStyles_()};InfoBubble.prototype["backgroundColor_changed"]=InfoBubble.prototype.backgroundColor_changed;InfoBubble.prototype.setBorderColor=function(e){if(e){this.set("borderColor",e)}};InfoBubble.prototype["setBorderColor"]=InfoBubble.prototype.setBorderColor;InfoBubble.prototype.borderColor_changed=function(){var e=this.get("borderColor");var t=this.contentContainer_;var n=this.arrowOuter_;t.style["borderColor"]=e;n.style["borderColor"]=e+" transparent transparent";t.style["borderStyle"]=n.style["borderStyle"]=this.arrowInner_.style["borderStyle"]="solid";this.updateTabStyles_()};InfoBubble.prototype["borderColor_changed"]=InfoBubble.prototype.borderColor_changed;InfoBubble.prototype.setBorderRadius=function(e){this.set("borderRadius",e)};InfoBubble.prototype["setBorderRadius"]=InfoBubble.prototype.setBorderRadius;InfoBubble.prototype.getBorderRadius_=function(){return parseInt(this.get("borderRadius"),10)||0};InfoBubble.prototype.borderRadius_changed=function(){var e=this.getBorderRadius_();var t=this.getBorderWidth_();this.contentContainer_.style["borderRadius"]=this.contentContainer_.style["MozBorderRadius"]=this.contentContainer_.style["webkitBorderRadius"]=this.bubbleShadow_.style["borderRadius"]=this.bubbleShadow_.style["MozBorderRadius"]=this.bubbleShadow_.style["webkitBorderRadius"]=this.px(e);this.tabsContainer_.style["paddingLeft"]=this.tabsContainer_.style["paddingRight"]=this.px(e+t);this.redraw_()};InfoBubble.prototype["borderRadius_changed"]=InfoBubble.prototype.borderRadius_changed;InfoBubble.prototype.getBorderWidth_=function(){return parseInt(this.get("borderWidth"),10)||0};InfoBubble.prototype.setBorderWidth=function(e){this.set("borderWidth",e)};InfoBubble.prototype["setBorderWidth"]=InfoBubble.prototype.setBorderWidth;InfoBubble.prototype.borderWidth_changed=function(){var e=this.getBorderWidth_();this.contentContainer_.style["borderWidth"]=this.px(e);this.tabsContainer_.style["top"]=this.px(e);this.updateArrowStyle_();this.updateTabStyles_();this.borderRadius_changed();this.redraw_()};InfoBubble.prototype["borderWidth_changed"]=InfoBubble.prototype.borderWidth_changed;InfoBubble.prototype.updateArrowStyle_=function(){var e=this.getBorderWidth_();var t=this.getArrowSize_();var n=this.getArrowStyle_();var r=this.px(t);var i=this.px(Math.max(0,t-e));var s=this.arrowOuter_;var o=this.arrowInner_;this.arrow_.style["marginTop"]=this.px(-e);s.style["borderTopWidth"]=r;o.style["borderTopWidth"]=i;if(n==0||n==1){s.style["borderLeftWidth"]=r;o.style["borderLeftWidth"]=i}else{s.style["borderLeftWidth"]=o.style["borderLeftWidth"]=0}if(n==0||n==2){s.style["borderRightWidth"]=r;o.style["borderRightWidth"]=i}else{s.style["borderRightWidth"]=o.style["borderRightWidth"]=0}if(n<2){s.style["marginLeft"]=this.px(-t);o.style["marginLeft"]=this.px(-(t-e))}else{s.style["marginLeft"]=o.style["marginLeft"]=0}if(e==0){s.style["display"]="none"}else{s.style["display"]=""}};InfoBubble.prototype.setPadding=function(e){this.set("padding",e)};InfoBubble.prototype["setPadding"]=InfoBubble.prototype.setPadding;InfoBubble.prototype.getPadding_=function(){return parseInt(this.get("padding"),10)||0};InfoBubble.prototype.padding_changed=function(){var e=this.getPadding_();this.contentContainer_.style["padding"]=this.px(e);this.updateTabStyles_();this.redraw_()};InfoBubble.prototype["padding_changed"]=InfoBubble.prototype.padding_changed;InfoBubble.prototype.px=function(e){if(e){return e+"px"}return e};InfoBubble.prototype.addEvents_=function(){var e=["mousedown","mousemove","mouseover","mouseout","mouseup","mousewheel","DOMMouseScroll","touchstart","touchend","touchmove","dblclick","contextmenu","click"];var t=this.bubble_;this.listeners_=[];for(var n=0,r;r=e[n];n++){this.listeners_.push(google.maps.event.addDomListener(t,r,function(e){e.cancelBubble=true;if(e.stopPropagation){e.stopPropagation()}}))}};InfoBubble.prototype.onAdd=function(){if(!this.bubble_){this.buildDom_()}this.addEvents_();var e=this.getPanes();if(e){e.floatPane.appendChild(this.bubble_);e.floatShadow.appendChild(this.bubbleShadow_)}};InfoBubble.prototype["onAdd"]=InfoBubble.prototype.onAdd;InfoBubble.prototype.draw=function(){var e=this.getProjection();if(!e){return}var t=this.get("position");if(!t){this.close();return}var n=0;if(this.activeTab_){n=this.activeTab_.offsetHeight}var r=this.getAnchorHeight_();var i=this.getArrowSize_();var s=this.getArrowPosition_();s=s/100;var o=e.fromLatLngToDivPixel(t);var u=this.contentContainer_.offsetWidth;var a=this.bubble_.offsetHeight;if(!u){return}var f=o.y-(a+i);if(r){f-=r}var l=o.x-u*s;this.bubble_.style["top"]=this.px(f);this.bubble_.style["left"]=this.px(l);var c=parseInt(this.get("shadowStyle"),10);switch(c){case 1:this.bubbleShadow_.style["top"]=this.px(f+n-1);this.bubbleShadow_.style["left"]=this.px(l);this.bubbleShadow_.style["width"]=this.px(u);this.bubbleShadow_.style["height"]=this.px(this.contentContainer_.offsetHeight-i);break;case 2:u=u*.8;if(r){this.bubbleShadow_.style["top"]=this.px(o.y)}else{this.bubbleShadow_.style["top"]=this.px(o.y+i)}this.bubbleShadow_.style["left"]=this.px(o.x-u*s);this.bubbleShadow_.style["width"]=this.px(u);this.bubbleShadow_.style["height"]=this.px(2);break}};InfoBubble.prototype["draw"]=InfoBubble.prototype.draw;InfoBubble.prototype.onRemove=function(){if(this.bubble_&&this.bubble_.parentNode){this.bubble_.parentNode.removeChild(this.bubble_)}if(this.bubbleShadow_&&this.bubbleShadow_.parentNode){this.bubbleShadow_.parentNode.removeChild(this.bubbleShadow_)}for(var e=0,t;t=this.listeners_[e];e++){google.maps.event.removeListener(t)}};InfoBubble.prototype["onRemove"]=InfoBubble.prototype.onRemove;InfoBubble.prototype.isOpen=function(){return this.isOpen_};InfoBubble.prototype["isOpen"]=InfoBubble.prototype.isOpen;InfoBubble.prototype.close=function(){if(this.bubble_){this.bubble_.style["display"]="none";this.bubble_.className=this.bubble_.className.replace(this.animationName_,"")}if(this.bubbleShadow_){this.bubbleShadow_.style["display"]="none";this.bubbleShadow_.className=this.bubbleShadow_.className.replace(this.animationName_,"")}this.isOpen_=false};InfoBubble.prototype["close"]=InfoBubble.prototype.close;InfoBubble.prototype.open=function(e,t){var n=this;window.setTimeout(function(){n.open_(e,t)},0)};InfoBubble.prototype.open_=function(e,t){this.updateContent_();if(e){this.setMap(e)}if(t){this.set("anchor",t);this.bindTo("anchorPoint",t);this.bindTo("position",t)}this.bubble_.style["display"]=this.bubbleShadow_.style["display"]="";var n=!this.get("disableAnimation");if(n){this.bubble_.className+=" "+this.animationName_;this.bubbleShadow_.className+=" "+this.animationName_}this.redraw_();this.isOpen_=true;var r=!this.get("disableAutoPan");if(r){var i=this;window.setTimeout(function(){i.panToView()},200)}};InfoBubble.prototype["open"]=InfoBubble.prototype.open;InfoBubble.prototype.setPosition=function(e){if(e){this.set("position",e)}};InfoBubble.prototype["setPosition"]=InfoBubble.prototype.setPosition;InfoBubble.prototype.getPosition=function(){return this.get("position")};InfoBubble.prototype["getPosition"]=InfoBubble.prototype.getPosition;InfoBubble.prototype.position_changed=function(){this.draw()};InfoBubble.prototype["position_changed"]=InfoBubble.prototype.position_changed;InfoBubble.prototype.panToView=function(){var e=this.getProjection();if(!e){return}if(!this.bubble_){return}var t=this.getAnchorHeight_();var n=this.bubble_.offsetHeight+t;var r=this.get("map");var i=r.getDiv();var s=i.offsetHeight;var o=this.getPosition();var u=e.fromLatLngToContainerPixel(r.getCenter());var a=e.fromLatLngToContainerPixel(o);var f=u.y-n;var l=s-u.y;var c=f<0;var h=0;if(c){f*=-1;h=(f+l)/2}a.y-=h;o=e.fromContainerPixelToLatLng(a);if(r.getCenter()!=o){r.panTo(o)}};InfoBubble.prototype["panToView"]=InfoBubble.prototype.panToView;InfoBubble.prototype.htmlToDocumentFragment_=function(e){e=e.replace(/^\s*([\S\s]*)\b\s*$/,"$1");var t=document.createElement("DIV");t.innerHTML=e;if(t.childNodes.length==1){return t.removeChild(t.firstChild)}else{var n=document.createDocumentFragment();while(t.firstChild){n.appendChild(t.firstChild)}return n}};InfoBubble.prototype.removeChildren_=function(e){if(!e){return}var t;while(t=e.firstChild){e.removeChild(t)}};InfoBubble.prototype.setContent=function(e){this.set("content",e)};InfoBubble.prototype["setContent"]=InfoBubble.prototype.setContent;InfoBubble.prototype.getContent=function(){return this.get("content")};InfoBubble.prototype["getContent"]=InfoBubble.prototype.getContent;InfoBubble.prototype.updateContent_=function(){if(!this.content_){return}this.removeChildren_(this.content_);var e=this.getContent();if(e){if(typeof e=="string"){e=this.htmlToDocumentFragment_(e)}this.content_.appendChild(e);var t=this;var n=this.content_.getElementsByTagName("IMG");for(var r=0,i;i=n[r];r++){google.maps.event.addDomListener(i,"load",function(){t.imageLoaded_()})}google.maps.event.trigger(this,"domready")}this.redraw_()};InfoBubble.prototype.imageLoaded_=function(){var e=!this.get("disableAutoPan");this.redraw_();if(e&&(this.tabs_.length==0||this.activeTab_.index==0)){this.panToView()}};InfoBubble.prototype.updateTabStyles_=function(){if(this.tabs_&&this.tabs_.length){for(var e=0,t;t=this.tabs_[e];e++){this.setTabStyle_(t.tab)}this.activeTab_.style["zIndex"]=this.baseZIndex_;var n=this.getBorderWidth_();var r=this.getPadding_()/2;this.activeTab_.style["borderBottomWidth"]=0;this.activeTab_.style["paddingBottom"]=this.px(r+n)}};InfoBubble.prototype.setTabStyle_=function(e){var t=this.get("backgroundColor");var n=this.get("borderColor");var r=this.getBorderRadius_();var i=this.getBorderWidth_();var s=this.getPadding_();var o=this.px(-Math.max(s,r));var u=this.px(r);var a=this.baseZIndex_;if(e.index){a-=e.index}var f={cssFloat:"left",position:"relative",cursor:"pointer",backgroundColor:t,border:this.px(i)+" solid "+n,padding:this.px(s/2)+" "+this.px(s),marginRight:o,whiteSpace:"nowrap",borderRadiusTopLeft:u,MozBorderRadiusTopleft:u,webkitBorderTopLeftRadius:u,borderRadiusTopRight:u,MozBorderRadiusTopright:u,webkitBorderTopRightRadius:u,zIndex:a,display:"inline"};for(var l in f){e.style[l]=f[l]}var c=this.get("tabClassName");if(c!=undefined){e.className+=" "+c}};InfoBubble.prototype.addTabActions_=function(e){var t=this;e.listener_=google.maps.event.addDomListener(e,"click",function(){t.setTabActive_(this)})};InfoBubble.prototype.setTabActive=function(e){var t=this.tabs_[e-1];if(t){this.setTabActive_(t.tab)}};InfoBubble.prototype["setTabActive"]=InfoBubble.prototype.setTabActive;InfoBubble.prototype.setTabActive_=function(e){if(!e){this.setContent("");this.updateContent_();return}var t=this.getPadding_()/2;var n=this.getBorderWidth_();if(this.activeTab_){var r=this.activeTab_;r.style["zIndex"]=this.baseZIndex_-r.index;r.style["paddingBottom"]=this.px(t);r.style["borderBottomWidth"]=this.px(n)}e.style["zIndex"]=this.baseZIndex_;e.style["borderBottomWidth"]=0;e.style["marginBottomWidth"]="-10px";e.style["paddingBottom"]=this.px(t+n);this.setContent(this.tabs_[e.index].content);this.updateContent_();this.activeTab_=e;this.redraw_()};InfoBubble.prototype.setMaxWidth=function(e){this.set("maxWidth",e)};InfoBubble.prototype["setMaxWidth"]=InfoBubble.prototype.setMaxWidth;InfoBubble.prototype.maxWidth_changed=function(){this.redraw_()};InfoBubble.prototype["maxWidth_changed"]=InfoBubble.prototype.maxWidth_changed;InfoBubble.prototype.setMaxHeight=function(e){this.set("maxHeight",e)};InfoBubble.prototype["setMaxHeight"]=InfoBubble.prototype.setMaxHeight;InfoBubble.prototype.maxHeight_changed=function(){this.redraw_()};InfoBubble.prototype["maxHeight_changed"]=InfoBubble.prototype.maxHeight_changed;InfoBubble.prototype.setMinWidth=function(e){this.set("minWidth",e)};InfoBubble.prototype["setMinWidth"]=InfoBubble.prototype.setMinWidth;InfoBubble.prototype.minWidth_changed=function(){this.redraw_()};InfoBubble.prototype["minWidth_changed"]=InfoBubble.prototype.minWidth_changed;InfoBubble.prototype.setMinHeight=function(e){this.set("minHeight",e)};InfoBubble.prototype["setMinHeight"]=InfoBubble.prototype.setMinHeight;InfoBubble.prototype.minHeight_changed=function(){this.redraw_()};InfoBubble.prototype["minHeight_changed"]=InfoBubble.prototype.minHeight_changed;InfoBubble.prototype.addTab=function(e,t){var n=document.createElement("DIV");n.innerHTML=e;this.setTabStyle_(n);this.addTabActions_(n);this.tabsContainer_.appendChild(n);this.tabs_.push({label:e,content:t,tab:n});n.index=this.tabs_.length-1;n.style["zIndex"]=this.baseZIndex_-n.index;if(!this.activeTab_){this.setTabActive_(n)}n.className=n.className+" "+this.animationName_;this.redraw_()};InfoBubble.prototype["addTab"]=InfoBubble.prototype.addTab;InfoBubble.prototype.updateTab=function(e,t,n){if(!this.tabs_.length||e<0||e>=this.tabs_.length){return}var r=this.tabs_[e];if(t!=undefined){r.tab.innerHTML=r.label=t}if(n!=undefined){r.content=n}if(this.activeTab_==r.tab){this.setContent(r.content);this.updateContent_()}this.redraw_()};InfoBubble.prototype["updateTab"]=InfoBubble.prototype.updateTab;InfoBubble.prototype.removeTab=function(e){if(!this.tabs_.length||e<0||e>=this.tabs_.length){return}var t=this.tabs_[e];t.tab.parentNode.removeChild(t.tab);google.maps.event.removeListener(t.tab.listener_);this.tabs_.splice(e,1);delete t;for(var n=0,r;r=this.tabs_[n];n++){r.tab.index=n}if(t.tab==this.activeTab_){if(this.tabs_[e]){this.activeTab_=this.tabs_[e].tab}else if(this.tabs_[e-1]){this.activeTab_=this.tabs_[e-1].tab}else{this.activeTab_=undefined}this.setTabActive_(this.activeTab_)}this.redraw_()};InfoBubble.prototype["removeTab"]=InfoBubble.prototype.removeTab;InfoBubble.prototype.getElementSize_=function(e,t,n){var r=document.createElement("DIV");r.style["display"]="inline";r.style["position"]="absolute";r.style["visibility"]="hidden";if(typeof e=="string"){r.innerHTML=e}else{r.appendChild(e.cloneNode(true))}document.body.appendChild(r);var i=new google.maps.Size(r.offsetWidth,r.offsetHeight);if(t&&i.width>t){r.style["width"]=this.px(t);i=new google.maps.Size(r.offsetWidth,r.offsetHeight)}if(n&&i.height>n){r.style["height"]=this.px(n);i=new google.maps.Size(r.offsetWidth,r.offsetHeight)}document.body.removeChild(r);delete r;return i};InfoBubble.prototype.redraw_=function(){this.figureOutSize_();this.positionCloseButton_();this.draw()};InfoBubble.prototype.figureOutSize_=function(){var e=this.get("map");if(!e){return}var t=this.getPadding_();var n=this.getBorderWidth_();var r=this.getBorderRadius_();var i=this.getArrowSize_();var s=e.getDiv();var o=i*2;var u=s.offsetWidth-o;var a=s.offsetHeight-o-this.getAnchorHeight_();var f=0;var l=this.get("minWidth")||0;var c=this.get("minHeight")||0;var h=this.get("maxWidth")||0;var p=this.get("maxHeight")||0;h=Math.min(u,h);p=Math.min(a,p);var d=0;if(this.tabs_.length){for(var v=0,m;m=this.tabs_[v];v++){var g=this.getElementSize_(m.tab,h,p);var y=this.getElementSize_(m.content,h,p);if(l<g.width){l=g.width}d+=g.width;if(c<g.height){c=g.height}if(g.height>f){f=g.height}if(l<y.width){l=y.width}if(c<y.height){c=y.height}}}else{var b=this.get("content");if(typeof b=="string"){b=this.htmlToDocumentFragment_(b)}if(b){var y=this.getElementSize_(b,h,p);if(l<y.width){l=y.width}if(c<y.height){c=y.height}}}if(h){l=Math.min(l,h)}if(p){c=Math.min(c,p)}l=Math.max(l,d);if(l==d){l=l+2*t}i=i*2;l=Math.max(l,i);if(l>u){l=u}if(c>a){c=a-f}if(this.tabsContainer_){this.tabHeight_=f;this.tabsContainer_.style["width"]=this.px(d)}this.contentContainer_.style["width"]=this.px(l);this.contentContainer_.style["height"]=this.px(c)};InfoBubble.prototype.getAnchorHeight_=function(){var e=this.get("anchor");if(e){var t=this.get("anchorPoint");if(t){return-1*t.y}}return 0};InfoBubble.prototype.anchorPoint_changed=function(){this.draw()};InfoBubble.prototype["anchorPoint_changed"]=InfoBubble.prototype.anchorPoint_changed;InfoBubble.prototype.positionCloseButton_=function(){var e=this.getBorderRadius_();var t=this.getBorderWidth_();var n=2;var r=2;if(this.tabs_.length&&this.tabHeight_){r+=this.tabHeight_}r+=t;n+=t;var i=this.contentContainer_;if(i&&i.clientHeight<i.scrollHeight){n+=15}this.close_.style["right"]=this.px(n);this.close_.style["top"]=this.px(r)}
