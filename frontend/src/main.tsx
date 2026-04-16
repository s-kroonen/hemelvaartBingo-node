import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // The file you just showed me
import "./styles/index.css";    // Your Tailwind/CSS imports

// 1. Grab the 'root' div from your index.html
const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error("Target container 'root' not found. Check your index.html");
}

// 2. Inject the App into the DOM
ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);