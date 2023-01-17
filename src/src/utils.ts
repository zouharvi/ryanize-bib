import { number } from "bibtex"

function flattenBraced(object) {
    if (typeof(object) != "object") {
        return object
    }
    return "{" + object["data"].map(flattenBraced).join("") + "}"
}

function shouldCapitalProtect(_word: string) : boolean {
    let prevCapitalLetter = false
    let word = [..._word]
    for(let i in  word) {
        let c = word[i]
        let isCapitalLetter = (c.toUpperCase() != c.toLowerCase()) && c.toUpperCase() == c
        if (isCapitalLetter && prevCapitalLetter) {
            return true
        }
        prevCapitalLetter = isCapitalLetter
    }
    return false
}

export { flattenBraced, shouldCapitalProtect }