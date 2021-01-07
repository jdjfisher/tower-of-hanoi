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
    const [key, ...tokens] = line.split(' ');

    switch (key) {
      case 'v':
        const [x, y, z] = tokens;

        vertices.push(vec4(parseFloat(x), parseFloat(y), parseFloat(z), 1));
        break;

      case 'f':
        const indices = tokens.map(token => {
          return token.split('/')[0] - 1;
        });

        faces.push(indices);
        break;
    }
  });

  return createMesh(vertices, faces);
}
