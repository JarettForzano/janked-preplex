import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SearchEngine from './components/search';
import Display from './components/display.tsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SearchEngine />} />
        <Route path="/search/:query" element={<Display />} />
      </Routes>
    </Router>
  );
}

export default App;
