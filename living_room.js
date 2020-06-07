// Directional lighting demo: By Frederick Li
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +        // Normal
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_ProjMatrix;\n' +
  'uniform vec3 u_LightColor;\n' +     // Light color
  'uniform vec3 u_LightDirection;\n' + // Light direction (in the world coordinate, normalized)
  'varying vec4 v_Color;\n' +
  'uniform bool u_isLighting;\n' +
  'void main() {\n' +
  '  gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n' +
  '  if(u_isLighting)\n' +
  '  {\n' +
  '     vec3 normal = normalize((u_NormalMatrix * a_Normal).xyz);\n' +
  '     float nDotL = max(dot(normal, u_LightDirection), 0.0);\n' +
        // Calculate the color due to diffuse reflection
  '     vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;\n' +
  '     v_Color = vec4(diffuse, a_Color.a);\n' +  '  }\n' +
  '  else\n' +
  '  {\n' +
  '     v_Color = a_Color;\n' +
  '  }\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

var modelMatrix = new Matrix4(); // The model matrix
var viewMatrix = new Matrix4();  // The view matrix
var projMatrix = new Matrix4();  // The projection matrix
var g_normalMatrix = new Matrix4();  // Coordinate transformation matrix for normals

var ANGLE_STEP = 3.0;  // The increments of rotation angle (degrees)
var g_xAngle = 0.0;    // The rotation x angle (degrees)
var g_yAngle = 0.0;    // The rotation y angle (degrees)
let x_coord = 0;  // eye x co-ordinate
let y_coord = 0;    // eye y co-ordinate
let z_coord = 0;   // eye z co-ordinate
var angle=0;
function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }


  // Set clear color and enable hidden surface removal
  gl.clearColor(51 / 255, 204 / 255, 1, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Get the storage locations of uniform attributes
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');

  // Trigger using lighting or not
  var u_isLighting = gl.getUniformLocation(gl.program, 'u_isLighting');

  if (!u_ModelMatrix || !u_ViewMatrix || !u_NormalMatrix ||
      !u_ProjMatrix || !u_LightColor || !u_LightDirection ||
      !u_isLighting) {
    console.log('Failed to Get the storage locations of u_ModelMatrix, u_ViewMatrix, and/or u_ProjMatrix');
    return;
  }

  // Set the light color (white)
  gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
  // Set the light direction (in the world coordinate)
  var lightDirection = new Vector3([0.5, 3.0, 4.0]);
  lightDirection.normalize();     // Normalize
  gl.uniform3fv(u_LightDirection, lightDirection.elements);

  // Calculate the view matrix and the projection matrix
  viewMatrix.setLookAt(0, 0, 15, 0, 0, -100, 0, 1, 0);
  projMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);
  // Pass the model, view, and projection matrix to the uniform variable respectively
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);


  document.onkeydown = function (ev) {
    keydown(ev, gl, u_ModelMatrix, u_NormalMatrix, u_isLighting);
  };

  draw(gl, u_ModelMatrix, u_NormalMatrix, u_isLighting);

  document.onkeydown = function (ev) {
    keydown(ev, gl, u_ModelMatrix, u_NormalMatrix, u_isLighting);
  };

  function keydown(ev, gl, u_ModelMatrix, u_NormalMatrix, u_isLighting) {
    let movement_speed = 0.1;

    switch (ev.keyCode) {
      case 87:
        z_coord++;
        break;
      case 65:
        x_coord++;
        break;
      case 83:
        z_coord--;
        break;
      case 68:
        x_coord--;
        break;
      case 81:
        y_coord++;
        break;
      case 69:
        y_coord--;
        break;
      case 40: // Up arrow key -> the positive rotation of arm1 around the y-axis
        g_xAngle = (g_xAngle + ANGLE_STEP) % 360;
        break;
      case 38: // Down arrow key -> the negative rotation of arm1 around the y-axis
        g_xAngle = (g_xAngle - ANGLE_STEP) % 360;
        break;
      case 39: // Right arrow key -> the positive rotation of arm1 around the y-axis
        g_yAngle = (g_yAngle + ANGLE_STEP) % 360;
        break;
      case 37: // Left arrow key -> the negative rotation of arm1 around the y-axis
        g_yAngle = (g_yAngle - ANGLE_STEP) % 360;
        break;
      default:
        return; // Skip drawing at no effective action
    }

    // Draw the scene
    draw(gl, u_ModelMatrix, u_NormalMatrix, u_isLighting);
  }
  function render() {

    draw(gl, u_ModelMatrix, u_NormalMatrix, u_isLighting);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

function initVertexBuffers(gl, r, g, b, a) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  let vertices = new Float32Array([   // Coordinates
    0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, // v0-v1-v2-v3 front
    0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, // v0-v3-v4-v5 right
    0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, // v0-v5-v6-v1 up
    -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, // v1-v6-v7-v2 left
    -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, // v7-v4-v3-v2 down
    0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5  // v4-v7-v6-v5 back
  ]);


  let colors = new Float32Array([    // Colors
    r, g, b, a, r, g, b, a, r, g, b, a, r, g, b, a,  // v0-v1-v2-v3 front
    r, g, b, a, r, g, b, a, r, g, b, a, r, g, b, a,     // v0-v3-v4-v5 right
    r, g, b, a, r, g, b, a, r, g, b, a, r, g, b, a,     // v0-v5-v6-v1 up
    r, g, b, a, r, g, b, a, r, g, b, a, r, g, b, a,    // v1-v6-v7-v2 left
    r, g, b, a, r, g, b, a, r, g, b, a, r, g, b, a,    // v7-v4-v3-v2 down
    r, g, b, a, r, g, b, a, r, g, b, a, r, g, b, a     // v4-v7-v6-v5 back
  ]);


  let normal = new Float32Array([    // Normal
    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
    -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0   // v4-v7-v6-v5 back
  ]);



  // Indices of the vertices
  let indices = new Uint8Array([
    0, 1, 2, 0, 2, 3,    // front
    4, 5, 6, 4, 6, 7,    // right
    8, 9, 10, 8, 10, 11,    // up
    12, 13, 14, 12, 14, 15,    // left
    16, 17, 18, 16, 18, 19,    // down
    20, 21, 22, 20, 22, 23     // back
  ]);

  if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Color', colors, 4, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', normal, 3, gl.FLOAT)) return -1;

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Write the indices to the buffer object
  let indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}



function initArrayBuffer (gl, attribute, data, num, type) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return true;
}

function initAxesVertexBuffers(gl) {

  var verticesColors = new Float32Array([
    // Vertex coordinates and color (for axes)
    -20.0,  0.0,   0.0,  1.0,  1.0,  1.0,  // (x,y,z), (r,g,b)
     20.0,  0.0,   0.0,  1.0,  1.0,  1.0,
     0.0,  20.0,   0.0,  1.0,  1.0,  1.0,
     0.0, -20.0,   0.0,  1.0,  1.0,  1.0,
     0.0,   0.0, -20.0,  1.0,  1.0,  1.0,
     0.0,   0.0,  20.0,  1.0,  1.0,  1.0
  ]);
  var n = 6;

  // Create a buffer object
  var vertexColorBuffer = gl.createBuffer();
  if (!vertexColorBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var FSIZE = verticesColors.BYTES_PER_ELEMENT;
  //Get the storage location of a_Position, assign and enable buffer
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

  // Get the storage location of a_Position, assign buffer and enable
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);  // Enable the assignment of the buffer object

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return n;
}

var g_matrixStack = []; // Array for storing a matrix
function pushMatrix(m) { // Store the specified matrix to the array
  var m2 = new Matrix4(m);
  g_matrixStack.push(m2);
}

function popMatrix() { // Retrieve the matrix from the array
  return g_matrixStack.pop();
}



function draw(gl, u_ModelMatrix, u_NormalMatrix, u_isLighting) {

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.uniform1i(u_isLighting, false); // Will not apply lighting

  // Set the vertex coordinates and color (for the x, y axes)

  var n = initAxesVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }


  // Calculate the view matrix and the projection matrix
  modelMatrix.setTranslate(0, 0, 0);  // No Translation
  // Pass the model matrix to the uniform variable
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Draw x and y axes
  // gl.drawArrays(gl.LINES, 0, n);

  gl.uniform1i(u_isLighting, true); // Will apply lighting

  // Set the vertex coordinates and color (for the cube)
  var n = initVertexBuffers(gl, 66 / 255, 135 / 255, 254 / 255, 1);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Rotate, and then translate
  modelMatrix.setTranslate(x_coord, y_coord, z_coord);  // Translation (No translation is supported here)
  modelMatrix.rotate(g_yAngle, 0, 1, 0); // Rotate along y axis
  modelMatrix.rotate(g_xAngle, 1, 0, 0); // Rotate along x axis


  //Floor
  var n = initVertexBuffers(gl, 153 / 255, 51 / 255, 51 / 255, 1);
  pushMatrix(modelMatrix);
  modelMatrix.translate(0, -2, 10);  // Translation
  modelMatrix.scale(30.0, 0.5, 30.0); // Scale
  drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  function draw_chair(x, y, z, r, g, b) {
    var n = initVertexBuffers(gl, r, g, b, 1);

    // Model the chair back
    pushMatrix(modelMatrix);
    modelMatrix.translate(x + 0, y + 1.25, z - 0.75);  // Translation
    modelMatrix.scale(2.0, 2.0, 0.5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();

    //Chair seat
    pushMatrix(modelMatrix);
    modelMatrix.translate(x, y, z);  // Translation
    modelMatrix.scale(2.0, 0.5, 2.0); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();

    var n = initVertexBuffers(gl, 102 / 255, 51 / 255, 0 / 255, 1);
//  Chair legs

    //Back right
    pushMatrix(modelMatrix);
    modelMatrix.translate(x + 0.8, y - 1, z - 0.75);  // Translation
    modelMatrix.scale(0.4, 1.5, 0.4); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();

//  Back left
    pushMatrix(modelMatrix);
    modelMatrix.translate(x - 0.8, y - 1, z - 0.75);  // Translation
    modelMatrix.scale(0.4, 1.5, 0.4); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();

//  Front left
    pushMatrix(modelMatrix);
    modelMatrix.translate(x - 0.8, y - 1, z + 0.75);  // Translation
    modelMatrix.scale(0.4, 1.5, 0.4); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();

//  Front right
    pushMatrix(modelMatrix);
    modelMatrix.translate(x + 0.8, y - 1, z + 0.75);  // Translation
    modelMatrix.scale(0.4, 1.5, 0.4); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();

  }

  draw_chair(0, 0, 0, 51 / 255, 153 / 255, 51 / 255);
  draw_chair(0, 0, 4, 255 / 255, 153 / 255, 51 / 255);

//  TV Stand
  var n = initVertexBuffers(gl, 102 / 255, 51 / 255, 0 / 255, 1);

  pushMatrix(modelMatrix);
  modelMatrix.translate(0, -1, 20);  // Translation
  modelMatrix.scale(5, 1.5, 3); // Scale
  drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  //TV Base

  var n = initVertexBuffers(gl, 0, 0, 0, 1);
  pushMatrix(modelMatrix);
  modelMatrix.translate(0, -0.2, 20);  // Translation
  modelMatrix.scale(3, 0.4, 2); // Scale
  drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

//  TV Stand bit
  var n = initVertexBuffers(gl, 0, 0, 0, 1);
  pushMatrix(modelMatrix);
  modelMatrix.translate(0, 0.2, 20);  // Translation
  modelMatrix.scale(1, 1, 0.3); // Scale
  drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

//TV Screen
  var n = initVertexBuffers(gl, 0, 0, 0, 1);
  pushMatrix(modelMatrix);
  modelMatrix.translate(0, 2, 20);  // Translation
  modelMatrix.scale(5, 3, 0.3); // Scale
  drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();


//  Lamp
  function draw_lamp(x, y, z) {
    var n = initVertexBuffers(gl, 102 / 255, 51 / 255, 0 / 255, 1);
    pushMatrix(modelMatrix);
    modelMatrix.translate(x + 5, y - 0.5, z + 20);  // Translation
    modelMatrix.scale(0.4, 3.5, 0.4); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();

    //  Lamp Stand
    pushMatrix(modelMatrix);
    modelMatrix.translate(x + 5, y - 1.7, z + 20);  // Translation
    modelMatrix.scale(2, 0.3, 2); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();

//  Lamp shade
    var n = initVertexBuffers(gl, 255 / 255, 204 / 255, 0 / 255, 1);
    angle++;
    pushMatrix(modelMatrix);
    modelMatrix.translate(x + 5, y + 2, z + 20);  // Translation
    modelMatrix.scale(2, 2, 2); // Scale
    modelMatrix.rotate(angle, 0, 1, 0);
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();
  }


  draw_lamp(5, 0, 0);
  draw_lamp(-15, 0, 0);

  function draw_speaker(x, y, z) {
    //  Speakers

    var n = initVertexBuffers(gl, 0, 0, 0, 1);

    pushMatrix(modelMatrix);
    modelMatrix.translate(x + 5, y, z + 20);  // Translation
    modelMatrix.scale(2, 4, 3); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();

//  Woofer


    var n = initVertexBuffers(gl, 0.5, 0.5, 0.5, 1);

    pushMatrix(modelMatrix);
    modelMatrix.translate(x + 5, y - 0.7, z + 18.5 + ((Math.floor(Math.random() * 2)) / 4));  // Translation
    modelMatrix.scale(1, 1, 0.7); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();

//  Tweeter
    pushMatrix(modelMatrix);
    modelMatrix.translate(x + 5, y + 1, z + 18.5 + ((Math.floor(Math.random() * 2)) / 4));  // Translation
    modelMatrix.scale(0.6, 0.6, 0.7); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();
  }

  draw_speaker(0, 0, 0);
  draw_speaker(-10, 0, 0);

  function draw_sofa(x, y, z, r, g, b) {


//   Sofa
  var n = initVertexBuffers(gl, r, g, b, 1);
  //Bottom
  pushMatrix(modelMatrix);
  modelMatrix.translate(x+8, y-1, z);  // Translation
  modelMatrix.scale(8, 1.5, 3); // Scale
  drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //Left arm

  pushMatrix(modelMatrix);
  modelMatrix.translate(x+4, y-0.5, z);  // Translation
  modelMatrix.scale(1, 3, 3); // Scale
  drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //Right arm

  pushMatrix(modelMatrix);
  modelMatrix.translate(x+12, y-0.5, z);  // Translation
  modelMatrix.scale(1, 3, 3); // Scale
  drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //Back

  pushMatrix(modelMatrix);
  // angle++;
  modelMatrix.translate(x+8, y+1, z-1);  // Translation
  modelMatrix.scale(9, 2.5, 1); // Scale
  drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
}

  draw_sofa(0,0,0,255/255,102/255,255/255);

  draw_sofa(-15,0,0,51/255,153/255,255/255);
}


function drawbox(gl, u_ModelMatrix, u_NormalMatrix, n) {
  pushMatrix(modelMatrix);

    // Pass the model matrix to the uniform variable
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // Calculate the normal transformation matrix and pass it to u_NormalMatrix
    g_normalMatrix.setInverseOf(modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);

    // Draw the cube
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

  modelMatrix = popMatrix();
}
