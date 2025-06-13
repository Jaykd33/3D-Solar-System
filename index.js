import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();

// Set background with stars texture
const starTexture = new THREE.TextureLoader().load('stars.jpg');
scene.background = starTexture;

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Brighter point light
const light = new THREE.PointLight(0xffffff, 5);
light.position.set(0, 0, 0);
scene.add(light);

// Add ambient light to brighten textures evenly
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// Sun with emissive material for glow effect
const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
const sunTexture = new THREE.TextureLoader().load('sun.jpg');
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

const planetData = [
  { name: 'Mercury', size: 0.4, distance: 5, texture: 'mercury.jpg', speed: 1 },
  { name: 'Venus', size: 0.9, distance: 7, texture: 'venus.jpg', speed: 0.8 },
  { name: 'Earth', size: 1, distance: 9, texture: 'earth.jpg', speed: 0.6 },
  { name: 'Mars', size: 0.8, distance: 11, texture: 'mars.jpg', speed: 0.5 },
  { name: 'Jupiter', size: 1.8, distance: 14, texture: 'jupiter.jpg', speed: 0.3 },
  { name: 'Saturn', size: 1.5, distance: 17, texture: 'saturn.jpg', speed: 0.2 },
  { name: 'Uranus', size: 1.2, distance: 20, texture: 'uranus.jpg', speed: 0.1 },
  { name: 'Neptune', size: 1.1, distance: 23, texture: 'neptune.jpg', speed: 0.08 }
];

const planets = [];
const orbits = [];

planetData.forEach(data => {
  const texture = new THREE.TextureLoader().load(data.texture);
  const geometry = new THREE.SphereGeometry(data.size, 64, 64);
  const material = new THREE.MeshStandardMaterial({ map: texture, emissive: 0x222222, emissiveIntensity: 1.5 });
  const mesh = new THREE.Mesh(geometry, material);

  const labelDiv = document.createElement('div');
  labelDiv.className = 'label';
  labelDiv.textContent = data.name;
  labelDiv.style.position = 'absolute';
  labelDiv.style.color = 'white';
  labelDiv.style.fontSize = '12px';
  labelDiv.style.fontWeight = 'bold';
  labelDiv.style.pointerEvents = 'none';
  document.body.appendChild(labelDiv);

  // Orbit ring
  const orbitGeometry = new THREE.RingGeometry(data.distance - 0.01, data.distance + 0.01, 64);
  const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x888888, side: THREE.DoubleSide });
  const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
  orbit.rotation.x = Math.PI / 2;
  scene.add(orbit);
  orbits.push(orbit);

  planets.push({ mesh, data, angle: 0, label: labelDiv });
  scene.add(mesh);
});

// Add moon for Earth
const moonTexture = new THREE.TextureLoader().load('moon.jpg');
const moonGeometry = new THREE.SphereGeometry(0.27, 32, 32);
const moonMaterial = new THREE.MeshStandardMaterial({ map: moonTexture, emissive: 0x111111, emissiveIntensity: 1 });
const moon = new THREE.Mesh(moonGeometry, moonMaterial);
scene.add(moon);

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.z = 30;
controls.update();

const sliders = {
  mercury: document.getElementById('mercury'),
  venus: document.getElementById('venus'),
  earth: document.getElementById('earth'),
  mars: document.getElementById('mars'),
  jupiter: document.getElementById('jupiter'),
  saturn: document.getElementById('saturn'),
  uranus: document.getElementById('uranus'),
  neptune: document.getElementById('neptune'),
  lightSlider: document.getElementById('lightSlider')
};

const focusButtons = {
  mercury: document.getElementById('focus-mercury'),
  venus: document.getElementById('focus-venus'),
  earth: document.getElementById('focus-earth'),
  mars: document.getElementById('focus-mars'),
  jupiter: document.getElementById('focus-jupiter'),
  saturn: document.getElementById('focus-saturn'),
  uranus: document.getElementById('focus-uranus'),
  neptune: document.getElementById('focus-neptune')
};

Object.keys(focusButtons).forEach(key => {
  focusButtons[key].addEventListener('click', () => {
    const target = planets.find(p => p.data.name.toLowerCase() === key);
    if (target) {
      camera.position.set(
        target.mesh.position.x + 5,
        target.mesh.position.y + 5,
        target.mesh.position.z + 5
      );
      controls.update();
    }
  });
});

function animate() {
  requestAnimationFrame(animate);

  light.intensity = parseFloat(sliders.lightSlider.value);

  planets.forEach((planet, index) => {
    const speed = parseFloat(sliders[planet.data.name.toLowerCase()].value);
    planet.angle += 0.01 * speed;
    planet.mesh.position.x = Math.cos(planet.angle) * planet.data.distance;
    planet.mesh.position.z = Math.sin(planet.angle) * planet.data.distance;

    const vector = planet.mesh.position.clone().project(camera);
    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
    planet.label.style.left = `${x}px`;
    planet.label.style.top = `${y}px`;
  });

  // Earth moon rotation
  const earth = planets.find(p => p.data.name === 'Earth');
  if (earth) {
    const moonOrbitRadius = 1.5;
    const moonSpeed = 0.05;
    const moonAngle = Date.now() * 0.001 * moonSpeed;
    moon.position.x = earth.mesh.position.x + Math.cos(moonAngle) * moonOrbitRadius;
    moon.position.z = earth.mesh.position.z + Math.sin(moonAngle) * moonOrbitRadius;
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
