var diskCount = 7;
const minDisks = 3;
const maxDisks = 10;
const diskHeight = 0.2;
const diskInnerRadius = 0.07;

const platformThickness = 0.1;

const towerRadius = diskInnerRadius - 0.01;
const towerHeight = (maxDisks + 4) * diskHeight;

const g0 = diskHeight / 2 + platformThickness; // Ground zero

const States = Object.freeze({
  SELECTING: 1,
  LIFTING: 2,
  RAISED: 3,
  TRANSFERRING: 4,
  LOWERING: 5,
});

var state;
var completed;
var playerMoves;
var startTimestamp;

var selectedDisk = null;
var selectedTower = null;


function initScene() {
  // Initialise meshes
  const tm = tetrahedronMesh();
  const cym = cylinderMesh();
  const sm = sphereMesh();
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
        scale: vec3(7.5, platformThickness, 2.5),
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
        position: vec3(-2.5, towerHeight / 2, 0),
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
        position: vec3(2.5, towerHeight / 2, 0),
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

  for (var i = 0; i < diskCount; i++) {
    // Create a the disk
    const disk = {
      id: i,
      mesh: tubeMesh(diskInnerRadius + (diskCount - i) * 0.1, diskInnerRadius, diskHeight),
      material: {
        colour: getRandomColour(),
      },
      transform: {
        position: vec3(models.leftTower.transform.position[0], i * diskHeight + g0, 0.0),
      },
    };

    // Register the disk in the scene models
    models[`disk${i}`] = disk;

    // Push the disk on to the left tower
    models.leftTower.stack.push(disk);
  }

  // Set the initial state
  playerMoves = 0;
  completed = false;
  state = States.SELECTING;
  startTimestamp = new Date();
}

function update() {
  // Spin the models
  models.spinningCube.transform.rotation[0] += 0.5;
  models.spinningCube.transform.rotation[1] += 1.0;
  models.spinningPyramid.transform.rotation[1] += 1.0;
  models.spinningBall.transform.rotation[1] += 1.0;

  // Disk move step magnitude
  const step = 0.09;

  //
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
        selectedDisk.transform.position[1] = selectedTower.stack.length * diskHeight + g0;
        selectedTower.stack.push(selectedDisk);
        selectedTower = null;
        selectedDisk = null;
        state = States.SELECTING;

        // Check if all the disks are on either the centre or right tower
        if (models.centreTower.stack.length === diskCount || models.rightTower.stack.length === diskCount) {
          completed = true;
        }
      }
      break;
  }

  if (completed) {
    light.material.colour = green;
  } else {
    // Update the document while not completed
    document.getElementById('moves').textContent = playerMoves;
    document.getElementById('timer').textContent = new Date(new Date() - startTimestamp).toISOString().substr(14, 5);
  }
}

function keydownHandler(key) {
  switch (key) {
    case 'ArrowLeft':
      prevCamera();
      break;

    case 'ArrowRight':
      nextCamera();
      break;

    case 'w':
      eye = add(eye, getViewVector());
      break;

    case 's':
      eye = subtract(eye, getViewVector());
      eye[1] = Math.max(eye[1], platformThickness); // Force camera to stay above xy-plane
      break;

    case 'a':
      eye = add(eye, cross(up, getViewVector()));
      break;

    case 'd':
      eye = subtract(eye, cross(up, getViewVector()));
      break;

    case 'q':
      eye[1]++;
      break;

    case 'e':
      eye[1]--;
      eye[1] = Math.max(eye[1], platformThickness); // Force camera to stay above xy-plane
      break;

    case 'Escape':
      if (state == States.LIFTING || state == States.RAISED) state = States.LOWERING;
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
          if (!tower.stack.length || tower.stack[tower.stack.length - 1].id < selectedDisk.id) {
            selectedTower = tower;
            playerMoves++;
            state = States.TRANSFERRING;
          } else {
            state = States.LOWERING;
          }
          break;
      }
  }
}
