import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Work from './components/Work.jsx';
import FacilitationAreas from './components/FacilitationAreas.jsx';
import Approach from './components/Approach.jsx';
import Speaking from './components/Speaking.jsx';
import Writing from './components/Writing.jsx';
import Contact from './components/Contact.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Work />
        <FacilitationAreas />
        <Approach />
        <Speaking />
        <Writing />
        <Contact />
      </main>
    </>
  );
}
