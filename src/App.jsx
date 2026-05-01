import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import DeckDetail from './pages/DeckDetail'
import Review from './pages/Review'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/deck/:id" element={<DeckDetail />} />
        <Route path="/review/:id" element={<Review />} />
      </Routes>
    </HashRouter>
  )
}
