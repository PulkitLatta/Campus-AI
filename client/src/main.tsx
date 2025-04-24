import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Import Google Fonts and Material Icons
const linkFont = document.createElement('link');
linkFont.rel = 'stylesheet';
linkFont.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
document.head.appendChild(linkFont);

const linkIcons = document.createElement('link');
linkIcons.rel = 'stylesheet';
linkIcons.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
document.head.appendChild(linkIcons);

// Add title
document.title = "CampusAI - Smart Campus Companion";

createRoot(document.getElementById("root")!).render(<App />);
