uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec4 vPosition;
attribute vec3 vNormal;

varying vec3 fNormal;

void main()
{
    gl_Position = projectionMatrix * modelViewMatrix * vPosition;
    fNormal = vec3(modelViewMatrix * vec4(vNormal, 1.0));
}