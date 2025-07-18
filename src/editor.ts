import { basicSetup } from "codemirror";
import { EditorView, Decoration, hoverTooltip, DecorationSet } from "@codemirror/view";
import {
    RangeSetBuilder,
    Range,
    StateEffect,
    StateField,
    Extension
} from "@codemirror/state";

export const DEFAULT_DOC = `% Write your transition rules here!`;

// chatgpt ended up rewriting this
// the way codemirror handles extensions is terrible
// just let me add and remove stuff independently without having to retain references everywhere i beg

const setDecorationsEffect = StateEffect.define<DecorationSet>();
const clearDecorationsEffect = StateEffect.define<void>();

const decorationsField = StateField.define<DecorationSet>({
    create: () => Decoration.none,
    update: (value, tr) => {
        for (let e of tr.effects) {
            if (e.is(setDecorationsEffect)) {
                // Ensure decorations are mapped to new document after changes
                return e.value.map(tr.changes);
            }
            if (e.is(clearDecorationsEffect)) return Decoration.none;
        }
        return value.map(tr.changes);
    },
    provide: f => EditorView.decorations.from(f)
});

export const view = new EditorView({
    doc: DEFAULT_DOC,
    parent: document.querySelector("#editor") as HTMLElement,
    extensions: [basicSetup, decorationsField]
});

export const get_text = () => {
    return view.state.doc.toString();
}

export const create_decoration_range = (
    start: number,
    end: number,
    class_name = "cm-error"
): Range<Decoration> => {
    return Decoration.mark({ class: class_name }).range(start, end);
}

type DecorationData = { from: number, to: number, className: string };
const active_decorations: Map<number, DecorationData> = new Map();
let decoration_id_counter = 0;

const rebuild_and_apply_decorations = () => {
    const docLength = view.state.doc.length;
    const builder = new RangeSetBuilder<Decoration>();

    for (const { from, to, className } of active_decorations.values()) {
        // Clamp to document bounds
        const safeFrom = Math.min(from, docLength);
        const safeTo = Math.min(to, docLength);
        if (safeFrom < safeTo) {
            builder.add(safeFrom, safeTo, Decoration.mark({ class: className }));
        }
    }

    view.dispatch({
        effects: setDecorationsEffect.of(builder.finish())
    });
}

export const apply_decoration_range = (decoration: Range<Decoration>,) => {
    let id = ++decoration_id_counter;

    // Instead of storing the Range<Decoration> directly, store logical data
    active_decorations.set(id, {
        from: decoration.from,
        to: decoration.to,
        className: (decoration.value.spec.class || "cm-error")
    });

    rebuild_and_apply_decorations();
    return id;
}

export const create_and_apply_decoration_range = (
    start: number,
    end: number,
    class_name = "cm-error"
) => {
    const decoration = create_decoration_range(start, end, class_name);
    return apply_decoration_range(decoration);
}

export const remove_decoration_by_id = (id: number) => {
    active_decorations.delete(id);
    rebuild_and_apply_decorations();
}

export const remove_all_decorations = () => {
    active_decorations.clear();
    view.dispatch({ effects: clearDecorationsEffect.of() });
}

let hover_extensions: Map<number, Extension> = new Map();
let hover_id_counter = 0;

const MessageHover = (start: number, end: number, message: string, class_name = "cm-hover-msg") => {
    return hoverTooltip((view, hoverPos) => {
        if (hoverPos < start || hoverPos >= end) return null;

        return {
            pos: start,
            end: end,
            above: true,
            create(view) {
                const dom = document.createElement("div");
                dom.className = class_name;
                dom.innerText = message;
                return { dom };
            }
        };
    });
}

let update_listener_extensions: Map<number, Extension> = new Map();
let update_listener_id_counter = 0;

export const add_hover_message = (
    message: string,
    start: number,
    end: number,
    class_name = "cm-hover-msg"
) => {
    const hover = MessageHover(start, end, message, class_name);

    let id = ++hover_id_counter;
    hover_extensions.set(id, hover);

    view.dispatch({
        effects: StateEffect.reconfigure.of([
            basicSetup,
            decorationsField,
            ...hover_extensions.values(),
            ...update_listener_extensions.values()
        ])
    });

    return id;
}

export const remove_hover_message_by_id = (id: number) => {
    hover_extensions.delete(id);

    const remaining = Array.from(hover_extensions.values());

    view.dispatch({
        effects: StateEffect.reconfigure.of([
            basicSetup,
            decorationsField,
            ...remaining,
            ...update_listener_extensions.values()
        ])
    });
}

export const remove_all_hover_messages = () => {
    hover_extensions.clear();

    view.dispatch({
        effects: StateEffect.reconfigure.of([
            basicSetup,
            decorationsField,
            ...update_listener_extensions.values()
        ])
    });
}

export const add_update_listener = (callback: (view: EditorView) => void, events: ("edit" | "select")[] = ["edit", "select"]) => {
    update_listener_extensions.set(
        ++update_listener_id_counter,
        EditorView.updateListener.of((update) => {
            if ((events.includes("edit") && update.docChanged) || (events.includes("select") && update.selectionSet)) {
                callback(view);
            }
        })
    );

    view.dispatch({
        effects: StateEffect.reconfigure.of([
            basicSetup,
            decorationsField,
            ...hover_extensions.values(),
            ...update_listener_extensions.values()
        ])
    });
}

export const remove_update_listener_by_id = (id: number) => {
    update_listener_extensions.delete(id);

    const remaining = Array.from(update_listener_extensions.values());

    view.dispatch({
        effects: StateEffect.reconfigure.of([
            basicSetup,
            decorationsField,
            ...hover_extensions.values(),
            ...remaining
        ])
    });
}

export const set_readonly = (readonly: boolean) => {
    view.dispatch({
        effects: StateEffect.reconfigure.of([
            basicSetup,
            decorationsField,
            ...hover_extensions.values(),
            ...update_listener_extensions.values(),
            EditorView.editable.of(!readonly)
        ])
    });

    if (readonly) {
        view.dom.classList.add("readonly");
    } else {
        view.dom.classList.remove("readonly");
    }
}

let dirty = false;
add_update_listener((view => {
    console.log("Editor content changed, marking as dirty");
    dirty = true;

    dirty_change_callbacks.forEach(callback => callback(dirty));
}), ["edit"]);

export const is_dirty = () => dirty;
export const clear_dirty = () => {
    console.log("Editor content saved, clearing dirty flag");
    dirty = false;

    dirty_change_callbacks.forEach(callback => callback(dirty));
}

const dirty_change_callbacks: ((dirty: boolean) => void)[] = [];
export const add_dirty_change_listener = (callback: (dirty: boolean) => void) => {
    dirty_change_callbacks.push(callback);
}
