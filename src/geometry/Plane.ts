import {vec2, vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Plane extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  normals: Float32Array;
  center: vec3;
  scale: vec2;
  subdivs: number; // 2^subdivs is how many squares will compose the plane; must be even.

  col1: Float32Array;
  col2: Float32Array;
  col3: Float32Array;
  col4: Float32Array;
  colors: Float32Array;

  constructor(center: vec3, scale: vec2, subdivs: number) {
    super(); // Call the constructor of the super class. This is required.
    this.center = vec3.fromValues(center[0], center[1], center[2]);
    this.scale = scale;
    this.subdivs = subdivs + subdivs % 2; // Ensures the number is even, rounds up.
  }

  create() {

    let width: number = Math.pow(2, this.subdivs / 2);
    let normalize: number = 1.0 / width;
    this.positions = new Float32Array((width + 1) * (width + 1) * 4);
    this.normals = new Float32Array((width + 1) * (width + 1) * 4);
    this.indices = new Uint32Array(width * width * 6); // NxN squares, each square is two triangles, each triangle is three indices

    let posIdx = 0;
    for(let x = 0; x <= width; ++x) {
      for(let y = 0; y <= width; ++y) {
        // Make a strip of vertices along Z with the current X coord
        this.normals[posIdx] = 0;
        this.positions[posIdx++] = x * normalize * this.scale[0] + this.center[0] - this.scale[0] * 0.5;
        this.normals[posIdx] = 0;
        this.positions[posIdx++] = 0 + this.center[1];
        this.normals[posIdx] = 1;
        this.positions[posIdx++] = y * normalize * this.scale[1] + this.center[2] - this.scale[1] * 0.5;
        this.normals[posIdx] = 0;
        this.positions[posIdx++] = 1;
      }
    }

    let indexIdx = 0;
    // Make the squares out of indices
    for(let i = 0; i < width; ++i) { // X iter
      for(let j = 0; j < width; ++j) { // Z iter
        this.indices[indexIdx++] = j + i * (width + 1);
        this.indices[indexIdx++] = j + 1 + i * (width + 1);
        this.indices[indexIdx++] = j + (i + 1) * (width + 1);

        this.indices[indexIdx++] = j + 1 + i * (width + 1);
        this.indices[indexIdx++] = j + (i + 1) * (width + 1);
        this.indices[indexIdx++] = j + 1 + (i + 1) * (width + 1);
      }
    }

    this.generateIdx();
    this.generatePos();
    this.generateNor();

    this.generateTransform1();
    this.generateTransform2();
    this.generateTransform3();
    this.generateTransform4();
    this.generateCol();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    console.log(`Created plane`);
  }

  setInstanceVBOs(col1: Float32Array,
                           col2: Float32Array,
                           col3: Float32Array,
                           col4: Float32Array,
                           colors: Float32Array) {
    this.col1 = col1;
    this.col2 = col2;
    this.col3 = col3;
    this.col4 = col4;
    this.colors = colors;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform1);
    gl.bufferData(gl.ARRAY_BUFFER, this.col1, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform2);
    gl.bufferData(gl.ARRAY_BUFFER, this.col2, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform3);
    gl.bufferData(gl.ARRAY_BUFFER, this.col3, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform4);
    gl.bufferData(gl.ARRAY_BUFFER, this.col4, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
  }
};

export default Plane;
