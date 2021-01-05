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

var sourceStack = null;
var leftStack = [];
var centreStack = [];
var rightStack = [];


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
    // Initialise meshes
    const tm = tetrahedronMesh();
    const sm = sphereMesh(5);
    const pm = planeMesh();
    const cm = cubeMesh();

    // Define light source
    light = {
        mesh: sm,
        material: {
            colour: white,
            intensity: 3,
        },
        transform: {
            position: vec3(0.0, 5.0, 0.5),
            scale: vec3(0.3, 0.3, 0.3),
        },
    };

    // Define models
    models = {
        xzPlane: {
            mesh: pm,
            material: {
                colour: white,
            },
            transform: {
                scale: vec3(100, 0, 100),
            },
        },
        platform: {
            mesh: cm,
            material: {
                colour: brown,
                shininess: 0,
            },
            transform: {
                scale: vec3(12, 0.25, 4),
                position: vec3(0, 0.125, 0),
            },
        },
        leftColumn: {
            mesh: cm,
            material: {
                colour: brown,
            },
            transform: {
                scale: vec3(0.2, 5, 0.2),
                position: vec3(-2, 1.25, 0),
            },
        },
        centreColumn: {
            mesh: cm,
            material: {
                colour: brown,
            },
            transform: {
                scale: vec3(0.2, 5, 0.2),
                position: vec3(0, 1.25, 0),
            },
        },
        rightColumn: {
            mesh: cm,
            material: {
                colour: brown,
            },
            transform: {
                scale: vec3(0.2, 5, 0.2),
                position: vec3(2, 1.25, 0),
            },
        },
        spinningCube: {
            mesh: cm,
            material: {
                colour: blue,
                shininess: 32,
            },
            transform: {
                position: vec3(-3.0, 4.0, 0.0),
                rotation: vec3(),
            },
        },
        spinningPyramid: {
            mesh: tm,
            material: {
                colour: green,
                shininess: 128,
            },
            transform: {
                position: vec3(2.5, 2.5, 1.5),
                rotation: vec3(),
                scale: vec3(0.5, 0.5, 0.5),
            },
        },
    };

    //
    const scale = 0.4;
    const count = 7;
    const m = (count + 1)  * scale;

    for (var i = 0; i < count; i++) {
        const disk = {
            mesh: cm,
            material: {
                colour: getRandomColour(),
            },
            transform: {
                position: vec3(-2, 0.25 + i * scale / 2, 0.0),
                scale: vec3(m - i * scale, scale, m - i * scale),
            },
        }

        models[`disk${i}`] = disk;
        leftStack.push(disk);
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

            case 'Escape':
                sourceStack = null;
                break;
            case '1':
            case '2':
            case '3':
                const stack = [leftStack, centreStack, rightStack][e.key - 1];

                // TODO: Cleanup
                if (sourceStack) {
                    if (sourceStack.length && (!stack.length || stack[stack.length-1].transform.scale[0] > sourceStack[sourceStack.length-1].transform.scale[0])) {
                        disk = sourceStack.pop();
                        disk.transform.position[0] = (e.key - 2) * 2;
                        disk.transform.position[1] = 0.25 + stack.length * 0.2;
                        stack.push(disk);
                    }
                    sourceStack = null;
                } else {                
                    sourceStack = stack;
                }
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
    models.spinningPyramid.transform.rotation[1] += 1.0;
}

function render()
{
    // Clear the default framebuffer
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set global uniforms
    gl.uniform1f( ambientIntensityLoc, 0.2 );
    gl.uniform3fv( lightLoc.colour, light.material.colour );
    gl.uniform1f( lightLoc.intensity, light.material.intensity );
    gl.uniform3fv( lightLoc.position, light.transform.position );
    
    gl.uniform3fv( viewPositionLoc, eye );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten( getProjectionMatrix() ) );
    gl.uniformMatrix4fv( viewMatrixLoc, false, flatten( getViewMatrix() ) );

    // Render scene models
    Object.values(models).forEach(model => {
        renderModel(model);
    });

    // Render light model
    gl.uniform1f( ambientIntensityLoc, 1.0 );
    renderModel(light);
}

function renderModel(model) 
{
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
}
