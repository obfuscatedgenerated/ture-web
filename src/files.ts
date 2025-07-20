import * as error_log from "./error_log";
import * as editor from "./editor";
import * as runner from "./runner";

const upload_dialog = document.getElementById("upload-dialog") as HTMLDialogElement;
const file_input = document.getElementById("file-input") as HTMLInputElement;
const file_name = document.getElementById("file-name") as HTMLInputElement;
const state_select = document.getElementById("init-state") as HTMLSelectElement;

/**
 * Opens the file uploader dialog.
 */
export const open_file_uploader = () => {
    file_input.value = "";
    upload_dialog.showModal();
}

/**
 * Reads the file input and uploads the content to the editor.
 */
const upload_file = () => {
    if (!file_input.files) {
        upload_dialog.close();
        return;
    }

    const file = file_input.files[0];
    if (!file) {
        upload_dialog.close();
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        if (e.target && e.target.result) {
            let content = e.target.result as string;

            // if there is an INIT statement, remove it but try set it as the init state
            // e.g. INIT qInit (newline) is qInit
            // would be better to parse properly but will work as a hack
            let read_init_state: string | null = null;
            const init_regex = /^INIT\s+(\w+)\s*\n/;
            const init_match = content.match(init_regex);
            if (init_match) {
                read_init_state = init_match[1];
                console.log(`Read init declaration: ${read_init_state}`);
                content = content.replace(init_regex, "");
            }

            // load the content into the editor
            editor.view.dispatch({
                changes: {from: 0, to: editor.view.state.doc.length, insert: content}
            });

            // parse now
            runner.parse(content);
            error_log.log_to_console();

            if (read_init_state) {
                // validate that the state read from the file is valid
                if (!state_select.querySelector(`option[value="${read_init_state}"]`)) {
                    error_log.add(`Initial state declared in uploaded file "${read_init_state}" is not defined in the program.`, "no-init");
                    state_select.value = "";
                } else {
                    state_select.value = read_init_state;
                }
            }

            // load file name into field, cutting off file extension
            file_name.value = file.name.replace(/\.[^/.]+$/, "");
        }

        upload_dialog.close();
    }

    // invoke
    reader.readAsText(file, "UTF-8");
}

/**
 * Downloads the current editor content as a file.<br>
 * An initial state must be selected before downloading
 */
export const download_file = () => {
    // TODO: more advanced dialog allowing file name, option to download just txt, dropdown for init state etc

    const init_state = state_select.value;
    if (init_state === "") {
        // TODO: switch to error_log.add?
        alert("Please select an initial state before downloading.");
        return;
    }

    // prepend INIT declaration to the content
    const content = `INIT ${init_state}\n\n` + editor.get_text();

    // create a blob url
    const blob = new Blob([content], {type: "text/plain"});
    const url = URL.createObjectURL(blob);

    // download via dom click
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file_name.value || "program"}.ture`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();

    editor.clear_dirty();
}


// bind file upload
file_input.addEventListener("change", upload_file);

// bind upload button
document.getElementById("upload-button")!.addEventListener("click", open_file_uploader);

// bind upload close button
document.getElementById("upload-cancel")!.addEventListener("click", () => {
    upload_dialog.close();
});

// bind download button
document.getElementById("download-button")!.addEventListener("click", download_file);
