import "../public/icon_436x211.png";

import "../public/icon_192x192.png";
import "../public/icon_436x436.png";
import "../public/icon_512x512.png";

import {documents, show_document} from "./documents";

declare var __USE_SW__: boolean;

if (__USE_SW__) {
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("service-worker.js").then(registration => {
                console.log("SW registered: ", registration);

                // force update check on registration
                registration.update().then(() => {
                    console.log("SW update check complete.");
                }).catch(updateError => {
                    console.error("SW update check failed: ", updateError);
                });

                // check for updates every hour
                setInterval(() => {
                    registration.update().then(() => {
                        console.log("SW update check complete.");
                    }).catch(updateError => {
                        console.error("SW update check failed: ", updateError);
                    });
                }, 60 * 60 * 1000); // every hour

                registration.addEventListener("updatefound", () => {
                    const new_worker = registration.installing;

                    if (!new_worker) {
                        console.error("No new worker found during update.");
                        return;
                    }

                    new_worker.addEventListener("statechange", () => {
                        if (new_worker.state === "installed") {
                            if (navigator.serviceWorker.controller) {
                                localStorage.setItem("sw_update_available", "true");
                                show_document("Update", sw_update_doc);
                            }
                        }
                    });
                });
            }).catch(registrationError => {
                console.log("SW registration failed: ", registrationError);
            });
        });
    }
}

const sw_update_doc = document.createElement("p");
sw_update_doc.innerHTML = "A new version of Ture is available!<br><br>";
sw_update_doc.style.textAlign = "center";

const sw_update_button = document.createElement("button");
sw_update_button.innerText = "Update";
sw_update_button.addEventListener("click", () => {
    clear_cache();
    localStorage.removeItem("sw_update_available");
    window.location.reload();
});

sw_update_doc.appendChild(sw_update_button);

// not sure if this is the ideal apporach but it sure as hell works
const clear_cache = () => {
    if ("caches" in window) {
        caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
                caches.delete(cacheName).then(() => {
                    console.log(`Cache ${cacheName} cleared.`);
                }).catch(err => {
                    console.error(`Failed to clear cache ${cacheName}: `, err);
                });
            });
        });
    }
}

// on page load, check if an update is meant to be applied
if (localStorage.getItem("sw_update_available") === "true") {
    show_document("Update", sw_update_doc);
}

export const is_using_sw = __USE_SW__;
export let is_standalone = () => window.matchMedia("(display-mode: standalone)").matches;
