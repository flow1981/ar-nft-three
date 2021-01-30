export const createSphere = () => {
    let sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 8, 8),
        new THREE.MeshNormalMaterial()
    );

    sphere.material.flatShading;
    sphere.position.z = 40;
    sphere.position.x = 80;
    sphere.position.y = 80;
    sphere.scale.set(80,80,80);

    return sphere
}