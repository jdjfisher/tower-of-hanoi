precision mediump float;

struct Light {
    vec3 colour;
    vec3 position;
    float intensity;
};

uniform vec3 modelColour;
uniform float modelShininess;
uniform Light light;
uniform vec3 viewPosition;
uniform float ambientIntensity;

varying vec3 fNormal;
varying vec3 fPosition;


void main()
{
    // Lighting calculations
    vec3 lightFragVector = light.position - fPosition;
    vec3 lightDirection = normalize(lightFragVector);
    float distance = length(lightFragVector);
    float attenuation = 1.0 / (1.0 + 0.05 * distance + 0.025 * (distance * distance));    

    // Ambient component
    vec3 ambient = vec3(ambientIntensity);

    // Diffuse component
    vec3 diffuse = max(dot(fNormal, lightDirection), 0.0) * light.colour * light.intensity;

    // Specular component
    vec3 viewDirection = normalize(viewPosition - fPosition);
    vec3 reflectDirection = reflect(-lightDirection, fNormal);  
    vec3 specular = pow(max(dot(viewDirection, reflectDirection), 0.0), modelShininess) * light.colour * light.intensity;

    // Combined fragment colour
    vec3 fragColour = (ambient + diffuse + specular) * attenuation * modelColour;
    gl_FragColor = vec4(fragColour, 1.0);
}