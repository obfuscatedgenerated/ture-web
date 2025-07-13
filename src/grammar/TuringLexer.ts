// Generated from src/Turing.g4 by ANTLR 4.13.2
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols,JSUnusedLocalSymbols
import {
	ATN,
	ATNDeserializer,
	CharStream,
	DecisionState, DFA,
	Lexer,
	LexerATNSimulator,
	RuleContext,
	PredictionContextCache,
	Token
} from "antlr4";
export default class TuringLexer extends Lexer {
	public static readonly SPACE = 1;
	public static readonly NEWLINE = 2;
	public static readonly OPENER = 3;
	public static readonly CLOSER = 4;
	public static readonly COMMA = 5;
	public static readonly ARROW = 6;
	public static readonly EMPTY = 7;
	public static readonly DIRECTION = 8;
	public static readonly LEGAL_CHAR = 9;
	public static readonly EOF = Token.EOF;

	public static readonly channelNames: string[] = [ "DEFAULT_TOKEN_CHANNEL", "HIDDEN" ];
	public static readonly literalNames: (string | null)[] = [ null, null, 
                                                            null, "'('", 
                                                            "')'", "','", 
                                                            "'->'", "'\\u2B1A'" ];
	public static readonly symbolicNames: (string | null)[] = [ null, "SPACE", 
                                                             "NEWLINE", 
                                                             "OPENER", "CLOSER", 
                                                             "COMMA", "ARROW", 
                                                             "EMPTY", "DIRECTION", 
                                                             "LEGAL_CHAR" ];
	public static readonly modeNames: string[] = [ "DEFAULT_MODE", ];

	public static readonly ruleNames: string[] = [
		"SPACE", "NEWLINE", "OPENER", "CLOSER", "COMMA", "ARROW", "EMPTY", "DIRECTION", 
		"LEGAL_CHAR",
	];


	constructor(input: CharStream) {
		super(input);
		this._interp = new LexerATNSimulator(this, TuringLexer._ATN, TuringLexer.DecisionsToDFA, new PredictionContextCache());
	}

	public get grammarFileName(): string { return "Turing.g4"; }

	public get literalNames(): (string | null)[] { return TuringLexer.literalNames; }
	public get symbolicNames(): (string | null)[] { return TuringLexer.symbolicNames; }
	public get ruleNames(): string[] { return TuringLexer.ruleNames; }

	public get serializedATN(): number[] { return TuringLexer._serializedATN; }

	public get channelNames(): string[] { return TuringLexer.channelNames; }

	public get modeNames(): string[] { return TuringLexer.modeNames; }

	public static readonly _serializedATN: number[] = [4,0,9,54,6,-1,2,0,7,
	0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,1,0,4,
	0,21,8,0,11,0,12,0,22,1,1,1,1,1,1,1,1,3,1,29,8,1,1,2,1,2,1,3,1,3,1,4,1,
	4,1,5,1,5,1,5,1,6,1,6,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,3,7,51,8,7,1,
	8,1,8,0,0,9,1,1,3,2,5,3,7,4,9,5,11,6,13,7,15,8,17,9,1,0,2,2,0,9,9,32,32,
	6,0,9,10,13,13,32,32,40,41,44,44,11034,11034,57,0,1,1,0,0,0,0,3,1,0,0,0,
	0,5,1,0,0,0,0,7,1,0,0,0,0,9,1,0,0,0,0,11,1,0,0,0,0,13,1,0,0,0,0,15,1,0,
	0,0,0,17,1,0,0,0,1,20,1,0,0,0,3,28,1,0,0,0,5,30,1,0,0,0,7,32,1,0,0,0,9,
	34,1,0,0,0,11,36,1,0,0,0,13,39,1,0,0,0,15,50,1,0,0,0,17,52,1,0,0,0,19,21,
	7,0,0,0,20,19,1,0,0,0,21,22,1,0,0,0,22,20,1,0,0,0,22,23,1,0,0,0,23,2,1,
	0,0,0,24,29,5,10,0,0,25,26,5,13,0,0,26,29,5,10,0,0,27,29,5,13,0,0,28,24,
	1,0,0,0,28,25,1,0,0,0,28,27,1,0,0,0,29,4,1,0,0,0,30,31,5,40,0,0,31,6,1,
	0,0,0,32,33,5,41,0,0,33,8,1,0,0,0,34,35,5,44,0,0,35,10,1,0,0,0,36,37,5,
	45,0,0,37,38,5,62,0,0,38,12,1,0,0,0,39,40,5,11034,0,0,40,14,1,0,0,0,41,
	42,5,108,0,0,42,43,5,101,0,0,43,44,5,102,0,0,44,51,5,116,0,0,45,46,5,114,
	0,0,46,47,5,105,0,0,47,48,5,103,0,0,48,49,5,104,0,0,49,51,5,116,0,0,50,
	41,1,0,0,0,50,45,1,0,0,0,51,16,1,0,0,0,52,53,8,1,0,0,53,18,1,0,0,0,4,0,
	22,28,50,0];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!TuringLexer.__ATN) {
			TuringLexer.__ATN = new ATNDeserializer().deserialize(TuringLexer._serializedATN);
		}

		return TuringLexer.__ATN;
	}


	static DecisionsToDFA = TuringLexer._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );
}