import {DataSet, Network, Node, Edge, Options, network} from "vis-network/standalone";

import {ParseTree} from "antlr4";
import TuringTransitionVisitor from "./TuringTransitionVisitor";

const container = document.getElementById("transition-graph") as HTMLDivElement;

const root_style = getComputedStyle(document.documentElement);

const vis_options: Options = {
    autoResize: false,
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
        font: {
            align: "middle",
            strokeWidth: 0,
            color: root_style.getPropertyValue("--on-accent") || "#fff",
        }
    },
    nodes: {
        shape: "ellipse",
        color: root_style.getPropertyValue("--accent") || "#007bff",
        font: {
            color: root_style.getPropertyValue("--on-accent") || "#fff",
            size: 16,
            face: "Arial",
            background: "none"
        },
    }
};

// TODO: is this good design? should we redesign runner to have a singleton ParseTree and then just use that everywhere? it works fine for now
let last_parsed_tree: ParseTree | null = null;
let outdated = false;
let drawn_network: Network | null = null;

// better autoResize implementation
// even though we have a fixed height, this is still needed as there is a min-height expressed in em
window.addEventListener("resize", () => {
    if (drawn_network) {
        const canvas = container.querySelector("canvas") as HTMLCanvasElement;
        if (canvas) {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            drawn_network.fit();
        } else {
            console.warn("No canvas found in transition graph container.");
        }
    }
});

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
    for (const state of visitor.all_states) {
        nodes.push({id: state, label: state});
    }

    // add edges from edge list
    for (const edge of visitor.merged_edge_list) {
        edges.push({
            from: edge.from,
            to: edge.to,
            label: edge.letter,
            arrows: "to",
        });
    }

    return {nodes: new DataSet(nodes), edges: new DataSet(edges)};
}

const calculate_vis_graph_size = () => {
    if (!drawn_network) {
        return null;
    }

    const positions = drawn_network.getPositions();

    const xs = Object.values(positions).map(pos => pos.x);
    const ys = Object.values(positions).map(pos => pos.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);

    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const width = maxX - minX;
    const height = maxY - minY;

    return {
        width,
        height
    };
}

/**
 * Updates the transition graph visualisation based on the last parsed tree.<br>
 * For efficiency, you can call this just-in-time when viewing the transition graph, rather than on every parse.<br>
 * It will only redraw the graph if it is outdated (i.e. if the last parsed tree has changed since the last draw).
 */
export const update_graph = () => {
    if (!last_parsed_tree) {
        container.innerText = "No parse tree available.";
        return;
    }

    if (!outdated) {
        // no need to re-visit the tree if it hasn't changed
        return;
    }

    const data = prepare_vis_data(last_parsed_tree);
    drawn_network = new Network(container, data, vis_options);

    // resize the container to fit all nodes
    const graph_size = calculate_vis_graph_size()!;
    container.style.height = `${graph_size.height}px`;

    // autoResize is broken. need to fit canvas to container height properly ourselves. the event listener for resize will also handle this later
    const canvas = container.querySelector("canvas") as HTMLCanvasElement;
    if (canvas) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        drawn_network.fit();
    } else {
        console.warn("No canvas found in transition graph container.");
    }

    outdated = false;
}

// TODO: scrolling ux
// TODO: highlight nodes when stepping
