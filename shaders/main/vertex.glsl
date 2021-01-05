uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec4 vPosition;
attribute vec3 vNormal;

varying vec3 fNormal;
varying vec3 fPosition;

void main()
{
    gl_Position = projectionMatrix * modelViewMatrix * vPosition;
    fPosition = vec3(modelViewMatrix * vPosition);
    fNormal = vNormal;
}