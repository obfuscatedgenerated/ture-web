import TuringVisitor from "./grammar/TuringVisitor";
import {StateContext} from "./grammar/TuringParser";

export default class TuringMetadataVisitor extends TuringVisitor<string> {
    state_names: string[] = [];
    letters: string[] = [];

    visitState = (ctx: StateContext) => {
        const name = ctx.getText();
        if (!this.state_names.includes(name)) {
            this.state_names.push(name);
        }

        return ctx.getText();
    }

    visitLetter = (ctx: any) => {
        const letter = ctx.getText();
        if (!this.letters.includes(letter)) {
            this.letters.push(letter);
        }

        return letter;
    }
}
