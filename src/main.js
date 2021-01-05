// OpenGL handles 
var program;
var canvas;
var gl;

// Uniforms
var lightLoc;
var modelColourLoc;
var viewPositionLoc;
var ambientIntensityLoc;
var modelMatrixLoc;
var viewMatrixLoc;
var projectionMatrixLoc;

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

    // Initialise WebGL
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) {
        alert( "WebGL isn't available" ); 
        return null;
    }

    // Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( ...black, 1.0 );
    gl.cullFace(gl.BACK);
    gl.enable(gl.DEPTH_TEST);

    // Setup shader program
    program = initShaders( gl, "shaders/main/vertex.glsl", "shaders/main/fragment.glsl" );
    gl.useProgram( program );

    // Create uniforms
    viewPositionLoc = gl.getUniformLocation( program, "viewPosition" );
    modelMatrixLoc = gl.getUniformLocation( program, "modelMatrix" );
    viewMatrixLoc = gl.getUniformLocation( program, "viewMatrix" );
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
    // Define models
    models = {
        xzPlane: {
            mesh: planeMesh(),
            colour: white,
            scale: vec3(10, 0, 10),
        },
        spinningCube: {
            mesh: cubeMesh(),
            colour: blue,
            position: vec3(0.0, 2.0, 0.0),
            rotation: vec3(),
        },
        pyramid: {
            mesh: tetrahedronMesh(),
            colour: green,
            position: vec3(1.0, 0.5, 1.0),
            scale: vec3(0.5, 0.5, 0.5),
        },
    };

    // Define light source
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
            case 'w':
                eye = add( eye, normalize( subtract( at, eye ) ) );
                break;
            case 's':
                eye = subtract( eye, normalize( subtract( at, eye ) ) );
                break;
            case 'a':
                eye = add( eye, cross( up, normalize( subtract( at, eye ) ) ) );
                break;
            case 'd':
                eye = subtract( eye, cross( up, normalize( subtract( at, eye ) ) ) );
                break;
            case 'q':
                eye[1]++;
                break;
            case 'e':
                eye[1]--;
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

    // Set global uniforms
    gl.uniform3fv( viewPositionLoc, eye );
    gl.uniform1f( ambientIntensityLoc, 0.1 );
    gl.uniform3fv( lightLoc.colour, light.colour );
    gl.uniform3fv( lightLoc.position, light.position );
    gl.uniform1f( lightLoc.intensity, light.intensity );

    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten( getProjectionMatrix() ) );
    gl.uniformMatrix4fv( viewMatrixLoc, false, flatten( getViewMatrix() ) );

    // Draw light mesh
    // TODO: ...

    // Draw model meshes
    Object.values(models).forEach(model => {

        // Compute model matrix
        var modelMatrix = mat4();

        if (model.position) 
            modelMatrix = mult(modelMatrix, translate(model.position));

        if (model.rotation) 
            modelMatrix = mult(modelMatrix, rotateEuler(...model.rotation));

        if (model.scale) 
            modelMatrix = mult(modelMatrix, scalem(model.scale));
         
        // Set model uniforms
        gl.uniformMatrix4fv( modelMatrixLoc, false, flatten(modelMatrix) );
        gl.uniform3fv(modelColourLoc, model.colour);

        // Bind model-mesh verticies
        gl.bindBuffer( gl.ARRAY_BUFFER, model.mesh.vBuffer );
        var vPosition = gl.getAttribLocation( program, "vPosition" );
        gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vPosition );

        // Bind model-mesh normals
        gl.bindBuffer( gl.ARRAY_BUFFER, model.mesh.nBuffer );
        var vNormal = gl.getAttribLocation( program, "vNormal" );
        gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vNormal );

        // Exectue mesh draw
        gl.drawArrays( gl.TRIANGLES, 0, model.mesh.vCount );
    });
}
