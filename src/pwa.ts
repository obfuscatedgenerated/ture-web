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

                registration.addEventListener("updatefound", () => {
                    const new_worker = registration.installing;

                    if (!new_worker) {
                        console.error("No new worker found during update.");
                        return;
                    }

                    new_worker.addEventListener("statechange", () => {
                        if (new_worker.state === "installed") {
                            if (navigator.serviceWorker.controller) {
                                show_document("Update", documents.sw_update);
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

export const is_using_sw = __USE_SW__;
export let is_standalone = () => window.matchMedia("(display-mode: standalone)").matches;
