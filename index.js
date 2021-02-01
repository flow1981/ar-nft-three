import { createEarthGnonomic } from './resources/threeJS/models/earth.js'
import { createIssPositionMarker, addIssModelToMarker } from './resources/threeJS/models/iss.js'
import { initOrbitalPosition, updateOrbitalPostion, visualizeOrbit, alignXeciToVernalEquinox, alignISSrelativeEarthSurface} from './resources/helper/sat.js'

const NFT_MARKER_URL = '../resources/dataNFT/earth-qr'
const CAMERA_PARAM_URL = '../resources/data/camera_para.dat'

const TLE_URL =  'http://live.ariss.org/iss.txt'

const scaleFactor = 1/100
const earthRadius = 6371

window.ARThreeOnLoad = function(tle) {

	ARController.getUserMediaThreeScene({maxARVideoSize: 320, cameraParam: CAMERA_PARAM_URL,
	onSuccess: function(arScene, arController, arCamera) {

		document.body.className = arController.orientation;

		//Set up ambient light source
		let ambientLight = new THREE.AmbientLight( 0xcccccc, 0.8 );
		arScene.scene.add( ambientLight );


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

		// renderer.domElement.addEventListener('click', function(ev) {
		// 	ev.preventDefault();
		// 	rotationTarget += 1;
		// }, false);

		let modelGroup = new THREE.Group();
		// x positive - left, y positive - up, z positive -towards viewer | x, y zero is bottom right of trigger
		modelGroup.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1)); // we need flip the objects since ARtoolkit displays them mirrored
		modelGroup.position.set(80,80,80)

		// Add Three.js models
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

		addIssModelToMarker(issPosition)
		alignISSrelativeEarthSurface(issPosition)

		modelGroup.rotateOnAxis( new THREE.Vector3(1, 0, 0).normalize(), 90 * Math.PI/180 );

		// Create NFT marker and associate it with Three.js model group
		arController.loadNFTMarker(NFT_MARKER_URL, function(markerId) {
			let markerRoot = arController.createThreeNFTMarker(markerId);

			arScene.scene.add(markerRoot);
			markerRoot.add(modelGroup); //Link models with NFT marker
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

	}});

	delete window.ARThreeOnLoad;

};

//----

//Avoid CORS when fetching TLE data
$.ajaxPrefilter( function (options) {
	if (options.crossDomain && jQuery.support.cors) {
		var http = (window.location.protocol === 'http:' ? 'http:' : 'https:');
		options.url = http + '//cors-anywhere.herokuapp.com/' + options.url;
	}
});

//Fetch TLE data before starting the App
$.get( TLE_URL, function( html ) {
	const TLE = html.split("\n").splice(0,3);
	console.log(TLE);

	// Start App if ARController and User Mediaare available
	if (window.ARController && ARController.getUserMediaThreeScene) {
		ARThreeOnLoad(TLE);
	}
})
