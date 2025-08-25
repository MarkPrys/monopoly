import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

// Сцена
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// Камера
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0.6, 200, -200);

// Рендерери
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

// Освітлення
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(3, 10, 10);
scene.add(dirLight);

// Контролер
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(1.8572, -2.6577, -2.4318);
controls.update();

window.camera = camera;
window.controls = controls;


// Клік по моделі → координати
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
renderer.domElement.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects.length > 0) {
    const point = intersects[0].point;
    console.log(`🟢 Coordinates: x=${point.x.toFixed(5)}, y=${point.y.toFixed(5)}, z=${point.z.toFixed(5)}`);
  }
});

// Завантаження моделі та додавання анотацій
const loader = new GLTFLoader();
loader.load('/bingen.glb', (gltf) => {
  const model = gltf.scene;
  scene.add(model);
  console.log('✅ Model uploaded');

  const annotations = [
    {
      position: new THREE.Vector3(-121.81182, 40.95932, -76.80483),
      icon: './img/tower.png',
      link: 'https://www.bingen.de/kultur/tor-zum-uneso-welterbe/der-binger-maeuseturm',
      title: 'Der Binger Mäuseturm'
    },
  ];

  annotations.forEach(({ position, icon, link, title }) => {
    const annotationIcon = document.createElement('img');
    annotationIcon.src = icon;
    annotationIcon.classList.add('annotation-icon');
    annotationIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      const rect = annotationIcon.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      openModalAt(x + 15, y + 15, link, title);
    });

    const label = new CSS2DObject(annotationIcon);
    label.position.copy(position);
    scene.add(label);
  });

  annotations.forEach(({ position, icon, link, title }) => {
    const annotationIcon = document.createElement('img');
    annotationIcon.src = icon;
    annotationIcon.classList.add('annotation-icon'); // один клас для всіх
    annotationIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      const rect = annotationIcon.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      openModalAt(x + 15, y + 15, link, title);
    });

    const label = new CSS2DObject(annotationIcon);
    label.position.copy(position);
    scene.add(label);
  });
}, undefined, (err) => {
  console.error('❌ Error:', err);
});

// Animation
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}
animate();

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

// ===== Modal Functions =====
function openModalAt(x, y, link, title) {
  const modal = document.getElementById('modal');
  const linkEl = document.getElementById('modal-link');
  linkEl.href = link;
  linkEl.textContent = title;

  modal.style.left = `${x}px`;
  modal.style.top = `${y}px`;
  modal.classList.remove('hidden');
}

document.getElementById('modal-close').addEventListener('click', () => {
  document.getElementById('modal').classList.add('hidden');
});

document.getElementById('modal').addEventListener('click', (e) => {
  if (e.target.id === 'modal') {
    document.getElementById('modal').classList.add('hidden');
  }
});
