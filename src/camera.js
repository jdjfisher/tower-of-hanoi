
// Projection constants
const near = 0.001;
const far = 50.0;
const fovy = 60.0;
const aspect = 1.0;   

// Preset camera positions
const cameraPositions = [
  vec3(4.0, 0.1, 0.0),
  vec3(-2.0, 1.0, 5.0),
  vec3(0.0, 0.5, -6.0),
  vec3(3.0, 4, -4.0),
];

// Camera view 
var currentCamera = 0
var eye = cameraPositions[currentCamera];
const up = vec3(0.0, 1.0, 0.0);
const at = vec3(0.0, 1.0, 0.0);

function nextCamera() {
  currentCamera = Math.min(currentCamera + 1, cameraPositions.length - 1);
  eye = cameraPositions[currentCamera]
}

function prevCamera() {
  currentCamera = Math.max(currentCamera - 1, 0);
  eye = cameraPositions[currentCamera]
}

function getViewMatrix() {
  return lookAt(eye, at , up);
}

function getProjectionMatrix() {
  return perspective(fovy, aspect, near, far);
}