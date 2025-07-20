import "../public/icon_436x211.png";

import "../public/icon_192x192.png";
import "../public/icon_436x436.png";
import "../public/icon_512x512.png";

import {documents, show_document} from "./documents";

declare var __USE_SW__: boolean;

if (__USE_SW__) {
    // service worker should be injected for offline support

    if ("serviceWorker" in navigator) {
        window.addEventListener("load", async () => {
            try {
                const registration = await navigator.serviceWorker.register("service-worker.js");
                console.log("SW registered: ", registration);

                // force update check on registration
                try {
                    await registration.update();
                    console.log("SW update check complete.");
                } catch (e) {
                    console.error("SW update check failed: ", e);
                }

                // check for updates every hour
                setInterval(async () => {
                    try {
                        await registration.update();
                        console.log("SW update check complete.");
                    } catch (e) {
                        console.error("SW update check failed: ", e);
                    }
                }, 60 * 60 * 1000);

                registration.addEventListener("updatefound", () => {
                    // a new service worker is waiting to be installed

                    const new_worker = registration.installing;

                    if (!new_worker) {
                        console.error("No new worker found during update.");
                        return;
                    }

                    new_worker.addEventListener("statechange", () => {
                        if (new_worker.state === "installed") {
                            if (navigator.serviceWorker.controller) {
                                // inform the user that a new version is available

                                localStorage.setItem("sw_update_available", "true");
                                show_document("Update", sw_update_doc);
                            }
                        }
                    });
                });
            } catch (e) {
                console.error("SW registration failed: ", e);
            }
        });
    }
}
// TODO: unregister if not __USE_SW__

// construct document to show when an update is available
const sw_update_doc = document.createElement("p");
sw_update_doc.innerHTML = "A new version of Ture is available!<br><br>";
sw_update_doc.style.textAlign = "center";

const sw_update_button = document.createElement("button");
sw_update_button.innerText = "Update";

// bind the update button to clear the cache and reload the page
sw_update_button.addEventListener("click", async () => {
    await clear_cache();
    localStorage.removeItem("sw_update_available");
    window.location.reload();
});

// TODO: this doesnt actually show internet connectivity status

// check for internet
if (!navigator.onLine) {
    sw_update_button.innerText = "Connect to internet to update";
    sw_update_button.disabled = true;
}

// check if internet access changed, and update the button enabled state accordingly
window.addEventListener("online", () => {
    sw_update_button.disabled = false;
    sw_update_button.innerText = "Update";
});

window.addEventListener("offline", () => {
    sw_update_button.disabled = true;
    sw_update_button.innerText = "Connect to internet to update";
});

sw_update_doc.appendChild(sw_update_button);

// not sure if this is the ideal approach but it sure as hell works
const clear_cache = async () => {
    if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
    }
}

// on page load, check if an update is meant to be applied
if (localStorage.getItem("sw_update_available") === "true") {
    show_document("Update", sw_update_doc);
}

export const is_using_sw = __USE_SW__;
export let is_standalone = () => window.matchMedia("(display-mode: standalone)").matches;
