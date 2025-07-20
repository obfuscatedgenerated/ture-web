import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";

const kbd_builder = (keys: string[]) => {
    const container = document.createElement("div");

    for (const key of keys) {
        const kbd = document.createElement("kbd");
        kbd.innerText = key;

        if (key === "Ctrl") {
            kbd.classList.add("mac-cmd");
        }

        container.appendChild(kbd);

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
