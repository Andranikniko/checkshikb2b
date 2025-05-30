import React, { useEffect, useState } from 'react';
import { colors, typography } from '../styles/theme';
import { WEBHOOKS } from '../constants/config';
import { isTelegramWebApp, getTelegramUserData } from '../utils/telegram';
import Header from '../components/Header';

const SuccessScreen = ({ 
  selectedCategory, 
  selectedBrand, 
  uploadedPhotos, 
  selectedCustomerEmail, 
  selectedAnswerTime, 
  totalPrice,
  paymentId 
}) => {
  const [webhookStatus, setWebhookStatus] = useState('pending');

  useEffect(() => {
    const sendWebhook = async (retryCount = 0) => {
      const telegramData = getTelegramUserData();
      const payload = {
        customer_email: selectedCustomerEmail,
        category_id: selectedCategory?.id,
        brand_name: selectedBrand?.brand_back_name,
        category_name: selectedCategory?.category_back_name,
        brand_id: selectedBrand?.id === 'other' ? null : selectedBrand?.id,
        answer_time: selectedAnswerTime,
        price: totalPrice?.toString(),
        payment_id: paymentId,
        photos: uploadedPhotos?.map(photo => ({
          index: photo.index,
          url: photo.url,
        })),
        environment: isTelegramWebApp() ? 'telegram' : 'browser',
        ...(telegramData ? {
          telegram_user_id: telegramData.user_id,
          telegram_chat_id: telegramData.chat_id,
          user_first_name: telegramData.first_name,
          user_last_name: telegramData.last_name,
          user_username: telegramData.username,
          user_language_code: telegramData.language_code,
          user_is_premium: telegramData.is_premium,
          platform: telegramData.platform,
          version: telegramData.version,
          theme_params: telegramData.theme_params,
        } : {
          browser_user_agent: navigator.userAgent,
          browser_language: navigator.language,
          browser_platform: navigator.platform,
        })
      };

      try {
        const response = await fetch(WEBHOOKS.SUCCESS, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        console.log("Success response:", data);
        setWebhookStatus('success');
      } catch (err) {
        console.error("API call failed:", err);
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000;
          console.log(`Retrying webhook in ${delay}ms...`);
          setTimeout(() => sendWebhook(retryCount + 1), delay);
        } else {
          setWebhookStatus('error');
          localStorage.setItem('pendingWebhook', JSON.stringify(payload));
        }
      }
    };

    sendWebhook();
  }, [selectedCategory, selectedBrand, uploadedPhotos, selectedCustomerEmail, selectedAnswerTime, totalPrice, paymentId]);

  const handleClose = () => {
    if (isTelegramWebApp()) {
      window.Telegram.WebApp.close();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: colors.background }}>
      <Header showLogo />

      {/* Cover Image - Hidden for now */}
      {/* 
      <div className="h-56 flex items-center justify-center px-4" style={{ backgroundColor: colors.primary }}>
        <img
          src="/assets/cover2.jpeg"
          alt="Cover"
          className="w-full max-w-md rounded-lg shadow-lg"
        />
      </div>
      */}

      <div className="px-6 py-8 text-center" style={{ backgroundColor: colors.primary }}>
        <p className="mb-4" style={{ ...typography.body, color: colors.text_on_primary, fontFamily: 'Montserrat', fontWeight: 400 }}>
          Шик! Ваш запрос на Чек принят успешно!
        </p>
        <p className="mb-4" style={{ ...typography.body, color: colors.text_on_primary, fontFamily: 'Montserrat', fontWeight: 400 }}>
          {isTelegramWebApp() ? (
            <>Результат проверки будет отправлен вам в телеграм, в выбранное время ответа. Если для аутентификации нам понадобится больше фото, мы отправим запрос в телеграм.</>
          ) : (
            <>Результат проверки будет отправлен в телеграм чат, в выбранное время ответа. Если для аутентификации нам понадобится больше фото, мы отправим вам запрос.</>
          )}
        </p>

        {webhookStatus === 'error' && (
          <p className="mb-4 text-sm" style={{ color: colors.error, fontFamily: 'Montserrat', fontWeight: 400 }}>
            Примечание: Возникла проблема при отправке данных. Ваш заказ всё равно принят в обработку.
          </p>
        )}
      </div>

      <div className="p-6" style={{ backgroundColor: colors.primary }}>
        <button
          onClick={handleClose}
          className="w-full py-4 px-6 rounded-lg font-medium transition-all"
          style={{
            backgroundColor: 'transparent',
            border: `2px solid ${colors.text_on_primary}`,
            color: colors.text_on_primary,
            fontFamily: 'Montserrat',
            fontWeight: 400
          }}
          onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default SuccessScreen;
