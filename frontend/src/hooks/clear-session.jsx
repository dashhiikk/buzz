export default function clearSessionState() {
    const prefixes = [
        "room:",
        "two-panel-layout",
        "settings:",
    ];

    Object.keys(sessionStorage).forEach((key) => {
        if (prefixes.some((prefix) => key.startsWith(prefix))) {
            sessionStorage.removeItem(key);
        }
    });
}