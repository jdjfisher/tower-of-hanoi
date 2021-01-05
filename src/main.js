// OpenGL handles 
var program;
var canvas;
var gl;

// Uniforms
var lightLoc;
var modelColourLoc;
var modelShininessLoc;
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
    modelShininessLoc = gl.getUniformLocation(program, "modelShininess");
    ambientIntensityLoc = gl.getUniformLocation(program, "ambientIntensity");
    lightLoc = {
        colour: gl.getUniformLocation(program, "light.colour"),
        position: gl.getUniformLocation(program, "light.position"),
        intensity: gl.getUniformLocation(program, "light.intensity"),
    } 
}

function initScene()
{
    const tm = tetrahedronMesh();
    const pm = planeMesh();
    const cm = cubeMesh();

    // Define models
    models = {
        xzPlane: {
            mesh: pm,
            material: {
                colour: white,
            },
            transform: {
                scale: vec3(10, 0, 10),
            },
        },
        spinningCube: {
            mesh: cm,
            material: {
                colour: blue,
                shininess: 32,
            },
            transform: {
                position: vec3(0.0, 2.0, 0.0),
                rotation: vec3(),
            },
        },
        pyramid: {
            mesh: tm,
            material: {
                colour: green,
                shininess: 128,
            },
            transform: {
                position: vec3(2.0, 2.5, 1.0),
                scale: vec3(0.5, 0.5, 0.5),
            },
        },
    };

    // Define light source
    light = {
        colour: white,
        mesh: cm,
        position: vec3(0.0, 5.0, 0.0),
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
    models.spinningCube.transform.rotation[0] += 0.5;
    models.spinningCube.transform.rotation[1] += 1.0;
}

function render()
{
    // Clear the default framebuffer
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set global uniforms
    gl.uniform1f( ambientIntensityLoc, 0.1 );
    gl.uniform3fv( lightLoc.colour, light.colour );
    gl.uniform3fv( lightLoc.position, light.position );
    gl.uniform1f( lightLoc.intensity, light.intensity );
    
    gl.uniform3fv( viewPositionLoc, eye );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten( getProjectionMatrix() ) );
    gl.uniformMatrix4fv( viewMatrixLoc, false, flatten( getViewMatrix() ) );

    // Draw model meshes
    Object.values(models).forEach(model => {

        // Compute model matrix
        var modelMatrix = mat4();

        if (model.transform.position) 
            modelMatrix = mult(modelMatrix, translate(model.transform.position));

        if (model.transform.rotation) 
            modelMatrix = mult(modelMatrix, rotateEuler(...model.transform.rotation));

        if (model.transform.scale) 
            modelMatrix = mult(modelMatrix, scalem(model.transform.scale));
         
        // Set model uniforms
        gl.uniformMatrix4fv( modelMatrixLoc, false, flatten(modelMatrix) );
        gl.uniform3fv(modelColourLoc, model.material.colour);
        gl.uniform1f(modelShininessLoc, model.material.shininess || 32);

        // Render the model mesh
        renderMesh(model.mesh);
    });

    // Draw light mesh
    gl.uniform1f( ambientIntensityLoc, 1.0 );
    gl.uniformMatrix4fv( modelMatrixLoc, false, flatten( translate( light.position ) ) );
    gl.uniform3fv(modelColourLoc, light.colour);
    renderMesh(light.mesh);
}
