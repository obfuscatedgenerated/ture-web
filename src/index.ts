import "./style.css";

import {CharStream, CommonTokenStream, ErrorListener, Token} from "antlr4";
import TuringLexer from "./grammar/TuringLexer";
import TuringParser from "./grammar/TuringParser";
import TuringExecutor from "./TuringExecutor";

import {create_editor, create_decoration_range, apply_decoration_range, add_hover_message} from "./editor";
import {EditorView} from "@codemirror/view";

let editor: EditorView;

document.addEventListener("DOMContentLoaded", () => {
    editor = create_editor();
});

class ThrowingErrorListener implements ErrorListener<any> {
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

            // TODO: clear decorations on change
        }

        throw new Error(message);
    }
}

const run = (input: string) => {
    const chars = new CharStream(input);
    const lexer = new TuringLexer(chars);
    const tokens = new CommonTokenStream(lexer);

    const parser = new TuringParser(tokens);
    parser.removeErrorListeners();
    parser.addErrorListener(new ThrowingErrorListener());

    const tree = parser.program();
    console.log(tree.toStringTree(parser.ruleNames, parser));

    tree.accept(new TuringExecutor());
}

// bind run
document.getElementById("run")!.addEventListener("click", () => {
    const input = editor.state.doc.toString();
    try {
        run(input);
    } catch (error: any) {
        console.error(error);
    }
});
