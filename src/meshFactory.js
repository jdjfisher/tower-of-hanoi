function cube() {
  return [
    ...cubeQuad(1, 0, 3, 2),
    ...cubeQuad(2, 3, 7, 6),
    ...cubeQuad(3, 0, 4, 7),
    ...cubeQuad(6, 5, 1, 2),
    ...cubeQuad(4, 5, 6, 7),
    ...cubeQuad(5, 4, 0, 1),
  ];
}

function cubeQuad(a, b, c, d) {
  const vertices = [
    vec4(-0.25, -0.25, 0.25, 1.0),
    vec4(-0.25, 0.25, 0.25, 1.0),
    vec4(0.25, 0.25, 0.25, 1.0),
    vec4(0.25, -0.25, 0.25, 1.0),
    vec4(-0.25, -0.25, -0.25, 1.0),
    vec4(-0.25, 0.25, -0.25, 1.0),
    vec4(0.25, 0.25, -0.25, 1.0),
    vec4(0.25, -0.25, -0.25, 1.0),
  ];

  const indices = [a, b, c, a, c, d];

  return indices.map((i) => vertices[i]);
}

function plane() {
  const vertices = [
    vec4(-0.5, 0, -0.5, 1),
    vec4(0.5, 0, -0.5, 1),
    vec4(0.5, 0, 0.5, 1),
    vec4(-0.5, 0, 0.5, 1),
  ];

  const indices = [
    0, 2, 1,
    2, 0, 3,
  ]

  return indices.map((i) => vertices[i]);
}
