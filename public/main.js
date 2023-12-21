import * as THREE from 'three';
			import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
			import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
	

			let renderer, scene, camera;
			let mesh;

			init();
			animate();

			function init() {

				renderer = new THREE.WebGLRenderer();
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				document.body.appendChild( renderer.domElement );

				scene = new THREE.Scene();

				camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100 );
				camera.position.set( 0, 0, 1.5 );

				new OrbitControls( camera, renderer.domElement );

				// Sky

				const canvas = document.createElement( 'canvas' );
				canvas.width = 1;
				canvas.height = 32;

				const context = canvas.getContext( '2d' );
				const gradient = context.createLinearGradient( 0, 0, 0, 32 );
				gradient.addColorStop( 0.0, '#5791BF' );
				gradient.addColorStop( 0.5, '#ffffff' );
				gradient.addColorStop( 1.0, '#D6E6F2' );
				context.fillStyle = gradient;
				context.fillRect( 0, 0, 1, 32 );

				const skyMap = new THREE.CanvasTexture( canvas );
				skyMap.colorSpace = THREE.SRGBColorSpace;

				const sky = new THREE.Mesh(
					new THREE.SphereGeometry( 10 ),
					new THREE.MeshBasicMaterial( { map: skyMap, side: THREE.BackSide } )
				);
				scene.add( sky );


				window.addEventListener( 'resize', onWindowResize );

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function animate() {

				requestAnimationFrame( animate );


				renderer.render( scene, camera );

			}
