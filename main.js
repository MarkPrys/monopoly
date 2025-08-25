import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { title } from 'process';

// Сцена
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// Камера
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(3.15695, -2.09795, -3.07595);

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
loader.load('./model.glb', (gltf) => {
  const model = gltf.scene;
  scene.add(model);
  console.log('✅ Model uploaded');

  const annotations = [
    {
      position: new THREE.Vector3(-0.01821, -4.2822, 2.0377),
      icon: './img/burgklopp.svg',
      link: 'https://rundgang.viriditas.info/de/tour/burg-klopp-bingen',
      title: 'Burg Klopp virtueller Rundgang'
    },
    {
      position: new THREE.Vector3(-0.69461, -4.40775, -0.09865),
      icon: './img/church.png',
      link: 'https://rundgang.viriditas.info/de/tour/basilika-bingen',
      title: 'Virtueller Rundgang der Basilika Bingen'
    },
    {
      position: new THREE.Vector3(1.30601, -4.55723, -1.18832),
      icon: './img/museum.svg',
      link: 'https://rundgang.viriditas.info/de/tour/museum-am-strom-bingen',
      title: 'Virtueller Rundgang im Museum am Strom'
    },
    {
      position: new THREE.Vector3(1.53361, -4.65066, -0.92239),
      icon: './img/garden.svg',
      link: 'https://rundgang.viriditas.info/de/tour/hildegarten',
      title: 'Virtueller Rundgang durch den Hildegarten'
    },
    {
      position: new THREE.Vector3(0.39346, -4.36081, 1.92313),
      icon: './img/bingen.png',
      link: 'https://www.bingen.de/',
      title: 'Bingen am Rhein - die offizielle Seite der Stadt Bingen'
    }
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
