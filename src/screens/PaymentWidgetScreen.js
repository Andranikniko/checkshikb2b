import React, { useRef, useEffect } from 'react';
import { colors, shadows } from '../styles/theme';

const PaymentWidgetScreen = ({ 
  confirmationToken, 
  setCurrentScreen,
  onPaymentComplete 
}) => {
  const widgetContainerRef = useRef(null);
  const widgetRenderedRef = useRef(false);
  const checkoutRef = useRef(null);

  useEffect(() => {
    console.log('PaymentWidgetScreen mounted, token:', confirmationToken);
    
    const loadScript = () => {
      return new Promise((resolve, reject) => {
        if (window.YooMoneyCheckoutWidget) {
          console.log('YooMoney script already loaded');
          resolve();
          return;
        }

        console.log('Loading YooMoney script...');
        const script = document.createElement('script');
        script.src = 'https://yookassa.ru/checkout-widget/v1/checkout-widget.js';
        script.async = true;
        script.onload = () => {
          console.log('YooMoney script loaded successfully');
          resolve();
        };
        script.onerror = (error) => {
          console.error('Failed to load YooMoney script:', error);
          reject(error);
          setCurrentScreen('error');
        };
        document.body.appendChild(script);
      });
    };

    const initializeWidget = async () => {
      try {
        await loadScript();
        
        if (!widgetRenderedRef.current && confirmationToken && window.YooMoneyCheckoutWidget) {
          console.log('Initializing widget with token:', confirmationToken);
          widgetRenderedRef.current = true;
          
          checkoutRef.current = new window.YooMoneyCheckoutWidget({
            confirmation_token: confirmationToken,
            error_callback: function(error) {
              console.error('Widget error:', error);
              if (checkoutRef.current) {
                checkoutRef.current.destroy();
              }
              setCurrentScreen('error');
            },
            customization: {
              colors: {
                control_primary: colors.primary,
                background: colors.background
              }
            }
          });

          // Handle successful payment
          checkoutRef.current.on('success', () => {
            console.log('Payment successful');
            // Don't destroy immediately, let the complete handler do it
            setCurrentScreen('success');
          });

          // Handle payment completion (regardless of success/failure)
          checkoutRef.current.on('complete', (event) => {
            console.log('Payment completed:', event);
            // Destroy widget after a short delay to allow for any pending operations
            setTimeout(() => {
              if (checkoutRef.current) {
                checkoutRef.current.destroy();
                checkoutRef.current = null;
              }
            }, 1000);
            
            if (event && event.status === 'success') {
              setCurrentScreen('success');
            } else {
              setCurrentScreen('error');
            }
          });

          // Handle payment failure
          checkoutRef.current.on('fail', (error) => {
            console.error('Payment failed:', error);
            if (checkoutRef.current) {
              checkoutRef.current.destroy();
              checkoutRef.current = null;
            }
            setCurrentScreen('error');
          });

          checkoutRef.current.render('payment-widget-form');
          console.log('Widget rendered');
        }
      } catch (error) {
        console.error('Failed to initialize widget:', error);
        setCurrentScreen('error');
      }
    };

    if (confirmationToken) {
      initializeWidget();
    }

    return () => {
      console.log('PaymentWidgetScreen unmounting');
      widgetRenderedRef.current = false;
      // Clean up widget on unmount
      if (checkoutRef.current) {
        checkoutRef.current.destroy();
        checkoutRef.current = null;
      }
      const script = document.querySelector('script[src="https://yookassa.ru/checkout-widget/v1/checkout-widget.js"]');
      if (script) {
        script.remove();
      }
    };
  }, [confirmationToken, setCurrentScreen]);

  return (
    <div className="flex flex-col h-full p-4" style={{ backgroundColor: colors.background }}>
      <div 
        id="payment-widget-form" 
        ref={widgetContainerRef} 
        style={{ 
          marginTop: 20,
          minHeight: '400px',
          width: '100%',
          border: '1px solid #eee',
          borderRadius: '8px',
          padding: '16px'
        }}
      >
        {!confirmationToken && <div>Loading payment widget...</div>}
      </div>
    </div>
  );
};

export default PaymentWidgetScreen; 
