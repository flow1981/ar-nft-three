import { createEarthGnonomic } from './resources/threeJS/models/earth.js'
import { createIssPositionMarker, addIssModelToMarker } from './resources/threeJS/models/iss.js'
import { initOrbitalPosition, updateOrbitalPostion, visualizeOrbit, alignXeciToVernalEquinox, alignISSrelativeEarthSurface} from './resources/helper/sat.js'

const TLE_SOURCE =  'https://oj63hk6d5a.execute-api.eu-west-3.amazonaws.com/production/celetrak-cors-proxy'

const NFT_MARKER_URL = './resources/dataNFT/earth-qr'
const CAMERA_PARAM_URL = './resources/data/camera_para.dat'

const ISS_MODEL_URL = './assets/3dmodels/station-mini.gltf';

const scaleFactor = 1/100
const earthRadius = 6371

window.AROnLoad = function(tle) {

	ARController.getUserMediaThreeScene({maxARVideoSize: 320, cameraParam: CAMERA_PARAM_URL,
		onSuccess: function(arScene, arController, arCamera) {

			document.body.className = arController.orientation;

			let ambientLight = new THREE.AmbientLight( 0xcccccc, 0.8 );
			arScene.scene.add( ambientLight );

			let renderer = new THREE.WebGLRenderer({antialias: true});
			renderer.gammaOutput = true;
			renderer.gammaFactor = 2.2;

			if (arController.orientation === 'portrait') {
				let w = (window.innerWidth / arController.videoHeight) * arController.videoWidth;
				let h = window.innerWidth;
				renderer.setSize(w, h);
				renderer.domElement.style.paddingBottom = (w-h) + 'px';
			} else {
				if (/Android|mobile|iPad|iPhone/i.test(navigator.userAgent)) {
					renderer.setSize(window.innerWidth, (window.innerWidth / arController.videoWidth) * arController.videoHeight);
				} else {
					renderer.setSize(arController.videoWidth, arController.videoHeight);
					document.body.className += ' desktop';
				}
			}

			document.body.insertBefore(renderer.domElement, document.body.firstChild);

			// renderer.domElement.addEventListener('click', function(ev) {
			// 	ev.preventDefault();
			// 	rotationTarget += 1;
			// }, false);

			let modelGroup = new THREE.Group();
			// x positive - left, y positive - up, z positive -towards viewer | x, y zero is bottom right of trigger
			modelGroup.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1)); // we need flip the objects since ARtoolkit displays them mirrored
			modelGroup.position.set(80,80,80)

			let earth = createEarthGnonomic(earthRadius, scaleFactor)
			earth = alignXeciToVernalEquinox(earth)
			modelGroup.add(earth)	
			
			let issPosition = createIssPositionMarker()
			issPosition.scale.set(200,200,200);
			issPosition = initOrbitalPosition(issPosition, tle, 0, scaleFactor)
			issPosition = updateOrbitalPostion(issPosition, scaleFactor)
			modelGroup.add(issPosition)
			
			let orbit = visualizeOrbit(issPosition.userData.satrec, scaleFactor)
			modelGroup.add(orbit)

			addIssModelToMarker(issPosition, ISS_MODEL_URL)
			alignISSrelativeEarthSurface(issPosition)

			modelGroup.rotateOnAxis( new THREE.Vector3(1, 0, 0).normalize(), 90 * Math.PI/180 );

			arController.loadNFTMarker(NFT_MARKER_URL, function(markerId) {
				let markerRoot = arController.createThreeNFTMarker(markerId);

				arScene.scene.add(markerRoot);
				markerRoot.add(modelGroup);
			});

			// var rotationV = 0;
			// var rotationTarget = 0;

			const animate = function() {
				arScene.process();
				// rotationV += (rotationTarget - sphere.rotation.z) * 0.05;
				// sphere.rotation.z += rotationV;
				// rotationV *= 0.8;

				arScene.renderOn(renderer);
				requestAnimationFrame(animate);
			};

			animate();
		}
	});

	delete window.AROnLoad;

};

if (window.ARController && ARController.getUserMediaThreeScene) {
	console.log("test")
	fetch(TLE_SOURCE)
		.then(response => response.json())
		.then(data => data.split("\n").splice(0,3))
		.then(tle =>  window.AROnLoad(tle))
}
