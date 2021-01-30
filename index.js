import { createEarthGnonomic } from './resources/three/models/earth.js'

const nftMarkerSource = '../resources/dataNFT/pinball'
const cameraParamSource = '../resources/data/camera_para.dat'

window.ARThreeOnLoad = function() {

	ARController.getUserMediaThreeScene({maxARVideoSize: 320, cameraParam: cameraParamSource,
	onSuccess: function(arScene, arController, arCamera) {

		document.body.className = arController.orientation;

		// Set up renderer
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

		renderer.domElement.addEventListener('click', function(ev) {
			ev.preventDefault();
			rotationTarget += 1;
		}, false);

		// Add Three.js models
		let sphere = createEarthGnonomic()
		sphere.material.flatShading;
		sphere.position.z = 80;
		sphere.position.x = 80;
		sphere.position.y = 120;
		sphere.scale.set(50,50,50);

		// Create NFT marker and associate Three.js models with it
		arController.loadNFTMarker(nftMarkerSource, function(markerId) {
			let markerRoot = arController.createThreeNFTMarker(markerId);
			arScene.scene.add(markerRoot);

			//Associate Three.js models with NFT marker
			markerRoot.add(sphere);

		});

		var rotationV = 0;
		var rotationTarget = 0;

		const tick = function() {
			arScene.process();
			rotationV += (rotationTarget - sphere.rotation.z) * 0.05;
			sphere.rotation.z += rotationV;
			rotationV *= 0.8;

			arScene.renderOn(renderer);
			requestAnimationFrame(tick);
		};

		tick();

	}});

	delete window.ARThreeOnLoad;

};

if (window.ARController && ARController.getUserMediaThreeScene) {
	ARThreeOnLoad();
}