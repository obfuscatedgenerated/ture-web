import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";

/**
 * Builds a container of <kbd> elements for the given key combo.<br>
 * @param keys A list of keys to include in the key combo, e.g. ["Ctrl", "S"] for "Ctrl + S"
 * @param auto_hide Whether to add the "auto-hide" class to the <kbd> elements, which will hide them if there is not likely a physical keyboard present
 */
const kbd_builder = (keys: string[], auto_hide = false) => {
    const container = document.createElement("div");

    for (const key of keys) {
        const kbd = document.createElement("kbd");
        kbd.innerText = key;

        if (auto_hide) {
            kbd.classList.add("auto-hide");
        }

        // replace Ctrl with Cmd on mac
        if (key === "Ctrl") {
            kbd.classList.add("mac-cmd");
            if (navigator.platform.startsWith("Mac")) {
                kbd.textContent = "⌘";
            }
        }

        container.appendChild(kbd);

        // if not the last key, add plus separator
        if (key !== keys[keys.length - 1]) {
            const separator = document.createElement("span");
            separator.innerText = " + ";
            separator.classList.add("kbd-plus");
            container.appendChild(separator);
        }
    }

    return container;
}

tippy("#restrict-label", {
    content: "Restricts input tape to letters in the input alphabet Σ.\nDetermined from letters found in the left-hand side of the rules.",
    placement: "bottom",
    touch: false
});

// i just like having the single F key on the button, it looks cool. however, it means that the detection of keyboards in css is still a bit funny conceptually. at least if the user strikes any valid keybind, any hidden ones will become visible.
// tippy("#run", {
//     content: kbd_builder(["F8"]),
//     placement: "bottom",
//     touch: false
// });
//
// tippy("#run-step", {
//     content: kbd_builder(["F9"]),
//     placement: "bottom",
//     touch: false
// });
//
// tippy("#next-step", {
//     content: kbd_builder(["F9"]),
//     placement: "bottom",
//     touch: false
// });

tippy("#download-button", {
    content: kbd_builder(["Ctrl", "S"]),
    placement: "bottom",
    touch: false
});

tippy("#upload-button", {
    content: kbd_builder(["Ctrl", "O"]),
    placement: "bottom",
    touch: false
});

tippy("#copy-empty", {
    content: kbd_builder(["Alt", "E"]),
    placement: "bottom",
    touch: false
});

tippy("#open-share-button", {
    content: kbd_builder(["Ctrl", "Alt", "O"]),
    placement: "bottom",
    touch: false
});

tippy("#share-dialog-button", {
    content: kbd_builder(["Ctrl", "Alt", "S"]),
    placement: "bottom",
    touch: false
});
