import { Header } from './components/Header';
import { MouseAura } from './components/MouseAura';
import { CustomCursor } from './components/CustomCursor';
import { Hero } from './sections/Hero';
import { Works } from './sections/Works';
import { Writing } from './sections/Writing';
import { Travel } from './sections/Travel';
import { Photography } from './sections/Photography';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="site-shell">
      <CustomCursor />
      <MouseAura />
      <div className="mesh mesh-a" />
      <div className="mesh mesh-b" />
      <div className="mesh mesh-c" />
      <Header />
      <main>
        <Hero />
        <Works />
        <Writing />
        <Travel />
        <Photography />
      </main>
      <Footer />
    </div>
  );
}

export default App;
