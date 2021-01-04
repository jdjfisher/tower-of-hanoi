// OpenGL handles 
var program;
var canvas;
var gl;

// Uniforms
var lightLoc;
var modelColourLoc;
var ambientIntensityLoc;
var modelViewMatrixLoc, projectionMatrixLoc;

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
    models = {
        xzPlane: {
            mesh: planeMesh(),
            colour: white,
            scale: vec3(10, 10, 10),
        },
        spinningCube: {
            mesh: cubeMesh(),
            colour: blue,
            position: vec3(0.0, 1.0, 0.0),
            rotation: vec3(),
        },
    };

    light = {
        colour: white,
        position: vec3(0.0, 3.0, 0.0),
        intensity: 3,
    }
}

function initElements()
{
    window.addEventListener ('keydown', e => {
        switch(e.key) {
            case 'ArrowLeft':
                prevCamera();
                break;
            case 'ArrowRight':
                nextCamera();
                break;
        }
    }) ;
}

function mainLoop()
{
    update(); 
    render();
    
    requestAnimFrame( mainLoop );
}

function update()
{
    models.spinningCube.rotation[0] += 0.5;
    models.spinningCube.rotation[1] += 1.0;
}

function render()
{
    // Clear the default framebuffer
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform1f( ambientIntensityLoc, 0.3 );
    gl.uniform3fv( lightLoc.colour, light.colour );
    gl.uniform3fv( lightLoc.position, light.position );
    gl.uniform1f( lightLoc.intensity, light.intensity );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten( getProjectionMatrix() ) );

    // Draw meshes
    Object.values(models).forEach(model => {
        gl.bindBuffer( gl.ARRAY_BUFFER, model.mesh.vBuffer );

        var vPosition = gl.getAttribLocation( program, "vPosition" );
        gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vPosition );

        gl.bindBuffer( gl.ARRAY_BUFFER, model.mesh.nBuffer );

        var vNormal = gl.getAttribLocation( program, "vNormal" );
        gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vNormal );

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
        
        const modelViewMatrix = mult( getViewMatrix(), modelMatrix );
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );

        gl.drawArrays( gl.TRIANGLES, 0, model.mesh.vCount );
    });
}
