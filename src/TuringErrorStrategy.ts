import {DefaultErrorStrategy, InputMismatchException} from "antlr4";
import TuringParser from "./grammar/TuringParser";

export class TuringErrorStrategy extends DefaultErrorStrategy {
    reportUnwantedToken(recognizer: TuringParser, e: InputMismatchException): void {
        if (this.inErrorRecoveryMode(recognizer)) {
            return;
        }
        this.beginErrorCondition(recognizer);
        const t = recognizer.getCurrentToken()
        // @ts-ignore
        const tokenName = super.getTokenErrorDisplay(t)
        // @ts-ignore
        const expecting = super.getExpectedTokens(recognizer)

        // if the options are {SPACE, DIRECTION}, provide a better error
        if (expecting.contains(TuringParser.DIRECTION)) {
            // @ts-ignore
            recognizer.notifyErrorListeners(`unrecognised direction ${tokenName} (expected left or right)`, t, null);
            return;
        }

        // default error message
        const msg = "extraneous input " + tokenName + " expecting " +
            expecting.toString(recognizer.literalNames, recognizer.symbolicNames)
        // @ts-ignore
        recognizer.notifyErrorListeners(msg, t, null);
    }
}
