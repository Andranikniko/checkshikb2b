import React, { useEffect, useState } from 'react';
import { colors } from '../styles/theme';
import brandData from '../data/brand.json';

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
  const [originalPrice, setOriginalPrice] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);

  const brand = brandData.find(b => b.id === selectedBrand?.id);

  const getPrice = (answerTimeKey) => {
    if (!brand) return 0;
    switch (answerTimeKey) {
      case 'h_2': return brand.h_2;
      case 'h_12': return brand.h_12;
      case 'h_24': return brand.h_24;
      default: return 0;
    }
  };

  // Only 2h, 12h, 24h options
  const answerTimeOptions = [
    { key: 'h_2', label: '2 часа' },
    { key: 'h_12', label: '12 часов' },
    { key: 'h_24', label: '24 часа' },
  ];

  useEffect(() => {
    const price = getPrice(selectedAnswerTime);
    setOriginalPrice(price);
    setCurrentPrice(price);
    setTotalPrice(price);
  }, [selectedAnswerTime]);

  const fetchConfirmationToken = async () => {
    setLoading(true);
    try {
      // You may still need this for order logic; keep/remove as needed
      return true;
    } catch (err) {
      console.error(err);
      alert(`Could not submit order: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOrder = async () => {
    if (currentPrice === 0) {
      setCurrentScreen('success');
      return;
    }
    const ok = await fetchConfirmationToken();
    if (!ok) return;
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
              <span className="flex-1 text-lg">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-4 text-xl">
        <span className="font-bold">Сумма: </span>₽{currentPrice}
      </div>

      <button
        onClick={handleSubmitOrder}
        disabled={loading}
        className="mt-2 py-4 text-white rounded-lg disabled:bg-gray-300"
        style={{
          backgroundColor: loading ? colors.primary : colors.primary,
          color: colors.text_on_primary
        }}
      >
        {loading ? 'Оформление заказа...' : 'Оформить заказ'}
      </button>
    </div>
  );
};

export default PaymentDetailsScreen;
