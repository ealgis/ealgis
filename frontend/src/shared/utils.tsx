export function getMapURL(map: object) {
    return `/map/${map.id}/${map["name-url-safe"]}`
}
