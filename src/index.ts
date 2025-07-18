import "./style.css";

import * as editor from "./editor";
import * as error_log from "./error_log";
import * as sharing from "./sharing";
import * as runner from "./runner";

import "./ui_binding";
import "./keybinds";

declare var __COMMIT_DETAILS__: string;

console.log(__COMMIT_DETAILS__);
document.getElementById("commit-details")!.innerText = __COMMIT_DETAILS__;

const state_select = document.getElementById("init-state") as HTMLSelectElement;

// load from url params
const from_url = sharing.load_from_url();

// parse default value immediately
runner.parse(editor.get_text());
error_log.log_to_console();

if (from_url.init) {
    // check init state from url
    if (!state_select.querySelector(`option[value="${from_url.init.value}"]`)) {
        error_log.add(`Initial state declared in URL "${from_url.init.value}" is not defined in the program.`, "no-init");
        state_select.value = "";
    } else {
        state_select.value = from_url.init.value;
    }
}

// listen for navigating away from the page
window.addEventListener("beforeunload", (e) => {
    // TODO: proper dirty flag
    if (editor.get_text() !== editor.DEFAULT_DOC) {
        // if the document is not the default, warn the user
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
