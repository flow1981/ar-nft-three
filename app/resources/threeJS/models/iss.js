export const createIssPositionMarker = () => {
  let geometry = new THREE.SphereGeometry(0.01, 32, 32);
  let material = new THREE.MeshStandardMaterial({
    color:  0xff4e21,
    opacity: 0.01
  });
  let mesh = new THREE.Mesh(geometry, material);
  mesh.name = "iss_blob"
  return mesh
}

export const addIssModelToMarker = (iss_mesh, model_path) => {
  const gltfLoader = new THREE.GLTFLoader();

  return gltfLoader.load(model_path, (gltf) => {
    const iss_model = gltf.scene
    iss_model.scale.set(1, 1, 1)
    iss_model.name = "station"
    iss_mesh.add(iss_model);
  })
}
