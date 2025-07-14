import TuringVisitor from "./grammar/TuringVisitor";
import {StateContext} from "./grammar/TuringParser";

export default class TuringStateNameVisitor extends TuringVisitor<string> {
    state_names: string[] = [];

    visitState = (ctx: StateContext) => {
        const name = ctx.getText();
        if (!this.state_names.includes(name)) {
            this.state_names.push(name);
        }

        return ctx.getText();
    }
}
