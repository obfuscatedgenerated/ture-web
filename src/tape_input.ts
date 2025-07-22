import "./style/tape_input.css";

import {EMPTY} from "./visitor/TuringExecutor";
import {documents, show_document} from "./documents";

import * as error_log from "./error_log";

const tape_input = document.getElementById("input") as HTMLInputElement;
const tape_visual = document.getElementById("tape-visual") as HTMLDivElement;

let restrict = true;
let valid_letters: string[] = [];

/**
 * Adds a new tile to the tape visual.
 * @param char The character to display in the tile, defaults to EMPTY
 * @return A reference to the inserted tile element
 */
const add_tile = (char: string = EMPTY) => {
    const tile = document.createElement("div");
    tile.textContent = char;
    tile.className = "tile";
    tile.contentEditable = "true";

    tile.addEventListener("input", () => {
        // not really called, but im too paranoid to remove it
        update_hidden_input();
    });

    /**
     * Moves the caret to the start of the tile when it is focused or clicked.
     */
    const control_caret = () => {
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
        // update invalid state
        tile.classList.toggle("invalid", restrict && !valid_letters.includes(tile.textContent || EMPTY));

        // ensure tile is not actually empty
        if (tile.textContent === "") {
            tile.textContent = EMPTY;
        }

        update_hidden_input();
    });

    tape_visual.appendChild(tile);
    return tile;
}

let is_locked = false;

/**
 * Sets the locked state of the tape visual.<br>
 * When locked, the tiles cannot be edited.
 * @param locked Whether the tape visual should be locked or not
 */
export const set_locked = (locked: boolean) => {
    is_locked = locked;

    tape_visual.classList.toggle("locked", locked);

    const tiles = tape_visual.querySelectorAll(".tile");
    tiles.forEach((t) => {
        const tile = t as HTMLDivElement;

        tile.contentEditable = locked ? "false" : "true";
        tile.classList.toggle("locked", locked);
    });
}

let done_easter_egg = false;
const easter_egg = () => {
    done_easter_egg = true;

    show_document("", documents.easter_egg);
}

const check_easter_egg = (tape_str: string) => {
    if (!done_easter_egg && tape_str.toLowerCase().includes("↑↑↓↓←→←→ba")) {
        easter_egg();
    }
}

/**
 * Renders the tape visual based on the provided tape string.
 * @param tape_str The string representing the tape content, where each character is a tile.
 */
export const render_tape = (tape_str: string) => {
    tape_visual.innerHTML = "";
    [...tape_str].forEach(char => {
        add_tile(char);
    });

    set_locked(is_locked);
    check_easter_egg(tape_str);
};

/**
 * Updates the hidden input field with the current tape visual content.<br>
 * This is used to keep the input field in sync with the visual representation of the tape.
 */
export const update_hidden_input = () => {
    const all_tiles = tape_visual.querySelectorAll(".tile");

    // collect content from tiles as string
    let tape_value = "";
    all_tiles.forEach(tile => {
        const char = tile.textContent || EMPTY;
        tape_value += char;
    });

    tape_input.value = tape_value;
    check_easter_egg(tape_value);
};

/**
 * Gets the current value of the tape input field.
 * @return The current tape value as a string
 */
export const get_value = () => {
    return tape_input.value;
}

/**
 * Sets the value of the tape input field and updates the visual representation.
 * @param value The value to set the tape to, as a string
 */
export const set_value = (value: string) => {
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

/**
 * Marks a specific tile as being under the pointer/tapehead in the tape visual.
 * @param pos The position of the tile to mark as pointer, or null to remove pointer
 */
export const mark_pointer = (pos: number | null) => {
    const tiles = tape_visual.querySelectorAll(".tile");

    if (pos === null) {
        tiles.forEach(tile => tile.classList.remove("pointer"));
        return;
    }

    if (pos < 0 || pos >= tiles.length) {
        console.warn("Pointer position out of bounds");
        return;
    }

    tiles.forEach((tile, index) => {
        tile.classList.toggle("pointer", index === pos);
    });
}

/**
 * Scrolls the tile at the specified position into view.
 * @param pos The position of the tile to scroll into view
 */
export const scroll_cell_into_view = (pos: number) => {
    const tile = tape_visual.children[pos] as HTMLDivElement;
    if (tile) {
        const tile_pos = tile.offsetLeft;
        const tile_width = tile.offsetWidth;
        const container_width = tape_visual.offsetWidth;

        const scroll_pos = tile_pos - (container_width - tile_width) / 2;
        tape_visual.scrollTo({
            left: scroll_pos,
            behavior: "smooth"
        });
    } else {
        console.warn("Tile at position", pos, "does not exist.");
    }
}

/**
 * Sets whether the tape input is in "restrict to alphabet" mode.
 * @param restricted Whether to restrict
 */
export const set_restricted = (restricted: boolean) => {
    restrict = restricted;
}

/**
 * Checks if the tape input is in "restrict to alphabet" mode.
 * @return If restricted mode is enabled
 */
export const is_restricted = () => {
    return restrict;
}

/**
 * Sets the valid letters for the tape input when under "restrict to alphabet" mode.
 * @param letters A list of valid letters to restrict the tape input to.<br>
 */
export const set_valid_letters = (letters: string[]) => {
    if (!letters.includes(EMPTY)) {
        letters.push(EMPTY); // ensure EMPTY is always included
    }

    valid_letters = letters;
}

/**
 * Validates the current tape visual content against the valid letters.<br>
 * This will highlight invalid tiles and return whether the tape is valid.
 * @return Whether the tape visual is valid
 */
export const validate_cells = () => {
    let safe = true;

    // check each letter and highlight invalid ones
    const tiles = tape_visual.querySelectorAll(".tile");
    tiles.forEach((tile, index) => {
        const char = tile.textContent || EMPTY;
        if (restrict && !valid_letters.includes(char)) {
            tile.classList.add("invalid");
            safe = false;
        } else {
            tile.classList.remove("invalid");
        }
    });

    return safe;
}

/**
 * Validates the current tape input value against the valid letters.<br>
 * This is similar to `validate_cells`, but operates on the input value directly, so is more efficient but does not highlight invalid tiles.
 * @return Whether the tape input value is valid
 */
export const validate_value = (): boolean => {
    const value = tape_input.value;
    if (restrict) {
        // check if all characters are valid
        for (const char of value) {
            if (!valid_letters.includes(char)) {
                return false; // invalid character found
            }
        }
    }

    return true; // all characters are valid
}

/**
 * Focuses the next tile in the tape visual.<br>
 * This will add a new tile at the end if there are no more tiles to focus on.
 * @param current The currently focused tile element
 * @return The newly focused tile element, or the new tile if added
 */
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

/**
 * Focuses the previous tile in the tape visual.<br>
 * This will focus the previous tile if it exists, otherwise does nothing.
 * @param current The currently focused tile element
 * @return The newly focused tile element, or null if no previous tile exists
 */
const focus_previous_tile = (current: HTMLElement) => {
    const prev = current.previousElementSibling;
    if (prev && prev.classList.contains("tile")) {
        (prev as HTMLElement).focus();
        return (prev as HTMLElement);
    }

    return null;
};

tape_visual.addEventListener("keydown", e => {
    // check if a tile is focused
    const current = document.activeElement;
    if (!current || !(current instanceof HTMLElement)) return;
    if (!current.classList.contains("tile")) return;

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();

        // if restrict is enabled, check if the key is valid
        if (restrict && !valid_letters.includes(e.key)) {
            current.classList.add("invalid");
            return;
        }

        current.classList.remove("invalid");
        current.textContent = e.key;

        update_hidden_input();
        focus_next_tile(current);

        // if all keys are now valid, clear error log of invalid input error
        if (restrict && validate_value()) {
            error_log.clear_type("tape-invalid");
        }
    } else if (e.key === "Backspace") {
        e.preventDefault();

        current.textContent = "";
        update_hidden_input();
        focus_previous_tile(current);

        // TODO: cull empty fields above min_tiles
        // TODO: improve cursor UX when backspacing then entering character immediately after
    } else if (e.key === "ArrowRight") {
        e.preventDefault();
        focus_next_tile(current);
    } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        focus_previous_tile(current);
    }

    // housekeeping to ensure single character input
    current.textContent = current.textContent?.slice(0, 1) || "";
});

tape_visual.addEventListener("paste", e => {
    e.preventDefault();

    // fetch clipboard data
    const text = e.clipboardData?.getData("text/plain") || "";

    // check if tile is focused
    let current = document.activeElement;
    if (current && current instanceof HTMLElement && current.classList.contains("tile")) {
        // split the text into characters and fill tiles from the selected tile onwards
        let chars = text.split("");
        while (chars.length > 0) {
            if (current.textContent === EMPTY) {
                current.textContent = chars.shift() || EMPTY;
            }

            // move to next tile then write next character
            current = focus_next_tile(current as HTMLElement);
            current.textContent = current.textContent?.slice(0, 1) || "";
        }
    }
});

// bind restricted checkbox
document.getElementById("restrict-input")!.addEventListener("change", (e) => {
    const do_restrict = (e.target as HTMLInputElement).checked;
    set_restricted(do_restrict);

    // also update flag-unrestrict
    const unrestrict = document.getElementById("flag-unrestrict") as HTMLInputElement;
    unrestrict.checked = do_restrict;

    // clear invalid class from all tiles
    const tiles = tape_visual.querySelectorAll(".tile");
    tiles.forEach(tile => {
        const t = tile as HTMLDivElement;
        t.classList.remove("invalid");
    });

    // clear error log of invalid input error
    error_log.clear_type("tape-invalid");
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

// TODO: this is somewhat jank
