precision mediump float;

struct Light {
    vec3 colour;
    vec3 position;
    float intensity;
};

uniform Light light;
uniform vec3 modelColour;
uniform vec3 viewPosition;
uniform float ambientIntensity;

varying vec3 fNormal;
varying vec3 fPosition;

void main()
{
    vec3 lightDirection = normalize(light.position - fPosition);

    vec3 ambient = vec3(ambientIntensity);

    vec3 diffuse = max(dot(fNormal, lightDirection), 0.0) * light.colour * light.intensity;

    vec3 viewDirection = normalize(viewPosition - fPosition);
    vec3 reflectDirection = reflect(-lightDirection, fNormal);  
    vec3 specular = pow(max(dot(viewDirection, reflectDirection), 0.0), 32.0) * light.colour * light.intensity;

    vec3 result = (ambient + diffuse + specular) * modelColour;

    gl_FragColor = vec4(result, 1.0);
}