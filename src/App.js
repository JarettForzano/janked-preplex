import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SearchEngine from './components/search.tsx';
import Display from './components/display.tsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/search" element={<SearchEngine />} />
        <Route path="/search/:query" element={<Display />} />
      </Routes>
    </Router>
  );
}

export default App;
