precision mediump float;

struct Light {
    vec3 colour;
    vec3 position;
    float intensity;
};

uniform Light light;
uniform vec3 modelColour;
uniform float ambientIntensity;

varying vec3 fNormal;

void main()
{
    vec3 lightDirection = normalize(light.position);

    vec3 ambient = vec3(ambientIntensity);
    vec3 diffuse = max(dot(fNormal, lightDirection), 0.0) * light.colour * light.intensity;

    vec3 result = (ambient + diffuse) * modelColour;

    gl_FragColor = vec4(result, 1.0);
}