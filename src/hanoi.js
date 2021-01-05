
var selectedDisk = null;
var selectedStack = null;
var leftStack = [];
var centreStack = [];
var rightStack = [];

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
        leftTower: {
            mesh: cm,
            material: {
                colour: brown,
            },
            transform: {
                scale: vec3(0.2, 5, 0.2),
                position: vec3(-2, 1.25, 0),
            },
        },
        centreTower: {
            mesh: cm,
            material: {
                colour: brown,
            },
            transform: {
                scale: vec3(0.2, 5, 0.2),
                position: vec3(0, 1.25, 0),
            },
        },
        rightTower: {
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
        spinningBall: {
          mesh: sm,
          material: {
              colour: red,
              shininess: 32,
          },
          transform: {
              position: vec3(2.0, 3.0, -1.5),
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

function update()
{
    models.spinningCube.transform.rotation[0] += 0.5;
    models.spinningCube.transform.rotation[1] += 1.0;
    models.spinningPyramid.transform.rotation[1] += 1.0;
    models.spinningBall.transform.rotation[1] += 1.0;
}

function keydownHandler(key) 
{
    switch(key) {
        case 'ArrowLeft':
            prevCamera();
            break;

        case 'ArrowRight':
            nextCamera();
            break;

        case 'w':
            eye = add( eye, getViewVector() );
            break;

        case 's':
            eye = subtract( eye, getViewVector() );
            eye[1] = Math.max(eye[1], 0.4);
            break;

        case 'a':
            eye = add( eye, cross( up, getViewVector() ) );
            break;

        case 'd':
            eye = subtract( eye, cross( up, getViewVector() ) );
            break;

        case 'q':
            eye[1]++;
            break;

        case 'e':
            eye[1]--;
            eye[1] = Math.max(eye[1], 0.4);
            break;

        case 'Enter':
            // Disco mode
            light.material.colour = getRandomColour();
            break;

        case 'Escape':
            unselectDisk();
            break;

        case '1':
        case '2':
        case '3':
            const stack = [leftStack, centreStack, rightStack][key - 1];

            // TODO: Cleanup
            if (selectedDisk) {
                transferDisk(stack, key);
                unselectDisk();
            } else {   
                selectDisk(stack);
            }
            break;
    }
}

function selectDisk(stack)
{
    selectedStack = stack;
    selectedDisk = stack.pop();    
    selectedDisk.transform.position[1] = 3;     
}

function unselectDisk()
{
    if (selectedDisk && selectedStack) {
        selectedDisk.transform.position[1] = 0.25 + selectedStack.length * 0.2;
        selectedStack.push(selectedDisk);
        selectedStack = null;
        selectedDisk = null;
    }
}

function transferDisk(stack, key)
{
    if (!stack.length || stack[stack.length-1].transform.scale[0] > selectedDisk.transform.scale[0]) {
        selectedStack = stack;
        selectedDisk.transform.position[0] = (key - 2) * 2;
    }
}
