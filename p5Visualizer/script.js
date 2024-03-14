import * as THREE from './lib/three.module.js';

let song, fft, p5Canvas, texture, scene, camera, renderer, mesh, scaler;
let objs = [];
scaler = 0;
let angle = 0; // Angle for the circular camera motion
let lightArray = [];

// p5.js setup
window.setup = function() {
  p5Canvas = createCanvas(windowWidth, windowHeight);
  p5Canvas.canvas.style.display = 'none'; // Hide the p5.js canvas
  noFill();

  song = loadSound('cryptoyeast.mp3', () => {
    console.log("Song loaded successfully");
  });

  fft = new p5.FFT();
  threeJsSetup();
}

// p5.js draw
window.draw = function() {
  background(35, 110, 150);
  stroke(0);

  let wave = fft.waveform();
  // strokeWeight(15);
  // beginShape();
  // vertex(0,0);
  // vertex(width, 0);
  // vertex(width, height);
  // vertex(0, height);
  // vertex(0,0);
  // endShape();

  strokeWeight(wave[100] * 50 + 5);
  stroke(255);
  scaler = wave[100];

  // Drawing three lines representing the waveform
  for (let j = 1; j <= 3; j++) {
    beginShape();
    for (let i = 0; i < width; i++) {
      let index = floor(map(i, 0, width, 0, wave.length));
      let x = i;
      let y = wave[index] * 400 + height * (j * 0.25);
      vertex(x, y);
    }
    endShape();
  }

  for (let j = 1; j <= 3; j++) {
    beginShape();
    for (let i = 0; i < height; i++) {
      let index = floor(map(i, 0, height, 0, wave.length));
      let y = i;
      let x = wave[index] * 400 + width * (j * 0.25);
      vertex(x, y);
    }
    endShape();
  }

  if (texture) {
    texture.needsUpdate = true; // Update the Three.js texture with the p5.js canvas
  }
}

// p5.js mouse click function to control the music playback
window.mouseClicked = function() {
  if (song.isPlaying()) {
    song.pause();
    noLoop();
  } else {
    song.play();
    loop();
  }
}

// Three.js setup
function threeJsSetup() {
  scene = new THREE.Scene();

  // Load background texture
  const loader = new THREE.TextureLoader();
  loader.load('realTree.jpg', function(texture) {
    scene.background = texture;  
  });

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Create a 4x4 grid of point lights
  const lightIntensity = 20;
  const lightDistance = 30;
  const gridSize = 4;
  const lightSpacing = (3 * (3 + 10)) / (gridSize - 1); // Adjust based on the cube size and spacing

  let index = 0;
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      for (let k = 0; k < gridSize; k++) {
        let pointLight = new THREE.PointLight(0xffffff, lightIntensity, lightDistance);
        pointLight.position.set(
          -20 + i * lightSpacing,
          -20 + j * lightSpacing,
          -20 + k * lightSpacing
        );

        lightArray.push(pointLight);
        scene.add(lightArray[index]);
        index += 1;
      }
    }
  }

  texture = new THREE.Texture(p5Canvas.elt);
  texture.minFilter = THREE.LinearFilter;
  let materials = [];
  for (let i = 0; i < 6; i++) {
    materials.push(new THREE.MeshStandardMaterial({ map: texture }));
  }

  const cubeSize = 5;
  const spacing = 10;
  const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  let startPosition = -((cubeSize + spacing) * 2 / 2);

  for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 4; y++) {
      for (let z = 0; z < 4; z++) {
        mesh = new THREE.Mesh(geometry, materials);
        mesh.position.set(startPosition + x * (cubeSize + spacing), startPosition + y * (cubeSize + spacing), startPosition + z * (cubeSize + spacing));
        objs.push(mesh);
        scene.add(mesh);
      }
    }
  }

  camera.position.set(0, 20, 40);
  camera.lookAt(scene.position);
  animate();
}

// Three.js animation loop
function animate() {
  requestAnimationFrame(animate);

  // Circular camera motion
  angle += 0.01; // Adjust speed of rotation here

  camera.rotation.y = angle; // Rotates the camera on its Y-axis

  // Calculate the center position of the cube structure
  let centerX = 10; // Adjust these values based on your cube structure's position
  let centerY = 10;
  let centerZ = 10;

  // Calculate the camera's position to orbit around the center cube
  camera.position.x = centerX + Math.sin(angle) * 45; // Orbit radius adjusted for better visibility
  camera.position.z = centerZ + Math.cos(angle) * 45;
  camera.position.y = centerY // Adjust height as needed for a better view


  for (let i = 0; i < 64; i++) {
    lightArray[i].intensity = 125 + 3* i;
  }
  // Make the camera look at the center cube

  // Optionally rotate the cubes
  for (let i = 0; i < 64; i++) {
    objs[i].rotation.y += Math.abs(1.5 * scaler/i) + 0.0015;
    objs[i].rotation.x += 0.0001 + 0.00025 * i;

  }

  // const baseScale = 1;
  // const scaleFactor = 0.2; // Control how much the scale changes
  // let scale = baseScale + scaleFactor * Math.abs(scaler); // Calculate the new scale

  // // Ensure scale stays within reasonable bounds
  // scale = Math.max(baseScale, Math.min(scale, baseScale + scaleFactor));

  // // Apply the new scale to each cube
  // objs.forEach(obj => {
  //   obj.scale.set(scale, scale, scale);
  // });

  renderer.render(scene, camera);
}

