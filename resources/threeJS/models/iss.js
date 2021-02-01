export const createIssPositionMarker = () => {
    let geometry = new THREE.SphereGeometry(0.01, 32, 32);
    let material = new THREE.MeshStandardMaterial({
      color:  0xff4e21,
      opacity: 0.5
    });
    let mesh = new THREE.Mesh(geometry, material);
    mesh.name = "iss_blob"
    return mesh
}

export const addIssModelToMarker = (mesh) => {
    const gltfLoader = new THREE.GLTFLoader();
    const url = 'assets/3dmodels/station-mini.gltf';
  
    return gltfLoader.load(url, (gltf) => {
      const iss = gltf.scene;
      iss.scale.set(1,1,1)
      iss.name = "station"
      mesh.add(iss);
    })
}