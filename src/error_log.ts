import {ErrorListener, Token} from "antlr4";

import type TuringParser from "./grammar/TuringParser";

import * as editor from "./editor";

let errors: { type: "syntax" | string, message: string }[] = [];
const errors_textarea = document.getElementById("errors") as HTMLTextAreaElement;
const errors_container = document.getElementById("errors-container") as HTMLDivElement;

export const get_list = () => {
    return errors;
}

export const get_textarea = () => {
    return errors_textarea;
}

export const add = (message: string, type: "syntax" | string) => {
    errors.push({type, message});
    errors_textarea.value += message + "\n";
    errors_container.classList.remove("hidden");
    errors_textarea.style.height = "auto"; // reset height to auto to recalculate
    errors_textarea.style.height = (errors_textarea.scrollHeight + 5) + "px";
}

export const clear = () => {
    errors = [];
    errors_textarea.value = "";
    errors_textarea.style.height = "auto"; // reset height to auto to recalculate
    errors_container.classList.add("hidden");
}

export const clear_type = (type: "syntax" | string) => {
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

export const log_to_console = () => {
    for (const error of errors) {
        console.error(`${error.type}: ${error.message}`);
    }
}

export class CustomErrorListener implements ErrorListener<any> {
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
            const decoration = editor.create_decoration_range(offendingSymbol.start, offendingSymbol.start + offendingSymbol.text.length, "cm-error");
            editor.apply_decoration_range(decoration);

            editor.add_hover_message(message, offendingSymbol.start, offendingSymbol.start + offendingSymbol.text.length, "cm-hover-msg error");
        }

        add(message, "syntax");
    }
}
