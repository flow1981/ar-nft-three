export const createEarthGnonomic = ( radius = 1, scaleFactor = 1 ) => {
    console.log("loaded")

    let geometry = new THREE.BoxGeometry(
        radius * scaleFactor,
        radius * scaleFactor,
        radius * scaleFactor,
        24,
        24,
        24
    );
    geometry = morphCubeToSphere(geometry, radius, scaleFactor)
    
    const loader = new THREE.TextureLoader();

    const cubeMaterials = [
        new THREE.MeshBasicMaterial({ map: loader.load( './assets/images/earth/india.png' )}),           //front side
        new THREE.MeshBasicMaterial({ map: loader.load( './assets/images/earth/americas.png' )}),        //back side
        new THREE.MeshBasicMaterial({ map: loader.load( './assets/images/earth/northpole.png' )}),       //up side
        new THREE.MeshBasicMaterial({ map: loader.load( './assets/images/earth/southpole.png' )}),       //down side
        new THREE.MeshBasicMaterial({ map: loader.load( './assets/images/earth/europe-africa.png' )}),   //right side
        new THREE.MeshBasicMaterial({ map: loader.load( './assets/images/earth/australia.png')})         //left side
    ];

    let mesh = new THREE.Mesh(geometry, cubeMaterials);

    return mesh
}

const morphCubeToSphere = (geometry, radius, scaleFactor) => {
    console.log("morph")

    // morph box into a sphere
    for ( let i = 0; i < geometry.vertices.length; i ++ ) {
        geometry.vertices[ i ].normalize().multiplyScalar( radius * scaleFactor ); // or whatever size you want
    }

    // redefine vertex normals consistent with a sphere; reset UVs
    for ( let i = 0; i < geometry.faces.length; i ++ ) {
        let face = geometry.faces[i];
        face.vertexNormals[0].copy( geometry.vertices[face.a] ).normalize();
        face.vertexNormals[1].copy( geometry.vertices[face.b] ).normalize();
        face.vertexNormals[2].copy( geometry.vertices[face.c] ).normalize();
        let uvs = geometry.faceVertexUvs[0];
    }
    return geometry
}
