
import React from 'react';
import Header from './components/Header.tsx';
import Hero from './components/Hero.tsx';
import Footer from './components/Footer.tsx';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col selection:bg-[#1918f0]/10 selection:text-[#1918f0]">
      <Header />
      <main className="flex-1">
        <Hero />
      </main>
      <Footer />
    </div>
  );
};

export default App;
