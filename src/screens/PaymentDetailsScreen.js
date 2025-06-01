import React, { useEffect, useState } from 'react';
import { colors } from '../styles/theme';
import brandData from '../data/brand.json';
import { WEBHOOKS } from '../constants/config';
import { getTelegramUserData } from '../utils/telegram';

const PaymentDetailsScreen = ({
  selectedBrand,
  selectedCategory,
  setConfirmationToken,
  setCurrentScreen,
  selectedAnswerTime,
  setSelectedAnswerTime,
  setTotalPrice,
  setPaymentId,
}) => {
  const [loading, setLoading] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const brand = brandData.find(b => b.id === selectedBrand?.id);
  const getPrice = (answerTimeKey) => {
    if (!brand) return 0;
    switch (answerTimeKey) {
      case 'min_30': return brand.min_30;
      case 'h_2': return brand.h_2;
      case 'h_12': return brand.h_12;
      case 'h_24': return brand.h_24;
      default: return 0;
    }
  };

  const answerTimeOptions = [
    { key: 'min_30', label: '30 минут', price: getPrice('min_30') },
    { key: 'h_2', label: '2 часа', price: getPrice('h_2') },
    { key: 'h_12', label: '12 часов', price: getPrice('h_12') },
    { key: 'h_24', label: '24 часа', price: getPrice('h_24') },
  ];

  // Update total price whenever selectedAnswerTime changes
  useEffect(() => {
    const price = getPrice(selectedAnswerTime);
    setOriginalPrice(price);
    // Reset promo state when answer time changes
    setPromoApplied(false);
    setPromoCode('');
    setShowPromoInput(false);
    setCurrentPrice(price);
    setTotalPrice(price);
  }, [selectedAnswerTime]);

  const handlePromoCode = async () => {
    const telegramData = getTelegramUserData();
    if (!promoCode.trim()) return;

    try {
      const response = await fetch(WEBHOOKS.PAYMENT_DETAILS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: telegramData?.user_id || 'browser_user',
          promo_code: promoCode,
          original_sum: originalPrice,
          brand: selectedBrand?.brand_name,
          category: selectedCategory?.category_back_name
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        setCurrentPrice(data.new_sum);
        setTotalPrice(data.new_sum);
        setPromoApplied(true);
        setShowPromoInput(false);
      } else if (response.status === 400) {
        setPopupMessage(data.error || 'Промокод недействителен');
        setShowPopup(true);
      } else {
        setPopupMessage('Произошла ошибка при применении промокода');
        setShowPopup(true);
      }
    } catch (error) {
      console.error('Error applying promo code:', error);
      setPopupMessage('Произошла ошибка при применении промокода');
      setShowPopup(true);
    }
  };

  const fetchConfirmationToken = async () => {
    setLoading(true);
    try {
      const body = {
        price: currentPrice.toString() || "2.00",
        brand: selectedBrand?.brand_name,
        category: selectedCategory?.category_back_name,
        answer_time: selectedAnswerTime,
        description: `${selectedBrand?.brand_name} | ${selectedCategory?.category_back_name} | ${selectedAnswerTime}`
      };

      const response = await fetch(WEBHOOKS.CONFIRMATION_TOKEN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch token: ${response.status}`);
      }

      const data = await response.json();
      if (!data.confirmation_token) {
        throw new Error('No confirmation_token in response!');
      }

      setConfirmationToken(data.confirmation_token);
      if (data.payment_id) {
        setPaymentId(data.payment_id);
      }
      return data.confirmation_token;
    } catch (err) {
      console.error(err);
      alert(`Could not fetch confirmation token: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (currentPrice === 0) {
      // For zero-sum cases, skip payment widget and go directly to success
      setCurrentScreen('success');
      return;
    }

    // Skip payment widget and go directly to success screen
    // Payment will be handled separately after successful execution of scenario
    const token = await fetchConfirmationToken();
    if (!token) return;
    
    // Redirect directly to success screen instead of payment widget
    setCurrentScreen('success');
  };

  return (
    <div className="flex flex-col h-full p-4" style={{ backgroundColor: colors.background }}>
      <div className="mb-4">
        <label className="block mb-2 font-medium">Время ответа</label>
        <div className="flex flex-col space-y-2">
          {answerTimeOptions.map((option) => (
            <label
              key={option.key}
              className={`flex items-center border p-2 rounded cursor-pointer ${
                selectedAnswerTime === option.key ? 'border-orange-500' : 'border-gray-300'
              }`}
              style={{
                borderColor: selectedAnswerTime === option.key ? colors.primary : colors.secondary,
              }}
            >
              <input
                type="radio"
                name="answerTime"
                value={option.key}
                checked={selectedAnswerTime === option.key}
                onChange={() => setSelectedAnswerTime(option.key)}
                className="mr-2"
                style={{
                  accentColor: colors.primary
                }}
              />
              <span className="flex-1 text-lg">
                {option.label} {option.price}₽
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={() => setShowPromoInput(!showPromoInput)}
          className="flex items-center text-sm text-gray-600 hover:text-gray-800"
        >
          <span className="mr-1">+</span> Промокод
        </button>
        
        {showPromoInput && (
          <div className="mt-2 flex gap-1">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg p-2"
              placeholder="Введите промокод"
              style={{
                borderColor: colors.secondary,
                backgroundColor: colors.background,
              }}
            />
            <button
              onClick={handlePromoCode}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg"
              style={{ backgroundColor: colors.primary, color: colors.text_on_primary }}
            >
              Применить
            </button>
          </div>
        )}
      </div>

      <div className="mb-4 text-xl">
        <span className="font-bold">Сумма: </span>₽{currentPrice}
      </div>

      <button
        onClick={handlePay}
        disabled={loading}
        className="mt-2 py-4 text-white rounded-lg disabled:bg-gray-300"
        style={{
          backgroundColor: loading ? colors.primary : colors.primary,
          color: colors.text_on_primary
        }}
      >
        {loading ? 'Переход к оплате...' : 'К оплате'}
      </button>

      {showPopup && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowPopup(false)}
        >
          <div 
            className="bg-white p-6 rounded-lg max-w-sm w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-center text-lg mb-4">
              {popupMessage}
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="w-full py-2 text-white rounded-lg"
              style={{
                backgroundColor: colors.primary,
                color: colors.text
              }}
            >
              Назад
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDetailsScreen; 
