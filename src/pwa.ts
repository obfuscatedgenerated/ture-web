import "../public/icon_436x211.png";

import "../public/icon_192x192.png";
import "../public/icon_436x436.png";
import "../public/icon_512x512.png";

declare var __USE_SW__: boolean;

if (__USE_SW__) {
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("service-worker.js").then(registration => {
                console.log("SW registered: ", registration);
            }).catch(registrationError => {
                console.log("SW registration failed: ", registrationError);
            });
        });
    }
}

export const is_using_sw = __USE_SW__;
export const is_standalone = window.matchMedia("(display-mode: standalone)").matches ;
