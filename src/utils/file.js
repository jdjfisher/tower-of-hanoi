
function loadFile(path) {
  const xhr = new XMLHttpRequest();
  const okStatus = document.location.protocol === 'file:' ? 0 : 200;
  xhr.open('GET', path, false);
  xhr.send(null);
  return xhr.status == okStatus ? xhr.responseText : null;
}

function loadObjMesh(path) {
  const lines = loadFile(path).split(/\r?\n/);

  var distinctVertices = [];
  var distinctNormals = [];
  var faces = [];

  // Parse the data
  lines.forEach(line => {
    const [key, ...tokens] = line.split(' ');

    switch (key) {
      // Position
      case 'v':
        var [x, y, z] = tokens;

        distinctVertices.push(vec4(parseFloat(x), parseFloat(y), parseFloat(z), 1));
        break;

      // Normal
      case 'vn':
        var [x, y, z] = tokens;

        distinctNormals.push(vec3(parseFloat(x), parseFloat(y), parseFloat(z)));
        break;

      // Face
      case 'f':
        const indices = tokens.map(token => {
          [v, tc, vn] = token.split('/');

          return {
            v: v -1,
            tc: tc -1,
            vn: vn -1,
          };
        });

        faces.push(indices);
        break;
    }
  });

  var vertices = [];
  var normals = [];

  // Derefence the data
  faces.forEach(face => {
    face.forEach(index => {
      vertices.push(distinctVertices[index.v]);
      normals.push(distinctNormals[index.vn]);
    });
  });

  // Create the mesh
  return createMesh(vertices, normals);
}
