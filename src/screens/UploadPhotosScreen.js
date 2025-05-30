import React, { useState } from 'react';
import { colors, shadows } from '../styles/theme';
import { API_CREDENTIALS, API_ENDPOINTS } from '../constants/config';
import IndexSquare from '../components/IndexSquare';
import indexData from '../data/index.json';

const UploadPhotosScreen = ({
  selectedCategory,
  selectedBrand,
  uploadedPhotos,
  setUploadedPhotos,
  setCurrentScreen,
}) => {
  const [token, setToken] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(null);
  const [warnedIndexes, setWarnedIndexes] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const photoTypes = indexData.filter(
    (index) => index.category_id === selectedCategory.id
  );
  const requiredPhotoTypes = photoTypes.filter((pt) => pt.required === 'TRUE');

  const allRequiredUploaded = requiredPhotoTypes.every((pt) =>
    uploadedPhotos.some((photo) => photo.index === pt.index_back_name)
  );

  const fetchToken = async () => {
    if (token) return token;
    try {
      const res = await fetch(API_ENDPOINTS.AUTHORIZE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(API_CREDENTIALS),
      });
      const data = await res.json();
      if (!data.access_token) throw new Error('Не получен токен авторизации');
      setToken(data.access_token);
      return data.access_token;
    } catch (error) {
      console.error('Error fetching token', error);
      setErrorMessage('Ошибка авторизации. Попробуйте позже.');
    }
  };

  const fetchPresignedUrl = async (accessToken) => {
    try {
      const res = await fetch(API_ENDPOINTS.UPLOAD_LINK, {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (!data.presigned_url)
        throw new Error('Не получена ссылка для загрузки');
      return data;
    } catch (error) {
      console.error('Error fetching presigned URL', error);
      setErrorMessage(
        'Ошибка получения ссылки для загрузки. Попробуйте позже.'
      );
    }
  };

  const handleUpload = async (indexBackName) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setUploading(true);
      setLoadingIndex(indexBackName);
      try {
        const accessToken = await fetchToken();
        if (!accessToken) return;
        const presignedData = await fetchPresignedUrl(accessToken);
        if (!presignedData) return;
        const uploadResponse = await fetch(presignedData.presigned_url, {
          method: 'PUT',
          body: file,
        });
        if (uploadResponse.ok) {
          setUploadedPhotos((prev) => [
            ...prev,
            { index: indexBackName, url: presignedData.url },
          ]);
          setWarnedIndexes((prev) =>
            prev.filter((index) => index !== indexBackName)
          );
        }
      } catch (error) {
        console.error('Upload failed', error);
        setErrorMessage('Ошибка загрузки изображения. Попробуйте ещё раз.');
      } finally {
        setUploading(false);
        setLoadingIndex(null);
      }
    };
    fileInput.click();
  };

  const handleNext = () => {
    if (!allRequiredUploaded) {
      const missingRequiredIndexes = requiredPhotoTypes
        .filter(
          (pt) =>
            !uploadedPhotos.some((photo) => photo.index === pt.index_back_name)
        )
        .map((pt) => pt.index_back_name);

      setWarnedIndexes(missingRequiredIndexes);
      setShowPopup(true);
      return;
    }
    setCurrentScreen('paymentDetails');
  };
  return (
    <div
      className="flex flex-col h-full p-4"
      style={{ backgroundColor: colors.background }}
    >
      {/* Grid of photos */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {photoTypes.map((photoType) => (
          <IndexSquare
            key={photoType.index_id}
            photoType={photoType}
            uploadedPhotos={uploadedPhotos}
            handleUpload={handleUpload}
            loading={uploading && loadingIndex === photoType.index_back_name}
            warnedIndexes={warnedIndexes}
          />
        ))}
      </div>

      {/* Button */}
      <div className="mt-auto">
        <button
          onClick={handleNext}
          className="w-full py-4 rounded-lg transition-all"
          style={{
            backgroundColor: colors.primary,
            color: colors.text_on_primary,
            fontFamily: '"Montserrat", sans-serif',
            fontWeight: 700,
            fontSize: '16px',
            boxShadow: shadows.small,
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.boxShadow = shadows.medium)
          }
          onMouseOut={(e) => (e.currentTarget.style.boxShadow = shadows.small)}
        >
          Выбор времени ответа
        </button>
      </div>

      {/* Popup for missing required photos */}
      {showPopup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="bg-white p-6 rounded-lg max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center text-lg mb-4">
              Пожалуйста, загрузите обязательные фото (выделенные пунктиром)
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="w-full py-2 rounded-lg text-center"
              style={{
                backgroundColor: colors.primary,
                color: colors.text_on_primary,
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 600,
              }}
            >
              Понятно
            </button>
          </div>
        </div>
      )}

      {/* Popup for errors */}
      {errorMessage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setErrorMessage('')}
        >
          <div
            className="bg-white p-6 rounded-lg max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center text-lg mb-4">{errorMessage}</p>
            <button
              onClick={() => setErrorMessage('')}
              className="w-full py-2 rounded-lg text-center"
              style={{
                backgroundColor: colors.primary,
                color: colors.text_on_primary,
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 600,
              }}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPhotosScreen;
