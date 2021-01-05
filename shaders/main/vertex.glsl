uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;

attribute vec4 vPosition;
attribute vec3 vNormal;

varying vec3 fNormal;
varying vec3 fPosition;

void main()
{
    vec4 modelPosition = modelMatrix * vPosition;
    fPosition = vec3( modelPosition );
    fNormal = normalize(mat3(modelMatrix) * vNormal);
    gl_Position = projectionMatrix * viewMatrix * modelPosition;
}