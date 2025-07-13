import {CharStream, CommonTokenStream} from "antlr4";
import TuringLexer from "./grammar/TuringLexer";
import TuringParser from "./grammar/TuringParser";
import TuringExecutor from "./TuringExecutor";

const input = "% Store the first letter in the word as a state\n" +
    "(qInit, a) -> (qA, a, right)\n" +
    "(qInit, b) -> (qB, b, right)\n" +
    "\n" +
    "% Move to the end of the tape\n" +
    "(qA, a) -> (qA, a, right)\n" +
    "(qA, b) -> (qA, b, right)\n" +
    "(qB, a) -> (qB, a, right)\n" +
    "(qB, b) -> (qB, b, right)\n" +
    "\n" +
    "% Backtrack once when we reach the end of the tape\n" +
    "(qA, ⬚) -> (qEndA, ⬚, left)\n" +
    "(qB, ⬚) -> (qEndB, ⬚, left)\n" +
    "\n" +
    "% Replace the last letter with the first letter and enter the trap state\n" +
    "(qEndA, a) -> (qHalt, a, right)\n" +
    "(qEndA, b) -> (qHalt, a, right)\n" +
    "(qEndB, a) -> (qHalt, b, right)\n" +
    "(qEndB, b) -> (qHalt, b, right)";
const chars = new CharStream(input);
const lexer = new TuringLexer(chars);
const tokens = new CommonTokenStream(lexer);
const parser = new TuringParser(tokens);
const tree = parser.program();
console.log(tree.toStringTree(parser.ruleNames, parser));
tree.accept(new TuringExecutor())