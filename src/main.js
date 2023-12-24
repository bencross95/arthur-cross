import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

import { RGBShiftShader } from "three/addons/shaders/RGBShiftShader.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

// import { gsap } from "gsap";

let renderer, scene, camera, composer;
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
  
  // console.log(camera.fov)

  new OrbitControls(camera, renderer.domElement);

  

  // Bits
  new RGBELoader()
    .setPath("assets/3d/")
    .load("kloofendal_43d_clear_puresky_2k.hdr", function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;

      scene.background = texture;
      scene.environment = texture;



      // animate();

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

        // model.children[0].material.opacity = 0
        
        // model.children[0].material.transparent = true

        // model.children[0].material.emissive = new THREE.Color( 0xff0000 );
        model.children[0].material.emissive = new THREE.Color( 0xffffff );

        // console.log(model.children[0].material.emissive);
        // model.material.wireframe = false;

        // gsap.to(model.position, { duration: 10, ease: "power2.out", z: 2 });

        


        // animate();
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
  }

  gui.add(parameters, "x", -50, 50, 0.01).onChange(update);
  gui.add(parameters, "y", -50, 50, 0.01).onChange(update);
  gui.add(parameters, "z", 0, 50, 0.01).onChange(update);

  gui.hide()

  gsap.to(camera.position, { duration: 10, ease: "power2.out", z: 0 });
  


  // postprocessing

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));


  const effect1 = new ShaderPass(RGBShiftShader);
  effect1.uniforms["amount"].value = 0.001;
  composer.addPass(effect1);


  const effect3 = new OutputPass();
  composer.addPass(effect3);



  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  animate();
}


// Mouse interaction with INFO

const arthurLink = document.getElementsByClassName('arthurLink')[0];


arthurLink.addEventListener('mouseover', () => {
  if (model) {
    model.rotation.x += 0.2;
    model.rotation.y += 0.2;
    model.children[0].material.emissive = new THREE.Color( 0xDFFF1C );
}
});

arthurLink.addEventListener('mouseout', () => {
  model.rotation.x += 0.2;
  model.rotation.y += 0.2;
  model.children[0].material.emissive = new THREE.Color( 0xFFFFFF );
});





function animate() {
  

  if (model) {
    model.rotation.x += 0.0001; // Rotate around the x-axis
    model.rotation.y += 0.0002; // Rotate around the y-axis
    model.rotation.z += 0.0001; // Rotate around the z-axis
  }

  composer.render(scene, camera);
  requestAnimationFrame(animate);

  // renderer.render(scene, camera);
}


gsap.fromTo("canvas", { opacity: 0 }, { opacity: 0.5, delay: 1, duration: 3 });

function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Stop rendering on mobile devices
function stopRenderingOnMobile() {
  if (isMobile()) {
      // Cancel the animation frame request
      cancelAnimationFrame(animate);
  }
}

// Call the initialization function
init();

// Call the function to stop rendering on mobile
stopRenderingOnMobile();