import { DEVMODE } from "./globals";
import { flattenBraced, shouldCapitalProtect } from "./utils";
import { parseBibFile } from "bibtex";

let main_editable = $("#main_editable")

let CHECK_ARXIV = false
let CHECK_PUBLISHER = false
let CHECK_CAPITAL = false
let CHECK_URL = false
let CHECK_ABSTRACT = false
let CHECK_DUPLICATES = false

let seen_titles = new Set<string>()

function preprocessTextMain(text: string) {
    // trim whitespace
    text = text.trim()

    // remove html tags
    text = text.replaceAll("<br>", "\n")
    // collapse multiple newlines together
    text = text.replace(/\n\s*\n/g, '\n');

    text = text.replace(/<(.|\n)*?>/g, '')
    // for some reason running it twice makes it works
    // we're going full LaTeX here
    text = preprocessText(text)
    text = preprocessText(text)
    return text
}

function preprocessText(text: string) {
    // make sure that the input is somewhat canonized and readable by
    // the bibtex module which is otherwise conservative
    let insideEntry = false
    let output:Array<string> = []

    text.split("\n").forEach((line) => {
        line = line.trim()
        
        let prevLine = ""
        // hacky way to remove space around equality
        while (prevLine != line) {
            prevLine = line
            line = line.replace("= ", "=").replace(" =", "=")
        }
        // normalize to use {} instead of ""
        line = line.replace('="', "={").replace('",', "}")

        // this is a very hacky way (as this whole function) to do stuff absed on if we're inside a value or not
        if (insideEntry) {
            output[output.length-1] += " " + line

            if (!line.includes("={") && line.replaceAll(",", "").endsWith("}")) {
                insideEntry = false
            }
            return
        }
        // bracket everything
        line=line.replace('="', '={')
        line = (line+",").replace(",,", ",")
        line=line.replace('",', '},')
        if (!line.includes("=")) {
            output.push(line)
            return
        }
        if (line.includes("={") && line.replaceAll(",", "").endsWith("}")) {
            output.push(line)
            return
        }
        // special case where the entry starts here but doesn't end here
        if (line.includes("={") && !line.replaceAll(",", "").endsWith("}")) {
            insideEntry = true
            line = (line+"$").replace(",$", "")
            
            output.push(line)
            return
        }
        line = line.replace("=", "={")
        
        let lastComma = line.lastIndexOf(",")
        line = line.substring(0, lastComma) + '},' + line.substring(lastComma + 1)

        output.push(line)
    })
    
    return output.join("\n")
}



function processEntry(key, entry): string {
    // big function which should be split up
    // does both checking and formatting the output

    let hasURL = false
    let hasDOI = false
    let title = ""
    for(let field in entry["fields"]) {
        if (field == "url") {
            hasURL = true
        }
        if (field == "doi") {
            hasDOI = true
        }
        if (field == "title"){
            title = flattenBraced(entry["fields"][field])
        }
    }
    let search_url = `https://scholar.google.com/scholar?hl=en&as_sdt=0%2C5&q=${title.replaceAll(' ', '+').replaceAll('\'', '').replaceAll('{', '').replaceAll('}', '')}`
    let search_button = `<input class="search_button" type="button" value="search" onclick="window.open('${search_url}', '_blank')">`
    let out = `@${entry["type"]}{${key}, ${search_button}\n`

    for(let field in entry["fields"]) {
        let fieldDataTxt = ""
        let fieldData = entry["fields"][field]["data"]
        while (fieldData.length == 1 && typeof(fieldData[0]) == "object") {
            fieldData = fieldData[0]["data"]
        }
        for (let element in fieldData) {
            fieldDataTxt += flattenBraced(fieldData[element])
        }

        if (CHECK_DUPLICATES && field == "title") {
            let title_hash = fieldDataTxt.replace(/[^a-zA-Z]/gi, '')
            if (seen_titles.has(title_hash)) {
                fieldDataTxt = '<span class="line_warning">' + fieldDataTxt + '</span>'
            }
            seen_titles.add(title_hash)
        }
        
        if (CHECK_ABSTRACT && field=="abstract") {
            fieldDataTxt = '<span class="line_warning">' + fieldDataTxt + '</span>'
        }

        if (CHECK_ARXIV && field=="journal") {
            fieldDataTxt = fieldDataTxt.replaceAll("arXiv", '<span class="line_warning">arXiv</span>')
            fieldDataTxt = fieldDataTxt.replaceAll("arxiv", '<span class="line_warning">arxiv</span>')
        }

        if (CHECK_CAPITAL && field =="title") {
            // BibTeX removes double spaces anyway
            fieldDataTxt = fieldDataTxt.replace(/\s+/g,' ')
            let words = fieldDataTxt.split(" ")
            // reset output
            fieldDataTxt = ""
            for(let word_i in words) {
                let word = words[word_i]
                if (shouldCapitalProtect(word) && (!word.includes("{") || !word.includes("}"))) {
                    fieldDataTxt += `<span class="line_warning">${word}</span> `
                    continue
                }
                let word_i_num = parseInt(word_i)
                if (word_i_num > 0 && (!word.includes("{") || !word.includes("}"))){
                    let prev_word = words[`${word_i_num-1}`]
                    if (prev_word.at(-1) == ":") {
                        fieldDataTxt += `<span class="line_warning">${word}</span> `
                        continue
                    }
                }
                fieldDataTxt += word + " "
            }
            fieldDataTxt = fieldDataTxt.trim()
        }

        if (CHECK_PUBLISHER && field == "publisher") {
            if (["article", "journal", "inproceeding"].includes(entry["type"])) {
                out += `    ${field}=<span class="line_warning">{${fieldDataTxt}}</span>,\n`
            }
            continue
        }

        if (field == "url" && fieldDataTxt == "URL/DOI MISSING") {
            if (CHECK_URL) {
                out += `    url=<span class="line_warning">{URL/DOI MISSING}</span>,\n`
            }
        } else {
            out += `    ${field}={${fieldDataTxt}},\n`
        }

    }
    
    if (!hasURL && !hasDOI && CHECK_URL) {
        out += `    url=<span class="line_warning">{URL/DOI MISSING}</span>,\n`
    }

    out += `}`

    return out
}

function checkEntriesAndDump(entries: Object) {
    let out = []
    for (let key in entries) {
        let entry = entries[key]
        out.push(processEntry(key, entry))
    }

    let error_count = out.map((line) => {
        if (line.includes("line_warning")) {
            return 1
        } else {
            return 0
        }
    }).reduce((sum, current) => sum + current, 0);

    return [out.join("\n\n"), error_count]
}

function setup_navigation() {
    $("#button_go").on("click", () => {
        CHECK_URL = $("#check_url").is(":checked")
        CHECK_ARXIV = $("#check_arxiv").is(":checked")
        CHECK_ABSTRACT = $("#check_abstract").is(":checked")
        CHECK_PUBLISHER = $("#check_publisher").is(":checked")
        CHECK_CAPITAL = $("#check_capital").is(":checked")
        CHECK_DUPLICATES = $("#check_duplicates").is(":checked")

        // main_editable.html(main_editable.html()+" ")
        let text = preprocessTextMain(main_editable.html() as string)


        // yank comments
        let comments = text.split("\n").filter((line) => line.trim().startsWith("%")).join("\n")

        main_editable.html(text)

        // clear seen cache
        seen_titles = new Set<string>()
        let bibFile;
        try {   
            bibFile = parseBibFile(text)
        } catch {
            $("#process_log").html(`Can't parse the bibfile :-(<br>Make sure it's formatted correctly`)
            return
        }
        
        let output = checkEntriesAndDump(bibFile["entries$"])
        text = output[0] as string

        let logMessage = `${output[1]} problems found`

        if (comments.length >0) {
            logMessage += "\nComments were moved to the top (they are not fully supported yet)"
            main_editable.html(comments + "\n\n" + text)
        } else {
            main_editable.html(text)
        }
        
        $("#process_log").html(logMessage)

        main_editable.scrollTop(0)
        main_editable.scrollLeft(0)
    })    
}


export { setup_navigation }