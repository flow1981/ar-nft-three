import { createSphere } from './resources/sphere.js'

window.ARThreeOnLoad = function() {

	ARController.getUserMediaThreeScene({maxARVideoSize: 320, cameraParam: '../resources/data/camera_para.dat',
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
		let sphere = createSphere()

		// Create NFT marker and associate Three.js models with it
		arController.loadNFTMarker('../resources/dataNFT/pinball', function(markerId) {
			let markerRoot = arController.createThreeNFTMarker(markerId);
			markerRoot.add(sphere);
			arScene.scene.add(markerRoot);
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