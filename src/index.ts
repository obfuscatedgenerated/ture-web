import "./style.css";


// @ts-expect-error
import readme_html from "../README.md";

import {CharStream, CommonTokenStream, ErrorListener, Token} from "antlr4";

import TuringLexer from "./grammar/TuringLexer";
import TuringParser, {ProgramContext} from "./grammar/TuringParser";
import TuringExecutor, {EMPTY, ExecResultStatus, StepIterator} from "./TuringExecutor";
import TuringStateNameVisitor from "./TuringStateNameVisitor";

import {setup as setup_tape_input} from "./tape_input";

import {
    add_hover_message,
    add_update_listener,
    apply_decoration_range, create_and_apply_decoration_range,
    create_decoration_range,
    create_editor, highlight_line,
    remove_all_decorations,
    remove_all_hover_messages, remove_decoration_by_id
} from "./editor";

import {compressToEncodedURIComponent, decompressFromEncodedURIComponent} from "lz-string";
import {TuringErrorStrategy} from "./TuringErrorStrategy";

const editor = create_editor();

let errors: { type: "syntax" | string, message: string }[] = [];
const errors_textarea = document.getElementById("errors") as HTMLTextAreaElement;
const errors_container = document.getElementById("errors-container") as HTMLDivElement;

const state_select = document.getElementById("init-state") as HTMLSelectElement;
const states_options = document.getElementById("states") as HTMLOptGroupElement;

const tape_input = document.getElementById("input") as HTMLInputElement;
const tape_visual = document.getElementById("tape-visual") as HTMLDivElement;

const tape_fns = setup_tape_input(tape_input, tape_visual);

const upload_dialog = document.getElementById("upload-dialog") as HTMLDialogElement;
const file_input = document.getElementById("file-input") as HTMLInputElement;
const file_name = document.getElementById("file-name") as HTMLInputElement;

const step_state = document.getElementById("step-state") as HTMLSpanElement;
const step_number = document.getElementById("step-number") as HTMLSpanElement;

const readme_dialog = document.getElementById("readme-dialog") as HTMLDialogElement;
readme_dialog.querySelector("#readme-content")!.innerHTML = readme_html;

const add_error = (message: string, type: "syntax" | string) => {
    errors.push({type, message});
    errors_textarea.value += message + "\n";
    errors_container.classList.remove("hidden");
    errors_textarea.style.height = "auto"; // reset height to auto to recalculate
    errors_textarea.style.height = (errors_textarea.scrollHeight + 5) + "px";
}

const clear_errors = () => {
    errors = [];
    errors_textarea.value = "";
    errors_textarea.style.height = "auto"; // reset height to auto to recalculate
    errors_container.classList.add("hidden");
}

const clear_errors_of_type = (type: "syntax" | string) => {
    for (let i = 0; i < errors.length; i++) {
        if (errors[i].type === type) {
            errors.splice(i, 1);

            // remove that line of textarea
            const lines = errors_textarea.value.split("\n");
            lines.splice(i, 1);
            errors_textarea.value = lines.join("\n");

            i--; // adjust index after removal
        }
    }

    errors_textarea.style.height = "auto";
    errors_textarea.style.height = (errors_textarea.scrollHeight + 5) + "px";

    if (errors.length === 0) {
        errors_container.classList.add("hidden");
    }
}

const log_errors = () => {
    for (const error of errors) {
        console.error(`${error.type}: ${error.message}`);
    }
}

class CustomErrorListener implements ErrorListener<any> {
    syntaxError(
        recognizer: TuringParser,
        offendingSymbol: Token | null,
        line: number,
        charPositionInLine: number,
        msg: string,
        e: Error | undefined
    ): void {
        let message = `Syntax error at line ${line}, column ${charPositionInLine}: ${msg}`;

        if (offendingSymbol) {
            const decoration = create_decoration_range(offendingSymbol.start, offendingSymbol.start + offendingSymbol.text.length, "cm-error");
            apply_decoration_range(editor, decoration);

            add_hover_message(editor, message, offendingSymbol.start, offendingSymbol.start + offendingSymbol.text.length);
        }

        add_error(message, "syntax");
    }
}

const set_state_names = (names: string[]) => {
    let existing_state = state_select.value;

    states_options.innerHTML = "";

    for (const name of names) {
        const option = document.createElement("option");
        option.value = name;
        option.innerText = name;
        states_options.appendChild(option);
    }

    // check if existing state is still valid
    if (names.includes(existing_state)) {
        state_select.value = existing_state;
    } else {
        state_select.value = "";
    }
}

const parse = (input: string): ProgramContext => {
    clear_errors_of_type("syntax");

    remove_all_decorations(editor);
    remove_all_hover_messages(editor);

    const chars = new CharStream(input);
    const lexer = new TuringLexer(chars);
    const tokens = new CommonTokenStream(lexer);

    const parser = new TuringParser(tokens);
    parser.removeErrorListeners();
    parser.addErrorListener(new CustomErrorListener());
    parser._errHandler = new TuringErrorStrategy();

    const tree = parser.program();
    //console.log(tree.toStringTree(parser.ruleNames, parser));

    // collect state names and add to select box
    const collector = new TuringStateNameVisitor();
    tree.accept(collector);
    set_state_names(collector.state_names);

    return tree;
}

const run = (input: string) => {
    clear_errors();
    const tree = parse(input);

    if (errors.length > 0) {
        log_errors();
        errors_textarea.scrollIntoView({behavior: "smooth", block: "end"});
        return;
    }

    const exec = new TuringExecutor();
    try {
        tree.accept(exec);
    } catch (e: any) {
        console.error(e);
        add_error("Validation error: " + e.message, "validation");
        errors_textarea.scrollIntoView({behavior: "smooth", block: "end"});
        return;
    }

    const init_state = state_select.value;
    if (init_state === "") {
        add_error("Please select an initial state.", "no-init");
        state_select.setCustomValidity("Please select an initial state.");
        return;
    }

    exec.set_state(init_state);

    const in_tape = tape_input.value;
    console.log(`Running Turing machine with initial state "${init_state}" and tape input "${in_tape}"`);

    if (in_tape === "" || in_tape === EMPTY.repeat(in_tape.length)) {
        add_error("Warning: tape input is empty. This may be a mistake.", "warn-no-tape");
    }

    try {
        let tape = exec.execute(in_tape);
        console.log(tape);

        // trim trailing empties by finding first non empty character from the end
        let last_non_empty = tape.length;
        for (let i = tape.length - 1; i >= 0; i--) {
            if (tape[i] !== EMPTY) {
                last_non_empty = i + 1;
                break;
            }
        }

        tape = tape.substring(0, last_non_empty);

        // TODO: is this annoying? is a separate field better for output? maybe a visualisation of the pointer step by step too
        tape_fns.set_value(tape);
    } catch (e: any) {
        console.error(e);
        add_error("Execution error: " + e.message, "exec");
    }
}

let step_iterator: StepIterator | null = null;
let step_idx = 0;
let step_highlight_id: number | undefined;
const run_step = () => {
    // if step_iterator is null, parse the input and create a new iterator
    if (!step_iterator) {
        clear_errors();

        const input = editor.state.doc.toString();
        const tree = parse(input);

        if (errors.length > 0) {
            log_errors();
            errors_textarea.scrollIntoView({behavior: "smooth", block: "end"});
            return;
        }

        const exec = new TuringExecutor();
        try {
            tree.accept(exec);
        } catch (e: any) {
            console.error(e);
            add_error("Validation error: " + e.message, "validation");
            errors_textarea.scrollIntoView({behavior: "smooth", block: "end"});
            return;
        }

        const init_state = state_select.value;
        if (init_state === "") {
            add_error("Please select an initial state.", "no-init");
            state_select.setCustomValidity("Please select an initial state.");
            return;
        }

        exec.set_state(init_state);
        step_iterator = exec.get_step_iterator(tape_input.value);
        step_idx = 0;

        console.log("Prepared new step iterator.")

        // hide run button and show stepper controls
        document.getElementById("run")!.classList.add("hidden");
        document.getElementById("stepper-controls")!.classList.remove("hidden");
        document.getElementById("run-step")!.classList.add("hidden");

        // set initial positions
        tape_fns.mark_pointer(0);
        step_state.innerText = init_state;
        step_number.innerText = "1";

        // TODO: lock form elements
        // TODO: bind cancel button
        // TODO: better ux

        return;
    }

    // if step_iterator is not null, execute the next step
    if (step_iterator) {
        try {
            step_number.innerText = `${++step_idx}`;

            const res = step_iterator.next();
            if (res.status === ExecResultStatus.Halt) {
                console.log("Execution finished.");
                step_iterator = null; // reset iterator

                document.getElementById("run")!.classList.remove("hidden");
                document.getElementById("stepper-controls")!.classList.add("hidden");
                document.getElementById("run-step")!.classList.remove("hidden");

                tape_fns.mark_pointer(null);

                if (step_highlight_id) {
                    remove_decoration_by_id(editor, step_highlight_id);
                }
            } else {
                console.log(`Tape: ${res.value}, Position: ${res.pos}, State: ${res.state} (Text range: ${res.text_range?.start} - ${res.text_range?.end})`);

                tape_fns.set_value(res.value);
                tape_fns.mark_pointer(res.pos);

                if (step_highlight_id) {
                    remove_decoration_by_id(editor, step_highlight_id);
                }

                if (res.text_range) {
                    step_highlight_id = create_and_apply_decoration_range(editor, res.text_range.start, res.text_range.end, "cm-highlight");
                }

                step_state.innerText = res.state;
            }
        } catch (e: any) {
            console.error(e);
            add_error("Execution error: " + e.message, "exec");
            step_iterator = null; // reset iterator on error

            document.getElementById("run")!.classList.remove("hidden");
            document.getElementById("stepper-controls")!.classList.add("hidden");
            document.getElementById("run-step")!.classList.remove("hidden");

            tape_fns.mark_pointer(null);

            if (step_highlight_id) {
                remove_decoration_by_id(editor, step_highlight_id);
            }
        }
    }
}

const open_file_uploader = () => {
    file_input.value = "";
    upload_dialog.showModal();
}

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

            editor.dispatch({
                changes: {from: 0, to: editor.state.doc.length, insert: content}
            });

            parse(content);
            log_errors();

            if (read_init_state) {
                // validate that the state read from the file is valid
                if (!state_select.querySelector(`option[value="${read_init_state}"]`)) {
                    add_error(`Initial state declared in uploaded file "${read_init_state}" is not defined in the program.`, "no-init");
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

    reader.readAsText(file, "UTF-8");
}

const download_file = () => {
    // TODO: more advanced dialog allowing file name, option to download just txt, dropdown for init state etc

    const init_state = state_select.value;
    if (init_state === "") {
        alert("Please select an initial state before downloading.");
        return;
    }

    const content = `INIT ${init_state}\n\n` + editor.state.doc.toString();
    const blob = new Blob([content], {type: "text/plain"});
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${file_name.value || "program"}.ture`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
}

const get_share_url = () => {
    // TODO: dialog to ask which properties to copy

    const comp = compressToEncodedURIComponent(editor.state.doc.toString());

    const url = new URL(window.location.href);
    url.hash = ""; // clear hash (sometimes set by readme viewers)

    url.searchParams.set("script", comp);

    if (file_name.value) {
        url.searchParams.set("name", file_name.value);
    }

    if (state_select.value) {
        url.searchParams.set("init", state_select.value);
    } else {
        url.searchParams.delete("init");
    }

    if (tape_input.value) {
        let tape = tape_input.value;

        // remove trailing empty characters from tape input
        // trim trailing empties by finding first non empty character from the end
        let last_non_empty = tape.length;
        for (let i = tape.length - 1; i >= 0; i--) {
            if (tape[i] !== EMPTY) {
                last_non_empty = i + 1;
                break;
            }
        }

        const trimmed = tape.substring(0, last_non_empty);
        url.searchParams.set("tape", trimmed);
    } else {
        url.searchParams.delete("tape");
    }

    return url.toString();
}

const load_from_url = () => {
    // TODO: support loading a file from a remote url

    const url = new URL(window.location.href);
    const script = url.searchParams.get("script");
    const init_state = url.searchParams.get("init");
    const tape = url.searchParams.get("tape");
    const name = url.searchParams.get("name");

    const loaded: {script?: string, init?: string, tape?: string, name?: string} = {};

    if (script) {
        const decompressed = decompressFromEncodedURIComponent(script);
        if (decompressed) {
            editor.dispatch({
                changes: {from: 0, to: editor.state.doc.length, insert: decompressed}
            });

            loaded.script = decompressed;
        } else {
            console.error("Failed to decompress script from URL.");
            add_error("Failed to decompress script from URL", "decompress");
        }
    }

    if (init_state) {
        // cant do anything for this since not parsed yet, so need to deal with it after
        loaded.init = init_state;
    }

    if (tape) {
        tape_input.value = tape;
        tape_fns.set_value(tape);
        loaded.tape = tape;
    }

    if (name) {
        file_name.value = name;
        loaded.name = name;
    }

    return loaded;
}

// load from url params
const from_url = load_from_url();

// parse default value immediately
parse(editor.state.doc.toString());
log_errors();

if (from_url.init) {
    // check init state from url
    if (!state_select.querySelector(`option[value="${from_url.init}"]`)) {
        add_error(`Initial state declared in URL "${from_url.init}" is not defined in the program.`, "no-init");
        state_select.value = "";
    } else {
        state_select.value = from_url.init;
    }
}

// parse on change to highlight errors
add_update_listener(editor, (view) => {
    parse(editor.state.doc.toString());
    log_errors();
}, ["edit"]);


// bind run
document.getElementById("run")!.addEventListener("click", () => {
    const input = editor.state.doc.toString();
    run(input);
});

// bind run step
// TODO: split run_step logic into prepare and execute step rather than call same function
document.getElementById("run-step")!.addEventListener("click", run_step);
document.getElementById("next-step")!.addEventListener("click", run_step);

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
    clear_errors_of_type("no-init");
    state_select.setCustomValidity("");
});

// bind tape input change
tape_input.addEventListener("keydown", () => {
    clear_errors_of_type("warn-no-tape");
});

// bind file upload
file_input.addEventListener("change", upload_file);

// bind upload button
document.getElementById("upload-button")!.addEventListener("click", open_file_uploader);

// bind upload close button
document.getElementById("upload-cancel")!.addEventListener("click", () => {
    upload_dialog.close();
});

// bind help link
document.getElementById("help-link")!.addEventListener("click", (e) => {
    e.preventDefault();
    readme_dialog.showModal();
});

// bind help close button
document.getElementById("readme-close")!.addEventListener("click", () => {
    readme_dialog.close();
});

// bind download button
document.getElementById("download-button")!.addEventListener("click", download_file);

// bind share button
const share_button = document.getElementById("share-button") as HTMLButtonElement;
const share_button_content = share_button.innerHTML;
share_button.addEventListener("click", () => {
    const share_url = get_share_url();

    navigator.clipboard.writeText(share_url).then(() => {
        share_button.innerText = "Copied!";
        setTimeout(() => {
            share_button.innerHTML = share_button_content;
        }, 2000);
    }).catch((err) => {
        console.error("Failed to copy share URL: ", err);
    });
});

// on mac, replace Ctrl with Cmd in the kbd elements
document.querySelectorAll(".mac-cmd").forEach((el) => {
    if (navigator.platform.startsWith("Mac")) {
        el.textContent = "⌘";
    }
});

const override_kbd_hiding = () => {
    // if the hide media query applies, inject an override !important rule to keep the kbd elements visible
    const media = window.matchMedia("(hover: none) and (pointer: coarse)");
    if (!media.matches) {
        return; // no override needed
    }

    const style = document.createElement("style");
    style.innerHTML = `
        kbd, .kbd-plus {
            display: inline-block !important;
        }
    `;
    document.head.appendChild(style);
}

// listen for keybinds
document.addEventListener("keydown", (e) => {
    const is_mac = navigator.platform.startsWith("Mac");
    const control_key = is_mac ? e.metaKey : e.ctrlKey;

    if (control_key && !e.altKey) {
        // download: Ctrl + S
        if (e.key === "s" || e.key === "S") {
            e.preventDefault();
            override_kbd_hiding();

            download_file();
            return;
        }

        // upload: Ctrl + O
        if (e.key === "o" || e.key === "O") {
            e.preventDefault();
            override_kbd_hiding();

            open_file_uploader();
            return;
        }
    }

    if (!control_key && e.altKey) {
        // copy empty: Alt + E
        if (e.key === "e" || e.key === "E") {
            e.preventDefault();
            override_kbd_hiding();

            navigator.clipboard.writeText(EMPTY).then(() => {
                copy_empty.innerText = "Copied!";
                setTimeout(() => {
                    copy_empty.innerHTML = copy_empty_content;
                }, 2000);
            });
            return;
        }
    }

    if (control_key && e.altKey) {
        // share: Ctrl + Alt + S
        if (e.key === "s" || e.key === "S") {
            e.preventDefault();
            override_kbd_hiding();

            const share_url = get_share_url();
            navigator.clipboard.writeText(share_url).then(() => {
                share_button.innerText = "Copied!";
                setTimeout(() => {
                    share_button.innerHTML = share_button_content;
                }, 2000);
            }).catch((err) => {
                console.error("Failed to copy share URL: ", err);
            });
            return;
        }
    }

    // run: F8
    if (e.key === "F8") {
        e.preventDefault();
        override_kbd_hiding();

        const input = editor.state.doc.toString();
        run(input);
        return;
    }

    // run step: F9
    if (e.key === "F9") {
        e.preventDefault();
        override_kbd_hiding();

        run_step();
        return;
    }

    // cancel: Esc
    if (e.key === "Escape") {
        e.preventDefault();
        override_kbd_hiding();

        // TODO
    }
});

// TODO: split this file up
// TODO: improve validation error ux when editing file (would help if they had a line to blame)
