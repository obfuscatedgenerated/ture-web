import {EMPTY} from "./TuringExecutor";

export const setup = (tape_input: HTMLInputElement, tape_visual: HTMLDivElement) => {
    const add_tile = (char?: string) => {
        const tile = document.createElement("div");
        tile.textContent = char || EMPTY;
        tile.className = "tile";
        tile.contentEditable = "true";

        tile.addEventListener("input", () => {
            update_hidden_input();
        });

        const control_caret = () => {
            // put caret before
            const range = document.createRange();
            const selection = window.getSelection();
            range.setStart(tile, 0);
            range.collapse(true);
            selection?.removeAllRanges();
            selection?.addRange(range);
        }

        tile.addEventListener("focus", control_caret);
        tile.addEventListener("click", control_caret);

        tile.addEventListener("blur", () => {
            // ensure tile is not actually empty
            if (tile.textContent === "") {
                tile.textContent = EMPTY;
            }
            update_hidden_input();
        });

        tape_visual.appendChild(tile);
        return tile;
    }

    const render_tape = (tape_str: string) => {
        tape_visual.innerHTML = "";
        [...tape_str].forEach(char => {
            add_tile(char);
        });
    };

    const update_hidden_input = () => {
        const all_tiles = tape_visual.querySelectorAll(".tile");
        // @ts-ignore
        const chars = [...all_tiles].map(el => (el.textContent || EMPTY).slice(0, 1));
        tape_input.value = chars.join("");
    };

    const focus_next_tile = (current: HTMLElement) => {
        const next = current.nextElementSibling;
        if (next && next.classList.contains("tile")) {
            (next as HTMLElement).focus();
            return (next as HTMLElement);
        } else {
            // add a new tile at the end
            const new_tile = add_tile();
            new_tile.focus();
            return new_tile;
        }
    };

    const focus_previous_tile = (current: HTMLElement) => {
        const prev = current.previousElementSibling;
        if (prev && prev.classList.contains("tile")) {
            (prev as HTMLElement).focus();
            return (prev as HTMLElement);
        }
    };

    tape_visual.addEventListener("keydown", e => {
        const current = document.activeElement;
        if (!current || !(current instanceof HTMLElement)) return;
        if (!current.classList.contains("tile")) return;

        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            current.textContent = e.key;
            update_hidden_input();
            focus_next_tile(current);
            e.preventDefault();
        } else if (e.key === "Backspace") {
            current.textContent = "";
            update_hidden_input();
            focus_previous_tile(current);
            e.preventDefault();
            // TODO: cull empty fields above min_tiles
        } else if (e.key === "ArrowRight") {
            focus_next_tile(current);
            e.preventDefault();
        } else if (e.key === "ArrowLeft") {
            focus_previous_tile(current);
            e.preventDefault();
        }

        current.textContent = current.textContent?.slice(0, 1) || "";
    });

    tape_visual.addEventListener("paste", e => {
        e.preventDefault();
        const text = e.clipboardData?.getData("text/plain") || "";
        let current = document.activeElement;

        if (current && current instanceof HTMLElement && current.classList.contains("tile")) {
            debugger
            // split the text into characters and fill tiles from the selected tile onwards
            let chars = text.split("");
            while (chars.length > 0) {
                if (current.textContent === EMPTY) {
                    current.textContent = chars.shift() || EMPTY;
                }
                current = focus_next_tile(current as HTMLElement);
                current.textContent = current.textContent?.slice(0, 1) || "";
            }
        }
    });

    // initial render
    // calculate number of tiles that can fill full width of tape_visual

    render_tape(EMPTY);

    // determine width of tile
    // TODO fix or improve
    //const tile_width = tape_visual.children[0].scrollWidth;
    //const min_tiles = Math.floor(tape_visual.scrollWidth / tile_width);

    // for now just use a sensible default, might look better anyway
    const min_tiles = 5;

    // set initial value to empty tape with min_tiles tiles
    render_tape(EMPTY.repeat(min_tiles));

    // TODO: use empties not space, but hide the empties

    const set_value = (value: string) => {
        tape_input.value = value;

        // ensure an empty at the end to make it clear it can be extended
        if (!value.endsWith(EMPTY)) {
            value += EMPTY;
        }

        // prevent shrinking
        if (value.length < min_tiles) {
            const diff = min_tiles - value.length;
            value += EMPTY.repeat(diff);
        }
        render_tape(value);
    }

    const mark_pointer = (pos: number) => {
        const tiles = tape_visual.querySelectorAll(".tile");
        if (pos < 0 || pos >= tiles.length) {
            console.warn("Pointer position out of bounds");
            return;
        }
        tiles.forEach((tile, index) => {
            tile.classList.toggle("pointer", index === pos);
        });
    }

    return {
        set_value,
        update_hidden_input,
        focus_next_tile,
        focus_previous_tile,
        mark_pointer
    } as TapeInputFunctions;
}

export interface TapeInputFunctions {
    set_value: (value: string) => void;
    update_hidden_input: () => void;
    focus_next_tile: (current: HTMLElement) => HTMLElement;
    focus_previous_tile: (current: HTMLElement) => HTMLElement;
    mark_pointer: (pos: number) => void;
}

// TODO: this is all so jank
// TODO: maybe an option to show old school input?
