import {compressToEncodedURIComponent, decompressFromEncodedURIComponent} from "lz-string";
import {EMPTY} from "./TuringExecutor";

import * as editor from "./editor";
import * as error_log from "./error_log";
import * as tape_input from "./tape_input";

// TODO: necessary? at least clean up all this sharing logic
type ShareURLPropertyIncludeName = "script" | "name" | "init" | "tape";
type ShareURLPropertyFlagName = "lock_restrict" | "unrestrict";
export type ShareURLPropertyName = ShareURLPropertyIncludeName | ShareURLPropertyFlagName;

const share_prop_names_include: ShareURLPropertyIncludeName[] = ["script", "name", "init", "tape"];
const share_prop_names_flags: ShareURLPropertyFlagName[] = ["lock_restrict", "unrestrict"];

export const share_prop_names: ShareURLPropertyName[] = [...share_prop_names_include, ...share_prop_names_flags];

interface ShareURLPropertyIncludeBase {
    readonly: boolean;
}

type ShareURLPropertyFlagBase = boolean | undefined;

type ShareURLPropertyFor<K extends ShareURLPropertyName> =
    K extends ShareURLPropertyFlagName ? ShareURLPropertyFlagBase : ShareURLPropertyIncludeBase;

type ShareURLPropertyWithValueFor<K extends ShareURLPropertyName> =
    K extends ShareURLPropertyFlagName ? ShareURLPropertyFlagBase : ShareURLPropertyIncludeBase & { value: string };

export type ShareURLProperties = Partial<{
    [K in ShareURLPropertyName]?: ShareURLPropertyFor<K>;
}>;

export type ShareURLPropertiesWithValues = {
    [K in ShareURLPropertyName]?: ShareURLPropertyWithValueFor<K>;
};

const create_share_dialog = document.getElementById("share-dialog") as HTMLDialogElement;
const file_name = document.getElementById("file-name") as HTMLInputElement;
const state_select = document.getElementById("init-state") as HTMLSelectElement;
const upload_button = document.getElementById("upload-button") as HTMLButtonElement;
const restrict_checkbox = document.getElementById("restrict-input") as HTMLInputElement;

const open_share_dialog = document.getElementById("open-share-dialog") as HTMLDialogElement;
const open_share_url_input = document.getElementById("open-share-url") as HTMLInputElement;

export const get_share_url = (properties: ShareURLProperties) => {
    const comp = compressToEncodedURIComponent(editor.get_text());

    const url = new URL(window.location.href);
    url.hash = ""; // clear hash (sometimes set by readme viewers)
    url.search = ""; // clear search params to avoid conflicts

    if (properties.script) {
        url.searchParams.set("script", comp);

        if (properties.script.readonly) {
            url.searchParams.set("script_ro", "true");
        }
    }

    if (properties.name && file_name.value) {
        url.searchParams.set("name", file_name.value);

        if (properties.name.readonly) {
            url.searchParams.set("name_ro", "true");
        }
    }

    if (properties.init && state_select.value) {
        url.searchParams.set("init", state_select.value);

        if (properties.init.readonly) {
            url.searchParams.set("init_ro", "true");
        }
    }

    if (properties.tape && tape_input.get_value()) {
        let tape = tape_input.get_value();

        // remove trailing empty characters from tape input
        // trim trailing empties by finding first non empty character from the end
        let last_non_empty = tape.length;
        for (let i = tape.length - 1; i >= 0; i--) {
            if (tape[i] !== EMPTY) {
                last_non_empty = i + 1;
                break;
            }
        }

        const trimmed = tape.substring(0, last_non_empty);
        url.searchParams.set("tape", trimmed);

        if (properties.tape.readonly) {
            url.searchParams.set("tape_ro", "true");

            // ignore unrestrict and lock_restrict if tape is readonly (user can't change tape anyway)
            delete properties.unrestrict;
            delete properties.lock_restrict;
        }
    }

    if (properties.unrestrict) {
        url.searchParams.set("unrestrict", "");
    }

    if (properties.lock_restrict) {
        url.searchParams.set("lock_restrict", "");
    }

    return url.toString();
}

export const show_create_share_dialog = () => {
    // if certain properties dont have a value to share, disable the checkbox
    const include_script = document.getElementById("include-script") as HTMLInputElement;
    const include_name = document.getElementById("include-name") as HTMLInputElement;
    const include_init = document.getElementById("include-init") as HTMLInputElement;
    const include_tape = document.getElementById("include-tape") as HTMLInputElement;

    const script_enable = (editor.get_text() !== "" && editor.get_text() !== editor.DEFAULT_DOC);

    if (!script_enable) {
        include_script.disabled = true;
        include_script.checked = false;
    } else {
        include_script.disabled = false;
    }

    const name_enable = (file_name.value !== "");
    if (!name_enable) {
        include_name.disabled = true;
        include_name.checked = false;
    } else {
        include_name.disabled = false;
    }

    const init_enable = (state_select.value !== "");
    if (!init_enable) {
        include_init.disabled = true;
        include_init.checked = false;
    } else {
        include_init.disabled = false;
    }

    const tape_enable = (tape_input.get_value() !== "" && tape_input.get_value() !== EMPTY.repeat(tape_input.get_value().length));
    if (!tape_enable) {
        include_tape.disabled = true;
        include_tape.checked = false;
    } else {
        include_tape.disabled = false;
    }

    create_share_dialog.showModal();
}

let loaded: ShareURLPropertiesWithValues | null = null;
export const load_from_url = (): ShareURLPropertiesWithValues => {
    // TODO: support loading a file from a remote url

    const url = new URL(window.location.href);
    const script = url.searchParams.get("script");
    const init_state = url.searchParams.get("init");
    const tape = url.searchParams.get("tape");
    const name = url.searchParams.get("name");
    const unrestrict = url.searchParams.has("unrestrict");
    const lock_restrict = url.searchParams.has("lock_restrict");

    loaded = {};

    if (script) {
        const decompressed = decompressFromEncodedURIComponent(script);
        if (decompressed) {
            editor.view.dispatch({
                changes: {from: 0, to: editor.view.state.doc.length, insert: decompressed}
            });

            const readonly = url.searchParams.get("script_ro") === "true";

            if (readonly) {
                editor.set_readonly(true);
                upload_button.disabled = true;
                // TODO: hide upload entirely?
            }

            editor.clear_dirty();

            loaded.script = {
                readonly: readonly,
                value: decompressed
            };
        } else {
            console.error("Failed to decompress script from URL.");
            error_log.add("Failed to decompress script from URL", "decompress");
        }
    }

    if (init_state) {
        const readonly = url.searchParams.get("init_ro") === "true";

        if (readonly) {
            state_select.disabled = true;
        }

        // cant do anything for this value since not parsed yet, so need to deal with it after

        loaded.init = {
            readonly: readonly,
            value: init_state
        };
    }

    if (tape) {
        tape_input.set_value(tape);

        const readonly = url.searchParams.get("tape_ro") === "true";

        if (readonly) {
            tape_input.set_locked(true);

            // hide restrict checkbox
            document.getElementById("restrict-label")!.classList.add("hidden");
        }

        loaded.tape = {
            readonly: readonly,
            value: tape
        };
    }

    if (name) {
        file_name.value = name;

        const readonly = url.searchParams.get("name_ro") === "true";

        if (readonly) {
            file_name.disabled = true;
        }

        loaded.name = {
            readonly: readonly,
            value: name
        };
    }

    if (lock_restrict) {
        restrict_checkbox.disabled = true;
        loaded.lock_restrict = true;
    }

    // default is to be restricted
    if (unrestrict) {
        tape_input.set_restricted(false);
        restrict_checkbox.checked = false;

        loaded.unrestrict = true;
    }

    console.table(loaded);
    return loaded;
}

export const finish_load_from_url = () => {
    if (!loaded) {
        throw new Error("No properties loaded from URL. Call load_from_url() first.");
    }

    if (loaded.init) {
        // check init state from url
        if (!state_select.querySelector(`option[value="${loaded.init.value}"]`)) {
            error_log.add(`Initial state declared in URL "${loaded.init.value}" is not defined in the program.`, "no-init");
            state_select.value = "";
        } else {
            state_select.value = loaded.init.value;
        }
    }
}

export const get_loaded_properties = (): ShareURLPropertiesWithValues | null => {
    return loaded;
}

const get_share_checkbox_values = (): ShareURLProperties => {
    const properties: ShareURLProperties = {};

    // collect all includes
    share_prop_names_include.forEach(id => {
        const include = document.getElementById(`include-${id}`) as HTMLInputElement;
        const readonly = document.getElementById(`readonly-${id}`) as HTMLInputElement;

        if (include.checked) {
            properties[id] = {
                readonly: readonly.checked
            };
        }
    });

    // collect all flags
    share_prop_names_flags.forEach(id => {
        const flag = document.getElementById(`flag-${id}`) as HTMLInputElement;

        if (flag.checked) {
            properties[id] = true;
        }
    });

    // invert unrestrict and lock_restrict as they are written in a negative way
    properties.unrestrict = !properties.unrestrict;
    properties.lock_restrict = !properties.lock_restrict;

    return properties;
}

// bind share dialog button
document.getElementById("share-dialog-button")!.addEventListener("click", show_create_share_dialog);

// bind share dialog close button
document.getElementById("share-close")!.addEventListener("click", () => {
    create_share_dialog.close();
});

// bind checkbox suboptions
share_prop_names.forEach(id => {
    const checkbox = document.getElementById(`include-${id}`) as HTMLInputElement;
    const sub_div = document.getElementById(`${id}-sub`);

    if (checkbox) {
        checkbox.addEventListener("change", () => {
            // re-evaluate select all checkbox
            const select_all = document.getElementById("select-all") as HTMLInputElement;
            const all_checked = share_prop_names_include.every(name => {
                const include = document.getElementById(`include-${name}`) as HTMLInputElement;
                return include.checked || include.disabled;
            });
            select_all.checked = all_checked;

            if (sub_div) {
                sub_div.classList.toggle("hidden", !checkbox.checked);
            }
        });
    }
});

// special case: making tape readonly hides restrict options
const tape_ro_check = document.getElementById("readonly-tape") as HTMLInputElement;
tape_ro_check.addEventListener("change", () => {
    document.getElementById("tape-restrict-sub")!.classList.toggle("hidden", tape_ro_check.checked);
});

// bind checkbox select all
document.getElementById("select-all")!.addEventListener("change", (event) => {
    const select_all = event.target as HTMLInputElement;

    if (select_all.checked) {
        // if turning on, select all checkboxes

        share_prop_names_include.forEach(id => {
            const include = document.getElementById(`include-${id}`) as HTMLInputElement;

            if (include.disabled) {
                // if the checkbox is disabled, skip it
                return;
            }

            include.checked = true;

            // toggle sub options visibility
            const sub_div = document.getElementById(`${id}-sub`);
            if (sub_div) {
                sub_div.classList.remove("hidden");
            }
        });
    } else {
        // if turning off, unselect all checkboxes

        share_prop_names_include.forEach(id => {
            const include = document.getElementById(`include-${id}`) as HTMLInputElement;

            if (include.disabled) {
                // if the checkbox is disabled, skip it
                return;
            }

            include.checked = false;

            // toggle sub options visibility
            const sub_div = document.getElementById(`${id}-sub`);
            if (sub_div) {
                sub_div.classList.add("hidden");
            }
        });
    }
});

// bind share button
const share_button = document.getElementById("share-button") as HTMLButtonElement;
const share_button_content = share_button.innerHTML;
share_button.addEventListener("click", () => {
    const share_url = get_share_url(get_share_checkbox_values());

    navigator.clipboard.writeText(share_url).then(() => {
        editor.clear_dirty();
        share_button.innerText = "Copied!";
        setTimeout(() => {
            share_button.innerHTML = share_button_content;
        }, 2000);
    }).catch((err) => {
        console.error("Failed to copy share URL: ", err);
    });
});

// bind share iframe button
const share_iframe_button = document.getElementById("share-iframe-button") as HTMLButtonElement;
const share_iframe_button_content = share_iframe_button.innerHTML;
share_iframe_button.addEventListener("click", () => {
    const props = get_share_checkbox_values();
    const share_url = get_share_url(props);

    // create an iframe with the share url
    const iframe = document.createElement("iframe");
    iframe.src = share_url;
    iframe.style.border = "none";
    iframe.loading = "lazy";
    iframe.allowFullscreen = true;
    iframe.width = "1200";

    // calculate height based on content
    let height = 520;

    if (props.script) {
        const line_count = (editor.get_text().match(/\n/g) || []).length + 1;
        height += line_count * 18; // 18px per line
    }

    iframe.height = height.toString();

    navigator.clipboard.writeText(iframe.outerHTML).then(() => {
        editor.clear_dirty();
        share_iframe_button.innerText = "Copied!";
        setTimeout(() => {
            share_iframe_button.innerHTML = share_iframe_button_content;
        }, 2000);
    });
});

// fill input placeholder
const current_url = new URL(window.location.href);
open_share_url_input.placeholder = `${current_url.origin}${current_url.pathname}?script=...`;

// bind pwa open share url button
export const show_open_share_dialog = () => open_share_dialog.showModal();
document.getElementById("open-share-button")!.addEventListener("click", show_open_share_dialog);

// bind dialog close
document.getElementById("open-share-cancel")!.addEventListener("click", () => {
    open_share_dialog.close();
});

// bind open share url input
open_share_url_input.addEventListener("paste", (event) => {
    event.preventDefault();
    error_log.clear_type("open-url");

    if (!event.clipboardData) {
        console.error("Clipboard data not available for paste event.");
        error_log.add("Clipboard data not available.", "open-url");

        open_share_dialog.close();
        return;
    }

    const pasted_text = event.clipboardData.getData("text/plain");

    // sanity check: the url is valid
    let pasted_url: URL;
    try {
        pasted_url = new URL(pasted_text);
    } catch (error) {
        console.error("Invalid URL pasted: " + pasted_text, error);
        error_log.add("Invalid URL pasted: " + pasted_text, "open-url");

        open_share_dialog.close();
        return;
    }

    // valid

    // copy out search params and apply to current url
    const new_url = current_url;
    new_url.search = pasted_url.search;

    // easier to just visit it to make it run as usual
    // then don't need to worry about dirty state and pre-parsing
    open_share_dialog.close();
    window.location.assign(new_url.href);
});
