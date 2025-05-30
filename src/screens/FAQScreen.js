import React, { useState } from 'react';
import { colors } from '../styles/theme';
import Header from '../components/Header';

const FAQScreen = ({ onClose }) => {
  const [expandedItems, setExpandedItems] = useState({});

  const faqItems = [
    {
      question: "Что такое Double Check?",
      answer: "Double Check - это первый в России сервис по аутентификации брендовых товаров, совмещающий в себе проверку AI-технологией и проверку профессиональными аутентификаторами. Совмещая AI с технологиям, мы достигаем 99.5% точности по проведенным проверкам. "
    },
    {
      question: "Как работает 2-факторная аутентификация?",
      answer: "🟡1 этап: Проверка с помощью AI-технологии, которая анализирует изображения изделия и сравнивает его с базой других фотографий. (Таких фотографий в базе от 10.000 на каждую модель) \nAI определяет % схожести фотографий с оригиналом и с фейком и склоняется в ту или иную сторону в своем вердикте. \n\n⚪️2 этап: проверка экспертом. Эксперты в нашей команде - это люди с опытом от 6 лет в индустрии люкса, ресейла и аутентификации. Каждый аутентификатор проверил от 15,000 изделий за свою жизнь, а лучший наш эксперт проверил более 1,000,000 вещей. 🤓\nПроанализировав фотографии изделия, эксперт также выносит вердикт и если его мнение совпадает с мнением AI, аутентификация пройдена.\nЕсли нет, то аутентификация проходит 3 этап: проверку у еще одного эксперта. \nЕсли аутентификаторы не смогут вынести вердикт, денежные средства за аутентификацию будут возвращены на ваш счет."
    },
    {
      question: "Сколько стоит проверка?",
      answer: "Стоимость проверки зависит от времени ответа и категории бренда, которое вы выберете. Диапазон цен от 2000 рублей - 5200 рублей."
    },
    {
      question: "Сколько времени длится проверка?",
      answer: "Вы можете выбрать время ответа из следующих вариантов: 24 часа, 12 часов, 2 часа и 30 минут. Результат проверки с сертификатом будет отправлен вам в этот чат."
    },
    {
      question: "Какие бренды вы проверяете?",
      answer: "Мы проверяем более 300 брендов. Например, Louis Vuitton, Chanel, Gucci, Hermès, Dior, Prada, Saint Laurent, Burberry, Fendi, Balenciaga, Michael Kors, Celine, Cartier, Bottega Veneta, Jacquemus, Chrome Hearts, Miu Miu, Nike, Air Jordan, Van Cleef и Tiffany & Co."
    }
  ];

  const toggleItem = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Header title="FAQ" />
      
      <div style={{
        padding: '20px',
        flex: 1,
        overflowY: 'auto'
      }}>
        {faqItems.map((item, index) => (
          <div
            key={index}
            style={{
              marginBottom: '16px',
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            <button
              onClick={() => toggleItem(index)}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: colors.background,
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{
                fontWeight: 'bold',
                color: colors.text
              }}>
                {item.question}
              </span>
              <span style={{
                fontSize: '20px',
                color: colors.text
              }}>
                {expandedItems[index] ? '−' : '+'}
              </span>
            </button>
            
            {expandedItems[index] && (
              <div style={{
                padding: '16px',
                backgroundColor: 'white',
                color: colors.text
              }}>
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{
        padding: '20px'
      }}>
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: colors.primary,
            color: colors.text_on_primary,
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default FAQScreen; 