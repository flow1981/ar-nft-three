window.ARThreeOnLoad = function() {

	ARController.getUserMediaThreeScene({maxARVideoSize: 320, cameraParam: '../resources/data/camera_para.dat',
	onSuccess: function(arScene, arController, arCamera) {

		document.body.className = arController.orientation;

		var renderer = new THREE.WebGLRenderer({antialias: true});
		renderer.gammaOutput = true;
		renderer.gammaFactor = 2.2;
		if (arController.orientation === 'portrait') {
			var w = (window.innerWidth / arController.videoHeight) * arController.videoWidth;
			var h = window.innerWidth;
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

		var rotationV = 0;
		var rotationTarget = 0;

		renderer.domElement.addEventListener('click', function(ev) {
			ev.preventDefault();
			rotationTarget += 1;
		}, false);

		var sphere = new THREE.Mesh(
			new THREE.SphereGeometry(0.5, 8, 8),
			new THREE.MeshNormalMaterial()
		);

		sphere.material.flatShading;
		sphere.position.z = 40;
		sphere.position.x = 80;
		sphere.position.y = 80;
		sphere.scale.set(80,80,80);

		arController.loadNFTMarker('../resources/dataNFT/pinball', function(markerId) {
			var markerRoot = arController.createThreeNFTMarker(markerId);
			markerRoot.add(sphere);
			arScene.scene.add(markerRoot);
		});

		var tick = function() {
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