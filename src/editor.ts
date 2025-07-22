import "./style/editor.css";

import {basicSetup} from "codemirror";
import {Decoration, DecorationSet, EditorView, hoverTooltip} from "@codemirror/view";
import {Extension, Range, RangeSetBuilder, StateEffect, StateField} from "@codemirror/state";

import {DEFAULT_DOC} from "./config";

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

/**
 * The CodeMirror EditorView instance. (singleton)
 */
export const view = new EditorView({
    doc: DEFAULT_DOC,
    parent: document.querySelector("#editor") as HTMLElement,
    extensions: [basicSetup, decorationsField]
});

/**
 * Gets the current text content of the editor.
 */
export const get_text = () => {
    return view.state.doc.toString();
}

/**
 * Creates a decoration range with the specified start and end positions.
 * @param start Start index in the document
 * @param end End index
 * @param class_name CSS class to apply to the decoration
 * @return A Range<Decoration> representing the decoration
 */
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

/**
 * Rebuilds the decoration set from the active decorations and applies it to the editor.
 */
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

/**
 * Applies a decoration range to the editor and returns an ID for it.
 * @param decoration The Range<Decoration> to apply
 * @returns An ID that can be used to remove the decoration later
 */
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

/**
 * Creates a decoration range and applies it to the editor.
 * @param start Start index in the document
 * @param end End index
 * @param class_name CSS class to apply to the decoration
 */
export const create_and_apply_decoration_range = (
    start: number,
    end: number,
    class_name = "cm-error"
) => {
    const decoration = create_decoration_range(start, end, class_name);
    return apply_decoration_range(decoration);
}

/**
 * Removes a decoration by its ID.
 * @param id The ID of the decoration to remove
 */
export const remove_decoration_by_id = (id: number) => {
    active_decorations.delete(id);
    rebuild_and_apply_decorations();
}

/**
 * Removes all active decorations from the editor.
 */
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

// store references to hover extensions to retain state across reconfigurations
let update_listener_extensions: Map<number, Extension> = new Map();
let update_listener_id_counter = 0;

/**
 * Adds a hover message to the editor at the specified range.
 * @param message The message to display in the hover tooltip
 * @param start Start index in the document
 * @param end End index
 * @param class_name CSS class to apply to the hover tooltip
 * @return An ID that can be used to remove the hover message later
 */
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
            ...update_listener_extensions.values(),
            EditorView.editable.of(!readonly_state)
        ])
    });

    return id;
}

/**
 * Removes a hover message by its ID.
 * @param id The ID of the hover message to remove
 */
export const remove_hover_message_by_id = (id: number) => {
    hover_extensions.delete(id);

    const remaining = Array.from(hover_extensions.values());

    view.dispatch({
        effects: StateEffect.reconfigure.of([
            basicSetup,
            decorationsField,
            ...remaining,
            ...update_listener_extensions.values(),
            EditorView.editable.of(!readonly_state)
        ])
    });
}

/**
 * Removes all hover messages from the editor.
 */
export const remove_all_hover_messages = () => {
    hover_extensions.clear();

    view.dispatch({
        effects: StateEffect.reconfigure.of([
            basicSetup,
            decorationsField,
            ...update_listener_extensions.values(),
            EditorView.editable.of(!readonly_state)
        ])
    });
}

/**
 * Adds an update listener to the editor that triggers on specific events.
 * @param callback The function to call when the specified events occur
 * @param events The events to listen for
 * @returns An ID that can be used to remove the listener later
 */
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
            ...update_listener_extensions.values(),
            EditorView.editable.of(!readonly_state)
        ])
    });

    return update_listener_id_counter;
}

/**
 * Removes an update listener by its ID.
 * @param id The ID of the update listener to remove
 */
export const remove_update_listener_by_id = (id: number) => {
    update_listener_extensions.delete(id);

    const remaining = Array.from(update_listener_extensions.values());

    view.dispatch({
        effects: StateEffect.reconfigure.of([
            basicSetup,
            decorationsField,
            ...hover_extensions.values(),
            ...remaining,
            EditorView.editable.of(!readonly_state)
        ])
    });
}

// store readonly state so it is retained across reconfigurations
let readonly_state = false;

export const is_readonly = () => readonly_state;
export const set_readonly = (readonly: boolean) => {
    readonly_state = readonly;

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

// track dirty state automatically and run callbacks when it changes
let dirty = false;
add_update_listener((view => {
    console.log("Editor content changed, marking as dirty");
    dirty = true;

    dirty_change_callbacks.forEach(callback => callback(dirty));
}), ["edit"]);

export const is_dirty = () => dirty;

/**
 * Marks the editor as clean, indicating that the content has been saved.
 */
export const clear_dirty = () => {
    console.log("Editor content saved, clearing dirty flag");
    dirty = false;

    dirty_change_callbacks.forEach(callback => callback(dirty));
}

const dirty_change_callbacks: ((dirty: boolean) => void)[] = [];

/**
 * Adds a listener that will be called whenever the dirty state changes.
 * @param callback The function to call with the new dirty state
 */
export const add_dirty_change_listener = (callback: (dirty: boolean) => void) => {
    dirty_change_callbacks.push(callback);
}
