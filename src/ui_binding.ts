import * as error_log from "./error_log";
import * as editor from "./editor";
import * as runner from "./runner";

import {EMPTY} from "./TuringExecutor";
import {documents, hide_document, show_document} from "./documents";

const state_select = document.getElementById("init-state") as HTMLSelectElement;
const tape_input_dom = document.getElementById("input") as HTMLInputElement;

// parse on change to highlight errors
editor.add_update_listener((view) => {
    runner.parse(editor.get_text());
    error_log.log_to_console();
}, ["edit"]);

// bind run
document.getElementById("run")!.addEventListener("click", () => {
    const input = editor.get_text();
    runner.run(input);
});

// bind run step
// TODO: split run_step logic into prepare and execute step rather than call same function
document.getElementById("run-step")!.addEventListener("click", runner.run_step);
document.getElementById("next-step")!.addEventListener("click", runner.run_step);

// bind run remaining steps
document.getElementById("run-remaining")!.addEventListener("click", runner.run_remaining_steps);

// bind cancel step
document.getElementById("cancel-step")!.addEventListener("click", runner.cancel_steps);

// bind copy empty
const copy_empty = document.getElementById("copy-empty") as HTMLButtonElement;
const copy_empty_content = copy_empty.innerHTML;
copy_empty.addEventListener("click", () => {
    navigator.clipboard.writeText(EMPTY).then(() => {
        copy_empty.innerText = "Copied!";
        setTimeout(() => {
            copy_empty.innerHTML = copy_empty_content;
        }, 2000);
    });
});

// bind state select change
state_select.addEventListener("change", () => {
    error_log.clear_type("no-init");
    state_select.setCustomValidity("");
});

// bind tape input change
tape_input_dom.addEventListener("keydown", () => {
    error_log.clear_type("warn-no-tape");
});

// bind help link
document.getElementById("help-link")!.addEventListener("click", (e) => {
    e.preventDefault();
    show_document("README", documents.readme);
});

// bind examples link
document.getElementById("examples-link")!.addEventListener("click", (e) => {
    e.preventDefault();
    show_document("Examples", documents.examples);
});

// bind teachers link
document.getElementById("teachers-link")!.addEventListener("click", (e) => {
    e.preventDefault();
    show_document("Teachers", documents.teachers);
});

// bind help close button
document.getElementById("document-close")!.addEventListener("click", hide_document);
