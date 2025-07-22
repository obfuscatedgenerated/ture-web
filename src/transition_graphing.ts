import { DataSet, Network, Node, Edge } from "vis-network/standalone";

import {ParseTree} from "antlr4";
import TuringTransitionVisitor from "./TuringTransitionVisitor";

const container = document.getElementById("transition-graph") as HTMLDivElement;

const vis_options = {
    layout: {
        hierarchical: {
            enabled: true,
            direction: "LR", // "UD", "DU", "LR", "RL"
            sortMethod: "directed",
            levelSeparation: 150,
            nodeSpacing: 100,
            treeSpacing: 200
        }
    },
    physics: {
        enabled: false // disable physics to avoid floaty movement
    },
    edges: {
        arrows: "to",
        font: { align: "middle" }
    },
    nodes: {
        shape: "ellipse"
    }
};

// TODO: is this good design? should we redesign runner to have a singleton ParseTree and then just use that everywhere? it works fine for now
let last_parsed_tree: ParseTree | null = null;
let outdated = false;
let drawn_network: Network | null = null;

/**
 * Sets a parse tree as the last parsed tree (the one to display in the transition graph).
 * @param tree
 */
export const remember_tree = (tree: ParseTree) => {
    last_parsed_tree = tree;
    outdated = true;
}

const prepare_vis_data = (tree: ParseTree): {nodes: DataSet<Node>, edges: DataSet<Edge>} => {
    const visitor = new TuringTransitionVisitor();
    visitor.visit(tree);

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // add from states as nodes
    for (const state of visitor.from_states) {
        nodes.push({id: state, label: state});
    }

    // add edges from edge list
    for (const edge of visitor.edge_list) {
        edges.push({
            from: edge.from,
            to: edge.to,
            label: edge.letter,
            arrows: "to",
        });
    }

    return {nodes: new DataSet(nodes), edges: new DataSet(edges)};
}

/**
 * Updates the transition graph visualisation based on the last parsed tree.<br>
 * For efficiency, you can call this just-in-time when viewing the transition graph, rather than on every parse.<br>
 * It will only redraw the graph if it is outdated (i.e. if the last parsed tree has changed since the last draw).
 */
export const update_vis_graph = () => {
    if (!last_parsed_tree) {
        throw new Error("No parse tree available to draw the transition graph.");
    }

    if (!outdated) {
        // already drawn, no need to redraw
        return;
    }

    const data = prepare_vis_data(last_parsed_tree);
    drawn_network = new Network(container, data, vis_options);

    outdated = false;
}
