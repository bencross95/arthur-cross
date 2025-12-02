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

  // Load assets in PARALLEL for faster loading
  const rgbeLoader = new RGBELoader().setPath("assets/3d/");
  const gltfLoader = new GLTFLoader().setPath("assets/3d/");

  // Start loading both assets simultaneously
  const hdrPromise = new Promise((resolve, reject) => {
    rgbeLoader.load(
      "kloofendal_43d_clear_puresky_2k.hdr",
      resolve,
      undefined,
      reject
    );
  });

  const modelPromise = new Promise((resolve, reject) => {
    gltfLoader.load(
      "arthur-depthcore-v0.02.gltf",
      resolve,
      undefined,
      reject
    );
  });

  // Wait for both to load in parallel
  Promise.all([hdrPromise, modelPromise])
    .then(async ([texture, gltf]) => {
      // Set up environment
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.background = texture;
      scene.environment = texture;

      // Set up model
      model = gltf.scene;
      await renderer.compileAsync(model, camera, scene);
      scene.add(model);

      model.position.x = 0;
      model.position.y = 2;
      model.position.z = -2;
      model.rotation.x = 2;

      // Set emissive to black so textures are visible
      model.children[0].material.emissive = new THREE.Color(0x000000);
      
      // Enable texture support
      if (!model.children[0].material.map) {
        model.children[0].material.color = new THREE.Color(0xffffff);
      }

      // Create wireframe duplicate
      const wireframeGeometry = model.children[0].geometry.clone();
      const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.3
      });
      const wireframeMesh = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
      
      // Position wireframe at same position but different rotation
      wireframeMesh.position.copy(model.children[0].position);
      wireframeMesh.rotation.set(
        model.children[0].rotation.x + 0.3,
        model.children[0].rotation.y + 0.3,
        model.children[0].rotation.z + 0.3
      );
      wireframeMesh.scale.copy(model.children[0].scale);
      
      // Add as child to model so it follows rotations
      model.add(wireframeMesh);

      // Create distorted semi-transparent duplicate
      const distortedGeometry = model.children[0].geometry.clone();
      
      // Distort the geometry by modifying vertices with larger displacement
      const positionAttribute = distortedGeometry.attributes.position;
      for (let i = 0; i < positionAttribute.count; i++) {
        const x = positionAttribute.getX(i);
        const y = positionAttribute.getY(i);
        const z = positionAttribute.getZ(i);
        
        // Apply larger distortion
        positionAttribute.setXYZ(
          i,
          x + (Math.random() - 0.5) * 0.8,
          y + (Math.random() - 0.5) * 0.8,
          z + (Math.random() - 0.5) * 0.8
        );
      }
      distortedGeometry.attributes.position.needsUpdate = true;
      distortedGeometry.computeVertexNormals();
      
      const distortedMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
        flatShading: true // Less detailed shading
      });
      const distortedMesh = new THREE.Mesh(distortedGeometry, distortedMaterial);
      
      // Position distorted mesh
      distortedMesh.position.copy(model.children[0].position);
      distortedMesh.rotation.set(
        model.children[0].rotation.x - 0.2,
        model.children[0].rotation.y - 0.2,
        model.children[0].rotation.z - 0.2
      );
      distortedMesh.scale.copy(model.children[0].scale);
      
      // Add as child to model so it follows rotations
      model.add(distortedMesh);
    })
    .catch((error) => {
      console.error("Error loading 3D assets:", error);
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

  gui.hide();
  gui.destroy();

  gsap.to(camera.position, { duration: 10, ease: "power2.out", z: 0 });
  


  // postprocessing

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));


  // const effect1 = new ShaderPass(RGBShiftShader);
  // effect1.uniforms["amount"].value = 0.001;
  // composer.addPass(effect1);


  // const effect3 = new OutputPass();
  // composer.addPass(effect3);



  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}


// Mouse interaction with INFO

const arthurLink = document.getElementsByClassName('arthurLink')[0];

if (arthurLink) {
  arthurLink.addEventListener('mouseover', () => {
    if (model) {
      // Animate rotation smoothly like project hover
      gsap.to(model.rotation, { 
        duration: 0.8, 
        ease: "power2.out", 
        x: model.rotation.x + 0.3,
        y: model.rotation.y + 0.3
      });
      model.children[0].material.emissive = new THREE.Color( 0xDFFF1C );
    }
  });

  arthurLink.addEventListener('mouseout', () => {
    if (model) {
      model.children[0].material.emissive = new THREE.Color( 0x000000 );
    }
  });
}

// Project hover interaction - change model texture
const projectDivs = document.querySelectorAll('.home-project-div');
const textureLoader = new THREE.TextureLoader();
let originalTexture = null;

projectDivs.forEach(projectDiv => {
  projectDiv.addEventListener('mouseenter', () => {
    if (model && model.children[0]) {
      const imageUrl = projectDiv.getAttribute('data-project-image');
      
      // Rotate the model on hover
      gsap.to(model.rotation, { 
        duration: 0.8, 
        ease: "power2.out", 
        x: model.rotation.x + 0.3,
        y: model.rotation.y + 0.3
      });
      
      // Load and apply the project image as texture
      textureLoader.load(imageUrl, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.flipY = false; // May need to adjust based on your model's UV mapping
        
        // Store original state on first hover
        if (!originalTexture) {
          originalTexture = model.children[0].material.map;
        }
        
        // Apply new texture and make sure emissive doesn't wash it out
        model.children[0].material.map = texture;
        model.children[0].material.emissive = new THREE.Color(0x000000);
        model.children[0].material.needsUpdate = true;
      });
    }
  });

  projectDiv.addEventListener('mouseleave', () => {
    if (model && model.children[0]) {
      // Restore original texture
      model.children[0].material.map = originalTexture || null;
      model.children[0].material.emissive = new THREE.Color(0x000000);
      model.children[0].material.needsUpdate = true;
    }
  });
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