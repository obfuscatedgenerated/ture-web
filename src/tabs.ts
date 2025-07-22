// a neat js component to manage the tabs. not sure if i'll use this again but thought it was a neat approach to managing the code

/**
 * Tabs component to manage tabbed navigation in a UI.
 */
export default class Tabs {
    private listeners: { [target: string]: (() => any)[] } = {};
    private _current_tab: string | null = null;

    /**
     * Adds a listener for the given target ID. The callback will be called when the tab is changed to the target ID.
     * @param target_id The ID of the target element to listen for
     * @param callback The callback to call when the tab is changed to the target ID
     */
    add_listener = (target_id: string, callback: () => any) => {
        // check if the target_id exists in listeners
        if (!this.listeners[target_id]) {
            this.listeners[target_id] = [];
        }

        // add the callback to the listeners for the target_id
        this.listeners[target_id].push(callback);
    }

    get current_tab() {
        return this._current_tab;
    }

    /**
     * Changes the current tab to the target element with the given ID.
     * @param target The ID of the target element to show
     */
    change_tab = (target: string) => {
        // remove hidden class from the target element
        const element = document.getElementById(target) as HTMLDivElement;
        if (element) {
            element.classList.remove("hidden");
        } else {
            console.warn(`No element found with ID: ${target}`);
        }

        // set current tab
        this._current_tab = target;

        // fire all listeners for the target
        if (this.listeners[target]) {
            this.listeners[target].forEach(callback => {
                try {
                    callback();
                } catch (error) {
                    console.error(`Error in listener for target ${target}:`, error);
                }
            });
        }
    }

    /**
     * Creates a new Tabs instance to manage tabbed navigation in a UI.
     * @param container The HTMLDivElement containing .tabs-buttons and .tabs-pane elements.
     */
    constructor(container: HTMLDivElement) {
        const buttons = container.querySelector(".tabs-buttons") as HTMLDivElement;
        const pane = container.querySelector(".tabs-pane") as HTMLDivElement;

        // bind each button
        buttons.querySelectorAll("button").forEach(button => {
            button.addEventListener("click", () => {
                // remove active class from all buttons
                buttons.querySelectorAll("button").forEach(btn => btn.classList.remove("active"));

                // add active class to clicked button
                button.classList.add("active");

                // hide all top level elements in the pane
                // @ts-ignore
                const children = [...pane.children];
                children.forEach(el => el.classList.add("hidden"));

                // show the container in the pane corresponding to the clicked button
                const target = button.getAttribute("data-target");
                if (target) {
                    this.change_tab(target);

                    // also scroll to the top of the pane
                    pane.scrollTo({ top: 0, behavior: "smooth" });
                } else {
                    console.warn("Button has no data-target attribute.");
                }
            });
        });
    }
}
