import * as error_log from "./error_log";
import * as editor from "./editor";
import * as tape_input from "./tape_input";
import * as sharing from "./sharing";
import * as state_graph from "./state_graph";

import {CharStream, CommonTokenStream} from "antlr4";

import TuringLexer from "./grammar/TuringLexer";
import TuringParser, {ProgramContext} from "./grammar/TuringParser";

import TuringExecutor, {ExecResultStatus, StepIterator} from "./visitor/TuringExecutor";
import {TuringErrorStrategy} from "./TuringErrorStrategy";
import TuringMetadataVisitor from "./visitor/TuringMetadataVisitor";

import {DEFAULT_STEP_LIMIT, EMPTY} from "./config";

import levenshtein from "js-levenshtein";

const state_select = document.getElementById("init-state") as HTMLSelectElement;
const states_options = document.getElementById("states") as HTMLOptGroupElement;

const step_state = document.getElementById("step-state") as HTMLSpanElement;
const step_number = document.getElementById("step-number") as HTMLSpanElement;

const final_label = document.getElementById("final-label") as HTMLLabelElement;
const final_state = document.getElementById("final-state") as HTMLSpanElement;
const final_steps = document.getElementById("final-steps") as HTMLSpanElement;
const final_steps_plural = document.getElementById("final-steps-plural") as HTMLSpanElement;

/**
 * Sets the state names available in the init state select box.
 * @param names A list of state names
 */
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

/**
 * Try to determine the initial state based on the available states, following the algorithm:<br>
 * 1. check if theres a single state and choose that<br>
 * 2. calculate levenshtein distance between each state and ["init", "start"]<br>
 * 3. award bonus to distance score if contains either keyword fully<br>
 * 4. if best state has score within threshold pick it<br>
 * 5. or else give up and alert user<br>
 * This will set the init state select box value to the guessed state, or leave it empty and add an error to the log if it cannot guess.
 */
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
            const normalised = distance / value.length;

            // award a small bonus if the value includes the keyword
            const includes = value.includes(keyword);
            const adjusted = normalised - (includes ? 0.4 : 0);

            console.log(`${value} vs ${keyword}: distance=${distance}, normalised=${normalised}, adjusted=${adjusted}`);

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

/**
 * Parses the input string as a Turing machine program and returns the parse tree.<br>
 * This also invokes housekeeping tasks such as clearing error logs, removing decorations, as well as collecting metadata to populate legal state names and tape letters.
 * @param code The code to parse
 * @return The parse tree of the program
 */
export const parse = (code: string): ProgramContext => {
    error_log.clear_type("syntax");

    editor.remove_all_decorations();
    editor.remove_all_hover_messages();

    const chars = new CharStream(code);
    const lexer = new TuringLexer(chars);
    const tokens = new CommonTokenStream(lexer);

    // use custom error listener and strategy
    const parser = new TuringParser(tokens);
    parser.removeErrorListeners();
    parser.addErrorListener(new error_log.CustomErrorListener());
    parser._errHandler = new TuringErrorStrategy();

    const tree = parser.program();
    state_graph.remember_tree(tree);

    // collect state names and add to select box
    // also collects letters to tell tape what characters are valid
    const collector = new TuringMetadataVisitor();
    tree.accept(collector);

    set_state_names(collector.state_names);
    tape_input.set_valid_letters(collector.lhs_letters);

    return tree;
}

/**
 * Runs the Turing machine with the provided code all the way through.<br>
 * This will parse the code, validate the tape input from the DOM, and execute the program using the TuringExecutor.
 * @param code The code to run, typically from the editor input
 */
export const run = (code: string) => {
    error_log.clear();
    const tree = parse(code);

    // print any errors to the console and scroll error log into view if there are any
    if (error_log.get_list().length > 0) {
        error_log.log_to_console();
        error_log.get_textarea().scrollIntoView({behavior: "smooth", block: "end"});
        return;
    }

    // validate tape input if in "restrict tape alphabet" mode
    if (tape_input.is_restricted()) {
        const valid = tape_input.validate_cells();

        if (!valid) {
            error_log.add("Invalid input: tape contains letters not in the input alphabet Σ (determined from LHS letters).", "tape-invalid");
            error_log.get_textarea().scrollIntoView({behavior: "smooth", block: "end"});
            return;
        }
    }

    // walk and validate the parse tree
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

    final_label.classList.add("hidden");

    const in_tape = tape_input.get_value();
    console.log(`Running Turing machine with initial state "${init_state}" and tape input "${in_tape}"`);

    if (in_tape === "" || in_tape === EMPTY.repeat(in_tape.length)) {
        error_log.add("Warning: tape input is empty. This may be a mistake.", "warn-no-tape");
    }

    try {
        const res = exec.execute(in_tape);
        let tape = res.tape;

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

        // populate final state and steps message
        final_label.classList.remove("hidden");
        final_state.innerText = res.state;

        let step_num = res.step_idx + 1;
        final_steps.innerText = `${step_num}`;
        final_steps_plural.classList.toggle("hidden", step_num === 1);
    } catch (e: any) {
        console.error(e);
        error_log.add("Execution error: " + e.message, "exec");
    }
}

// keep reference to the step iterator and step number, as well as the highlighted rule so it can be removed later
let step_iterator: StepIterator | null = null;
let step_num = 1;
let step_highlight_id: number | undefined;

export const is_stepping = () => {
    return step_iterator !== null;
}

/**
 * Cancels the current step-by-step execution.<br>
 * This is also called at the end of a completed step-by-step execution to reset the UI state.
 */
export const cancel_steps = () => {
    step_iterator = null; // reset iterator

    // hide stepper controls and show run button
    document.getElementById("run")!.classList.remove("hidden");
    document.getElementById("stepper-controls")!.classList.add("hidden");
    document.getElementById("run-step")!.classList.remove("hidden");

    tape_input.mark_pointer(null);

    if (step_highlight_id) {
        editor.remove_decoration_by_id(step_highlight_id);
    }

    state_graph.mark_edge(null);

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

/**
 * Runs a single step in the step-by-step execution of the Turing machine.<br>
 * If no step iterator is available, it will parse the input and create a new iterator.
 */
export const run_step = () => {
    // if step_iterator is null, parse the input and create a new iterator
    if (!step_iterator) {
        error_log.clear();

        const input = editor.get_text();
        const tree = parse(input);

        // print any errors to the console and scroll error log into view if there are any
        if (error_log.get_list().length > 0) {
            error_log.log_to_console();
            error_log.get_textarea().scrollIntoView({behavior: "smooth", block: "end"});
            return;
        }

        // validate tape input if in "restrict tape alphabet" mode
        if (tape_input.is_restricted()) {
            const valid = tape_input.validate_cells();

            if (!valid) {
                error_log.add("Invalid input: tape contains letters not in the input alphabet Σ (determined from LHS letters).", "tape-invalid");
                error_log.get_textarea().scrollIntoView({behavior: "smooth", block: "end"});
                return;
            }
        }

        // walk and validate the parse tree
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

        // create a step iterator
        exec.set_state(init_state);
        step_iterator = exec.get_step_iterator(tape_input.get_value());
        step_num = 1;

        console.log("Prepared new step iterator.");

        // hide run button and show stepper controls
        document.getElementById("run")!.classList.add("hidden");
        final_label.classList.add("hidden");
        document.getElementById("stepper-controls")!.classList.remove("hidden");
        document.getElementById("run-step")!.classList.add("hidden");
        document.getElementById("upload-button")!.setAttribute("disabled", "true");
        state_select.disabled = true;

        // set initial positions
        editor.set_readonly(true);
        tape_input.set_locked(true);
        tape_input.mark_pointer(0);
        tape_input.scroll_cell_into_view(0);
        step_state.innerText = init_state;
        step_number.innerText = "1";

        return;
    }

    // if step_iterator is not null, execute the next step
    if (step_iterator) {
        try {
            // increment step number and update ui
            step_number.innerText = `${++step_num}`;

            // perform one iteration (i.e. a single step)
            const res = step_iterator.next();
            if (res.status === ExecResultStatus.Halt) {
                console.log("Execution finished.");
                cancel_steps();

                // show final state and steps
                final_label.classList.remove("hidden");
                final_state.innerText = res.state;
                final_steps.innerText = `${--step_num}`;
                final_steps_plural.classList.toggle("hidden", step_num === 1);
            } else {
                console.log(`Tape: ${res.value}, Position: ${res.pos}, State: ${res.state} (Text range: ${res.text_range?.start} - ${res.text_range?.end})`);

                // update positions
                tape_input.set_value(res.value);
                tape_input.mark_pointer(res.pos);
                tape_input.scroll_cell_into_view(res.pos);

                if (step_highlight_id) {
                    editor.remove_decoration_by_id(step_highlight_id);
                }

                // highlight the rule that was just executed in the editor
                if (res.text_range) {
                    step_highlight_id = editor.create_and_apply_decoration_range(res.text_range.start, res.text_range.end, "cm-highlight");
                }

                // determine the graph edge and mark it
                const prev_letter = res.old_value[res.old_pos] || EMPTY;
                state_graph.mark_edge({
                    from: res.old_state,
                    to: res.state,
                    letter: prev_letter
                });

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

    // run until halt or step limit is reached, keeping reference to the latest tape value and state
    let halted = false;
    let value = tape_input.get_value();
    let state = step_state.innerText;
    for (step_num; step_num < DEFAULT_STEP_LIMIT; step_num++) {
        const res = save_iterator.next();
        if (res.status === ExecResultStatus.Halt) {
            console.log("Execution finished.");
            halted = true;
            break;
        }

        value = res.value;
        state = res.state;
    }

    tape_input.set_value(value);

    // populate final state and steps message
    final_label.classList.remove("hidden");
    final_state.innerText = state;
    final_steps.innerText = `${step_num}`;
    final_steps_plural.classList.toggle("hidden", step_num === 1);

    if (!halted) {
        console.warn(`Reached step limit of ${DEFAULT_STEP_LIMIT} without halting.`);
        error_log.add(`Reached step limit of ${DEFAULT_STEP_LIMIT} without halting.`, "step-limit");
    }
}
