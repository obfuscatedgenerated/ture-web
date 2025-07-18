import {EMPTY} from "./TuringExecutor";

import * as editor from "./editor";
import * as files from "./files";
import * as sharing from "./sharing";
import * as runner from "./runner";

const override_kbd_hiding = () => {
    // if the hide media query applies, inject an override !important rule to keep the kbd elements visible
    const media = window.matchMedia("(hover: none) and (pointer: coarse)");
    if (!media.matches) {
        return; // no override needed
    }

    const style = document.createElement("style");
    style.innerHTML = `
        kbd, .kbd-plus {
            display: inline-block !important;
        }
    `;
    document.head.appendChild(style);
}

const copy_empty = document.getElementById("copy-empty") as HTMLButtonElement;
const copy_empty_content = copy_empty.innerHTML;

// listen for keybinds
document.addEventListener("keydown", (e) => {
    const is_mac = navigator.platform.startsWith("Mac");
    const control_key = is_mac ? e.metaKey : e.ctrlKey;

    if (control_key && !e.altKey) {
        // download: Ctrl + S
        if (e.key === "s" || e.key === "S") {
            e.preventDefault();
            override_kbd_hiding();

            files.download_file();
            return;
        }

        // upload: Ctrl + O
        if (e.key === "o" || e.key === "O") {
            e.preventDefault();
            override_kbd_hiding();

            files.open_file_uploader();
            return;
        }
    }

    if (!control_key && e.altKey) {
        // copy empty: Alt + E
        if (e.key === "e" || e.key === "E") {
            e.preventDefault();
            override_kbd_hiding();

            navigator.clipboard.writeText(EMPTY).then(() => {
                copy_empty.innerText = "Copied!";
                setTimeout(() => {
                    copy_empty.innerHTML = copy_empty_content;
                }, 2000);
            });
            return;
        }
    }

    if (control_key && e.altKey) {
        // share dialog: Ctrl + Alt + S
        if (e.key === "s" || e.key === "S") {
            e.preventDefault();
            override_kbd_hiding();

            sharing.show_share_dialog();
            return;
        }
    }

    // run / run remaining steps: F8 (contextual)
    if (e.key === "F8") {
        e.preventDefault();
        override_kbd_hiding();

        if (runner.is_stepping()) {
            runner.run_remaining_steps();
            return;
        }

        const input = editor.get_text();
        runner.run(input);

        return;
    }

    // run step: F9
    if (e.key === "F9") {
        e.preventDefault();
        override_kbd_hiding();

        runner.run_step();
        return;
    }

    // cancel: Esc (contextual)
    if (e.key === "Escape" && runner.is_stepping()) {
        e.preventDefault();
        override_kbd_hiding();

        runner.cancel_steps();
    }
});
