import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";  // Importing App, but no need to export it

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />  {/* Renders App, no need to export it */}
  </StrictMode>
);
