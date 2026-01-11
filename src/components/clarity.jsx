import { useEffect } from 'react';

export function Clarity() {
    useEffect(() => {
        // This function is a direct adaptation of the script provided by Microsoft Clarity.
        // It ensures that the Clarity tracking script is loaded asynchronously.
        (function (c, l, a, r, i, t, y) {
            c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) };
            t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
            y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
        })(window, document, "clarity", "script", "uyko6rz814");
    }, []);

    return null;
}
