import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import DemoApp from "./DemoApp.jsx";
import { ToastProvider } from "../ui.jsx";
import { applySavedTheme } from "../theme.js";
import "@fontsource-variable/inter";
import "../tokens.css";
import "../app.css";
import "./demo.css";

applySavedTheme();
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider><DemoApp /></ToastProvider>
    </BrowserRouter>
  </StrictMode>,
);
