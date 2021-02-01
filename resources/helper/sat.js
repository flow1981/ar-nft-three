export const initOrbitalPosition = (satMesh, tle, timeSinceEpoch = 0, scaleFactor=1)=> {
    let satrec = satellite.twoline2satrec(tle[1], tle[2]);
    satMesh.userData.satrec = satrec;
  
    let pAv = satellite.sgp4(satrec, timeSinceEpoch);
  
    satMesh.position.set(
      pAv.position.y * scaleFactor,    // map to three.js coord system  y* >> x
      pAv.position.z * scaleFactor,     // map to three.js coord system  z* >> y
      pAv.position.x * scaleFactor    // map to three.js coord system x* >> z
    );
  
    return  satMesh;
}
  
export const updateOrbitalPostion = (satMesh, scaleFactor) => {
    let now = new Date()

    let gmst = satellite.gstime(now)
    let pAv = satellite.propagate(satMesh.userData.satrec, now);
    let positionGd = satellite.eciToGeodetic( pAv.position, gmst)
    let longitude = satellite.degreesLong(positionGd.longitude)
    let latitude  = satellite.degreesLat(positionGd.latitude)

    satMesh.position.set(
    pAv.position.y * scaleFactor,    // map to three.js coord system  y* >> x
    pAv.position.z * scaleFactor,     // map to three.js coord system  z* >> y
    pAv.position.x * scaleFactor    // map to three.js coord system x* >> z
    );

    satMesh.userData.coord = { lat: latitude, lng: longitude}
    satMesh.userData.location = `lon: ${longitude.toFixed(2)} deg, lat: ${latitude.toFixed(2)} deg`
    satMesh.userData.velocity = Math.pow( (Math.pow(pAv.velocity.x, 2) + Math.pow(pAv.velocity.y,2) + Math.pow(pAv.velocity.z,2)), 0.5) *  3600
    satMesh.userData.altitude = positionGd.height

    return satMesh
}

export const visualizeOrbit = (satRec, scaleFactor) => {
    let pAv
    let newDate        = new Date()
    let plotpoints     = 90;
  
    let periodMinutes  = 2 * Math.PI / satRec.no; //no rev/min
    let deltaT         = 0.025 * periodMinutes / plotpoints
  
    let material  = new THREE.LineBasicMaterial(
      {color:    0x075D99, opacity:  0.5}
    )
  
    let points = []
  
    let geometry = new THREE.Geometry();
  
    for (let i = 0; i <= plotpoints; i++){
      newDate = new Date( newDate.getTime() + i * deltaT * 60000 )
      pAv = satellite.propagate(satRec, newDate);
      let position = new THREE.Vector3( 
        pAv.position.y * scaleFactor,    // map to three.js coord system  y* >> x
        pAv.position.z * scaleFactor,    // map to three.js coord system  z* >> y
        pAv.position.x * scaleFactor    // map to three.js coord system x* >> z
      )
      points.push(position)
      geometry.vertices.push(position);
    };
    geometry = new THREE.BufferGeometry().setFromPoints( points )
      
    let orbitPath = new THREE.Line(geometry,material)
    orbitPath.name = "orbit"
  
    return orbitPath
}

export const alignISSrelativeEarthSurface = (issMesh) => {
    let now = new Date()
    let gmst = satellite.gstime(now) //rad
    let quaternion = new THREE.Quaternion();

    quaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), gmst + issMesh.userData.coord.lng * Math.PI/180 - 90*Math.PI/180 );
    issMesh.applyQuaternion( quaternion )
    issMesh.rotateOnAxis(new THREE.Vector3( 0, 0, 1 ), issMesh.userData.coord.lat * Math.PI/180)

    return issMesh
}

export const alignXeciToVernalEquinox = (group) => {
    let now = new Date()
    let gmst = satellite.gstime(now) //rad
    group.geometry.rotateY(gmst)
    return group
}