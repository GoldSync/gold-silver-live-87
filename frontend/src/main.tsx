import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Disable React DevTools and wipe console in production
if (import.meta.env.PROD && typeof window !== 'undefined') {
    // 1. Disable React DevTools
    if ((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
        for (const key in hook) {
            if (key === 'renderers') continue;
            hook[key] = typeof hook[key] === 'function' ? () => { } : null;
        }
    }

    // 2. Silent Console: Wipe all logs/errors/warnings
    const methods: (keyof Console)[] = ['log', 'debug', 'info', 'warn', 'error', 'table', 'trace', 'group', 'groupCollapsed'];
    methods.forEach(method => {
        (console as any)[method] = () => { };
    });
}

createRoot(document.getElementById("root")!).render(<App />);
