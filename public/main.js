import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

let renderer, scene, camera;
let model;

const gui = new GUI();

init();
animate();

function init() {
  const container = document.createElement("div");

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    200,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 1.5);

  new OrbitControls(camera, renderer.domElement);

  // Bits
  new RGBELoader()
    .setPath("assets/3d/")
    .load("kloofendal_43d_clear_puresky_2k.hdr", function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;

      scene.background = texture;
      scene.environment = texture;

      animate();

      // model

      const loader = new GLTFLoader().setPath("assets/3d/");
      loader.load("arthur-depthcore-v0.02.gltf", async function (gltf) {
        model = gltf.scene;

        // wait until the model can be added to the scene without blocking due to shader compilation

        await renderer.compileAsync(model, camera, scene);

        scene.add(model);


        model.position.x = 0;
        model.position.y = 2;
        model.position.z = -2;

        animate();


      });
    });




  // Sky

  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 32;

  const context = canvas.getContext("2d");
  const gradient = context.createLinearGradient(0, 0, 0, 32);
  gradient.addColorStop(0.0, "#5791BF");
  gradient.addColorStop(0.5, "#ffffff");
  gradient.addColorStop(1.0, "#D6E6F2");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1, 32);

  const skyMap = new THREE.CanvasTexture(canvas);
  skyMap.colorSpace = THREE.SRGBColorSpace;

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(10),
    new THREE.MeshBasicMaterial({ map: skyMap, side: THREE.BackSide })
  );
  scene.add(sky);

  const parameters = {
    x: 0,
    y: 0,
    z: 0.1,
  };

  function update() {
    camera.position.x = parameters.x;
    camera.position.y = parameters.y;
    camera.position.z = parameters.z;

    // console.log(camera.position);
    // console.log(model);
    // console.log(gltf);
  }

  gui.add(parameters, "x", -50, 50, 0.01).onChange(update);
  gui.add(parameters, "y", -50, 50, 0.01).onChange(update);
  gui.add(parameters, "z", 0, 50, 0.01).onChange(update);

  //   camera.position.set(0, 0, 1.5);
  //   gui.add(camera.position, "myNumber", [0, 1, 2]).onChange(update);

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  animate();
}

// model.rotation.x += 0.01;
// model.rotation.y += 0.01;

function animate() {
  requestAnimationFrame(animate);

  if (model) {
    model.rotation.x += 0.0001; // Rotate around the x-axis
    model.rotation.y += 0.0002; // Rotate around the y-axis
    model.rotation.z += 0.0001; // Rotate around the z-axis

    // Other animation logic here, if any
  }

  // model.rotation.y = 2;
  // model.rotation.z = 0.5* ( 1 +  Math.sin( time ) );

  renderer.render(scene, camera);
}
