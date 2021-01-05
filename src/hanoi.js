
var state = 0;
var selectedDisk = null;
var selectedTower = null;

const diskCount = 7;
const diskHeight = 0.2;
const diskInnerRadius = 0.1;
const platformThickness = 0.1;

const g0 = diskHeight / 2 + platformThickness;


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
                scale: vec3(6, platformThickness, 2),
                position: vec3(0, platformThickness / 2, 0),
            },
        },
        leftTower: {
            mesh: cm,
            material: {
                colour: brown,
            },
            transform: {
                scale: vec3(0.1, 2.5, 0.1),
                position: vec3(-2, 1.25, 0),
            },
            stack: [],
        },
        centreTower: {
            mesh: cm,
            material: {
                colour: brown,
            },
            transform: {
                scale: vec3(0.1, 2.5, 0.1),
                position: vec3(0, 1.25, 0),
            },
            stack: [],
        },
        rightTower: {
            mesh: cm,
            material: {
                colour: brown,
            },
            transform: {
                scale: vec3(0.1, 2.5, 0.1),
                position: vec3(2, 1.25, 0),
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
            mesh: diskMesh(outerRadius, diskInnerRadius, diskHeight),
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

    switch (state) {
        case 1:
            if (selectedDisk.transform.position[1] < 3) {
                selectedDisk.transform.position[1] += 0.07;
            } else {
                state = 2;
            }
            break;    
        case 3:
            const delta = selectedTower.transform.position[0] - selectedDisk.transform.position[0];

            if (Math.abs(delta) > 0.2) {
                selectedDisk.transform.position[0] += Math.sign(delta) * 0.07; 
            } else {
                selectedDisk.transform.position[0] = selectedTower.transform.position[0];
                unselectDisk();
            }
            break;
        case 4:
            if (selectedDisk.transform.position[1] > selectedTower.stack.length * diskHeight + g0) {
                selectedDisk.transform.position[1] -= 0.07; 
            } else {
                state = 0;
                selectedTower.stack.push(selectedDisk);
                selectedTower = null;
                selectedDisk = null;
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
            eye[1] = Math.max(eye[1], platformThickness);
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
            eye[1] = Math.max(eye[1], platformThickness);
            break;

        case 'Enter':
            // Disco mode
            light.material.colour = getRandomColour();
            break;

        case 'Escape':
            if (state == 1 || state == 2) {
                unselectDisk();
            }
            break;

        case '1':
        case '2':
        case '3':
            const tower = [models.leftTower, models.centreTower, models.rightTower][key - 1];

            switch (state) {
                case 0:
                    selectDisk(tower);
                    break;

                case 2:
                    transferDisk(tower);
                    break;
            }
    }
}

function selectDisk(tower)
{
    if (tower.stack.length) {
        selectedTower = tower;
        selectedDisk = tower.stack.pop();
        state = 1;
    }
}

function unselectDisk()
{
    state = 4;
}

function transferDisk(tower)
{
    if (!tower.stack.length || tower.stack[tower.stack.length-1].id < selectedDisk.id) {
        selectedTower = tower;
        state = 3;
    } else {
        unselectDisk();
    }
}
