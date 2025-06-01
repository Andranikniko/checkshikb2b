import React, { useState, useEffect } from 'react';
import { colors } from './styles/theme';
import Header from './components/Header';
import { isTelegramWebApp, getTelegramWebApp } from './utils/telegram';

// Import screens
import HomeScreen from './screens/HomeScreen';
import CategoryScreen from './screens/CategoryScreen';
import BrandScreen from './screens/BrandScreen';
import UploadPhotosScreen from './screens/UploadPhotosScreen';
import PaymentDetailsScreen from './screens/PaymentDetailsScreen';
import PaymentWidgetScreen from './screens/PaymentWidgetScreen';
import SuccessScreen from './screens/SuccessScreen';
import ReuploadScreen from './screens/ReuploadScreen';
import FAQScreen from './screens/FAQScreen';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState('');
  const [selectedAnswerTime, setSelectedAnswerTime] = useState('h_24');
  const [totalPrice, setTotalPrice] = useState(0);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [confirmationToken, setConfirmationToken] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [paymentId, setPaymentId] = useState(null);

  // Initialize Telegram WebApp if available
  useEffect(() => {
    if (isTelegramWebApp()) {
      const webApp = getTelegramWebApp();
      webApp.ready();
      webApp.expand();
    }
  }, []);

  // Scroll to top when screen changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentScreen]);

  // Check URL parameter for order id on mount and switch to reupload if exists
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const screen = params.get("screen");
    
    if (screen === "faq") {
      setCurrentScreen("faq");
    } else if (id) {
      setOrderId(id);
      setCurrentScreen("reupload");
    }
  }, []);

  // Navigate to previous screen
  const goBack = () => {
    switch (currentScreen) {
      case 'home':
        setCurrentScreen('home');
        break;
      case 'category':
        setCurrentScreen('home');
        break;
      case 'brand':
        setCurrentScreen('category');
        setSelectedBrand(null);
        break;
      case 'authentication':
        setCurrentScreen('brand');
        break;
      case 'paymentDetails':
        setCurrentScreen('authentication');
        break;
      // Hide payment widget navigation since screen is hidden
      // case 'paymentWidget':
      //   setCurrentScreen('paymentDetails');
      //   break;
      default:
        break;
    }
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedBrand(null);
    setUploadedPhotos([]);
    setCurrentScreen('brand');
  };

  // Handle brand selection
  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    setUploadedPhotos([]);
    setCurrentScreen('authentication');
  };

  // Get header title based on current screen
  const getHeaderTitle = () => {
    switch (currentScreen) {
      case 'category':
        return 'ВЫБЕРИТЕ КАТЕГОРИЮ';
      case 'brand':
        return 'ВЫБЕРИТЕ БРЕНД';
      case 'authentication':
        return 'ЗАГРУЗИТЕ ФОТОГРАФИИ';
      case 'paymentDetails':
        return 'ВЫБЕРИТЕ ВРЕМЯ ОТВЕТА';
      // Hide payment widget header since screen is hidden
      // case 'paymentWidget':
      //   return 'ОПЛАТА';
      case 'reupload':
        return 'ПЕРЕЗАГРУЗИТЕ ФОТОГРАФИИ';
      case 'faq':
        return 'FAQ';
      default:
        return null;
    }
  };

  // Add these above your renderScreen function

  const handleBrandNext = () => {
    setCurrentScreen('authentication');
  };

  const handlePaymentSuccess = () => {
    setCurrentScreen('success');
  };

  // Render current screen based on state
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen setCurrentScreen={setCurrentScreen} />;
      case 'category':
        return <CategoryScreen onSelect={handleCategorySelect} />;
      case 'brand':
        return <BrandScreen onSelect={handleBrandSelect} selectedCategory={selectedCategory} />;
      case 'authentication':
        return (
          <UploadPhotosScreen
            selectedCategory={selectedCategory}
            selectedBrand={selectedBrand}
            uploadedPhotos={uploadedPhotos}
            setUploadedPhotos={setUploadedPhotos}
            setCurrentScreen={setCurrentScreen}
          />
        );
      case 'paymentDetails':
        return (
          <PaymentDetailsScreen
            selectedCategory={selectedCategory}
            selectedBrand={selectedBrand}
            setConfirmationToken={setConfirmationToken}
            setCurrentScreen={setCurrentScreen}
            selectedCustomerEmail={selectedCustomerEmail}
            setSelectedCustomerEmail={setSelectedCustomerEmail}
            selectedAnswerTime={selectedAnswerTime}
            setSelectedAnswerTime={setSelectedAnswerTime}
            setTotalPrice={setTotalPrice}
            setPaymentId={setPaymentId}
          />
        );
      // Hide payment widget screen - payment will be handled separately
      // case 'paymentWidget':
      //   return <PaymentWidgetScreen 
      //     confirmationToken={confirmationToken}
      //     setCurrentScreen={setCurrentScreen}
      //     onSuccess={handlePaymentSuccess} 
      //   />;
      case 'success':
        return <SuccessScreen 
          selectedCategory={selectedCategory}
          selectedBrand={selectedBrand}
          uploadedPhotos={uploadedPhotos}
          selectedCustomerEmail={selectedCustomerEmail}
          selectedAnswerTime={selectedAnswerTime}
          totalPrice={totalPrice}
          paymentId={paymentId}
        />;
      case 'reupload':
        return <ReuploadScreen orderId={orderId} />;
      case 'faq':
        return <FAQScreen onClose={() => setCurrentScreen('home')} />;
      default:
        return <HomeScreen onCategorySelect={handleCategorySelect} />;
    }
  };

  return (
    <div className="flex flex-col bg-white min-h-screen safe-area-inset-top safe-area-inset-bottom">
      {currentScreen !== 'home' && currentScreen !== 'orderConfirmed' && currentScreen !== 'faq' && (
        <Header
          title={getHeaderTitle()}
          showBackButton={currentScreen !== 'home' && currentScreen !== 'orderConfirmed'}
          showLogo={currentScreen === 'home' || currentScreen === 'orderConfirmed'}
          onBack={goBack}
        />
      )}

      {/* Content */}
      <main className="flex-1 overflow-auto" style={{ 
        backgroundColor: colors.background,
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}>
        {(currentScreen === 'home' || currentScreen === 'orderConfirmed')  && (
          <Header
            title={getHeaderTitle()}
            showBackButton={currentScreen !== 'home' && currentScreen !== 'orderConfirmed'}
            showLogo={currentScreen === 'home' || currentScreen === 'orderConfirmed'}
            onBack={goBack}
          />
        )}
        {renderScreen()}
      </main>
    </div>
  );
};

export default App;
