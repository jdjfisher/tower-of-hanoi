function loadFile(path) {
  const xhr = new XMLHttpRequest();
  const okStatus = document.location.protocol === 'file:' ? 0 : 200;
  xhr.open('GET', path, false);
  xhr.send(null);
  return xhr.status == okStatus ? xhr.responseText : null;
}

function loadObjMesh(path) {
  const lines = loadFile(path).split(/\r?\n/);

  var vertices = [];
  var faces = [];

  lines.forEach(line => {
    const tokens = line.split(' ');

    switch (tokens[0]) {
      case 'v':
        vertices.push(vec4(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]), 1));
        break;

      case 'f':
        faces.push([ tokens[1][0] - 1, tokens[2][0] - 1, tokens[3][0] - 1 ]);
        break;
    }
  });

  return createMesh(vertices, faces);
}
