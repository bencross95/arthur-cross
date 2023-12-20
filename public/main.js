import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

let camera, scene, renderer;

var orbit;

init();

function init() {

    const container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 20 );
    camera.position.set( - 1.8, 0.6, 2.7 );

    scene = new THREE.Scene();

    new RGBELoader()
        .setPath( 'assets/3d/' )
        .load( 'table_mountain_1_puresky_1k.hdr', function ( texture ) {

            texture.mapping = THREE.EquirectangularReflectionMapping;

            scene.background = texture;
            scene.environment = texture;

            render();

            // model

            const loader = new GLTFLoader().setPath( 'assets/3d/' );
            loader.load( 'Main-real-ohcomeon.gltf', async function ( gltf ) {

                const model = gltf.scene;

                // wait until the model can be added to the scene without blocking due to shader compilation

                await renderer.compileAsync( model, camera, scene );

                scene.add( model );

                render();

            } );

        } );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    container.appendChild( renderer.domElement );

    const controls = new OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render ); // use if there is no animation loop
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.target.set( 0, 0, - 0.2 );
    controls.update();

    window.addEventListener( 'resize', onWindowResize );

    

    document.addEventListener('mousemove', function(e){
    	let scale = -0.001;
    	orbit.rotateY( e.movementX * scale );
      orbit.rotateX( e.movementY * scale ); 
      orbit.rotation.z = 0; //this is important to keep the camera level..
    })
    
    //the camera rotation pivot
    orbit = new THREE.Object3D();
    orbit.rotation.order = "YXZ"; //this is important to keep level, so Z should be the last axis to rotate in order...
    // orbit.position.copy( mesh.position );
    scene.add( orbit );
    
    //offset the camera and add it to the pivot
    //you could adapt the code so that you can 'zoom' by changing the z value in camera.position in a mousewheel event..
    let cameraDistance = 1;
		camera.position.z = cameraDistance;
    orbit.add( camera );
    

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();

}

//

function render() {

    requestAnimationFrame( render );
    renderer.render( scene, camera );

}
