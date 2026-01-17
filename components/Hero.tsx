
import React from 'react';
import ChatCard from './ChatCard.tsx';

const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40 bg-white">
      {/* Subtle Divider */}
      <div className="absolute top-0 left-0 w-full h-px bg-gray-50"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Column: Text */}
          <div className="max-w-2xl">
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-8">
              <span className="text-gray-300 font-normal">The </span>
              <span className="text-black font-extrabold">AI resume builder</span>
              <span className="text-gray-300 font-normal"> that helps you get </span>
              <span className="text-black font-extrabold">hired</span>
              <span className="text-gray-300 font-normal"> at your </span>
              <span className="text-black font-extrabold">dream job.</span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
              Zysculpt turns your experience and any job description into a resume recruiters want to read.
            </p>
          </div>

          {/* Right Column: AI Chat Card */}
          <div className="flex justify-center lg:justify-end animate-in fade-in zoom-in duration-700">
            <ChatCard />
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default Hero;