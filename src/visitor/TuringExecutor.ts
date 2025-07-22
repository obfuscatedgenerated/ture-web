import TuringVisitor from "../grammar/TuringVisitor";
import {LetterContext, LhsContext, RhsContext, StateContext, Turing_ruleContext} from "../grammar/TuringParser";
import {ParseTree} from "antlr4";

// originally a direct port of the java code
// now with additional features, but still quite OOP heavy

export const DEFAULT_STEP_LIMIT = 1000000;

export enum ExecResultStatus {
    Left,
    Right,
    Halt
}

interface TextRange {
    start: number;
    end: number;
}

class ExecResult {
    status: ExecResultStatus;
    new_tape: string;
    text_range?: TextRange;

    constructor(status: ExecResultStatus, new_tape: string, text_range?: TextRange) {
        this.status = status;
        this.new_tape = new_tape;
        this.text_range = text_range;
    }
}

/**
 * The character representing an empty tape cell.
 */
export const EMPTY = "⬚";

/**
 * Writes a letter to the tape at the specified position, automatically expanding the tape with empty cells if necessary.
 * @param in_tape The current tape as a string
 * @param pos The position to write the letter at
 * @param letter The letter to write at the specified position
 * @return The new tape
 */
const write_tape_letter = (in_tape: string, pos: number, letter: string) => {
    if (pos < in_tape.length) {
        return in_tape.substring(0, pos) + letter + in_tape.substring(pos + 1);
    }

    // need to expand tape by filling space with empties
    const n_empties = pos - in_tape.length;
    return in_tape + EMPTY.repeat(n_empties) + letter;
}

/**
 * An ANTLR visitor to walk, validate, load, and then later execute Turing machine rules.
 */
export default class TuringExecutor extends TuringVisitor<string> {
    private lookup = new Map<string, {rhs: RhsContext, text_range: TextRange}>();
    private parsed = false;

    visitLetter = (ctx: LetterContext) => {
        const text = ctx.getText();

        // unescape percent
        if (text === "\\%") {
            return "%";
        }

        return text;
    }

    visitState = (ctx: StateContext) => {
        return ctx.getText();
    }

    private construct_lookup_key = (state: string, letter: string): string => {
        return `(${state}, ${letter})`;
    }

    visitLhs = (ctx: LhsContext) => {
        return this.construct_lookup_key(this.visit(ctx._from_state), this.visit(ctx._from_letter));
    }

    visitTuring_rule = (ctx: Turing_ruleContext) => {
        const lookup_key = this.visit(ctx._left);

        if (this.lookup.has(lookup_key)) {
            throw new Error(`Duplicate rule for ${lookup_key}. Non-deterministic turing machines are not allowed at this time.`);
        }

        // add rhs and text range to lookup map
        this.lookup.set(lookup_key, {
            rhs: ctx._right,
            text_range: {
                start: ctx.start.start,
                end: ctx.stop!.stop + 1
            }
        });

        return ctx.getText();
    }

    visit = (tree: ParseTree) => {
        // set parsed to true when visit is called
        let result = super.visit(tree);
        this.parsed = true;
        return result;
    }

    private current_state: string = "";

    /**
     * Sets the current state of the Turing machine.<br>
     * Use this to set the initial state before executing the machine.
     * @param state The state to set as the current state. Not validated, so ensure it is a valid state defined in the rules
     */
    set_state = (state: string) => {
        this.current_state = state;
    }

    /**
     * Executes a single step of the Turing machine.
     * @param tape The current tape as a string, where each character represents a cell in the tape
     * @param pos The current position of the pointer/tapehead
     * @return An ExecResult containing the status of the step, the new tape, and optionally the text range of the rule applied
     */
    private execute_step = (tape: string, pos: number): ExecResult => {
        // read the current letter from the tape, falling back to EMPTY if the pointer is past the end
        let current_letter: string;
        if (pos >= tape.length) {
            current_letter = EMPTY;
        } else {
            current_letter = tape[pos];
        }

        // fetch the applicable rule from the lookup map
        const key = this.construct_lookup_key(this.current_state, current_letter);
        const rule = this.lookup.get(key);

        if (!rule) {
            // no rule applies, halt
            return new ExecResult(ExecResultStatus.Halt, tape);
        }

        // write the letter to the tape
        const letter = this.visit(rule.rhs._to_letter);
        tape = write_tape_letter(tape, pos, letter);

        // update the state
        // TODO: move state management to results?
        this.current_state = this.visit(rule.rhs._to_state);

        // return the direction
        const dir_str = rule.rhs._direction.text;
        if (!dir_str) {
            throw new Error("Direction token could not be read");
        }

        // convert direction to enum status
        switch (dir_str) {
            case "left":
                return new ExecResult(ExecResultStatus.Left, tape, rule.text_range);
            case "right":
                return new ExecResult(ExecResultStatus.Right, tape, rule.text_range);
            default:
                throw new Error(`Unknown direction: ${dir_str}`);
        }
    }

    /**
     * Executes the Turing machine through to halting, or until a step limit is reached.<br>
     * Note: validate/load rules first by calling visit on the parse tree before executing.
     * @param tape The input tape as a string, where each character represents a cell in the tape
     * @param pos The initial position of the pointer/tapehead
     * @param step_limit The maximum number of steps to execute before aborting
     * @return An object containing the final tape, pointer position, step index, and state
     */
    execute = (tape: string, pos: number = 0, step_limit: number = DEFAULT_STEP_LIMIT) => {
        if (!this.parsed) {
            throw new Error("Rules have not been validated/loaded yet. Call visit first.");
        }

        if (pos < 0) {
            throw new Error("pos cannot be less than 0");
        }

        // manual check if tape length is 0 (therefore pos 0 is allowable as it falls back to EMPTY)
        if (pos > tape.length - 1 && tape.length !== 0 && pos !== 0) {
            throw new Error("pos is outside tape range");
        }

        let halted = false;
        let step_idx = 0;
        for (step_idx; step_idx < step_limit; step_idx++) {
            const res = this.execute_step(tape, pos);

            // update tape
            tape = res.new_tape;

            // update position or halt
            if (res.status == ExecResultStatus.Right) {
                // unbounded to right
                // TODO: is this correct? should it be configurable?
                pos += 1;
            } else if (res.status == ExecResultStatus.Left) {
                // bounded on left
                if (pos != 0) {
                    pos -= 1;
                }
            } else {
                halted = true;
                break;
            }
        }

        if (!halted) {
            // the loop stopped due to step limit, not a halt
            throw new Error(`Step limit of ${step_limit} reached without halting.`);
        }

        return {tape, pos, step_idx, state: this.current_state};
    }

    /**
     * Returns an iterator that can be used to step through the Turing machine one step at a time.<br>
     * Note: make sure to observe if the iterator returns a halt status, as the iterator is permitted to execute past halting (will cause infinite loop if not handled/intentional).
     * @param tape The input tape as a string, where each character represents a cell in the tape
     * @param pos The initial position of the pointer/tapehead
     * @return An iterator that returns StepResult objects on each call to next()
     */
    get_step_iterator = (tape: string, pos: number = 0): StepIterator => {
        if (!this.parsed) {
            throw new Error("Rules have not been parsed yet. Call visit first.");
        }

        if (pos < 0) {
            throw new Error("pos cannot be less than 0");
        }

        // manual check if tape length is 0 (therefore pos 0 is allowable as it falls back to EMPTY)
        if (pos > tape.length - 1 && tape.length !== 0 && pos !== 0) {
            throw new Error("pos is outside tape range");
        }

        return {
            next: () => {
                // store old values to return in the result
                const old_value = tape;
                const old_pos = pos;
                const old_state = this.current_state;

                // execute a step
                const res = this.execute_step(tape, pos);
                tape = res.new_tape;

                // update pointer position
                if (res.status == ExecResultStatus.Right) {
                    // unbounded to right
                    // TODO: is this correct? should it be configurable?
                    pos += 1;
                } else if (res.status == ExecResultStatus.Left) {
                    // bounded on left
                    if (pos != 0) {
                        pos -= 1;
                    }
                }

                return {
                    status: res.status,
                    old_value,
                    value: tape,
                    old_pos,
                    pos: pos,
                    old_state,
                    state: this.current_state,
                    text_range: res.text_range
                };
            }
        };
    }
}

/**
 * The result of calling next() on a StepIterator.
 */
export interface StepResult {
    status: ExecResultStatus;
    old_value: string;
    value: string;
    old_pos: number;
    pos: number;
    old_state: string;
    state: string;
    text_range?: TextRange;
}

export type StepIterator = {
    next: () => StepResult;
}
