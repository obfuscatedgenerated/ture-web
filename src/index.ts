import "./style.css";

import * as editor from "./editor";
import * as error_log from "./error_log";
import * as runner from "./runner";
import * as sharing from "./sharing";

import "./ui_binding";
import "./keybinds";

declare var __COMMIT_DETAILS__: string;

console.log(__COMMIT_DETAILS__);
document.getElementById("commit-details")!.innerText = __COMMIT_DETAILS__;

const from_url = sharing.load_from_url();

// parse default value immediately
runner.parse(editor.get_text());
error_log.log_to_console();

sharing.finish_load_from_url(from_url);

// listen for navigating away from the page
window.addEventListener("beforeunload", (e) => {
    if (editor.is_dirty()) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
    }
});

// on mac, replace Ctrl with Cmd in the kbd elements
document.querySelectorAll(".mac-cmd").forEach((el) => {
    if (navigator.platform.startsWith("Mac")) {
        el.textContent = "⌘";
    }
});

// update document title to reflect the file name
const file_name = document.getElementById("file-name") as HTMLInputElement;

const update_title = () => {
    let title = "Ture";

    if (file_name.value) {
        title = `${file_name.value} - ${title}`;
    }

    if (editor.is_dirty()) {
        title = `(*) ${title}`;
    }

    document.title = title;
}

file_name.addEventListener("input", update_title);
editor.add_dirty_change_listener(update_title);
update_title();
