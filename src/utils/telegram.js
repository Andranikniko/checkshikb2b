export const isTelegramWebApp = () => {
  return window.Telegram && window.Telegram.WebApp;
};

export const getTelegramWebApp = () => {
  return isTelegramWebApp() ? window.Telegram.WebApp : null;
};

export const getTelegramUserData = () => {
  const webApp = getTelegramWebApp();
  if (!webApp) return null;
  
  return {
    user_id: webApp.initDataUnsafe?.user?.id,
    chat_id: webApp.initDataUnsafe?.chat_instance,
    first_name: webApp.initDataUnsafe?.user?.first_name,
    last_name: webApp.initDataUnsafe?.user?.last_name,
    username: webApp.initDataUnsafe?.user?.username,
    language_code: webApp.initDataUnsafe?.user?.language_code,
    is_premium: webApp.initDataUnsafe?.user?.is_premium,
    platform: webApp.platform,
    version: webApp.version,
    theme_params: webApp.themeParams,
  };
}; 