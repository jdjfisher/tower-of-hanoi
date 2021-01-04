// OpenGL handles 
var program;
var canvas;
var gl;

// Uniforms
var lightLoc;
var modelColourLoc;
var ambientIntensityLoc;
var modelViewMatrixLoc, projectionMatrixLoc;

// 
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var spin = false;

// Projection constants
const near = 0.001;
const far = 10.0;
const fovy = 60.0;
const aspect = 1.0;   

// View constants
const eye = vec3(0, 1.0, 2.0);
const at = vec3(0.0, 0.5, 0.0);
const up = vec3(0.0, 1.0, 0.0);

// Scene 
var models = {};
var light = {};

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
    gl.clearColor( ...black, 1.0 );
    gl.enable(gl.DEPTH_TEST);

    program = initShaders( gl, "shaders/main/vertex.glsl", "shaders/main/fragment.glsl" );
    gl.useProgram( program );

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    
    modelColourLoc = gl.getUniformLocation(program, "modelColour");
    ambientIntensityLoc = gl.getUniformLocation(program, "ambientIntensity");
    lightLoc = {
        colour: gl.getUniformLocation(program, "light.colour"),
        position: gl.getUniformLocation(program, "light.position"),
        intensity: gl.getUniformLocation(program, "light.intensity"),
    } 
}

function initScene()
{
    const planeMesh = createMesh(plane());
    const cubeMesh = createMesh(cube());

    models = {
        xzPlane: {
            mesh: planeMesh,
            colour: white,
            scale: vec3(3, 3, 3),
        },
        spinningCube: {
            mesh: cubeMesh,
            colour: blue,
            position: vec3(0.0, 1.0, 0.0),
            rotation: vec3(),
        },
    };

    light = {
        colour: white,
        position: vec3(0.0, 5.0, 0.0),
        intensity: 1,
    }
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
        models.spinningCube.rotation[axis] += 1.0;
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const viewMatrix = lookAt(eye, at , up);
    const projectionMatrix = perspective(fovy, aspect, near, far);

    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
    
    gl.uniform1f( ambientIntensityLoc, 0.1 );

    gl.uniform3fv( lightLoc.colour, light.colour );
    gl.uniform3fv( lightLoc.position, light.position );
    gl.uniform1f( lightLoc.intensity, light.intensity );

    // Draw meshes
    Object.values(models).forEach(model => {
        gl.bindBuffer( gl.ARRAY_BUFFER, model.mesh.vBuffer );

        var vPosition = gl.getAttribLocation( program, "vPosition" );
        gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vPosition );

        gl.uniform3fv(modelColourLoc, model.colour);

        var modelMatrix = mat4();

        if (model.position) {
            modelMatrix = mult(modelMatrix, translate(model.position));
        } 

        if (model.rotation) {
            const [ x, y , z ] = model.rotation;
            modelMatrix = mult(modelMatrix, rotateX(x));
            modelMatrix = mult(modelMatrix, rotateY(y));
            modelMatrix = mult(modelMatrix, rotateZ(z));
        } 

        if (model.scale) {
            modelMatrix = mult(modelMatrix, scalem(model.scale));
        } 
        
        const modelViewMatrix = mult(viewMatrix, modelMatrix);
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );

        gl.drawArrays( gl.TRIANGLES, 0, model.mesh.vCount );
    });

}
