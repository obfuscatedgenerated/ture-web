// Generated from grammar/Turing.g4 by ANTLR 4.13.2
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
	public static readonly WORD = 10;
	public static readonly ESCAPED_PERCENT = 11;
	public static readonly COMMENT = 12;
	public static readonly EOF = Token.EOF;

	public static readonly channelNames: string[] = [ "DEFAULT_TOKEN_CHANNEL", "HIDDEN" ];
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
	public static readonly modeNames: string[] = [ "DEFAULT_MODE", ];

	public static readonly ruleNames: string[] = [
		"SPACE", "NEWLINE", "OPENER", "CLOSER", "COMMA", "ARROW", "EMPTY", "DIRECTION", 
		"LEGAL_CHAR", "WORD", "ESCAPED_PERCENT", "COMMENT",
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

	public static readonly _serializedATN: number[] = [4,0,12,79,6,-1,2,0,7,
	0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,
	9,2,10,7,10,2,11,7,11,1,0,4,0,27,8,0,11,0,12,0,28,1,1,1,1,1,1,1,1,3,1,35,
	8,1,1,2,1,2,1,3,1,3,1,4,1,4,1,5,1,5,1,5,1,6,1,6,1,7,1,7,1,7,1,7,1,7,1,7,
	1,7,1,7,1,7,3,7,57,8,7,1,8,1,8,3,8,61,8,8,1,9,4,9,64,8,9,11,9,12,9,65,1,
	10,1,10,1,10,1,11,1,11,5,11,73,8,11,10,11,12,11,76,9,11,1,11,1,11,0,0,12,
	1,1,3,2,5,3,7,4,9,5,11,6,13,7,15,8,17,9,19,10,21,11,23,12,1,0,3,2,0,9,9,
	32,32,6,0,9,10,13,13,32,32,40,41,44,44,11034,11034,2,0,10,10,13,13,85,0,
	1,1,0,0,0,0,3,1,0,0,0,0,5,1,0,0,0,0,7,1,0,0,0,0,9,1,0,0,0,0,11,1,0,0,0,
	0,13,1,0,0,0,0,15,1,0,0,0,0,17,1,0,0,0,0,19,1,0,0,0,0,21,1,0,0,0,0,23,1,
	0,0,0,1,26,1,0,0,0,3,34,1,0,0,0,5,36,1,0,0,0,7,38,1,0,0,0,9,40,1,0,0,0,
	11,42,1,0,0,0,13,45,1,0,0,0,15,56,1,0,0,0,17,60,1,0,0,0,19,63,1,0,0,0,21,
	67,1,0,0,0,23,70,1,0,0,0,25,27,7,0,0,0,26,25,1,0,0,0,27,28,1,0,0,0,28,26,
	1,0,0,0,28,29,1,0,0,0,29,2,1,0,0,0,30,35,5,10,0,0,31,32,5,13,0,0,32,35,
	5,10,0,0,33,35,5,13,0,0,34,30,1,0,0,0,34,31,1,0,0,0,34,33,1,0,0,0,35,4,
	1,0,0,0,36,37,5,40,0,0,37,6,1,0,0,0,38,39,5,41,0,0,39,8,1,0,0,0,40,41,5,
	44,0,0,41,10,1,0,0,0,42,43,5,45,0,0,43,44,5,62,0,0,44,12,1,0,0,0,45,46,
	5,11034,0,0,46,14,1,0,0,0,47,48,5,108,0,0,48,49,5,101,0,0,49,50,5,102,0,
	0,50,57,5,116,0,0,51,52,5,114,0,0,52,53,5,105,0,0,53,54,5,103,0,0,54,55,
	5,104,0,0,55,57,5,116,0,0,56,47,1,0,0,0,56,51,1,0,0,0,57,16,1,0,0,0,58,
	61,3,21,10,0,59,61,8,1,0,0,60,58,1,0,0,0,60,59,1,0,0,0,61,18,1,0,0,0,62,
	64,3,17,8,0,63,62,1,0,0,0,64,65,1,0,0,0,65,63,1,0,0,0,65,66,1,0,0,0,66,
	20,1,0,0,0,67,68,5,92,0,0,68,69,5,37,0,0,69,22,1,0,0,0,70,74,5,37,0,0,71,
	73,8,2,0,0,72,71,1,0,0,0,73,76,1,0,0,0,74,72,1,0,0,0,74,75,1,0,0,0,75,77,
	1,0,0,0,76,74,1,0,0,0,77,78,6,11,0,0,78,24,1,0,0,0,7,0,28,34,56,60,65,74,
	1,6,0,0];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!TuringLexer.__ATN) {
			TuringLexer.__ATN = new ATNDeserializer().deserialize(TuringLexer._serializedATN);
		}

		return TuringLexer.__ATN;
	}


	static DecisionsToDFA = TuringLexer._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );
}