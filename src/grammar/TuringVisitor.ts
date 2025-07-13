// Generated from src/Turing.g4 by ANTLR 4.13.2

import {ParseTreeVisitor} from 'antlr4';


import { LetterContext } from "./TuringParser.js";
import { StateContext } from "./TuringParser.js";
import { LhsContext } from "./TuringParser.js";
import { RhsContext } from "./TuringParser.js";
import { Turing_ruleContext } from "./TuringParser.js";
import { ProgramContext } from "./TuringParser.js";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `TuringParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export default class TuringVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by `TuringParser.letter`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLetter?: (ctx: LetterContext) => Result;
	/**
	 * Visit a parse tree produced by `TuringParser.state`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitState?: (ctx: StateContext) => Result;
	/**
	 * Visit a parse tree produced by `TuringParser.lhs`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLhs?: (ctx: LhsContext) => Result;
	/**
	 * Visit a parse tree produced by `TuringParser.rhs`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitRhs?: (ctx: RhsContext) => Result;
	/**
	 * Visit a parse tree produced by `TuringParser.turing_rule`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTuring_rule?: (ctx: Turing_ruleContext) => Result;
	/**
	 * Visit a parse tree produced by `TuringParser.program`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitProgram?: (ctx: ProgramContext) => Result;
}

