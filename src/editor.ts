import { basicSetup } from "codemirror";
import { EditorView, Decoration, hoverTooltip, DecorationSet } from "@codemirror/view";
import {
    RangeSetBuilder,
    Range,
    StateEffect,
    StateField,
    Extension
} from "@codemirror/state";

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

// chatgpt ended up rewriting this
// the way codemirror handles extensions is terrible
// just let me add and remove stuff independently without having to retain references everywhere i beg

const setDecorationsEffect = StateEffect.define<DecorationSet>();
const clearDecorationsEffect = StateEffect.define<void>();

const decorationsField = StateField.define<DecorationSet>({
    create: () => Decoration.none,
    update: (value, tr) => {
        for (let e of tr.effects) {
            if (e.is(setDecorationsEffect)) return e.value;
            if (e.is(clearDecorationsEffect)) return Decoration.none;
        }
        return value.map(tr.changes);
    },
    provide: f => EditorView.decorations.from(f)
});

export const create_editor = () => {
    return new EditorView({
        doc: DEFAULT,
        parent: document.body,
        extensions: [basicSetup, decorationsField]
    });
}

export const create_decoration_range = (
    start: number,
    end: number,
    class_name = "cm-error"
): Range<Decoration> => {
    return Decoration.mark({ class: class_name }).range(start, end);
}

const active_decorations: Map<number, Range<Decoration>> = new Map();
let decoration_id_counter = 0;

export const apply_decoration_range = (
    view: EditorView,
    decoration: Range<Decoration>,
) => {
    let id = ++decoration_id_counter;
    active_decorations.set(id, decoration);

    const builder = new RangeSetBuilder<Decoration>();
    for (const deco of active_decorations.values()) {
        builder.add(deco.from, deco.to, deco.value);
    }

    const decorations = builder.finish();
    view.dispatch({
        effects: setDecorationsEffect.of(decorations)
    });

    return id;
}

export const remove_all_decorations = (view: EditorView) => {
    active_decorations.clear();

    view.dispatch({
        effects: clearDecorationsEffect.of()
    });
}

export const remove_decoration_by_id = (view: EditorView, id: number) => {
    active_decorations.delete(id);

    const builder = new RangeSetBuilder<Decoration>();
    for (const deco of active_decorations.values()) {
        builder.add(deco.from, deco.to, deco.value);
    }

    const decorations = builder.finish();
    view.dispatch({
        effects: setDecorationsEffect.of(decorations)
    });
}

let hover_extensions: Map<number, Extension> = new Map();
let hover_id_counter = 0;

const MessageHover = (start: number, end: number, message: string) => {
    return hoverTooltip((view, hoverPos) => {
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

// ** GLOBAL listener extension reference **
let update_listener_extension: Extension | null = null;

export const add_hover_message = (
    view: EditorView,
    message: string,
    start: number,
    end: number
) => {
    const hover = MessageHover(start, end, message);

    let id = ++hover_id_counter;
    hover_extensions.set(id, hover);

    view.dispatch({
        effects: StateEffect.reconfigure.of([
            basicSetup,
            decorationsField,
            ...hover_extensions.values(),
            ...(update_listener_extension ? [update_listener_extension] : [])
        ])
    });

    return id;
}

export const remove_hover_message_by_id = (view: EditorView, id: number) => {
    hover_extensions.delete(id);

    const remaining = Array.from(hover_extensions.values());

    view.dispatch({
        effects: StateEffect.reconfigure.of([
            basicSetup,
            decorationsField,
            ...remaining,
            ...(update_listener_extension ? [update_listener_extension] : [])
        ])
    });
}

export const remove_all_hover_messages = (view: EditorView) => {
    hover_extensions.clear();

    view.dispatch({
        effects: StateEffect.reconfigure.of([
            basicSetup,
            decorationsField,
            ...(update_listener_extension ? [update_listener_extension] : [])
        ])
    });
}

export const add_update_listener = (view: EditorView, callback: (view: EditorView) => void) => {
    // Remove old listener by reconfiguring without it
    if (update_listener_extension) {
        view.dispatch({
            effects: StateEffect.reconfigure.of([
                basicSetup,
                decorationsField,
                ...hover_extensions.values()
            ])
        });
        update_listener_extension = null;
    }

    update_listener_extension = EditorView.updateListener.of((update) => {
        if (update.docChanged || update.selectionSet) {
            callback(view);
        }
    });

    view.dispatch({
        effects: StateEffect.reconfigure.of([
            basicSetup,
            decorationsField,
            ...hover_extensions.values(),
            update_listener_extension
        ])
    });
}
