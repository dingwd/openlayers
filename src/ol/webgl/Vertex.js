/**
 * @module ol/webgl/Vertex
 */
import {inherits} from '../index.js';
import {VERTEX_SHADER} from '../webgl.js';
import WebGLShader from '../webgl/Shader.js';

/**
 * @constructor
 * @extends {module:ol/webgl/Shader~WebGLShader}
 * @param {string} source Source.
 * @struct
 */
const WebGLVertex = function(source) {
  WebGLShader.call(this, source);
};

inherits(WebGLVertex, WebGLShader);


/**
 * @inheritDoc
 */
WebGLVertex.prototype.getType = function() {
  return VERTEX_SHADER;
};
export default WebGLVertex;
