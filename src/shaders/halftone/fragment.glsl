uniform vec3 uColor;
uniform vec2 uResolution;
uniform float uGridSize;
uniform vec3 uShadowColour;
uniform float uLightRepetitions;
uniform vec3 uLightColour;

varying vec3 vNormal;
varying vec3 vPosition;

#include ../includes/ambientLight
#include ../includes/directionalLight
#include ../includes/halftone

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = uColor;

    // lights
    vec3 light = vec3(0.0);

    light += ambientLight(
        vec3(1.0), // Light color
        1.0        // Light intensity,
    );

    light += directionalLight(
        vec3(1.0, 1.0, 1.0), // Light color
        1.0,                 // Light intensity
        normal,              // Normal
        vec3(1.0, 1.0, 0.0), // Light position
        viewDirection,       // View direction
        1.0                  // Specular power
    );
    
    color *= light;


    // Halftone
    color = halftone(
        color,                 // Input color
        uGridSize,                  // Repetitions
        vec3(0.0, - 1.0, 0.0), // Direction
        - 0.8,                 // Low
        1.5,                   // High
        uShadowColour,   // Point color
        normal                 // Normal
    );

    //Shadow
      color = halftone(
        color,                 // Input color
        uLightRepetitions,                  // Repetitions
        vec3(1.0, 1.0, 0.0), // Direction
        0.5,                 // Low
        1.5,                   // High
        uLightColour,   // Point color
        normal                 // Normal
    );



    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}