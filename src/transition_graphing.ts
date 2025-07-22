import {DataSet, Network, Node, Edge, Options, network} from "vis-network/standalone";

import {ParseTree} from "antlr4";
import TuringTransitionVisitor, {TransitionEdge} from "./visitor/TuringTransitionVisitor";

const container = document.getElementById("transition-graph") as HTMLDivElement;

let root_style = getComputedStyle(document.documentElement);

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
            align: "top",
            strokeWidth: 0,
            color: root_style.getPropertyValue("--text-body") || "#fff",
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

// on light/dark mode change, re-evaluate colors
const dark_mode = window.matchMedia("(prefers-color-scheme: dark)");
dark_mode.addEventListener("change", () => {
    root_style = getComputedStyle(document.documentElement);

    // @ts-ignore
    vis_options.edges!.font!.color = root_style.getPropertyValue("--text-body") || "#fff";
    // @ts-ignore
    vis_options.nodes!.font!.color = root_style.getPropertyValue("--on-accent") || "#fff";
    vis_options.nodes!.color = root_style.getPropertyValue("--accent") || "#007bff";

    // if the graph is drawn, update it
    if (drawn_network) {
        drawn_network.setOptions(vis_options);
        drawn_network.redraw();
    }
});

type ExtendedEdge = Edge & {
    letters: string[]; // to store the letters in the edge
}

// TODO: is this good design? should we redesign runner to have a singleton ParseTree and then just use that everywhere? it works fine for now
let last_parsed_tree: ParseTree | null = null;
let prepared_data: { nodes: DataSet<Node>, edges: DataSet<ExtendedEdge> } | null = null;
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

const prepare_vis_data = (tree: ParseTree): { nodes: DataSet<Node>, edges: DataSet<ExtendedEdge> } => {
    const visitor = new TuringTransitionVisitor();
    visitor.visit(tree);

    const nodes: Node[] = [];
    const edges: ExtendedEdge[] = [];

    // add from states as nodes
    for (const state of visitor.all_states) {
        nodes.push({id: state, label: state});
    }

    // add edges from edge list
    for (const edge of visitor.merged_edge_list) {
        edges.push({
            from: edge.from,
            to: edge.to,
            label: edge.letters.join(", "), // join letters with comma
            letters: edge.letters,
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
    prepared_data = data;

    drawn_network = new Network(container, data, vis_options);

    // highlight an edge if it was requested before the graph was drawn
    if (need_to_highlight_edge) {
        highlight_edge_on_graph(need_to_highlight_edge);
        need_to_highlight_edge = null;
    }

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

// store the highlighted edge to be used later if the graph is not yet drawn
let need_to_highlight_edge: TransitionEdge | null = null;

/**
 * Highlights an edge on the graph by changing its color.<br>
 * If an edge is already highlighted, it will be replaced with the new one.<br>
 * If the network is not yet drawn, it will wait until the graph is drawn to highlight the edge.
 * @param edge the edge to highlight, or null to remove the highlight
 */
export const mark_edge = (edge: TransitionEdge | null) => {
    if (!drawn_network) {
        need_to_highlight_edge = edge;
        return;
    }

    highlight_edge_on_graph(edge);
}

/**
 * Highlights an edge on the graph by changing its color.<br>
 * If an edge is already highlighted, it will be replaced with the new one.
 * @param edge the edge to highlight, or null to remove the highlight
 */
const highlight_edge_on_graph = (edge: TransitionEdge | null) => {
    if (!drawn_network) {
        console.warn("No drawn network to highlight edge in.");
        return;
    }

    if (!prepared_data) {
        console.warn("No prepared data to highlight edge in.");
        return;
    }

    if (!edge) {
        // restore original data
        drawn_network.setData(prepared_data);
        return;
    }

    // find the edge with the given from, to and letter
    // use the original prepared data to ensure only 1 is highlighted at once
    const graph_edges = prepared_data.edges;

    // need custom network edge filter because each edge may have multiple letters but we only receive 1
    const filtered_edges = graph_edges.get({
        filter: (item) => item.from === edge.from && item.to === edge.to && item.label!.includes(edge.letter)
    });

    if (!filtered_edges || filtered_edges.length === 0) {
        console.warn("No edge found in the graph with the given from, to and letter.");
        return;
    }

    const graph_edge = filtered_edges[0] as ExtendedEdge;

    // highlight the edge by changing its color
    const highlighted_edge: ExtendedEdge = {
        ...graph_edge,
        color: {
            color: root_style.getPropertyValue("--edge-mark") || "#de00ff",
        }
    };

    // update edge in original data and apply
    const new_edges = new DataSet<ExtendedEdge>(prepared_data.edges.get());
    new_edges.update(highlighted_edge);

    drawn_network.setData({
        nodes: prepared_data.nodes,
        edges: new_edges
    });
}

// TODO: scrolling ux
