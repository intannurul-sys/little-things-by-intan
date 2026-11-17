import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Museum from "./pages/Museum";
import Diary from "./pages/Diary";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/museum" element={<Museum />} />
          <Route path="/diary" element={<Diary />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}