import './index.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProyectoSection from './components/ProyectoSection';
import DatasetSection from './components/DatasetSection';
import FeaturesSection from './components/FeaturesSection';
import ModelosSection from './components/ModelosSection';
import BacktestSection from './components/BacktestSection';
import BacktestRunner from './components/BacktestRunner';
import ComparadorSection from './components/ComparadorSection';
import SignalsSection from './components/SignalsSection';
import SimuladorSection from './components/SimuladorSection';
import InformeSection from './components/InformeSection';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProyectoSection />
        <DatasetSection />
        <FeaturesSection />
        <ModelosSection />
        <SimuladorSection />
        <BacktestSection />
        <BacktestRunner />
        <ComparadorSection />
        <SignalsSection />
        <InformeSection />
      </main>
      <Footer />
      <ChatBot />
    </>
  );
}
