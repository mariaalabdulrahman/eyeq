import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScanProvider } from "./contexts/ScanContext";
import Home from "./pages/Home";
import Index from "./pages/Index";
import PatientRecords from "./pages/PatientRecords";
import LLMChat from "./pages/LLMChat";
import NotFound from "./pages/NotFound";

const App = () => (
  <BrowserRouter>
    <ScanProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Index />} />
        <Route path="/records" element={<PatientRecords />} />
        <Route path="/llm-chat" element={<LLMChat />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ScanProvider>
  </BrowserRouter>
);

export default App;