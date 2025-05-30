import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { colors, typography } from '../styles/theme';

const Header = ({ title, showBackButton, showLogo, onBack }) => {
  const { WebApp } = window.Telegram;
  const isMobile = WebApp.platform === 'ios' || WebApp.platform === 'android';

  return (
    <div 
      className="w-full"
      style={{ 
        backgroundColor: colors.primary,
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)', // тень снизу
        zIndex: 10
      }}
    >
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center">
          {showBackButton && (
            <button 
              onClick={onBack} 
              className="flex items-center mr-4"
              style={{ color: colors.text_on_primary, fontFamily: 'PP Neue Montreal Mono', fontWeight: 400 }}
            >
              <ChevronLeft size={24} />
            </button>
          )}
          {title && (
            <h1 
              className="text-xl"
              style={{ 
                ...typography.h1, 
                fontFamily: 'PP Neue Montreal Mono', 
                fontWeight: 400,
                color: colors.text_on_primary
              }}
            >
              {title}
            </h1>
          )}
        </div>
        {showLogo && !title && (
          <div className="flex-1 flex justify-center">
            <img
              src="/assets/logo.png"
              alt="Logo"
              className="w-[254px] h-[80px] object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
