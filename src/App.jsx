import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import DeckDetail from './pages/DeckDetail'
import Review from './pages/Review'
import Browse from './pages/Browse'
import PromptGuide from './pages/PromptGuide'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/deck/:id" element={<DeckDetail />} />
        <Route path="/review/:id" element={<Review />} />
        <Route path="/browse/:id" element={<Browse />} />
        <Route path="/prompt-guide" element={<PromptGuide />} />
      </Routes>
    </HashRouter>
  )
}
