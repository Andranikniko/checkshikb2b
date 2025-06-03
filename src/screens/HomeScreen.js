import React from 'react';
import { colors, typography } from '../styles/theme';
import { FONT_FAMILY } from '../constants/font-family';

const HomeScreen = ({ setCurrentScreen }) => {
  return (
    <div
      className="flex flex-col justify-center items-center min-h-screen text-center px-4"
      style={{ backgroundColor: colors.primary }}
    >
      {/* Основной текст */}
      <div className="mb-8 max-w-md">
        <h2
          style={{
            ...typography.h2,
            color: colors.text_on_primary,
            fontFamily: FONT_FAMILY,
            fontWeight: 700,
            lineHeight: '1.2',
          }}
        >
          ПРОВЕРЬТЕ ПОДЛИННОСТЬ <br /> БРЕНДОВЫХ ВЕЩЕЙ
        </h2>
        <p
          style={{
            ...typography.body,
            color: colors.text_on_primary,
            fontFamily: FONT_FAMILY,
            fontWeight: 400,
            marginTop: '1.5rem',
          }}
        >
          ЧекШик — сервис онлайн-проверки оригинальности одежды, сумок, обуви и аксессуаров.
          <br />
          <br />
          Отправьте фотографии и получите профессиональное заключение от экспертов ЧекШик. 
          Поддержка более 200 брендов.
        </p>
      </div>

      {/* Кнопка */}
      <button
        onClick={() => setCurrentScreen('category')}
        className="py-2 px-8 rounded-lg font-medium transition-all"
        style={{
          backgroundColor: 'transparent',
          border: '2px solid rgba(255, 255, 255, 0.8)',
          color: '#FFFFFF',
          fontFamily: FONT_FAMILY,
          fontWeight: 500,
        }}
        onMouseOver={(e) =>
          (e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)')
        }
        onMouseOut={(e) => (e.currentTarget.style.boxShadow = 'none')}
      >
        НАЧАТЬ
      </button>
    </div>
  );
};

export default HomeScreen;
