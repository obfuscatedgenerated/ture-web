import "./style.css";

import {CharStream, CommonTokenStream, ErrorListener, Token} from "antlr4";
import TuringLexer from "./grammar/TuringLexer";
import TuringParser, {ProgramContext} from "./grammar/TuringParser";
import TuringExecutor, {EMPTY, ExecResultStatus, StepIterator} from "./TuringExecutor";

import {
    add_hover_message,
    add_update_listener,
    apply_decoration_range,
    create_decoration_range,
    create_editor, highlight_line,
    remove_all_decorations,
    remove_all_hover_messages, remove_decoration_by_id
} from "./editor";
import {EditorView} from "@codemirror/view";
import TuringStateNameVisitor from "./TuringStateNameVisitor";

import {setup as setup_tape_input, TapeInputFunctions} from "./tape_input";

let editor: EditorView;

let errors: {type: "syntax" | string, message: string}[] = [];
let errors_textarea: HTMLTextAreaElement;
let errors_container: HTMLDivElement;

let state_select: HTMLSelectElement;
let states_options: HTMLDivElement;

let tape_input: HTMLInputElement;

let upload_dialog: HTMLDialogElement;
let file_input: HTMLInputElement;
let file_name: HTMLInputElement;

let step_state: HTMLSpanElement;

let tape_fns: TapeInputFunctions;

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
        recognizer: unknown,
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
        add_error("Parse error: " + e.message, "parse");
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
let highlight_line_id: number | undefined;
const run_step = () => {
    // if step_iterator is null, parse the input and create a new iterator
    if (!step_iterator) {
        const input = editor.state.doc.toString();
        const tree = parse(input);

        if (errors.length > 0) {
            log_errors();
            errors_textarea.scrollIntoView({behavior: "smooth", block: "end"});
            return;
        }

        const exec = new TuringExecutor();
        tree.accept(exec);

        const init_state = state_select.value;
        if (init_state === "") {
            add_error("Please select an initial state.", "no-init");
            state_select.setCustomValidity("Please select an initial state.");
            return;
        }

        exec.set_state(init_state);
        step_iterator = exec.get_step_iterator(tape_input.value);

        console.log("Prepared new step iterator.")

        // hide run button and show stepper controls
        document.getElementById("run")!.classList.add("hidden");
        document.getElementById("stepper-controls")!.classList.remove("hidden");

        // set initial positions
        tape_fns.mark_pointer(0);
        step_state.innerText = init_state;

        // TODO: lock form elements
        // TODO: bind cancel button
        // TODO: better ux

        return;
    }

    // if step_iterator is not null, execute the next step
    if (step_iterator) {
        try {
            const res = step_iterator.next();
            if (res.status === ExecResultStatus.Halt) {
                console.log("Execution finished.");
                step_iterator = null; // reset iterator

                document.getElementById("run")!.classList.remove("hidden");
                document.getElementById("stepper-controls")!.classList.add("hidden");

                tape_fns.mark_pointer(null);

                if (highlight_line_id) {
                    remove_decoration_by_id(editor, highlight_line_id);
                }
            } else {
                console.log(`Tape: ${res.value}, Position: ${res.pos}, State: ${res.state} (Line: ${res.line_num})`);

                tape_fns.set_value(res.value);
                tape_fns.mark_pointer(res.pos);

                if (highlight_line_id) {
                    remove_decoration_by_id(editor, highlight_line_id);
                }

                if (res.line_num) {
                    highlight_line_id = highlight_line(editor, res.line_num);
                }

                step_state.innerText = res.state;
            }
        } catch (e: any) {
            console.error(e);
            add_error("Execution error: " + e.message, "exec");
            step_iterator = null; // reset iterator on error

            document.getElementById("run")!.classList.remove("hidden");
            document.getElementById("stepper-controls")!.classList.add("hidden");

            tape_fns.mark_pointer(null);

            if (highlight_line_id) {
                remove_decoration_by_id(editor, highlight_line_id);
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

document.addEventListener("DOMContentLoaded", () => {
    // frequent dom elements
    errors_textarea = document.getElementById("errors") as HTMLTextAreaElement;
    errors_container = document.getElementById("errors-container") as HTMLDivElement;
    state_select = document.getElementById("init-state") as HTMLSelectElement;
    states_options = document.getElementById("states") as HTMLDivElement;
    tape_input = document.getElementById("input") as HTMLInputElement;
    upload_dialog = document.getElementById("upload-dialog") as HTMLDialogElement;
    file_input = document.getElementById("file-input") as HTMLInputElement;
    file_name = document.getElementById("file-name") as HTMLInputElement;
    step_state = document.getElementById("step-state") as HTMLSpanElement;

    editor = create_editor();

    // bind run
    document.getElementById("run")!.addEventListener("click", () => {
        const input = editor.state.doc.toString();
        run(input);
    });

    // bind run step
    document.getElementById("run-step")!.addEventListener("click", () => {
        run_step();
    });

    // bind copy empty
    const copy_empty = document.getElementById("copy-empty") as HTMLButtonElement;
    copy_empty.addEventListener("click", () => {
        navigator.clipboard.writeText(EMPTY).then(() => {
            copy_empty.innerText = "Copied!";
            setTimeout(() => {
                copy_empty.innerText = "Copy empty letter";
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
    file_input.addEventListener("change", () => {
        upload_file();
    });

    // bind upload button
    document.getElementById("upload-button")!.addEventListener("click", () => {
        open_file_uploader();
    });

    // bind upload close button
    document.getElementById("upload-cancel")!.addEventListener("click", () => {
        upload_dialog.close();
    });

    // bind download button
    document.getElementById("download-button")!.addEventListener("click", () => {
        download_file();
    });

    // parse default value
    parse(editor.state.doc.toString());
    log_errors();

    // parse on change to highlight errors
    add_update_listener(editor, (view) => {
        parse(editor.state.doc.toString());
        log_errors();
    });

    // TODO: this sucks
    tape_fns = setup_tape_input(tape_input, document.getElementById("tape-visual") as HTMLDivElement);
});
