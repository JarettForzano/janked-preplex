import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SearchEngine from './components/search';
import Display from './components/display';
import Layout from './components/togglebar';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/search" />} />
          <Route path="search" element={<SearchEngine />} />
          <Route path="search/:query" element={<Display />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;