import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SearchEngine from './components/search';
import Display from './components/display';
import { ThemeProvider } from './components/theme-provider';
function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/search" />} /> {/* Redirect from root to /search */}
          <Route path="/search" element={<SearchEngine />} />
          <Route path="/search/:query" element={<Display />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
