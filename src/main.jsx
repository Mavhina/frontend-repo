import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { UnreadProvider } from "./pages/Unreadcontext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <UnreadProvider>
        <App />
      </UnreadProvider>
    </BrowserRouter>
  </React.StrictMode>
);