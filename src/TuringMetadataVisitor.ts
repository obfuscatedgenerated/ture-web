import TuringVisitor from "./grammar/TuringVisitor";
import {LetterContext, LhsContext, RhsContext, StateContext} from "./grammar/TuringParser";

// less space efficient to duplicate lhs and rhs, but more time efficient since no need to do some sort of "both" check each time
type Side = "lhs" | "rhs";
type SideMapped = {
    [key in Side]: string[];
};

/**
 * A lightweight visitor to collect state names, letters, and LHS letters from a Turing machine ruleset.
 */
export default class TuringMetadataVisitor extends TuringVisitor<string> {
    private _state_names: SideMapped = {lhs: [], rhs: []};
    private _letters: SideMapped = {lhs: [], rhs: []};

    get state_names() {
        // combine lhs and rhs state names into a single array
        return [...new Set([...this._state_names.lhs, ...this._state_names.rhs])];
    }

    get mapped_state_names() {
        return this._state_names;
    }

    get lhs_state_names() {
        return this._state_names.lhs;
    }

    get rhs_state_names() {
        return this._state_names.rhs;
    }

    get letters() {
        // combine lhs and rhs letters into a single array
        return [...new Set([...this._letters.lhs, ...this._letters.rhs])];
    }

    get mapped_letters() {
        return this._letters;
    }

    get lhs_letters() {
        return this._letters.lhs;
    }

    get rhs_letters() {
        return this._letters.rhs;
    }

    visitState = (ctx: StateContext) => {
        return ctx.getText();
    }

    visitLetter = (ctx: LetterContext) => {
        return ctx.getText().replace(/\\%/g, "%"); // unescape percent
    }

    visitLhs = (ctx: LhsContext) => {
        const lhs_letter = this.visit(ctx._from_letter);
        if (!this._letters.lhs.includes(lhs_letter)) {
            this._letters.lhs.push(lhs_letter);
        }

        const lhs_state = this.visit(ctx._from_state);
        if (!this._state_names.lhs.includes(lhs_state)) {
            this._state_names.lhs.push(lhs_state);
        }

        return "";
    }

    visitRhs = (ctx: RhsContext) => {
        const rhs_letter = this.visit(ctx._to_letter);
        if (!this._letters.rhs.includes(rhs_letter)) {
            this._letters.rhs.push(rhs_letter);
        }

        const rhs_state = this.visit(ctx._to_state);
        if (!this._state_names.rhs.includes(rhs_state)) {
            this._state_names.rhs.push(rhs_state);
        }

        return "";
    }
}
