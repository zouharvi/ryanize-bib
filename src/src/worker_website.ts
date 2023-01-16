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

function formatText(text: string) {
    return text.split("\n").map((line) => {
        let prevLine = ""
        // hacky way to remove space around equality
        while (prevLine != line) {
            prevLine = line
            line = line.replace("= ", "=").replace(" =", "=")
        }
        console.log(line)
        // bracket everything
        line=line.replace('="', '={')
        line = (line+",").replace(",,", ",")
        line=line.replace('",', '},')
        if (!line.includes("=")) {
            return line
        }
        if (line.includes("{") && line.includes("}")) {
            return line
        }
        line = line.replace("=", "={")
        
        // manual add trailing commas
        // we can add them everywhere because in `dumpEntries` we unpack everything
        // if (!line.includes(",")) {
        //     line += ","
        // }
        let lastComma = line.lastIndexOf(",")
        line = line.substring(0, lastComma) + '},' + line.substring(lastComma + 1)
        return line
    }).join("\n")
}

function flattenBraced(object) {
    if (typeof(object) != "object") {
        return object
    }
    return "{" + object["data"].map(flattenBraced).join("") + "}"
}

function dumpEntries(entries: Object) {
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
    return out
}

function setup_navigation() {
    $("#button_go").on("click", () => {
        CHECK_URL = $("#check_url").is(":checked")
        CHECK_ARXIV = $("#check_arxiv").is(":checked")
        CHECK_PUBLISHER = $("#check_publisher").is(":checked")
        CHECK_CAPITAL = $("#check_capital").is(":checked")

        // $("#main_editable").html($("#main_editable").html()+" ")
        let text = $("#main_editable").html() as string
        // remove html tags
        text = text.replaceAll("<br>", "\n")
        // text = text.replace(/<(.|\n)*?>/g, '')
        text = formatText(text)
        const bibFile = parseBibFile(text)

        text = dumpEntries(bibFile["entries$"])
        $("#main_editable").html(text)
    })

    // $("#main_editable").on("input paste", (event) => {
    //     // $("#main_editable").html($("#main_editable").html() + " ")
    //     console.log($("#main_editable").html().includes("<br>"))
    // })
    
}


export { setup_navigation }