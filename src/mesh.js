
function renderMesh(mesh) 
{
    // Bind model-mesh verticies
    gl.bindBuffer( gl.ARRAY_BUFFER, mesh.vBuffer );
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Bind model-mesh normals
    gl.bindBuffer( gl.ARRAY_BUFFER, mesh.nBuffer );
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    // Exectue mesh draw
    gl.drawArrays( gl.TRIANGLES, 0, mesh.vCount );
}

function createMesh(vertices, faces)
{
    const faceNormals = calcNormals( vertices, faces );

    // TODO: Smooth vertex normals

    var vertexNormals = [];
    for (var i = 0; i < faces.length; i++) {
      vertexNormals = [...vertexNormals, ...Array(faces[i].length).fill(faceNormals[i])] 
    }

    var normalBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertexNormals), gl.STATIC_DRAW );

    vertices = faces.flat().map(i => vertices[i]);

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );


    return {
        vCount: vertices.length,
        vBuffer: vertexBuffer,
        nBuffer: normalBuffer,
    };
}

function calcNormals(vertices, faces) 
{
  return faces.map(face => {
    const edge1 = subtract( vertices[face[1]], vertices[face[0]] );
    const edge2 = subtract( vertices[face[2]], vertices[face[0]] );

    return normalize( cross( edge1, edge2 ) );
  });
} 

function triangulateQuad(a, b, c, d) 
{
  return [a, b, c, a, c, d];
}

function cubeMesh() 
{
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

  const faces = [
    triangulateQuad(1, 0, 3, 2),
    triangulateQuad(2, 3, 7, 6),
    triangulateQuad(3, 0, 4, 7),
    triangulateQuad(6, 5, 1, 2),
    triangulateQuad(4, 5, 6, 7),
    triangulateQuad(5, 4, 0, 1),
  ];

  return createMesh( vertices, faces );
}

function planeMesh() 
{
  const vertices = [
    vec4(-0.5, 0, -0.5, 1),
    vec4(0.5, 0, -0.5, 1),
    vec4(0.5, 0, 0.5, 1),
    vec4(-0.5, 0, 0.5, 1),
  ];

  const face = triangulateQuad(0, 1, 2, 3);

  return createMesh( vertices, [ face ] );
}

function tetrahedronMesh() 
{
  const vertices = [
    vec4(0, 0, -1, 1),
    vec4(0, 0.942809, 0.333333, 1),
    vec4(-0.816497, -0.471405, 0.333333, 1),
    vec4(0.816497, -0.471405, 0.333333, 1),
  ];

  const faces = [
    [ 2, 1, 0 ],
    [ 1, 2, 3 ],
    [ 1, 3, 0 ],
    [ 3, 2, 0 ],
  ];

  return createMesh( vertices, faces );
}

function sphereMesh(divisions=5) 
{
  var vertices = [];
  var faces = []
  var index = 0;

  var a = vec4(0.0, 0.0, -1.0,1);
  var b = vec4(0.0, 0.942809, 0.333333, 1);
  var c = vec4(-0.816497, -0.471405, 0.333333, 1);
  var d = vec4(0.816497, -0.471405, 0.333333,1);

  subdivide(a, b, c, divisions);
  subdivide(d, c, b, divisions);
  subdivide(a, d, b, divisions);
  subdivide(a, c, d, divisions);

  return createMesh( vertices, faces);

  // Nested function
  function subdivide(a, b, c, n) 
  {
    if ( n > 0 ) {
        const ab = normalize( mix( a, b, 0.5), true );
        const ac = normalize( mix( a, c, 0.5), true );
        const bc = normalize( mix( b, c, 0.5), true );

        subdivide( a, ab, ac, n - 1 );
        subdivide( ab, b, bc, n - 1 );
        subdivide( bc, c, ac, n - 1 );
        subdivide( ab, bc, ac, n - 1 );
    }
    else {
      vertices.push(c);
      vertices.push(b);
      vertices.push(a);
  
      faces.push([
        index++,
        index++,
        index++,
      ])
    }
  }
}

