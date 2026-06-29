import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { installShelfOutboundForwarder } from "./components/mockups/evidently/_links";

// Drain shelf-card "Visit brand" clicks to the API analytics sink.
// Install once at app boot so every preview iframe shares a single
// queue and pagehide listener.
installShelfOutboundForwarder();

createRoot(document.getElementById("root")!).render(<App />);
