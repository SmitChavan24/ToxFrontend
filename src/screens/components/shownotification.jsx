
export function showNotification(title, body) {
    // console.log('first', title, body)
    // if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    //     alert("This browser does not support desktop notification or service workers");
    //     return;
    // }

    Notification.requestPermission().then((permission) => {
        // console.log('seconf', title, body)
        if (permission === "granted") {
            // console.log('third', title, body)
            navigator.serviceWorker.ready.then((registration) => {
                console.log('foutrr', registration)
                registration.showNotification(`${title}`, {
                    body,
                    // icon: "/images/touch/chrome-touch-icon-192x192.png", // make sure this path is correct and public
                    // vibrate: [200, 100, 200, 100, 200, 100, 200],
                    // tag: "vibration-sample",
                });
            });
        } else {
            console.warn("❌ Notification permission denied:", permission);
        }
    });
}
