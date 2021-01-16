function renderMesh(mesh) {
  // Bind model-mesh vertices
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vBuffer);
  var vPosition = gl.getAttribLocation(program, 'vPosition');
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  // Bind model-mesh normals
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.nBuffer);
  var vNormal = gl.getAttribLocation(program, 'vNormal');
  gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vNormal);

  // Exectue mesh draw
  gl.drawArrays(gl.TRIANGLES, 0, mesh.vCount);
}

function createMeshFromFaces(vertices, faces) {
  // Calculate normals
  const faceNormals = calcNormals(vertices, faces);

  // Normal smoothing
  var allVertexNormals = [];
  for (var i = 0; i < faces.length; i++) {
    for (var index of faces[i]) {
      if (allVertexNormals[index]) {
        allVertexNormals[index].push(faceNormals[i]);
      } else {
        allVertexNormals[index] = [faceNormals[i]];
      }
    }
  }

  var vertexNormals = [];
  for (var i = 0; i < faces.length; i++) {
    for (var index of faces[i]) {
      var smoothN = faceNormals[i];

      for (var n of allVertexNormals[index]) {
        const product = dot(faceNormals[i], n);

        if (product >= 0.15 && product <= 1.0) {
          smoothN = add(smoothN, n);
        }
      }

      vertexNormals.push(normalize(smoothN));
    }
  }

  // Dereference face indicies
  vertices = faces.flat().map(i => vertices[i]);

  // Create the mesh
  return createMesh(vertices, vertexNormals);
}

function createMesh(vertices, normals) {
  // Create normal buffer
  var normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

  // Create position buffer
  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  // Return mesh data
  return {
    vCount: vertices.length,
    vBuffer: vertexBuffer,
    nBuffer: normalBuffer,
  };
}

function calcNormals(vertices, faces) {
  return faces.map(face => {
    const edge1 = subtract(vertices[face[1]], vertices[face[0]]);
    const edge2 = subtract(vertices[face[2]], vertices[face[0]]);

    return normalize(cross(edge1, edge2));
  });
}

function triangulateQuad(a, b, c, d) {
  return [a, b, c, a, c, d];
}

function cubeMesh() {
  const vertices = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0),
  ];

  const faces = [
    triangulateQuad(1, 0, 3, 2),
    triangulateQuad(2, 3, 7, 6),
    triangulateQuad(3, 0, 4, 7),
    triangulateQuad(6, 5, 1, 2),
    triangulateQuad(4, 5, 6, 7),
    triangulateQuad(5, 4, 0, 1),
  ];

  return createMeshFromFaces(vertices, faces);
}

function planeMesh() {
  const vertices = [vec4(-0.5, 0, -0.5, 1), vec4(0.5, 0, -0.5, 1), vec4(0.5, 0, 0.5, 1), vec4(-0.5, 0, 0.5, 1)];

  const face = triangulateQuad(0, 1, 2, 3);

  return createMeshFromFaces(vertices, [face]);
}

function tetrahedronMesh() {
  const vertices = [
    vec4(0, 0, -1, 1),
    vec4(0, 0.942809, 0.333333, 1),
    vec4(-0.816497, -0.471405, 0.333333, 1),
    vec4(0.816497, -0.471405, 0.333333, 1),
  ];

  const faces = [
    [2, 1, 0],
    [1, 2, 3],
    [1, 3, 0],
    [3, 2, 0],
  ];

  return createMeshFromFaces(vertices, faces);
}

function sphereMesh(divisions = 5) {
  var vertices = [];
  var faces = [];
  var index = 0;

  var a = vec4(0.0, 0.0, -1.0, 1);
  var b = vec4(0.0, 0.942809, 0.333333, 1);
  var c = vec4(-0.816497, -0.471405, 0.333333, 1);
  var d = vec4(0.816497, -0.471405, 0.333333, 1);

  subdivide(a, b, c, divisions);
  subdivide(d, c, b, divisions);
  subdivide(a, d, b, divisions);
  subdivide(a, c, d, divisions);

  return createMeshFromFaces(vertices, faces);

  // Nested function
  function subdivide(a, b, c, n) {
    if (n > 0) {
      const ab = normalize(mix(a, b, 0.5), true);
      const ac = normalize(mix(a, c, 0.5), true);
      const bc = normalize(mix(b, c, 0.5), true);

      subdivide(a, ab, ac, n - 1);
      subdivide(ab, b, bc, n - 1);
      subdivide(bc, c, ac, n - 1);
      subdivide(ab, bc, ac, n - 1);
    } else {
      vertices.push(c);
      vertices.push(b);
      vertices.push(a);

      faces.push([index++, index++, index++]);
    }
  }
}

function tubeMesh(or, ir, h, n = 50) {
  var vertices = [];
  var faces = [];

  const deltaTheta = (2 * Math.PI) / n;
  const hh = h / 2;
  var theta = 0;

  // Generate verticies in a circle
  for (var i = 0; i < n; i++) {
    sinT = Math.sin(theta);
    cosT = Math.cos(theta);
    theta -= deltaTheta;

    vertices[i] = vec4(ir * cosT, hh, ir * sinT, 1);
    vertices[i + n] = vec4(or * cosT, hh, or * sinT, 1);
    vertices[i + 2 * n] = vec4(ir * cosT, -hh, ir * sinT, 1);
    vertices[i + 3 * n] = vec4(or * cosT, -hh, or * sinT, 1);
  }

  // Top & Bottom faces
  for (var i = 0; i < n - 1; i++) {
    faces.push(triangulateQuad(i, i + n, i + 1 + n, i + 1));

    const j = i + 2 * n;
    faces.push(triangulateQuad(j + 1, j + 1 + n, j + n, j));
  }

  // Top & Bottom joiner face
  faces.push(triangulateQuad(n - 1, 2 * n - 1, n, 0));
  faces.push(triangulateQuad(2 * n, 3 * n, 4 * n - 1, 3 * n - 1));

  // Outer faces
  for (var i = 0; i < n - 1; i++) {
    faces.push(triangulateQuad(i + n, i + 3 * n, i + 1 + 3 * n, i + 1 + n));
  }

  // Outer join face
  faces.push(triangulateQuad(2 * n - 1, 4 * n - 1, 3 * n, n));

  // Inner faces
  for (var i = 0; i < n - 1; i++) {
    faces.push(triangulateQuad(i + 1, i + 1 + 2 * n, i + 2 * n, i));
  }

  // Inner join face
  faces.push(triangulateQuad(0, 2 * n, 3 * n - 1, n - 1));

  return createMeshFromFaces(vertices, faces);
}

function cylinderMesh(n = 50) {
  var vertices = [];
  var faces = [];

  const deltaTheta = (2 * Math.PI) / n;
  var theta = 0;

  // Generate verticies in a circle
  for (var i = 0; i < n; i++) {
    sinT = Math.sin(theta);
    cosT = Math.cos(theta);
    theta -= deltaTheta;

    vertices[i] = vec4(cosT, 0.5, sinT, 1);
    vertices[i + n] = vec4(cosT, -0.5, sinT, 1);
  }

  vertices[2 * n] = vec4(0, 0.5, 0, 1);
  vertices[2 * n + 1] = vec4(0, -0.5, 0, 1);

  // Top & Bottom faces
  for (var i = 0; i < n - 1; i++) {
    faces.push([2 * n, i, i + 1]);

    const j = i + n;
    faces.push([j + 1, j, 2 * n + 1]);
  }

  // Top & Bottom joiner face
  faces.push([2 * n, n - 1, 0]);
  faces.push([n, 2 * n - 1, 2 * n + 1]);

  // Outer faces
  for (var i = 0; i < n - 1; i++) {
    faces.push(triangulateQuad(i, i + n, i + 1 + n, i + 1));
  }

  // Outer join face
  faces.push(triangulateQuad(n - 1, 2 * n - 1, n, 0));

  return createMeshFromFaces(vertices, faces);
}

function coneMesh(n = 50) {
  var vertices = [];
  var faces = [];

  const deltaTheta = (2 * Math.PI) / n;
  var theta = 0;

  // Generate verticies in a circle
  for (var i = 0; i < n; i++) {
    sinT = Math.sin(theta);
    cosT = Math.cos(theta);
    theta -= deltaTheta;

    vertices[i] = vec4(cosT, 0, sinT, 1);
  }

  // Base centre
  vertices[n] = vec4(0, 0, 0, 1);

  // Cone peak
  vertices[n + 1] = vec4(0, 1, 0, 1);

  for (var i = 0; i < n - 1; i++) {
    // Base faces
    faces.push([n, i, i + 1]);

    // Vertical faces
    faces.push([n + 1, i, i + 1]);
  }

  // Base & Vertical joiner face
  faces.push([n, n - 1, 0]);
  faces.push([n + 1, n - 1, 0]);

  return createMeshFromFaces(vertices, faces);  
}