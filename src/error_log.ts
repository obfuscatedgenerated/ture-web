import {ErrorListener, Token} from "antlr4";

import type TuringParser from "./grammar/TuringParser";

import * as editor from "./editor";

// singleton list of errors, with type (for filtered removal) and message
let errors: { type: string, message: string }[] = [];

const errors_textarea = document.getElementById("error-list") as HTMLTextAreaElement;
const errors_container = document.getElementById("errors-container") as HTMLDivElement;

/**
 * Returns the list of errors.
 */
export const get_list = () => {
    return errors;
}

/**
 * Returns the textarea element containing the errors, managed by the error log.
 */
export const get_textarea = () => {
    return errors_textarea;
}

/**
 * Adds an error to the error log.
 * @param message The error message to add
 * @param type The type of error
 */
export const add = (message: string, type: string) => {
    errors.push({type, message});
    errors_textarea.value += message + "\n";
    errors_container.classList.remove("hidden");
    errors_textarea.style.height = "auto"; // reset height to auto to recalculate
    errors_textarea.style.height = (errors_textarea.scrollHeight + 5) + "px";
}

/**
 * Clears the error log.<br>
 * This will remove all errors from the log and clear the textarea.
 */
export const clear = () => {
    errors = [];
    errors_textarea.value = "";
    errors_textarea.style.height = "auto"; // reset height to auto to recalculate
    errors_container.classList.add("hidden");
}

/**
 * Clears errors of a specific type from the log.<br>
 * This will remove all errors of the specified type from the log and clear the corresponding lines in the textarea.
 * @param type The type of error to clear
 */
export const clear_type = (type: string) => {
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

/**
 * Logs all errors in the list to the console.
 */
export const log_to_console = () => {
    for (const error of errors) {
        console.error(`${error.type}: ${error.message}`);
    }
}

/**
 * A custom ANTLR error listener that handles syntax errors and adds them to the error log.
 */
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

        // if the offending symbol is available, mark it in red and add a hover message
        if (offendingSymbol) {
            const decoration = editor.create_decoration_range(offendingSymbol.start, offendingSymbol.start + offendingSymbol.text.length, "cm-error");
            editor.apply_decoration_range(decoration);

            editor.add_hover_message(message, offendingSymbol.start, offendingSymbol.start + offendingSymbol.text.length, "cm-hover-msg error");
        }

        add(message, "syntax");
    }
}
