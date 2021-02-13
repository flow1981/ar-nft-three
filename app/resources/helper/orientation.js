export const alignXeciToVernalEquinox = (group) => {
    let now = new Date()
    let gmst = satellite.gstime(now) //rad
    group.geometry.rotateY(gmst)
    return group
}
