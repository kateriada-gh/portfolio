import * as THREE from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";

const textureLoader = new THREE.TextureLoader();
const objLoader = new OBJLoader();

function loadModel(objPath, texturePath) {
  return new Promise((resolve) => {
    const texture = textureLoader.load(texturePath);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = true;

    const material = new THREE.MeshStandardMaterial({ map: texture });

    objLoader.load(objPath, (obj) => {
      obj.traverse((child) => {
        if (child.isMesh) {
          child.material = material;
        }
      });
      resolve(obj);
    });
  });
}

export function initThreeScene(container) {
  const width = container.clientWidth;
  const height = container.clientHeight;

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 0, 100);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xfaf9f7);
  // scene.background = new THREE.Color(0xdddddd);

  const ambientLight = new THREE.AmbientLight(0xffffff, 2.6);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
  dirLight.position.set(5, 10, 7);
  scene.add(dirLight);

  const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
  backLight.position.set(-5, -5, -5);
  scene.add(backLight);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const pivotHead = new THREE.Group();
  scene.add(pivotHead);
  const pivotBody = new THREE.Group();
  scene.add(pivotBody);

  const hasPointer = window.matchMedia("(pointer: fine)").matches;

  const cameraHeight = hasPointer ? 6 : 6;
  const cameraDist = hasPointer ? -60 : -90;

  Promise.all([
    loadModel("models/head.obj", "models/head.webp"),
    loadModel("models/body.obj", "models/body.webp"),
  ]).then(([head, body]) => {
    pivotHead.add(head);
    pivotBody.add(body);

    const box = new THREE.Box3().setFromObject(pivotHead);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 40 / maxDim;
    pivotHead.scale.setScalar(scale);
    pivotBody.scale.setScalar(scale);

    if (hasPointer) {
      camera.position.set(0, cameraHeight, cameraDist);
      camera.lookAt(0, cameraHeight, 0);
    } else {
      camera.position.set(0, cameraHeight, cameraDist);
      camera.lookAt(0, cameraHeight, 0);
    }
  });

  let scrollY = window.scrollY;
  window.addEventListener(
    "scroll",
    () => {
      scrollY = window.scrollY;
    },
    { passive: true },
  );

  let mouseX = 0;
  let mouseY = 0;

  if (hasPointer) {
    window.addEventListener(
      "mousemove",
      (e) => {
        const rect = container.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        mouseX = (e.clientX - cx) / (rect.width / 2);
        mouseY = (e.clientY - cy) / (rect.height / 2);
      },
      { passive: true },
    );
  }

  const currentRotX = { value: 0 };
  const currentRotY = { value: 0 };

  const fidget = {
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
    amplitude: 0.06,
    speed: 0.012,
  };

  function pickFidgetTarget() {
    const amplitudeMultiplier = hasPointer ? 1.0 : 4.0;
    fidget.targetX = (Math.random() * 2 - 1) * fidget.amplitude * amplitudeMultiplier;
    fidget.targetY = (Math.random() * 2 - 1) * fidget.amplitude * amplitudeMultiplier;
  }
  pickFidgetTarget();

  function animate() {
    const maxAngle = 0.4;
    // const targetRotY = scrollY * 0.0004 + mouseX * maxAngle;
    const targetRotY = mouseX * maxAngle;
    const targetRotX = -mouseY * maxAngle * 0.5;

    const rotMul = 0.3;
    currentRotY.value += (targetRotY - currentRotY.value) * rotMul;
    currentRotX.value += (targetRotX - currentRotX.value) * rotMul;

    const speedMultiplier = hasPointer ? 1.0 : 4.0;
    fidget.currentX += (fidget.targetX - fidget.currentX) * fidget.speed * speedMultiplier;
    fidget.currentY += (fidget.targetY - fidget.currentY) * fidget.speed * speedMultiplier;

    const dx = fidget.targetX - fidget.currentX;
    const dy = fidget.targetY - fidget.currentY;
    if (dx * dx + dy * dy < 0.0001) {
      pickFidgetTarget();
    }

    pivotHead.rotation.y = currentRotY.value + fidget.currentY;
    pivotHead.rotation.x = currentRotX.value + fidget.currentX;

    const bodyRotMul = 0.3;
    pivotBody.rotation.y = currentRotY.value * bodyRotMul;
    pivotBody.rotation.x = currentRotX.value * bodyRotMul;

    const zoomMul = hasPointer ? 0.01 : 0.1;
    const heightMul = hasPointer ? 0.03 : 0.08;
    camera.position.set(0, cameraHeight + heightMul * scrollY, cameraDist + zoomMul * scrollY);

    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(animate);

  window.addEventListener("resize", () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}
