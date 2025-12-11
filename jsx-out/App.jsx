import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Index from "./pages/Index";
import PatientRecords from "./pages/PatientRecords";
import NotFound from "./pages/NotFound";
const App = () => (<BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />}/>
      <Route path="/dashboard" element={<Index />}/>
      <Route path="/records" element={<PatientRecords />}/>
      <Route path="*" element={<NotFound />}/>
    </Routes>
  </BrowserRouter>);
export default App;
