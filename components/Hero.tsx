
import React from 'react';
import ChatCard from './ChatCard.tsx';

interface HeroProps {
  mode: 'resume' | 'cover_letter' | 'resignation';
}

const Hero: React.FC<HeroProps> = ({ mode }) => {
  const getHeroContent = () => {
    switch(mode) {
      case 'cover_letter':
        return {
          title: "The AI cover letter builder that makes you stand out.",
          desc: "Zysculpt crafts persuasive cover letters that highlight your unique value and land you more interviews."
        };
      case 'resignation':
        return {
          title: "The AI resignation letter builder for a graceful exit.",
          desc: "Exit with confidence and professionalism. Zysculpt helps you maintain positive relationships during career transitions."
        };
      default:
        return {
          title: "The AI resume builder that helps you get hired at your dream job.",
          desc: "Zysculpt turns your experience and any job description into a resume recruiters want to read."
        };
    }
  };

  const { title, desc } = getHeroContent();

  return (
    <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-40 bg-gradient-to-br from-[#f0f9ff] to-[#f5f3ff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tighter mb-8 text-[#0f172a]">
              {title}
            </h1>
            <p className="text-xl text-[#475569] leading-relaxed max-w-xl tracking-tight">
              {desc}
            </p>
          </div>
          <div className="flex justify-center lg:justify-end animate-in fade-in zoom-in duration-700">
            <ChatCard mode={mode} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;