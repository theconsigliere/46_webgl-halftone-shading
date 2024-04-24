vec3 halftone(
    vec3 color,
    float repetitions,
    vec3 direction,
    float low,
    float high,
    vec3 pointColor,
    vec3 normal
)
{
    // Halftone
    // divide by y so we get a square for the grid
    vec2 uv = gl_FragCoord.xy / uResolution.y;

    // DRAW GRID
    // We need a grid of dots to make the halftone effect
    uv *= repetitions;
    // uv gets to 1.0 then staqrts again at 0
    uv = mod(uv, 1.0);

     // HALFTONE CIRCLE SIZE
    float intensity = dot(normal, direction);
    // intensity is going from 1 to -1 we need toclamp it
    intensity = smoothstep(low, high, intensity);

    // DRAW CIRCLES
    // we need the distance from the center of the UV cell to the current pixel
    float point = distance(uv, vec2(0.5));
    // to get a sharp edge we need to make the point value 0 or 1
    point = 1.0 - step(0.5 * intensity, point);

    // COMBINE HALFTONE WITH COLOUR
    return mix(color, pointColor, point);
    
}