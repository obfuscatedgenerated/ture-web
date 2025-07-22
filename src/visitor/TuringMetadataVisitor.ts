import TuringVisitor from "../grammar/TuringVisitor";
import {LetterContext, LhsContext, StateContext} from "../grammar/TuringParser";

/**
 * A lightweight visitor to collect state names, letters, and LHS letters from a Turing machine ruleset.<br>
 * Simply access `state_names`, `letters`, and `lhs_letters` after visiting the parse tree to get the collected metadata.
 */
export default class TuringMetadataVisitor extends TuringVisitor<string> {
    state_names: string[] = [];
    letters: string[] = [];
    lhs_letters: string[] = [];

    visitState = (ctx: StateContext) => {
        const name = ctx.getText();
        if (!this.state_names.includes(name)) {
            this.state_names.push(name);
        }

        return ctx.getText();
    }

    visitLetter = (ctx: LetterContext) => {
        const letter = ctx.getText();
        if (!this.letters.includes(letter)) {
            this.letters.push(letter);
        }

        return letter;
    }

    visitLhs = (ctx: LhsContext) => {
        const lhs_letter = this.visit(ctx._from_letter);
        if (!this.lhs_letters.includes(lhs_letter)) {
            this.lhs_letters.push(lhs_letter);
        }

        this.visit(ctx._from_state);

        return "";
    }
}
