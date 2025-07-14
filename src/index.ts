import "./style.css";

import {CharStream, CommonTokenStream, ErrorListener, Token} from "antlr4";
import TuringLexer from "./grammar/TuringLexer";
import TuringParser, {ProgramContext} from "./grammar/TuringParser";
import TuringExecutor, {EMPTY} from "./TuringExecutor";

import {
    create_editor,
    create_decoration_range,
    apply_decoration_range,
    add_hover_message,
    add_update_listener, remove_all_decorations, remove_all_hover_messages
} from "./editor";
import {EditorView} from "@codemirror/view";
import TuringStateNameVisitor from "./TuringStateNameVisitor";

let editor: EditorView;

let errors: {type: "syntax" | string, message: string}[] = [];
let errors_textarea: HTMLTextAreaElement;

let state_select: HTMLSelectElement;
let states_options: HTMLDivElement;

let tape_input: HTMLInputElement;

let upload_dialog: HTMLDialogElement;
let file_input: HTMLInputElement;

const add_error = (message: string, type: "syntax" | string) => {
    errors.push({type, message});
    errors_textarea.value += message + "\n";
    errors_textarea.style.height = "auto"; // reset height to auto to recalculate
    errors_textarea.style.height = (errors_textarea.scrollHeight + 5) + "px";
}

const clear_errors = () => {
    errors = [];
    errors_textarea.value = "";
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
        for (const error of errors) {
            console.error(error);
        }

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
        return;
    }

    exec.set_state(init_state);

    const in_tape = tape_input.value;

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
        tape_input.value = tape;
    } catch (e: any) {
        console.error(e);
        add_error("Execution error: " + e.message, "exec");
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

            if (errors.length > 0) {
                for (const error of errors) {
                    console.error(error);
                }
            }

            if (read_init_state) {
                // validate that the state read from the file is valid
                if (!state_select.querySelector(`option[value="${read_init_state}"]`)) {
                    add_error(`Initial state declared in uploaded file "${read_init_state}" is not defined in the program.`, "no-init");
                } else {
                    state_select.value = read_init_state;
                }
            }
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
    a.download = "program.ture";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
}

document.addEventListener("DOMContentLoaded", () => {
    errors_textarea = document.getElementById("errors") as HTMLTextAreaElement;
    state_select = document.getElementById("init-state") as HTMLSelectElement;
    states_options = document.getElementById("states") as HTMLDivElement;
    tape_input = document.getElementById("input") as HTMLInputElement;
    upload_dialog = document.getElementById("upload-dialog") as HTMLDialogElement;
    file_input = document.getElementById("file-input") as HTMLInputElement;

    editor = create_editor();

    // bind run
    document.getElementById("run")!.addEventListener("click", () => {
        const input = editor.state.doc.toString();
        run(input);
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
       clear_errors_of_type("no-init")
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

    if (errors.length > 0) {
        for (const error of errors) {
            console.error(error);
        }
    }

    // parse on change to highlight errors
    add_update_listener(editor, (view) => {
        parse(editor.state.doc.toString());

        if (errors.length > 0) {
            for (const error of errors) {
                console.error(error);
            }
        }
    });
});

