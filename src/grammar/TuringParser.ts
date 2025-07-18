// Generated from grammar/Turing.g4 by ANTLR 4.13.2
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
	public static readonly WORD = 10;
	public static readonly ESCAPED_PERCENT = 11;
	public static readonly COMMENT = 12;
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
                                                            null, "'\\%'" ];
	public static readonly symbolicNames: (string | null)[] = [ null, "SPACE", 
                                                             "NEWLINE", 
                                                             "OPENER", "CLOSER", 
                                                             "COMMA", "ARROW", 
                                                             "EMPTY", "DIRECTION", 
                                                             "LEGAL_CHAR", 
                                                             "WORD", "ESCAPED_PERCENT", 
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
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 14;
			this.match(TuringParser.WORD);
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
			this.state = 16;
			this.match(TuringParser.OPENER);
			this.state = 20;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 17;
				this.match(TuringParser.SPACE);
				}
				}
				this.state = 22;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 23;
			localctx._from_state = this.state_();
			this.state = 27;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 24;
				this.match(TuringParser.SPACE);
				}
				}
				this.state = 29;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 30;
			this.match(TuringParser.COMMA);
			this.state = 34;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 31;
				this.match(TuringParser.SPACE);
				}
				}
				this.state = 36;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 37;
			localctx._from_letter = this.letter();
			this.state = 41;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 38;
				this.match(TuringParser.SPACE);
				}
				}
				this.state = 43;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 44;
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
			this.state = 46;
			this.match(TuringParser.OPENER);
			this.state = 50;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 47;
				this.match(TuringParser.SPACE);
				}
				}
				this.state = 52;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 53;
			localctx._to_state = this.state_();
			this.state = 57;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 54;
				this.match(TuringParser.SPACE);
				}
				}
				this.state = 59;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 60;
			this.match(TuringParser.COMMA);
			this.state = 64;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 61;
				this.match(TuringParser.SPACE);
				}
				}
				this.state = 66;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 67;
			localctx._to_letter = this.letter();
			this.state = 71;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 68;
				this.match(TuringParser.SPACE);
				}
				}
				this.state = 73;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 74;
			this.match(TuringParser.COMMA);
			this.state = 78;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 75;
				this.match(TuringParser.SPACE);
				}
				}
				this.state = 80;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 81;
			localctx._direction = this.match(TuringParser.DIRECTION);
			this.state = 85;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 82;
				this.match(TuringParser.SPACE);
				}
				}
				this.state = 87;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 88;
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
			this.state = 93;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 90;
				this.match(TuringParser.SPACE);
				}
				}
				this.state = 95;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 96;
			localctx._left = this.lhs();
			this.state = 100;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 97;
				this.match(TuringParser.SPACE);
				}
				}
				this.state = 102;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 103;
			this.match(TuringParser.ARROW);
			this.state = 107;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 104;
				this.match(TuringParser.SPACE);
				}
				}
				this.state = 109;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 110;
			localctx._right = this.rhs();
			this.state = 114;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 13, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 111;
					this.match(TuringParser.SPACE);
					}
					}
				}
				this.state = 116;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 13, this._ctx);
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
			this.state = 121;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 14) !== 0)) {
				{
				this.state = 119;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case 1:
				case 3:
					{
					this.state = 117;
					this.turing_rule();
					}
					break;
				case 2:
					{
					this.state = 118;
					this.match(TuringParser.NEWLINE);
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
				this.state = 123;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 124;
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

	public static readonly _serializedATN: number[] = [4,1,12,127,2,0,7,0,2,
	1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,1,0,1,0,1,1,1,1,1,2,1,2,5,2,19,8,
	2,10,2,12,2,22,9,2,1,2,1,2,5,2,26,8,2,10,2,12,2,29,9,2,1,2,1,2,5,2,33,8,
	2,10,2,12,2,36,9,2,1,2,1,2,5,2,40,8,2,10,2,12,2,43,9,2,1,2,1,2,1,3,1,3,
	5,3,49,8,3,10,3,12,3,52,9,3,1,3,1,3,5,3,56,8,3,10,3,12,3,59,9,3,1,3,1,3,
	5,3,63,8,3,10,3,12,3,66,9,3,1,3,1,3,5,3,70,8,3,10,3,12,3,73,9,3,1,3,1,3,
	5,3,77,8,3,10,3,12,3,80,9,3,1,3,1,3,5,3,84,8,3,10,3,12,3,87,9,3,1,3,1,3,
	1,4,5,4,92,8,4,10,4,12,4,95,9,4,1,4,1,4,5,4,99,8,4,10,4,12,4,102,9,4,1,
	4,1,4,5,4,106,8,4,10,4,12,4,109,9,4,1,4,1,4,5,4,113,8,4,10,4,12,4,116,9,
	4,1,5,1,5,5,5,120,8,5,10,5,12,5,123,9,5,1,5,1,5,1,5,0,0,6,0,2,4,6,8,10,
	0,1,2,0,7,7,9,9,136,0,12,1,0,0,0,2,14,1,0,0,0,4,16,1,0,0,0,6,46,1,0,0,0,
	8,93,1,0,0,0,10,121,1,0,0,0,12,13,7,0,0,0,13,1,1,0,0,0,14,15,5,10,0,0,15,
	3,1,0,0,0,16,20,5,3,0,0,17,19,5,1,0,0,18,17,1,0,0,0,19,22,1,0,0,0,20,18,
	1,0,0,0,20,21,1,0,0,0,21,23,1,0,0,0,22,20,1,0,0,0,23,27,3,2,1,0,24,26,5,
	1,0,0,25,24,1,0,0,0,26,29,1,0,0,0,27,25,1,0,0,0,27,28,1,0,0,0,28,30,1,0,
	0,0,29,27,1,0,0,0,30,34,5,5,0,0,31,33,5,1,0,0,32,31,1,0,0,0,33,36,1,0,0,
	0,34,32,1,0,0,0,34,35,1,0,0,0,35,37,1,0,0,0,36,34,1,0,0,0,37,41,3,0,0,0,
	38,40,5,1,0,0,39,38,1,0,0,0,40,43,1,0,0,0,41,39,1,0,0,0,41,42,1,0,0,0,42,
	44,1,0,0,0,43,41,1,0,0,0,44,45,5,4,0,0,45,5,1,0,0,0,46,50,5,3,0,0,47,49,
	5,1,0,0,48,47,1,0,0,0,49,52,1,0,0,0,50,48,1,0,0,0,50,51,1,0,0,0,51,53,1,
	0,0,0,52,50,1,0,0,0,53,57,3,2,1,0,54,56,5,1,0,0,55,54,1,0,0,0,56,59,1,0,
	0,0,57,55,1,0,0,0,57,58,1,0,0,0,58,60,1,0,0,0,59,57,1,0,0,0,60,64,5,5,0,
	0,61,63,5,1,0,0,62,61,1,0,0,0,63,66,1,0,0,0,64,62,1,0,0,0,64,65,1,0,0,0,
	65,67,1,0,0,0,66,64,1,0,0,0,67,71,3,0,0,0,68,70,5,1,0,0,69,68,1,0,0,0,70,
	73,1,0,0,0,71,69,1,0,0,0,71,72,1,0,0,0,72,74,1,0,0,0,73,71,1,0,0,0,74,78,
	5,5,0,0,75,77,5,1,0,0,76,75,1,0,0,0,77,80,1,0,0,0,78,76,1,0,0,0,78,79,1,
	0,0,0,79,81,1,0,0,0,80,78,1,0,0,0,81,85,5,8,0,0,82,84,5,1,0,0,83,82,1,0,
	0,0,84,87,1,0,0,0,85,83,1,0,0,0,85,86,1,0,0,0,86,88,1,0,0,0,87,85,1,0,0,
	0,88,89,5,4,0,0,89,7,1,0,0,0,90,92,5,1,0,0,91,90,1,0,0,0,92,95,1,0,0,0,
	93,91,1,0,0,0,93,94,1,0,0,0,94,96,1,0,0,0,95,93,1,0,0,0,96,100,3,4,2,0,
	97,99,5,1,0,0,98,97,1,0,0,0,99,102,1,0,0,0,100,98,1,0,0,0,100,101,1,0,0,
	0,101,103,1,0,0,0,102,100,1,0,0,0,103,107,5,6,0,0,104,106,5,1,0,0,105,104,
	1,0,0,0,106,109,1,0,0,0,107,105,1,0,0,0,107,108,1,0,0,0,108,110,1,0,0,0,
	109,107,1,0,0,0,110,114,3,6,3,0,111,113,5,1,0,0,112,111,1,0,0,0,113,116,
	1,0,0,0,114,112,1,0,0,0,114,115,1,0,0,0,115,9,1,0,0,0,116,114,1,0,0,0,117,
	120,3,8,4,0,118,120,5,2,0,0,119,117,1,0,0,0,119,118,1,0,0,0,120,123,1,0,
	0,0,121,119,1,0,0,0,121,122,1,0,0,0,122,124,1,0,0,0,123,121,1,0,0,0,124,
	125,5,0,0,1,125,11,1,0,0,0,16,20,27,34,41,50,57,64,71,78,85,93,100,107,
	114,119,121];

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
	public WORD(): TerminalNode {
		return this.getToken(TuringParser.WORD, 0);
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
