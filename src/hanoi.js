
const diskCount = 7;
const diskHeight = 0.2;
const diskInnerRadius = 0.07;

const platformThickness = 0.1;

const towerRadius = diskInnerRadius - 0.01;
const towerHeight = (diskCount + 4) * diskHeight;

const g0 = diskHeight / 2 + platformThickness;

const States = Object.freeze({
    SELECTING: 1, 
    LIFTING: 2, 
    RAISED: 3, 
    TRANSFERRING: 4, 
    LOWERING: 5, 
});

var state = States.SELECTING;
var selectedDisk = null;
var selectedTower = null;


function initScene()
{
    // Initialise meshes
    const tm = tetrahedronMesh();
    const cym = cylinderMesh();
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
                scale: vec3(6, platformThickness, 2),
                position: vec3(0, platformThickness / 2, 0),
            },
        },
        leftTower: {
            mesh: cym,
            material: {
                colour: brown,
            },
            transform: {
                scale: vec3(towerRadius, towerHeight, towerRadius),
                position: vec3(-2, towerHeight / 2, 0),
            },
            stack: [],
        },
        centreTower: {
            mesh: cym,
            material: {
                colour: brown,
            },
            transform: {
                scale: vec3(towerRadius, towerHeight, towerRadius),
                position: vec3(0, towerHeight / 2, 0),
            },
            stack: [],
        },
        rightTower: {
            mesh: cym,
            material: {
                colour: brown,
            },
            transform: {
                scale: vec3(towerRadius, towerHeight, towerRadius),
                position: vec3(2, towerHeight / 2, 0),
            },
            stack: [],
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
                scale: vec3(0.5, 0.5, 0.5),
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
    for (var i = 0; i < diskCount; i++) {
        const outerRadius = diskInnerRadius + (diskCount - i) * 0.1;

        const disk = {
            id: i,
            mesh: tubeMesh(outerRadius, diskInnerRadius, diskHeight),
            material: {
                colour: getRandomColour(),
            },
            transform: {
                position: vec3(-2, i * diskHeight + g0, 0.0),
            },
        }

        models[`disk${i}`] = disk;
        models.leftTower.stack.push(disk);
    }
}

function update()
{
    models.spinningCube.transform.rotation[0] += 0.5;
    models.spinningCube.transform.rotation[1] += 1.0;
    models.spinningPyramid.transform.rotation[1] += 1.0;
    models.spinningBall.transform.rotation[1] += 1.0;

    const step = 0.07;

    switch (state) {
        case States.LIFTING:
            if (selectedDisk.transform.position[1] < towerHeight + 2 * diskHeight) {
                selectedDisk.transform.position[1] += step;
            } else {
                state = States.RAISED;
            }
            break;    
        case States.TRANSFERRING:
            const delta = selectedTower.transform.position[0] - selectedDisk.transform.position[0];

            if (Math.abs(delta) > 0.2) {
                selectedDisk.transform.position[0] += Math.sign(delta) * step; 
            } else {
                selectedDisk.transform.position[0] = selectedTower.transform.position[0];
                state = States.LOWERING;
            }
            break;
        case States.LOWERING:
            if (selectedDisk.transform.position[1] > selectedTower.stack.length * diskHeight + g0) {
                selectedDisk.transform.position[1] -= step; 
            } else {
                selectedDisk.transform.position[1] = selectedTower.stack.length * diskHeight + g0
                selectedTower.stack.push(selectedDisk);
                selectedTower = null;
                selectedDisk = null;
                state = States.SELECTING;
            }
            break;
    }
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
            eye[1] = Math.max(eye[1], platformThickness); // Force camera to stay above xy-plane
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
            eye[1] = Math.max(eye[1], platformThickness); // Force camera to stay above xy-plane
            break;

        case 'Enter':
            // Disco mode
            light.material.colour = getRandomColour();
            break;

        case 'Escape':
            if (state == States.LIFTING || state == States.RAISED) {
                state = States.LOWERING;
            }
            break;

        case '1':
        case '2':
        case '3':
            const tower = [models.leftTower, models.centreTower, models.rightTower][key - 1];

            switch (state) {
                case States.SELECTING:
                    if (tower.stack.length) {
                        selectedTower = tower;
                        selectedDisk = tower.stack.pop();
                        state = States.LIFTING;
                    }
                    break;

                case States.RAISED:
                    if (!tower.stack.length || tower.stack[tower.stack.length-1].id < selectedDisk.id) {
                        selectedTower = tower;
                        state = States.TRANSFERRING;
                    } else {
                        state = States.LOWERING;
                    }
                    break;
            }
    }
}
