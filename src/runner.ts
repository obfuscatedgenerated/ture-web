import * as error_log from "./error_log";
import * as editor from "./editor";
import * as tape_input from "./tape_input";
import * as sharing from "./sharing";

import {CharStream, CommonTokenStream} from "antlr4";

import TuringLexer from "./grammar/TuringLexer";
import TuringParser, {ProgramContext} from "./grammar/TuringParser";

import TuringExecutor, {DEFAULT_STEP_LIMIT, EMPTY, ExecResultStatus, StepIterator} from "./TuringExecutor";
import {TuringErrorStrategy} from "./TuringErrorStrategy";
import TuringStateNameVisitor from "./TuringStateNameVisitor";

import levenshtein from "js-levenshtein";

const state_select = document.getElementById("init-state") as HTMLSelectElement;
const states_options = document.getElementById("states") as HTMLOptGroupElement;

const step_state = document.getElementById("step-state") as HTMLSpanElement;
const step_number = document.getElementById("step-number") as HTMLSpanElement;

const set_state_names = (names: string[]) => {
    let existing_state = state_select.value;

    states_options.innerHTML = "";

    for (const name of names) {
        const option = document.createElement("option");
        option.value = name;
        option.innerText = name;
        states_options.appendChild(option);
    }

    // check if existing state is still valid
    if (names.includes(existing_state)) {
        state_select.value = existing_state;
    } else {
        state_select.value = "";
    }
}

const guess_init_state = () => {
    // TODO: explore behavioural guessing i.e. compare lhs frequency to rhs frequency. a state with no transitions into it is likely an initial state

    if (state_select.value !== "") {
        // already selected
        return;
    }

    const options = states_options.querySelectorAll("option");

    // if there is only one state, select it as the initial state
    if (options.length === 1) {
        error_log.add(`Warning: guessing initial state from only state "${options[0].value}" as none was set.`, "warn-guessed");
        state_select.value = options[0].value;
        state_select.setCustomValidity("");
        return;
    }

    // first, look for any states similar to "init" or "start"
    // priority goes to lowest edit distance
    const keywords = ["init", "start"];
    const threshold = 0.5;

    let best_match: string | null = null;
    let best_score = Infinity;

    for (let i = 0; i < options.length; i++) {
        const option = options[i];
        const value = option.value.toLowerCase();

        for (const keyword of keywords) {
            const distance = levenshtein(value, keyword);
            const normalized = distance / value.length;

            // award a small bonus if the value includes the keyword
            const includes = value.includes(keyword);
            const adjusted = normalized - (includes ? 0.4 : 0);

            console.log(`${value} vs ${keyword}: distance=${distance}, normalized=${normalized}, adjusted=${adjusted}`);

            // only accept if the adjusted score is below the threshold
            if (adjusted <= threshold && adjusted < best_score) {
                best_score = adjusted;
                best_match = option.value;
            }
        }
    }

    if (best_match) {
        error_log.add(`Warning: guessing initial state "${best_match}" as none was set.`, "warn-guessed");
        state_select.value = best_match;
        state_select.setCustomValidity("");
        return;
    }

    // can't guess
    error_log.add("Could not guess initial state. Please select one.", "no-init");
}

export const parse = (input: string): ProgramContext => {
    error_log.clear_type("syntax");

    editor.remove_all_decorations();
    editor.remove_all_hover_messages();

    const chars = new CharStream(input);
    const lexer = new TuringLexer(chars);
    const tokens = new CommonTokenStream(lexer);

    const parser = new TuringParser(tokens);
    parser.removeErrorListeners();
    parser.addErrorListener(new error_log.CustomErrorListener());
    parser._errHandler = new TuringErrorStrategy();

    const tree = parser.program();
    //console.log(tree.toStringTree(parser.ruleNames, parser));

    // collect state names and add to select box
    const collector = new TuringStateNameVisitor();
    tree.accept(collector);
    set_state_names(collector.state_names);

    return tree;
}

export const run = (input: string) => {
    error_log.clear();
    const tree = parse(input);

    if (error_log.get_list().length > 0) {
        error_log.log_to_console();
        error_log.get_textarea().scrollIntoView({behavior: "smooth", block: "end"});
        return;
    }

    const exec = new TuringExecutor();
    try {
        tree.accept(exec);
    } catch (e: any) {
        console.error(e);
        error_log.add("Validation error: " + e.message, "validation");
        error_log.get_textarea().scrollIntoView({behavior: "smooth", block: "end"});
        return;
    }

    let init_state = state_select.value;
    if (init_state === "") {
        // guess init state if none set
        guess_init_state();
        init_state = state_select.value;

        // if couldn't guess, set invalid and stop
        if (init_state === "") {
            state_select.setCustomValidity("Please select an initial state.");
            return;
        }
    }

    exec.set_state(init_state);

    const in_tape = tape_input.get_value();
    console.log(`Running Turing machine with initial state "${init_state}" and tape input "${in_tape}"`);

    if (in_tape === "" || in_tape === EMPTY.repeat(in_tape.length)) {
        error_log.add("Warning: tape input is empty. This may be a mistake.", "warn-no-tape");
    }

    try {
        let tape = exec.execute(in_tape);
        console.log(tape);

        // trim trailing empties by finding first non empty character from the end
        let last_non_empty = tape.length;
        for (let i = tape.length - 1; i >= 0; i--) {
            if (tape[i] !== EMPTY) {
                last_non_empty = i + 1;
                break;
            }
        }

        tape = tape.substring(0, last_non_empty);
        tape_input.set_value(tape);
    } catch (e: any) {
        console.error(e);
        error_log.add("Execution error: " + e.message, "exec");
    }
}

let step_iterator: StepIterator | null = null;
let step_idx = 1;
let step_highlight_id: number | undefined;

export const is_stepping = () => {
    return step_iterator !== null;
}

export const cancel_steps = () => {
    step_iterator = null; // reset iterator

    document.getElementById("run")!.classList.remove("hidden");
    document.getElementById("stepper-controls")!.classList.add("hidden");
    document.getElementById("run-step")!.classList.remove("hidden");

    tape_input.mark_pointer(null);

    if (step_highlight_id) {
        editor.remove_decoration_by_id(step_highlight_id);
    }

    // restore to original lock state
    const url_props = sharing.get_loaded_properties();

    const script_ro = url_props?.script?.readonly ?? false;
    const init_ro = url_props?.init?.readonly ?? false;
    const tape_ro = url_props?.tape?.readonly ?? false;

    editor.set_readonly(script_ro);

    if (!script_ro) {
        document.getElementById("upload-button")!.removeAttribute("disabled");

    }

    state_select.disabled = init_ro;

    tape_input.set_locked(tape_ro);
}

export const run_step = () => {
    // if step_iterator is null, parse the input and create a new iterator
    if (!step_iterator) {
        error_log.clear();

        const input = editor.get_text();
        const tree = parse(input);

        if (error_log.get_list().length > 0) {
            error_log.log_to_console();
            error_log.get_textarea().scrollIntoView({behavior: "smooth", block: "end"});
            return;
        }

        const exec = new TuringExecutor();
        try {
            tree.accept(exec);
        } catch (e: any) {
            console.error(e);
            error_log.add("Validation error: " + e.message, "validation");
            error_log.get_textarea().scrollIntoView({behavior: "smooth", block: "end"});
            return;
        }

        let init_state = state_select.value;
        if (init_state === "") {
            // guess init state if none set
            guess_init_state();
            init_state = state_select.value;

            // if couldn't guess, set invalid and stop
            if (init_state === "") {
                state_select.setCustomValidity("Please select an initial state.");
                return;
            }
        }

        exec.set_state(init_state);
        step_iterator = exec.get_step_iterator(tape_input.get_value());
        step_idx = 1;

        console.log("Prepared new step iterator.");

        // hide run button and show stepper controls
        document.getElementById("run")!.classList.add("hidden");
        document.getElementById("stepper-controls")!.classList.remove("hidden");
        document.getElementById("run-step")!.classList.add("hidden");
        document.getElementById("upload-button")!.setAttribute("disabled", "true");
        state_select.disabled = true;

        // set initial positions
        editor.set_readonly(true);
        tape_input.set_locked(true);
        tape_input.mark_pointer(0);
        step_state.innerText = init_state;
        step_number.innerText = "1";

        return;
    }

    // if step_iterator is not null, execute the next step
    if (step_iterator) {
        try {
            step_number.innerText = `${++step_idx}`;

            const res = step_iterator.next();
            if (res.status === ExecResultStatus.Halt) {
                console.log("Execution finished.");
                cancel_steps();
            } else {
                console.log(`Tape: ${res.value}, Position: ${res.pos}, State: ${res.state} (Text range: ${res.text_range?.start} - ${res.text_range?.end})`);

                tape_input.set_value(res.value);
                tape_input.mark_pointer(res.pos);

                if (step_highlight_id) {
                    editor.remove_decoration_by_id(step_highlight_id);
                }

                if (res.text_range) {
                    step_highlight_id = editor.create_and_apply_decoration_range(res.text_range.start, res.text_range.end, "cm-highlight");
                }

                step_state.innerText = res.state;
            }
        } catch (e: any) {
            console.error(e);
            error_log.add("Execution error: " + e.message, "exec");
            cancel_steps();
        }
    }
}

export const run_remaining_steps = () => {
    if (!step_iterator) {
        console.warn("No step iterator available. Please run the program first.");
        return;
    }

    const save_iterator = step_iterator;
    cancel_steps();

    let halted = false;
    let value = tape_input.get_value();
    for (step_idx; step_idx < DEFAULT_STEP_LIMIT; step_idx++) {
        const res = save_iterator.next();
        if (res.status === ExecResultStatus.Halt) {
            console.log("Execution finished.");
            halted = true;
            break;
        }

        value = res.value;
    }

    tape_input.set_value(value);

    if (!halted) {
        console.warn(`Reached step limit of ${DEFAULT_STEP_LIMIT} without halting.`);
        error_log.add(`Reached step limit of ${DEFAULT_STEP_LIMIT} without halting.`, "step-limit");
    }
}
