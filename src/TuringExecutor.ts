import TuringVisitor from "./grammar/TuringVisitor";
import {LetterContext, LhsContext, RhsContext, StateContext, Turing_ruleContext} from "./grammar/TuringParser";
import {ParseTree, TerminalNode} from "antlr4";

// basically a direct port of the java code. not ideal but just want an mvp

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

export const EMPTY = "⬚";

const write_tape_letter = (in_tape: string, pos: number, letter: string) => {
    if (pos < in_tape.length) {
        return in_tape.substring(0, pos) + letter + in_tape.substring(pos + 1);
    }

    // need to expand tape by filling space with empties
    const n_empties = pos - in_tape.length;
    return in_tape + EMPTY.repeat(n_empties) + letter;
}

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
        let result = super.visit(tree);
        this.parsed = true;
        return result;
    }

    private current_state: string = "";

    set_state = (state: string) => {
        this.current_state = state;
    }

    private execute_step = (tape: string, pos: number): ExecResult => {
        let current_letter: string;
        if (pos >= tape.length) {
            current_letter = EMPTY;
        } else {
            current_letter = tape[pos];
        }

        const key = this.construct_lookup_key(this.current_state, current_letter);
        const rule = this.lookup.get(key);

        if (!rule) {
            // no rules apply, halt
            return new ExecResult(ExecResultStatus.Halt, tape);
        }

        // write the letter to the tape
        const letter = this.visit(rule.rhs._to_letter);
        tape = write_tape_letter(tape, pos, letter);

        // update the state
        // TODO: move state management to results
        this.current_state = this.visit(rule.rhs._to_state);

        // return the direction
        const dir_str = rule.rhs._direction.text;
        if (!dir_str) {
            throw new Error("Direction token could not be read");
        }

        switch (dir_str) {
            case "left":
                return new ExecResult(ExecResultStatus.Left, tape, rule.text_range);
            case "right":
                return new ExecResult(ExecResultStatus.Right, tape, rule.text_range);
            default:
                throw new Error(`Unknown direction: ${dir_str}`);
        }
    }

    execute = (tape: string, pos: number = 0, step_limit: number = DEFAULT_STEP_LIMIT) => {
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

        let halted = false;
        for (let i = 0; i < step_limit; i++) {
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

        return tape;
    }

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
                const res = this.execute_step(tape, pos);
                tape = res.new_tape;

                if (res.status == ExecResultStatus.Right) {
                    pos += 1;
                } else if (res.status == ExecResultStatus.Left) {
                    if (pos != 0) {
                        pos -= 1;
                    }
                }

                return {status: res.status, value: tape, pos: pos, state: this.current_state, text_range: res.text_range};
            }
        };
    }
}

export interface StepResult {
    status: ExecResultStatus;
    value: string;
    pos: number;
    state: string;
    text_range?: TextRange;
}

export type StepIterator = {
    next: () => StepResult;
}

// TODO: store map of line number to rhs so it can be highlighted on step by step mode
