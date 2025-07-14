import "./style.css";

import {CharStream, CommonTokenStream, ErrorListener, Token} from "antlr4";
import TuringLexer from "./grammar/TuringLexer";
import TuringParser, {ProgramContext} from "./grammar/TuringParser";
import TuringExecutor from "./TuringExecutor";

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

let errors: string[] = [];
let errors_textarea: HTMLTextAreaElement;

let state_select: HTMLSelectElement;
let states_options: HTMLDivElement;

const add_error = (message: string) => {
    errors.push(message);
    errors_textarea.value += message + "\n";
    errors_textarea.style.height = "auto"; // reset height to auto to recalculate
    errors_textarea.style.height = (errors_textarea.scrollHeight + 5) + "px";
}

const clear_errors = () => {
    errors = [];
    errors_textarea.value = "";
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

        add_error(message);
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
    if (!names.includes(existing_state)) {
        state_select.value = "";
    }
}

const parse = (input: string): ProgramContext => {
    clear_errors();

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
    const tree = parse(input);

    if (errors.length > 0) {
        for (const error of errors) {
            console.error(error);
        }

        return;
    }

    tree.accept(new TuringExecutor());
}

document.addEventListener("DOMContentLoaded", () => {
    errors_textarea = document.getElementById("errors") as HTMLTextAreaElement;
    state_select = document.getElementById("init-state") as HTMLSelectElement;
    states_options = document.getElementById("states") as HTMLDivElement;

    editor = create_editor();

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

// bind run
document.getElementById("run")!.addEventListener("click", () => {
    const input = editor.state.doc.toString();
    run(input);
});
