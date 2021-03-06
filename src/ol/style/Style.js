/**
 * @module ol/style/Style
 */
import {assert} from '../asserts.js';
import GeometryType from '../geom/GeometryType.js';
import CircleStyle from '../style/Circle.js';
import Fill from '../style/Fill.js';
import Stroke from '../style/Stroke.js';

/**
 * @classdesc
 * Container for vector feature rendering styles. Any changes made to the style
 * or its children through `set*()` methods will not take effect until the
 * feature or layer that uses the style is re-rendered.
 *
 * @constructor
 * @struct
 * @param {olx.style.StyleOptions=} opt_options Style options.
 * @api
 */
const Style = function(opt_options) {

  const options = opt_options || {};

  /**
   * @private
   * @type {string|module:ol/geom/Geometry~Geometry|ol.StyleGeometryFunction}
   */
  this.geometry_ = null;

  /**
   * @private
   * @type {!ol.StyleGeometryFunction}
   */
  this.geometryFunction_ = defaultGeometryFunction;

  if (options.geometry !== undefined) {
    this.setGeometry(options.geometry);
  }

  /**
   * @private
   * @type {module:ol/style/Fill~Fill}
   */
  this.fill_ = options.fill !== undefined ? options.fill : null;

  /**
   * @private
   * @type {module:ol/style/Image~ImageStyle}
   */
  this.image_ = options.image !== undefined ? options.image : null;

  /**
   * @private
   * @type {ol.StyleRenderFunction|null}
   */
  this.renderer_ = options.renderer !== undefined ? options.renderer : null;

  /**
   * @private
   * @type {module:ol/style/Stroke~Stroke}
   */
  this.stroke_ = options.stroke !== undefined ? options.stroke : null;

  /**
   * @private
   * @type {module:ol/style/Text~Text}
   */
  this.text_ = options.text !== undefined ? options.text : null;

  /**
   * @private
   * @type {number|undefined}
   */
  this.zIndex_ = options.zIndex;

};


/**
 * Clones the style.
 * @return {module:ol/style/Style~Style} The cloned style.
 * @api
 */
Style.prototype.clone = function() {
  let geometry = this.getGeometry();
  if (geometry && geometry.clone) {
    geometry = geometry.clone();
  }
  return new Style({
    geometry: geometry,
    fill: this.getFill() ? this.getFill().clone() : undefined,
    image: this.getImage() ? this.getImage().clone() : undefined,
    stroke: this.getStroke() ? this.getStroke().clone() : undefined,
    text: this.getText() ? this.getText().clone() : undefined,
    zIndex: this.getZIndex()
  });
};


/**
 * Get the custom renderer function that was configured with
 * {@link #setRenderer} or the `renderer` constructor option.
 * @return {ol.StyleRenderFunction|null} Custom renderer function.
 * @api
 */
Style.prototype.getRenderer = function() {
  return this.renderer_;
};


/**
 * Sets a custom renderer function for this style. When set, `fill`, `stroke`
 * and `image` options of the style will be ignored.
 * @param {ol.StyleRenderFunction|null} renderer Custom renderer function.
 * @api
 */
Style.prototype.setRenderer = function(renderer) {
  this.renderer_ = renderer;
};


/**
 * Get the geometry to be rendered.
 * @return {string|module:ol/geom/Geometry~Geometry|ol.StyleGeometryFunction}
 * Feature property or geometry or function that returns the geometry that will
 * be rendered with this style.
 * @api
 */
Style.prototype.getGeometry = function() {
  return this.geometry_;
};


/**
 * Get the function used to generate a geometry for rendering.
 * @return {!ol.StyleGeometryFunction} Function that is called with a feature
 * and returns the geometry to render instead of the feature's geometry.
 * @api
 */
Style.prototype.getGeometryFunction = function() {
  return this.geometryFunction_;
};


/**
 * Get the fill style.
 * @return {module:ol/style/Fill~Fill} Fill style.
 * @api
 */
Style.prototype.getFill = function() {
  return this.fill_;
};


/**
 * Set the fill style.
 * @param {module:ol/style/Fill~Fill} fill Fill style.
 * @api
 */
Style.prototype.setFill = function(fill) {
  this.fill_ = fill;
};


/**
 * Get the image style.
 * @return {module:ol/style/Image~ImageStyle} Image style.
 * @api
 */
Style.prototype.getImage = function() {
  return this.image_;
};


/**
 * Set the image style.
 * @param {module:ol/style/Image~ImageStyle} image Image style.
 * @api
 */
Style.prototype.setImage = function(image) {
  this.image_ = image;
};


/**
 * Get the stroke style.
 * @return {module:ol/style/Stroke~Stroke} Stroke style.
 * @api
 */
Style.prototype.getStroke = function() {
  return this.stroke_;
};


/**
 * Set the stroke style.
 * @param {module:ol/style/Stroke~Stroke} stroke Stroke style.
 * @api
 */
Style.prototype.setStroke = function(stroke) {
  this.stroke_ = stroke;
};


/**
 * Get the text style.
 * @return {module:ol/style/Text~Text} Text style.
 * @api
 */
Style.prototype.getText = function() {
  return this.text_;
};


/**
 * Set the text style.
 * @param {module:ol/style/Text~Text} text Text style.
 * @api
 */
Style.prototype.setText = function(text) {
  this.text_ = text;
};


/**
 * Get the z-index for the style.
 * @return {number|undefined} ZIndex.
 * @api
 */
Style.prototype.getZIndex = function() {
  return this.zIndex_;
};


/**
 * Set a geometry that is rendered instead of the feature's geometry.
 *
 * @param {string|module:ol/geom/Geometry~Geometry|ol.StyleGeometryFunction} geometry
 *     Feature property or geometry or function returning a geometry to render
 *     for this style.
 * @api
 */
Style.prototype.setGeometry = function(geometry) {
  if (typeof geometry === 'function') {
    this.geometryFunction_ = geometry;
  } else if (typeof geometry === 'string') {
    this.geometryFunction_ = function(feature) {
      return /** @type {module:ol/geom/Geometry~Geometry} */ (feature.get(geometry));
    };
  } else if (!geometry) {
    this.geometryFunction_ = defaultGeometryFunction;
  } else if (geometry !== undefined) {
    this.geometryFunction_ = function() {
      return /** @type {module:ol/geom/Geometry~Geometry} */ (geometry);
    };
  }
  this.geometry_ = geometry;
};


/**
 * Set the z-index.
 *
 * @param {number|undefined} zIndex ZIndex.
 * @api
 */
Style.prototype.setZIndex = function(zIndex) {
  this.zIndex_ = zIndex;
};


/**
 * Convert the provided object into a style function.  Functions passed through
 * unchanged.  Arrays of module:ol/style/Style~Style or single style objects wrapped in a
 * new style function.
 * @param {module:ol/style~StyleFunction|Array.<module:ol/style/Style~Style>|module:ol/style/Style~Style} obj
 *     A style function, a single style, or an array of styles.
 * @return {module:ol/style~StyleFunction} A style function.
 */
export function toFunction(obj) {
  let styleFunction;

  if (typeof obj === 'function') {
    styleFunction = obj;
  } else {
    /**
     * @type {Array.<module:ol/style/Style~Style>}
     */
    let styles;
    if (Array.isArray(obj)) {
      styles = obj;
    } else {
      assert(obj instanceof Style,
        41); // Expected an `module:ol/style/Style~Style` or an array of `module:ol/style/Style~Style`
      styles = [obj];
    }
    styleFunction = function() {
      return styles;
    };
  }
  return styleFunction;
}


/**
 * @type {Array.<module:ol/style/Style~Style>}
 */
let defaultStyles = null;


/**
 * @param {module:ol/Feature~Feature|ol.render.Feature} feature Feature.
 * @param {number} resolution Resolution.
 * @return {Array.<module:ol/style/Style~Style>} Style.
 */
export function createDefaultStyle(feature, resolution) {
  // We don't use an immediately-invoked function
  // and a closure so we don't get an error at script evaluation time in
  // browsers that do not support Canvas. (module:ol/style/Circle~CircleStyle does
  // canvas.getContext('2d') at construction time, which will cause an.error
  // in such browsers.)
  if (!defaultStyles) {
    const fill = new Fill({
      color: 'rgba(255,255,255,0.4)'
    });
    const stroke = new Stroke({
      color: '#3399CC',
      width: 1.25
    });
    defaultStyles = [
      new Style({
        image: new CircleStyle({
          fill: fill,
          stroke: stroke,
          radius: 5
        }),
        fill: fill,
        stroke: stroke
      })
    ];
  }
  return defaultStyles;
}


/**
 * Default styles for editing features.
 * @return {Object.<module:ol/geom/GeometryType~GeometryType, Array.<module:ol/style/Style~Style>>} Styles
 */
export function createEditingStyle() {
  /** @type {Object.<module:ol/geom/GeometryType~GeometryType, Array.<module:ol/style/Style~Style>>} */
  const styles = {};
  const white = [255, 255, 255, 1];
  const blue = [0, 153, 255, 1];
  const width = 3;
  styles[GeometryType.POLYGON] = [
    new Style({
      fill: new Fill({
        color: [255, 255, 255, 0.5]
      })
    })
  ];
  styles[GeometryType.MULTI_POLYGON] =
      styles[GeometryType.POLYGON];

  styles[GeometryType.LINE_STRING] = [
    new Style({
      stroke: new Stroke({
        color: white,
        width: width + 2
      })
    }),
    new Style({
      stroke: new Stroke({
        color: blue,
        width: width
      })
    })
  ];
  styles[GeometryType.MULTI_LINE_STRING] =
      styles[GeometryType.LINE_STRING];

  styles[GeometryType.CIRCLE] =
      styles[GeometryType.POLYGON].concat(
        styles[GeometryType.LINE_STRING]
      );


  styles[GeometryType.POINT] = [
    new Style({
      image: new CircleStyle({
        radius: width * 2,
        fill: new Fill({
          color: blue
        }),
        stroke: new Stroke({
          color: white,
          width: width / 2
        })
      }),
      zIndex: Infinity
    })
  ];
  styles[GeometryType.MULTI_POINT] =
      styles[GeometryType.POINT];

  styles[GeometryType.GEOMETRY_COLLECTION] =
      styles[GeometryType.POLYGON].concat(
        styles[GeometryType.LINE_STRING],
        styles[GeometryType.POINT]
      );

  return styles;
}


/**
 * Function that is called with a feature and returns its default geometry.
 * @param {module:ol/Feature~Feature|ol.render.Feature} feature Feature to get the geometry
 *     for.
 * @return {module:ol/geom/Geometry~Geometry|ol.render.Feature|undefined} Geometry to render.
 */
function defaultGeometryFunction(feature) {
  return feature.getGeometry();
}

export default Style;
