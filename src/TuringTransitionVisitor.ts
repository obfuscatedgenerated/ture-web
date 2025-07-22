import TuringVisitor from "./grammar/TuringVisitor";
import {LetterContext, LhsContext, RhsContext, StateContext, Turing_ruleContext} from "./grammar/TuringParser";
import {ParseTree} from "antlr4";

type LetterToStateMap = Map<string, string>;
type StateGraph = Map<string, LetterToStateMap>;

// bit cleaner that dealing in terms of LhsContext and RhsContext
interface StateAndLetter {
    state: string;
    letter: string;
}

type VisitType = StateAndLetter | string | void;

export interface TransitionEdge {
    from: string;
    letter: string;
    to: string;
}

export interface MergedTransitionEdge {
    from: string;
    letters: string[];
    to: string;
}

// TODO: maybe unite some of this behavior with TuringExecutor? perform execution separately and handle this data structure rather than the text based lookup?

/**
 * An ANTLR visitor to map the all transitions by letter from a state to another state in a Turing machine ruleset.<br>
 * This is used by the transition graph generator.
 */
export default class TuringTransitionVisitor extends TuringVisitor<VisitType> {
    private _graph: StateGraph = new Map();
    private _all_states: string[] = [];

    private _visited: boolean = false;

    get graph(): StateGraph {
        if (!this._visited) {
            throw new Error("TuringTransitionVisitor has not been visited yet. Call visit on the parse tree before accessing the graph.");
        }

        return this._graph;
    }

    get from_states(): string[] {
        if (!this._visited) {
            throw new Error("TuringTransitionVisitor has not been visited yet. Call visit on the parse tree before accessing from_states.");
        }

        return Array.from(this._graph.keys());
    }

    get to_states(): string[] {
        if (!this._visited) {
            throw new Error("TuringTransitionVisitor has not been visited yet. Call visit on the parse tree before accessing to_states.");
        }

        // collect all states that are reachable from any from state
        const to_states: Set<string> = new Set();
        for (const letter_to_state of this._graph.values()) {
            for (const to_state of letter_to_state.values()) {
                to_states.add(to_state);
            }
        }

        return Array.from(to_states);
    }

    get all_states(): string[] {
        return this._all_states;
    }

    /**
     * Returns a list of edges in the graph, where each edge is represented as an object with from state, letter, and to state.
     */
    get edge_list(): TransitionEdge[] {
        if (!this._visited) {
            throw new Error("TuringTransitionVisitor has not been visited yet. Call visit on the parse tree before accessing the edge list.");
        }

        // unwrap the map to a list of edges
        // TODO: should we just store an edge list in the first place? check how it ends up being used (maps are more flexible) then come back
        const edges: TransitionEdge[] = [];
        for (const [from_state, letter_to_state] of this._graph.entries()) {
            for (const [letter, to_state] of letter_to_state.entries()) {
                edges.push({from: from_state, letter, to: to_state});
            }
        }

        return edges;
    }

    /**
     * Returns a merged edge list, where multiple identical transitions with different letters are flattened to a list of letters.<br>
     * This is useful for rendering a transition graph as to avoid multiple overlapping transitions between the same states.
     */
    get merged_edge_list(): MergedTransitionEdge[] {
        if (!this._visited) {
            throw new Error("TuringTransitionVisitor has not been visited yet. Call visit on the parse tree before accessing the merged edge list.");
        }

        // create a map to hold the merged edges
        const merged_edges: Map<string, MergedTransitionEdge> = new Map();

        // iterate over the edge list and merge edges
        for (const edge of this.edge_list) {
            const key = `${edge.from}-${edge.to}`;

            if (merged_edges.has(key)) {
                // if the edge already exists, append the letter to the existing edge
                const existing_edge = merged_edges.get(key)!;
                existing_edge.letters.push(edge.letter);
            } else {
                // otherwise, add a new edge
                merged_edges.set(key, {
                    from: edge.from,
                    letters: [edge.letter],
                    to: edge.to
                });
            }
        }

        // return the merged edges as an array
        return Array.from(merged_edges.values()).map(edge => ({
            from: edge.from,
            letters: edge.letters,
            to: edge.to
        }));
    }

    /**
     * Queries the state graph for a specific state.
     * @param state The state to query
     * @return A map of letters to states for the given state, or null if the state does not exist in the graph
     */
    query_state = (state: string): LetterToStateMap | null => {
        if (!this._visited) {
            throw new Error("TuringTransitionVisitor has not been visited yet. Call visit on the parse tree before querying the state.");
        }

        return this._graph.get(state) ?? null;
    }

    /**
     * Queries the state graph for a specific transition from a state with a letter.
     * @param state The state to query
     * @param letter The letter to query
     * @return The resulting state for the given state and letter, or null if the transition does not exist
     */
    query_transition = (state: string, letter: string): string | null => {
        if (!this._visited) {
            throw new Error("TuringTransitionVisitor has not been visited yet. Call visit on the parse tree before querying the transition.");
        }

        const letter_to_state = this._graph.get(state);
        if (!letter_to_state) {
            return null;
        }

        return letter_to_state.get(letter) ?? null;
    }

    visitLetter = (ctx: LetterContext) => {
        const text = ctx.getText();

        // unescape percent
        if (text === "\\%") {
            return "%";
        }

        return text;
    }

    visitState = (ctx: StateContext) => {
        const state = ctx.getText();

        if (!this._all_states.includes(state)) {
            this._all_states.push(state);
        }

        return state;
    }

    visitLhs = (ctx: LhsContext) => {
        const state = this.visit(ctx._from_state) as string;
        const letter = this.visit(ctx._from_letter) as string;

        return {state, letter};
    }

    visitRhs = (ctx: RhsContext) => {
        const state = this.visit(ctx._to_state) as string;
        const letter = this.visit(ctx._to_letter) as string;

        return {state, letter};
    }

    visitTuring_rule = (ctx: Turing_ruleContext) => {
        const lhs = this.visit(ctx._left) as StateAndLetter;
        const rhs = this.visit(ctx._right) as StateAndLetter;

        // check if the from state exists in the graph
        if (!this._graph.has(lhs.state)) {
            this._graph.set(lhs.state, new Map());
        }

        // get the letter to state map for the from state
        const letter_to_state = this._graph.get(lhs.state)!;

        // check if the letter already exists in the map
        if (letter_to_state.has(lhs.letter)) {
            throw new Error(`Duplicate transition for (${lhs.state}, ${lhs.letter}). Non-deterministic Turing machines are not allowed at this time.`);
        }

        // add the transition to the map
        letter_to_state.set(lhs.letter, rhs.state);
    }

    visit = (tree: ParseTree) => {
        // set visited to true when visit is called
        let result = super.visit(tree);
        this._visited = true;
        return result;
    }
}
