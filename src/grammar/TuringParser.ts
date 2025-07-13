// Generated from src/Turing.g4 by ANTLR 4.13.2
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols,JSUnusedLocalSymbols

import {
	ATN,
	ATNDeserializer, DecisionState, DFA, FailedPredicateException,
	RecognitionException, NoViableAltException, BailErrorStrategy,
	Parser, ParserATNSimulator,
	RuleContext, ParserRuleContext, PredictionMode, PredictionContextCache,
	TerminalNode, RuleNode,
	Token, TokenStream,
	Interval, IntervalSet
} from 'antlr4';
import TuringVisitor from "./TuringVisitor.js";

// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;

export default class TuringParser extends Parser {
	public static readonly SPACE = 1;
	public static readonly NEWLINE = 2;
	public static readonly OPENER = 3;
	public static readonly CLOSER = 4;
	public static readonly COMMA = 5;
	public static readonly ARROW = 6;
	public static readonly EMPTY = 7;
	public static readonly DIRECTION = 8;
	public static readonly LEGAL_CHAR = 9;
	public static readonly ESCAPED_PERCENT = 10;
	public static readonly COMMENT = 11;
	public static override readonly EOF = Token.EOF;
	public static readonly RULE_letter = 0;
	public static readonly RULE_state = 1;
	public static readonly RULE_lhs = 2;
	public static readonly RULE_rhs = 3;
	public static readonly RULE_turing_rule = 4;
	public static readonly RULE_program = 5;
	public static readonly literalNames: (string | null)[] = [ null, null, 
                                                            null, "'('", 
                                                            "')'", "','", 
                                                            "'->'", "'\\u2B1A'", 
                                                            null, null, 
                                                            "'\\%'" ];
	public static readonly symbolicNames: (string | null)[] = [ null, "SPACE", 
                                                             "NEWLINE", 
                                                             "OPENER", "CLOSER", 
                                                             "COMMA", "ARROW", 
                                                             "EMPTY", "DIRECTION", 
                                                             "LEGAL_CHAR", 
                                                             "ESCAPED_PERCENT", 
                                                             "COMMENT" ];
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"letter", "state", "lhs", "rhs", "turing_rule", "program",
	];
	public get grammarFileName(): string { return "Turing.g4"; }
	public get literalNames(): (string | null)[] { return TuringParser.literalNames; }
	public get symbolicNames(): (string | null)[] { return TuringParser.symbolicNames; }
	public get ruleNames(): string[] { return TuringParser.ruleNames; }
	public get serializedATN(): number[] { return TuringParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(this, TuringParser._ATN, TuringParser.DecisionsToDFA, new PredictionContextCache());
	}
	// @RuleVersion(0)
	public letter(): LetterContext {
		let localctx: LetterContext = new LetterContext(this, this._ctx, this.state);
		this.enterRule(localctx, 0, TuringParser.RULE_letter);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 12;
			_la = this._input.LA(1);
			if(!(_la===7 || _la===9)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public state_(): StateContext {
		let localctx: StateContext = new StateContext(this, this._ctx, this.state);
		this.enterRule(localctx, 2, TuringParser.RULE_state);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 15;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 14;
				this.match(TuringParser.LEGAL_CHAR);
				}
				}
				this.state = 17;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (_la===9);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public lhs(): LhsContext {
		let localctx: LhsContext = new LhsContext(this, this._ctx, this.state);
		this.enterRule(localctx, 4, TuringParser.RULE_lhs);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 19;
			this.match(TuringParser.OPENER);
			this.state = 23;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 20;
				this.match(TuringParser.SPACE);
				}
				}
				this.state = 25;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 26;
			localctx._from_state = this.state_();
			this.state = 30;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 27;
				this.match(TuringParser.SPACE);
				}
				}
				this.state = 32;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 33;
			this.match(TuringParser.COMMA);
			this.state = 37;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 34;
				this.match(TuringParser.SPACE);
				}
				}
				this.state = 39;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 40;
			localctx._from_letter = this.letter();
			this.state = 44;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 41;
				this.match(TuringParser.SPACE);
				}
				}
				this.state = 46;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 47;
			this.match(TuringParser.CLOSER);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public rhs(): RhsContext {
		let localctx: RhsContext = new RhsContext(this, this._ctx, this.state);
		this.enterRule(localctx, 6, TuringParser.RULE_rhs);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 49;
			this.match(TuringParser.OPENER);
			this.state = 53;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 50;
				this.match(TuringParser.SPACE);
				}
				}
				this.state = 55;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 56;
			localctx._to_state = this.state_();
			this.state = 60;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 57;
				this.match(TuringParser.SPACE);
				}
				}
				this.state = 62;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 63;
			this.match(TuringParser.COMMA);
			this.state = 67;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 64;
				this.match(TuringParser.SPACE);
				}
				}
				this.state = 69;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 70;
			localctx._to_letter = this.letter();
			this.state = 74;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 71;
				this.match(TuringParser.SPACE);
				}
				}
				this.state = 76;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 77;
			this.match(TuringParser.COMMA);
			this.state = 81;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 78;
				this.match(TuringParser.SPACE);
				}
				}
				this.state = 83;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 84;
			localctx._direction = this.match(TuringParser.DIRECTION);
			this.state = 88;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 85;
				this.match(TuringParser.SPACE);
				}
				}
				this.state = 90;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 91;
			this.match(TuringParser.CLOSER);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public turing_rule(): Turing_ruleContext {
		let localctx: Turing_ruleContext = new Turing_ruleContext(this, this._ctx, this.state);
		this.enterRule(localctx, 8, TuringParser.RULE_turing_rule);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 96;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 93;
				this.match(TuringParser.SPACE);
				}
				}
				this.state = 98;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 99;
			localctx._left = this.lhs();
			this.state = 103;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 100;
				this.match(TuringParser.SPACE);
				}
				}
				this.state = 105;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 106;
			this.match(TuringParser.ARROW);
			this.state = 110;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 107;
				this.match(TuringParser.SPACE);
				}
				}
				this.state = 112;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 113;
			localctx._right = this.rhs();
			this.state = 117;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 14, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 114;
					this.match(TuringParser.SPACE);
					}
					}
				}
				this.state = 119;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 14, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public program(): ProgramContext {
		let localctx: ProgramContext = new ProgramContext(this, this._ctx, this.state);
		this.enterRule(localctx, 10, TuringParser.RULE_program);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 124;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 14) !== 0)) {
				{
				this.state = 122;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case 1:
				case 3:
					{
					this.state = 120;
					this.turing_rule();
					}
					break;
				case 2:
					{
					this.state = 121;
					this.match(TuringParser.NEWLINE);
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
				this.state = 126;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 127;
			this.match(TuringParser.EOF);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}

	public static readonly _serializedATN: number[] = [4,1,11,130,2,0,7,0,2,
	1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,1,0,1,0,1,1,4,1,16,8,1,11,1,12,1,
	17,1,2,1,2,5,2,22,8,2,10,2,12,2,25,9,2,1,2,1,2,5,2,29,8,2,10,2,12,2,32,
	9,2,1,2,1,2,5,2,36,8,2,10,2,12,2,39,9,2,1,2,1,2,5,2,43,8,2,10,2,12,2,46,
	9,2,1,2,1,2,1,3,1,3,5,3,52,8,3,10,3,12,3,55,9,3,1,3,1,3,5,3,59,8,3,10,3,
	12,3,62,9,3,1,3,1,3,5,3,66,8,3,10,3,12,3,69,9,3,1,3,1,3,5,3,73,8,3,10,3,
	12,3,76,9,3,1,3,1,3,5,3,80,8,3,10,3,12,3,83,9,3,1,3,1,3,5,3,87,8,3,10,3,
	12,3,90,9,3,1,3,1,3,1,4,5,4,95,8,4,10,4,12,4,98,9,4,1,4,1,4,5,4,102,8,4,
	10,4,12,4,105,9,4,1,4,1,4,5,4,109,8,4,10,4,12,4,112,9,4,1,4,1,4,5,4,116,
	8,4,10,4,12,4,119,9,4,1,5,1,5,5,5,123,8,5,10,5,12,5,126,9,5,1,5,1,5,1,5,
	0,0,6,0,2,4,6,8,10,0,1,2,0,7,7,9,9,140,0,12,1,0,0,0,2,15,1,0,0,0,4,19,1,
	0,0,0,6,49,1,0,0,0,8,96,1,0,0,0,10,124,1,0,0,0,12,13,7,0,0,0,13,1,1,0,0,
	0,14,16,5,9,0,0,15,14,1,0,0,0,16,17,1,0,0,0,17,15,1,0,0,0,17,18,1,0,0,0,
	18,3,1,0,0,0,19,23,5,3,0,0,20,22,5,1,0,0,21,20,1,0,0,0,22,25,1,0,0,0,23,
	21,1,0,0,0,23,24,1,0,0,0,24,26,1,0,0,0,25,23,1,0,0,0,26,30,3,2,1,0,27,29,
	5,1,0,0,28,27,1,0,0,0,29,32,1,0,0,0,30,28,1,0,0,0,30,31,1,0,0,0,31,33,1,
	0,0,0,32,30,1,0,0,0,33,37,5,5,0,0,34,36,5,1,0,0,35,34,1,0,0,0,36,39,1,0,
	0,0,37,35,1,0,0,0,37,38,1,0,0,0,38,40,1,0,0,0,39,37,1,0,0,0,40,44,3,0,0,
	0,41,43,5,1,0,0,42,41,1,0,0,0,43,46,1,0,0,0,44,42,1,0,0,0,44,45,1,0,0,0,
	45,47,1,0,0,0,46,44,1,0,0,0,47,48,5,4,0,0,48,5,1,0,0,0,49,53,5,3,0,0,50,
	52,5,1,0,0,51,50,1,0,0,0,52,55,1,0,0,0,53,51,1,0,0,0,53,54,1,0,0,0,54,56,
	1,0,0,0,55,53,1,0,0,0,56,60,3,2,1,0,57,59,5,1,0,0,58,57,1,0,0,0,59,62,1,
	0,0,0,60,58,1,0,0,0,60,61,1,0,0,0,61,63,1,0,0,0,62,60,1,0,0,0,63,67,5,5,
	0,0,64,66,5,1,0,0,65,64,1,0,0,0,66,69,1,0,0,0,67,65,1,0,0,0,67,68,1,0,0,
	0,68,70,1,0,0,0,69,67,1,0,0,0,70,74,3,0,0,0,71,73,5,1,0,0,72,71,1,0,0,0,
	73,76,1,0,0,0,74,72,1,0,0,0,74,75,1,0,0,0,75,77,1,0,0,0,76,74,1,0,0,0,77,
	81,5,5,0,0,78,80,5,1,0,0,79,78,1,0,0,0,80,83,1,0,0,0,81,79,1,0,0,0,81,82,
	1,0,0,0,82,84,1,0,0,0,83,81,1,0,0,0,84,88,5,8,0,0,85,87,5,1,0,0,86,85,1,
	0,0,0,87,90,1,0,0,0,88,86,1,0,0,0,88,89,1,0,0,0,89,91,1,0,0,0,90,88,1,0,
	0,0,91,92,5,4,0,0,92,7,1,0,0,0,93,95,5,1,0,0,94,93,1,0,0,0,95,98,1,0,0,
	0,96,94,1,0,0,0,96,97,1,0,0,0,97,99,1,0,0,0,98,96,1,0,0,0,99,103,3,4,2,
	0,100,102,5,1,0,0,101,100,1,0,0,0,102,105,1,0,0,0,103,101,1,0,0,0,103,104,
	1,0,0,0,104,106,1,0,0,0,105,103,1,0,0,0,106,110,5,6,0,0,107,109,5,1,0,0,
	108,107,1,0,0,0,109,112,1,0,0,0,110,108,1,0,0,0,110,111,1,0,0,0,111,113,
	1,0,0,0,112,110,1,0,0,0,113,117,3,6,3,0,114,116,5,1,0,0,115,114,1,0,0,0,
	116,119,1,0,0,0,117,115,1,0,0,0,117,118,1,0,0,0,118,9,1,0,0,0,119,117,1,
	0,0,0,120,123,3,8,4,0,121,123,5,2,0,0,122,120,1,0,0,0,122,121,1,0,0,0,123,
	126,1,0,0,0,124,122,1,0,0,0,124,125,1,0,0,0,125,127,1,0,0,0,126,124,1,0,
	0,0,127,128,5,0,0,1,128,11,1,0,0,0,17,17,23,30,37,44,53,60,67,74,81,88,
	96,103,110,117,122,124];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!TuringParser.__ATN) {
			TuringParser.__ATN = new ATNDeserializer().deserialize(TuringParser._serializedATN);
		}

		return TuringParser.__ATN;
	}


	static DecisionsToDFA = TuringParser._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );

}

export class LetterContext extends ParserRuleContext {
	constructor(parser?: TuringParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public LEGAL_CHAR(): TerminalNode {
		return this.getToken(TuringParser.LEGAL_CHAR, 0);
	}
	public EMPTY(): TerminalNode {
		return this.getToken(TuringParser.EMPTY, 0);
	}
    public get ruleIndex(): number {
    	return TuringParser.RULE_letter;
	}
	// @Override
	public accept<Result>(visitor: TuringVisitor<Result>): Result {
		if (visitor.visitLetter) {
			return visitor.visitLetter(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StateContext extends ParserRuleContext {
	constructor(parser?: TuringParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public LEGAL_CHAR_list(): TerminalNode[] {
	    	return this.getTokens(TuringParser.LEGAL_CHAR);
	}
	public LEGAL_CHAR(i: number): TerminalNode {
		return this.getToken(TuringParser.LEGAL_CHAR, i);
	}
    public get ruleIndex(): number {
    	return TuringParser.RULE_state;
	}
	// @Override
	public accept<Result>(visitor: TuringVisitor<Result>): Result {
		if (visitor.visitState) {
			return visitor.visitState(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class LhsContext extends ParserRuleContext {
	public _from_state!: StateContext;
	public _from_letter!: LetterContext;
	constructor(parser?: TuringParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public OPENER(): TerminalNode {
		return this.getToken(TuringParser.OPENER, 0);
	}
	public COMMA(): TerminalNode {
		return this.getToken(TuringParser.COMMA, 0);
	}
	public CLOSER(): TerminalNode {
		return this.getToken(TuringParser.CLOSER, 0);
	}
	public state_(): StateContext {
		return this.getTypedRuleContext(StateContext, 0) as StateContext;
	}
	public letter(): LetterContext {
		return this.getTypedRuleContext(LetterContext, 0) as LetterContext;
	}
	public SPACE_list(): TerminalNode[] {
	    	return this.getTokens(TuringParser.SPACE);
	}
	public SPACE(i: number): TerminalNode {
		return this.getToken(TuringParser.SPACE, i);
	}
    public get ruleIndex(): number {
    	return TuringParser.RULE_lhs;
	}
	// @Override
	public accept<Result>(visitor: TuringVisitor<Result>): Result {
		if (visitor.visitLhs) {
			return visitor.visitLhs(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class RhsContext extends ParserRuleContext {
	public _to_state!: StateContext;
	public _to_letter!: LetterContext;
	public _direction!: Token;
	constructor(parser?: TuringParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public OPENER(): TerminalNode {
		return this.getToken(TuringParser.OPENER, 0);
	}
	public COMMA_list(): TerminalNode[] {
	    	return this.getTokens(TuringParser.COMMA);
	}
	public COMMA(i: number): TerminalNode {
		return this.getToken(TuringParser.COMMA, i);
	}
	public CLOSER(): TerminalNode {
		return this.getToken(TuringParser.CLOSER, 0);
	}
	public state_(): StateContext {
		return this.getTypedRuleContext(StateContext, 0) as StateContext;
	}
	public letter(): LetterContext {
		return this.getTypedRuleContext(LetterContext, 0) as LetterContext;
	}
	public DIRECTION(): TerminalNode {
		return this.getToken(TuringParser.DIRECTION, 0);
	}
	public SPACE_list(): TerminalNode[] {
	    	return this.getTokens(TuringParser.SPACE);
	}
	public SPACE(i: number): TerminalNode {
		return this.getToken(TuringParser.SPACE, i);
	}
    public get ruleIndex(): number {
    	return TuringParser.RULE_rhs;
	}
	// @Override
	public accept<Result>(visitor: TuringVisitor<Result>): Result {
		if (visitor.visitRhs) {
			return visitor.visitRhs(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Turing_ruleContext extends ParserRuleContext {
	public _left!: LhsContext;
	public _right!: RhsContext;
	constructor(parser?: TuringParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public ARROW(): TerminalNode {
		return this.getToken(TuringParser.ARROW, 0);
	}
	public lhs(): LhsContext {
		return this.getTypedRuleContext(LhsContext, 0) as LhsContext;
	}
	public rhs(): RhsContext {
		return this.getTypedRuleContext(RhsContext, 0) as RhsContext;
	}
	public SPACE_list(): TerminalNode[] {
	    	return this.getTokens(TuringParser.SPACE);
	}
	public SPACE(i: number): TerminalNode {
		return this.getToken(TuringParser.SPACE, i);
	}
    public get ruleIndex(): number {
    	return TuringParser.RULE_turing_rule;
	}
	// @Override
	public accept<Result>(visitor: TuringVisitor<Result>): Result {
		if (visitor.visitTuring_rule) {
			return visitor.visitTuring_rule(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ProgramContext extends ParserRuleContext {
	constructor(parser?: TuringParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public EOF(): TerminalNode {
		return this.getToken(TuringParser.EOF, 0);
	}
	public turing_rule_list(): Turing_ruleContext[] {
		return this.getTypedRuleContexts(Turing_ruleContext) as Turing_ruleContext[];
	}
	public turing_rule(i: number): Turing_ruleContext {
		return this.getTypedRuleContext(Turing_ruleContext, i) as Turing_ruleContext;
	}
	public NEWLINE_list(): TerminalNode[] {
	    	return this.getTokens(TuringParser.NEWLINE);
	}
	public NEWLINE(i: number): TerminalNode {
		return this.getToken(TuringParser.NEWLINE, i);
	}
    public get ruleIndex(): number {
    	return TuringParser.RULE_program;
	}
	// @Override
	public accept<Result>(visitor: TuringVisitor<Result>): Result {
		if (visitor.visitProgram) {
			return visitor.visitProgram(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
