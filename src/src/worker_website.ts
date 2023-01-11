import { log_data } from "./connector";
import { DEVMODE } from "./globals";
import { getIndicies } from "./utils";

let main_text_area = $("#main_text_area")
let active_response_area_template = $("#active_response_area_template")

const zip = (a, b) => a.map((k, i) => [k, b[i]]);

function load_headers() {
    console.log(globalThis.data.length)
    $("#progress").html(`
        <strong>Progress:</strong> ${globalThis.data_i + 1}/${globalThis.data.length},
        <strong>UID:</strong> ${globalThis.uid}
    `)
}

function setup_main_text() {
    // let html_text = `<b>${globalThis.data_now["title"]}</b><br>${globalThis.data_now["text"]}`;
    let out_html = ""
    zip(globalThis.data_now["texts"], globalThis.data_now["imgs"]).forEach((element) => {
        let text_path = element[0];
        let text_el = `<iframe src="texts/${text_path}" frameborder="0" scrolling="no" onload="resizeIframe(this)"></iframe>`;
        out_html += text_el;
        let imgs = element[1];
        if(imgs.length == 0) {
            return;
        }
        // TODO: take just the first image for now
        let img_path = imgs[0]
        let response_template = active_response_area_template.html();
        response_template = response_template.replaceAll("IMAGE_TEMPLATE", img_path);
        // remove lazy loading flag
        response_template = response_template.replaceAll('loading="lazy"', "");
        out_html += response_template;
    })
    main_text_area.html(out_html);
}

function load_cur_text() {
    load_headers()
    setup_main_text()
}

function load_thankyou() {
    // TODO: wait for data sync
    load_headers()
    let html_text = `Thank you for participating in our study. `;
    if (globalThis.uid.startsWith("prolific_pilot_1")) {
        html_text += `<br>Please click <a href="https://app.prolific.co/submissions/complete?cc=C67G3X5Y">this link</a> to go back to Prolific. `
        html_text += `Alternatively use this code <em>C67G3X5Y</em>.`
    }
    main_text_area.html(html_text);
}

function setup_navigation() {
    $("#but_next").on("click", () => {
        globalThis.data_i += 1;

        // globalThis.data_log.times.push(Date.now())
        // log_data(globalThis.data_log)

        if (globalThis.data_i >= globalThis.data.length) {
            globalThis.data_i = 0;
            load_thankyou()
        } else {
            globalThis.data_now = globalThis.data[globalThis.data_i];
            load_cur_text()
        }

        $("#but_prev").prop("disabled", globalThis.data_i == 0);
        $("#but_next").prop("disabled", globalThis.data_i == globalThis.data.length-1);
    })

    $("#but_prev").on("click", () => {
        globalThis.data_i -= 1;
        $("#but_prev").prop("disabled", globalThis.data_i == 0);
        $("#but_next").prop("disabled", globalThis.data_i == globalThis.data.length-1);

        globalThis.data_now = globalThis.data[globalThis.data_i];
        load_cur_text()
    })

    $("#but_prev").prop("disabled", true);
}


export { setup_navigation, load_cur_text }