import { DEVMODE } from './globals'

let SERVER_DATA_ROOT = DEVMODE ? "http://127.0.0.1:9000/queues/" : "queues/"
let SERVER_LOG_ROOT = DEVMODE ? "http://127.0.0.1:5000/" : "https://zouharvi.pythonanywhere.com/"

export async function load_data(): Promise<any> {
    let random_v = `?v=${Math.random()}`;
    let result :string = await $.ajax(
        SERVER_DATA_ROOT + globalThis.uid + ".jsonl" + random_v,
        {
            type: 'GET',
            contentType: 'application/text',
        }
    )
    result = result.trimEnd()
    result = JSON.parse("[" + result.replaceAll("\n", ",") + "]")
    return result
}

export async function log_data(data): Promise<any> {
    return {}
    // if (globalThis.prolific_pid != undefined) {
    //     data["prolific_pid"] = globalThis.prolific_pid
    // }

    // let result = await $.ajax(
    //     SERVER_LOG_ROOT + "log",
    //     {
    //         data: JSON.stringify({
    //             project: "tsip",
    //             uid: globalThis.uid,
    //             prolific_pid: globalThis.prolific_pid,
    //             payload: JSON.stringify(data),
    //         }),
    //         type: 'POST',
    //         contentType: 'application/json',
    //     }
    // )
    // console.log(result)
    // return result
}