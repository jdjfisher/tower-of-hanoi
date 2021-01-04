// OpenGL handles 
var program;
var canvas;
var gl;

// 
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var theta = [ 0, 0, 0 ];
var thetaLoc;
var spin = false;

// Projection constants
const near = 0.1;
const far = 5.0;
const fovy = 60.0;
const aspect = 1.0;   

// View constants
const eye = vec3(0, 2.0, 2.0);
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

// Scene 
var models = [];
var meshes = [];

var modelViewMatrixLoc, projectionMatrixLoc;

window.onload = () =>
{
    initElements();
    initOpenGL();
    initScene();

    mainLoop();
}

function initOpenGL()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) {
        alert( "WebGL isn't available" ); 
        return null;
    }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);

    program = initShaders( gl, "shaders/main/vertex.glsl", "shaders/main/fragment.glsl" );
    gl.useProgram( program );

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    
    thetaLoc = gl.getUniformLocation(program, "theta");
}

function initScene()
{
    const cubeMesh = createMesh(cube());
    const planeMesh = createMesh(plane());

    meshes = [
        cubeMesh,
        planeMesh,
    ];
}

function createMesh(vertices)
{
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    return {
        vCount: vertices.length,
        vBuffer: vBuffer,
    };
}

function initElements()
{
    //event listeners for buttons
    document.getElementById( "xButton" ).onclick = () => {
        axis = xAxis;
        spin = true;
    };
    document.getElementById( "yButton" ).onclick = () => {
        axis = yAxis;
        spin = true;
    };
    document.getElementById( "zButton" ).onclick = () => {
        axis = zAxis;
        spin = true;
    };
}

function mainLoop()
{
    update(); 
    render();
    
    requestAnimFrame( mainLoop );
}

function update()
{
    if(spin) {
        theta[axis] += 1.0;
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const modelViewMatrix = lookAt(eye, at , up);
    const projectionMatrix = perspective(fovy, aspect, near, far);

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
    gl.uniform3fv(thetaLoc, theta);

    // Draw meshes
    meshes.forEach(mesh => {
        gl.bindBuffer( gl.ARRAY_BUFFER, mesh.vBuffer );

        var vPosition = gl.getAttribLocation( program, "vPosition" );
        gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vPosition );

        gl.drawArrays( gl.TRIANGLES, 0, mesh.vCount );
    });
}
