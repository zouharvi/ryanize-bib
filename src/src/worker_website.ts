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

    // replace "}   ," with "}," (makes us or BibTeX flip out otherwise)
    text = text.replace(/\}\s+,/g, '},')

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
    let output: Array<string> = []

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
            output[output.length - 1] += " " + line

            if (!line.includes("={") && line.replaceAll(",", "").endsWith("}")) {
                insideEntry = false
            }
            return
        }
        // bracket everything
        line = line.replace('="', '={')
        line = (line + ",").replace(",,", ",")
        line = line.replace('",', '},')

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
            line = (line + "$").replace(",$", "")

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

let fix_actions = new Map<string, Array<(string) => string>>()
function fix_entry(key: string) {
    let text = main_editable.text();
    fix_actions[key].forEach((action) => { text = action(text) });
    main_editable.html(text)
    // trigger lcick
    let prev_scroll = main_editable.scrollTop()
    $("#button_go").trigger("click")
    main_editable.scrollTop(prev_scroll)
}
// make it global
globalThis.fix_entry = fix_entry

function processEntry(key, entry): string {
    // big function which should be split up
    // does both checking and formatting the output
    fix_actions[key] = new Array<(string) => string>();

    let hasURL = false
    let hasDOI = false
    let title = ""
    for (let field in entry["fields"]) {
        if (field == "url") {
            hasURL = true
        }
        if (field == "doi") {
            hasDOI = true
        }
        if (field == "title") {
            title = flattenBraced(entry["fields"][field])
        }
    }
    let out = `@${entry["type"]}{${key}, FIX_BUTTON_PLACEHOLDER\n`
    let search_url = `https://scholar.google.com/scholar?hl=en&as_sdt=0%2C5&q=${title.replaceAll(' ', '+').replaceAll('\'', '').replaceAll('{', '').replaceAll('}', '')}`
    let search_button = `<input class="search_button" type="button" value="search" onclick="window.open('${search_url}', '_blank')">`

    for (let field in entry["fields"]) {
        let fieldDataTxt = ""
        let fieldData = entry["fields"][field]["data"]
        while (fieldData.length == 1 && typeof (fieldData[0]) == "object") {
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

        if (CHECK_ABSTRACT && field == "abstract") {
            let fieldDataTxtClean = fieldDataTxt.replace("</span>", "").replace('<span class="line_warning">', "")
            // remove the field as a fix
            fix_actions[key].push((text) => {
                return text.replace(`abstract={${fieldDataTxtClean}},`, "")
            })
            fieldDataTxt = '<span class="line_warning">' + fieldDataTxtClean + '</span>'
        }

        if (CHECK_ARXIV && field == "journal") {
            fieldDataTxt = fieldDataTxt.replaceAll("arXiv", '<span class="line_warning">arXiv</span>')
            fieldDataTxt = fieldDataTxt.replaceAll("arxiv", '<span class="line_warning">arxiv</span>')
        }

        if (CHECK_CAPITAL && field == "title") {
            // BibTeX removes double spaces anyway
            fieldDataTxt = fieldDataTxt.replace(/\s+/g, ' ')
            let words = fieldDataTxt.split(" ")
            // reset output
            fieldDataTxt = ""
            let correct_words = []
            let words_need_fixing = false
            for (let word_i in words) {
                let word = words[word_i]
                if (shouldCapitalProtect(word) && (!word.includes("{") || !word.includes("}"))) {
                    fieldDataTxt += `<span class="line_warning">${word}</span> `
                    correct_words.push(`{${word}}`)
                    words_need_fixing = true
                    continue
                }
                let word_i_num = parseInt(word_i)
                if (word_i_num > 0 && (!word.includes("{") || !word.includes("}"))) {
                    let prev_word = words[`${word_i_num - 1}`]
                    if (prev_word.at(-1) == ":") {
                        fieldDataTxt += `<span class="line_warning">${word}</span> `
                        correct_words.push(`{${word[0].toUpperCase() + word.slice(1)}}`)
                        words_need_fixing = true
                        continue
                    }
                }
                fieldDataTxt += word + " "
                correct_words.push(`${word}`)
            }
            fieldDataTxt = fieldDataTxt.trim()
            if (words_need_fixing) {
                fix_actions[key].push((text) => {
                    text = text.replace(words.join(" "), correct_words.join(" "))
                    // hack for the common "{ABC}: Title" format so that "TitleTitle:" is still parseable (though weird)
                    if (text.lastIndexOf(":}") < text.length - 3) {
                        text = text.replaceAll(":}", "}:")
                    }
                    return text
                })
            }
        }

        if (CHECK_PUBLISHER && field == "publisher") {
            if (["article", "journal", "inproceeding"].includes(entry["type"])) {
                out += `    publisher=<span class="line_warning">{${fieldDataTxt}}</span>,\n`
                // remove the field as a fix
                fix_actions[key].push((text) => {
                    return text.replace(`publisher={${fieldDataTxt}},`, "")
                })
            } else {
                out += `    ${field}={${fieldDataTxt}},\n`
            }
            continue
        }
        if (field == "url" && fieldDataTxt == "URL_DOI_MISSING") {
            if (CHECK_URL) {
                out += `    url=<span class="line_warning">{URL_DOI_MISSING}</span>, ${search_button}\n`
            }
        } else {
            out += `    ${field}={${fieldDataTxt}},\n`
        }

    }

    if (!hasURL && !hasDOI && CHECK_URL) {
        out += `    url=<span class="line_warning">{URL_DOI_MISSING}</span>, ${search_button}\n`
    }

    out += `}`

    if (fix_actions[key].length == 0) {
        // remove placeholder if it was not used
        out = out.replace("FIX_BUTTON_PLACEHOLDER", "")
    } else {
        out = out.replace("FIX_BUTTON_PLACEHOLDER", `<input class="search_button" type="button" value="fix" onclick="fix_entry('${key}')">`)
    }


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

function check_no_duplicate_keys(text: string) {
    // take only the key
    let keys = [...text.matchAll(/@\w+\{(\w+),/g)].map((a) => a[1])
    let keys_seen = new Set<string>()
    let keys_dups = new Array<string>()
    keys.forEach((key) => {
        key = key.toLowerCase()
        if (keys_seen.has(key)) {
            keys_dups.push(key)
        }
        keys_seen.add(key)
    })
    return keys_dups
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

        let keys_dups = check_no_duplicate_keys(text)
        if (keys_dups.length > 0) {
            $("#process_log").html(`Won't parse the bibfile because is contains the following duplicate entries [<em>${keys_dups.join(", ")}</em>]`)
            return
        }

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

        if (comments.length > 0) {
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