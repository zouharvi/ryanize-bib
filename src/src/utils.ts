import { number } from "bibtex"

function flattenBraced(object) {
    if (typeof(object) != "object") {
        return object
    }
    return "{" + object["data"].map(flattenBraced).join("") + "}"
}

function shouldCapitalProtect(word: string) : boolean {
    let prevCapitalLetter = false
    for(let c in  [...word]) {
        let isCapitalLetter = c.match(/[A-Z]/i) && c.toUpperCase() == c
        if (isCapitalLetter && prevCapitalLetter) {
            return true
        }
    }
    return false
}

export { flattenBraced, shouldCapitalProtect }