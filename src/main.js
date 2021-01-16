// OpenGL handles
var program;
var canvas;
var gl;

// Uniforms
var lightLoc;
var modelColourLoc;
var modelShininessLoc;
var viewPositionLoc;
var ambientIntensityLoc;
var modelMatrixLoc;
var viewMatrixLoc;
var projectionMatrixLoc;

// Scene
var models = {};
var light = {};


// Entry point
window.onload = () => {
  initElements();
  initOpenGL();
  initScene();

  mainLoop();
};

function initOpenGL() {
  canvas = document.getElementById('gl-canvas');

  // Initialise WebGL
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
    return null;
  }

  // Configure WebGL
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(...black, 1.0);
  gl.cullFace(gl.BACK);
  gl.enable(gl.DEPTH_TEST);

  // Setup shader program
  program = initShaders(gl, 'resources/shaders/vertex/main.glsl', 'resources/shaders/fragment/main.glsl');
  gl.useProgram(program);

  // Create uniforms
  viewPositionLoc = gl.getUniformLocation(program, 'viewPosition');
  modelMatrixLoc = gl.getUniformLocation(program, 'modelMatrix');
  viewMatrixLoc = gl.getUniformLocation(program, 'viewMatrix');
  projectionMatrixLoc = gl.getUniformLocation(program, 'projectionMatrix');
  modelColourLoc = gl.getUniformLocation(program, 'modelColour');
  modelShininessLoc = gl.getUniformLocation(program, 'modelShininess');
  ambientIntensityLoc = gl.getUniformLocation(program, 'ambientIntensity');
  lightLoc = {
    colour: gl.getUniformLocation(program, 'light.colour'),
    position: gl.getUniformLocation(program, 'light.position'),
    intensity: gl.getUniformLocation(program, 'light.intensity'),
  };
}

function initElements() {
  // Keydown listener
  window.addEventListener('keydown', e => keydownHandler(e.key));

  // Help button
  document.getElementById('help-button').addEventListener('click', () => {
    alert(loadFile('resources/help.txt'));
  });

  // Remove disks
  document.getElementById('less-button').addEventListener('click', () => {
    if (diskCount > minDisks) {
      diskCount--;
      initScene();
    }
  });

  // Add disks
  document.getElementById('more-button').addEventListener('click', () => {
    if (diskCount < maxDisks) {
      diskCount++;
      initScene();
    }
  });
}

function mainLoop() {
  update();
  render();

  requestAnimFrame(mainLoop);
}

function render() {
  // Clear the default framebuffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Set global uniforms
  gl.uniform1f(ambientIntensityLoc, 0.3);
  gl.uniform3fv(lightLoc.colour, light.material.colour);
  gl.uniform1f(lightLoc.intensity, light.material.intensity);
  gl.uniform3fv(lightLoc.position, light.transform.position);

  gl.uniform3fv(viewPositionLoc, eye);
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(getProjectionMatrix()));
  gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(getViewMatrix()));

  // Render scene models
  Object.values(models).forEach(model => {
    renderModel(model);
  });

  // Render light model
  gl.uniform1f(ambientIntensityLoc, 1.0);
  renderModel(light);
}

function renderModel(model) {
  // Compute model matrix
  var modelMatrix = mat4();

  if (model.transform.position) 
    modelMatrix = mult(modelMatrix, translate(model.transform.position));

  if (model.transform.rotation)
    modelMatrix = mult(modelMatrix, rotateEuler(...model.transform.rotation));

  if (model.transform.scale)
    modelMatrix = mult(modelMatrix, scalem(model.transform.scale));

  // Set model uniforms
  gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
  gl.uniform3fv(modelColourLoc, model.material.colour);
  gl.uniform1f(modelShininessLoc, model.material.shininess || 32);

  // Render the model mesh
  renderMesh(model.mesh);
}
