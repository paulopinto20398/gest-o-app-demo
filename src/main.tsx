import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BeneficiariesProvider } from "@/contexts/BeneficiariesContext";

createRoot(document.getElementById("root")!).render(
    <BeneficiariesProvider>
        <App />
    </BeneficiariesProvider>
);

