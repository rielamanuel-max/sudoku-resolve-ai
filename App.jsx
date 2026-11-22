import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import SolvePage from './pages/SolvePage.jsx';
import ScanPage from './pages/ScanPage.jsx';
import LearnPage from './pages/LearnPage.jsx';
import './App.css';

function NotFound() {
  return <main className="page-shell container not-found"><span className="eyebrow">404 / NOT FOUND</span><h1>Questa pagina<br/><em>non esiste.</em></h1><a className="button primary" href="/">Torna alla home →</a></main>;
}
export default function App() {
  return <div className="app"><Navbar/><Routes><Route path="/" element={<HomePage/>}/><Route path="/solve" element={<SolvePage/>}/><Route path="/scan" element={<ScanPage/>}/><Route path="/learn" element={<LearnPage/>}/><Route path="*" element={<NotFound/>}/></Routes><Footer/></div>;
}
