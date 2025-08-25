// Імпорт з node_modules
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

// Сцена
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// Камера
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(2, 2, 4);

// Рендерер
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//CSS2D Render
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);


// Світло
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(3, 10, 10);
scene.add(dirLight);

// Контролер
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

// Завантаження моделі
const loader = new GLTFLoader();
loader.load('/model.glb', (gltf) => {
  scene.add(gltf.scene);
  console.log('✅ Модель завантажено');
}, undefined, (err) => {
  console.error('❌ Помилка завантаження:', err);
});

// Анімація
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
//Функція для проєкції 3D-точки в 2D екран
animate();
function toScreenPosition(obj, camera) {
  const vector = new THREE.Vector3();
  const widthHalf = window.innerWidth / 2;
  const heightHalf = window.innerHeight / 2;

  obj.updateMatrixWorld();
  vector.setFromMatrixPosition(obj.matrixWorld);
  vector.project(camera);

  return {
    x: (vector.x * widthHalf) + widthHalf,
    y: -(vector.y * heightHalf) + heightHalf
  };
}


//Анотація
loader.load('/model.glb', (gltf) => {
  const model = gltf.scene;
  scene.add(model);

  const label = document.createElement('img');
label.src = '/icons/custom-icon.svg';
label.className = 'annotation';
const labelObj = new CSS2DObject(label);
target.add(labelObj);
labelObj.position.set(0, 0.2, 0);  // трохи вище вузла

  //Render
  renderer.render(scene, camera);
labelRenderer.render(scene, camera);


  // 🔽 Створимо анотацію
  const annotationEl = document.createElement('div');
  annotationEl.className = 'annotation';
  annotationEl.title = 'Цікава точка';
  document.getElementById('annotations-container').appendChild(annotationEl);

  // ❗️Ця точка повинна бути десь в межах сцени:
  const targetObject = model.getObjectByName('НазваMeshАбоNode');
  if (!targetObject) {
    console.warn('❌ Не знайдено вузол для анотації');
    return;
  }

  // 🔁 Оновлюємо позицію анотації кожен кадр
  function updateAnnotation() {
    const pos = toScreenPosition(targetObject, camera);
    annotationEl.style.left = `${pos.x}px`;
    annotationEl.style.top = `${pos.y}px`;
  }

  // Додаємо до анімації
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    updateAnnotation(); // <-- тут!
  }

  animate();
});


// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
