import { IMap } from "../redux/modules/interfaces"

export function getMapURL(map: IMap) {
    return `/map/${map.id}/${map["name-url-safe"]}`
}
