import { log_data } from "./connector";
import { DEVMODE } from "./globals";
import { getIndicies } from "./utils";
import { parseBibFile, type } from "bibtex";

let main_text_area = $("#main_text_area")
let active_response_area_template = $("#active_response_area_template")

let CHECK_ARXIV = false
let CHECK_PUBLISHER = false
let CHECK_CAPITAL = false
let CHECK_URL = false

function preprocessText(text: string) {
    // make sure that the input is somewhat canonized and readable by
    // the bibtex module which is otherwise conservative
    let insideEntry = false
    let output:Array<string> = []

    text.split("\n").forEach((line) => {
        line = line.trim()
        if (insideEntry) {
            output[output.length-1] += " " + line

            if (!line.includes("{") && line.includes("}")) {
                insideEntry = false
            }
            return
        }

        let prevLine = ""
        // hacky way to remove space around equality
        while (prevLine != line) {
            prevLine = line
            line = line.replace("= ", "=").replace(" =", "=")
        }
        // bracket everything
        line=line.replace('="', '={')
        line = (line+",").replace(",,", ",")
        line=line.replace('",', '},')
        if (!line.includes("=")) {
            output.push(line)
            return
        }
        if (line.includes("{") && line.includes("}")) {
            output.push(line)
            return
        }
        // special case where the entry starts here but doesn't end here
        if (line.includes("{") && !line.includes("}")) {
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

function flattenBraced(object) {
    if (typeof(object) != "object") {
        return object
    }
    return "{" + object["data"].map(flattenBraced).join("") + "}"
}

function checkEntriesAndDump(entries: Object) {
    // big function which should be split up
    // does both checking and formatting the output

    let out = ""
    for (let key in entries) {
        let entry = entries[key]
        out += `@${entry["type"]}{${key},\n`

        let hasURL = false
        for(let field in entry["fields"]) {
            if (field == "url") {
                hasURL = true
            }

            let fieldDataTxt = ""
            let fieldData = entry["fields"][field]["data"]
            while (fieldData.length == 1 && typeof(fieldData[0]) == "object") {
                fieldData = fieldData[0]["data"]
            }
            for (let element in fieldData) {
                fieldDataTxt += flattenBraced(fieldData[element])
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
                    if (word.length >= 2 && word.toUpperCase() == word && (!word.includes("{") || !word.includes("}"))) {
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

            if (field == "url" && fieldDataTxt == "URL MISSING") {
                if (CHECK_URL) {
                    out += `    <span class="line_warning">url={URL MISSING}</span>,\n`
                }
            } else {
                out += `    ${field}={${fieldDataTxt}},\n`
            }

        }
        
        if (!hasURL && CHECK_URL) {
            out += `    <span class="line_warning">url={URL MISSING}</span>,\n`
        }

        out += `}\n\n`
    }

    let error_count = out.split("\n").map((line) => {
        if (line.includes("line_warning")) {
            return 1
        } else {
            return 0
        }
    }).reduce((sum, current) => sum + current, 0);

    return [out, error_count]
}

function setup_navigation() {
    $("#button_go").on("click", () => {
        CHECK_URL = $("#check_url").is(":checked")
        CHECK_ARXIV = $("#check_arxiv").is(":checked")
        CHECK_PUBLISHER = $("#check_publisher").is(":checked")
        CHECK_CAPITAL = $("#check_capital").is(":checked")

        // $("#main_editable").html($("#main_editable").html()+" ")
        let text = $("#main_editable").html() as string
        text = text.trim()

        // remove html tags
        text = text.replaceAll("<br>", "\n")
        // collapse multiple newlines together
        text = text.replace(/\n\s*\n/g, '\n');

        text = text.replace(/<(.|\n)*?>/g, '')
        text = preprocessText(text)
        $("#main_editable").html(text)

        let bibFile;
        try {
            bibFile = parseBibFile(text)
        } catch {
            $("#process_log").html(`Can't parse the bibfile :-(<br>Make sure it's formatted correctly`)
            return
        }
        
        let output = checkEntriesAndDump(bibFile["entries$"])
        text = output[0] as string

        $("#main_editable").html(text)
        
        $("#process_log").html(`${output[1]} problems found`)

        $("#main_editable").scrollTop(0)
        $("#main_editable").scrollLeft(0)
    })    
}


export { setup_navigation }