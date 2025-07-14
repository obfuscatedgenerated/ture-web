import {basicSetup} from "codemirror";
import {EditorView, Decoration, hoverTooltip} from "@codemirror/view";
import {RangeSetBuilder, Range, StateEffect, Extension} from "@codemirror/state";

const DEFAULT = `% Store the first letter in the word as a state
(qInit, a) -> (qA, a, right)
(qInit, b) -> (qB, b, right)

% Move to the end of the tape
(qA, a) -> (qA, a, right)
(qA, b) -> (qA, b, right)
(qB, a) -> (qB, a, right)
(qB, b) -> (qB, b, right)

% Backtrack once when we reach the end of the tape
(qA, ⬚) -> (qEndA, ⬚, left)
(qB, ⬚) -> (qEndB, ⬚, left)

% Replace the last letter with the first letter and enter the trap state
(qEndA, a) -> (qHalt, a, right)
(qEndA, b) -> (qHalt, a, right)
(qEndB, a) -> (qHalt, b, right)
(qEndB, b) -> (qHalt, b, right)`;

export const create_editor = () => {
    return new EditorView({
        doc: DEFAULT,
        parent: document.body,
        extensions: [basicSetup]
    });
}

export const create_decoration_range = (start: number, end: number, class_name = "cm-error") => {
    return Decoration.mark({
        class: class_name
    }).range(start, end);
}

export const apply_decoration_range = (view: EditorView, decoration: Range<Decoration>) => {
    const builder = new RangeSetBuilder<Decoration>();
    builder.add(decoration.from, decoration.to, decoration.value);
    const decorations = builder.finish();

    view.dispatch({
        effects: StateEffect.appendConfig.of([EditorView.decorations.of(decorations)])
    });
}

const MessageHover = (start: number, end: number, message: string) => {
    return hoverTooltip((view, hoverPos, side) => {
        if (hoverPos < start || hoverPos >= end) return null;

        return {
            pos: start,
            end: end,
            above: true,
            create(view) {
                const dom = document.createElement("div");
                dom.classList.add("hover-msg");
                dom.innerText = message;
                return { dom };
            }
        };
    });
}

export const add_hover_message = (view: EditorView, message: string, start: number, end: number) => {
    view.dispatch({
        effects: StateEffect.appendConfig.of([MessageHover(start, end, message)])
    });
}

export const add_update_listener = (view: EditorView, callback: (view: EditorView) => void) => {
    const listener = EditorView.updateListener.of((update) => {
        if (update.docChanged || update.selectionSet) {
            callback(view);
        }
    });

    view.dispatch({
        effects: StateEffect.appendConfig.of([listener])
    });
}

