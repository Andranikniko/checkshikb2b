import React, { useState, useEffect } from 'react';
import { colors } from '../styles/theme';
import { API_ENDPOINTS, API_CREDENTIALS, WEBHOOKS } from '../constants/config';
import IndexSquare from '../components/IndexSquare';
import indexData from '../data/index.json';

const ReuploadScreen = ({ orderId, setCurrentScreen }) => {
  const [reuploadIndexes, setReuploadIndexes] = useState([]);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [token, setToken] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(null);
  const [warnedIndexes, setWarnedIndexes] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  // Fetch the indexes that need reuploading when the component mounts
  useEffect(() => {
    fetch(API_ENDPOINTS.REUPLOAD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId })
    })
      .then(res => res.json())
      .then(data => {
        // Merge the API response with local index data based on index_back_name
        const merged = data.map(apiIndex => {
          const match = indexData.find(item => item.index_back_name === apiIndex.index_back_name);
          return {
            ...apiIndex,
            index_display_name: match ? match.index_display_name : apiIndex.index_front_text,
            icon_url: match ? match.icon_url : '/assets/placeholder.png',
            photo_example_url: match ? match.photo_example_url : apiIndex.photo_example_url,
          };
        });
        setReuploadIndexes(merged);
      })
      .catch(err => console.error('Error fetching reupload indexes', err));
  }, [orderId]);

  // Functions to fetch token and pre-signed URL
  const fetchToken = async () => {
    if (token) return token;
    try {
      const res = await fetch(API_ENDPOINTS.AUTHORIZE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(API_CREDENTIALS)
      });
      const data = await res.json();
      setToken(data.access_token);
      return data.access_token;
    } catch (error) {
      console.error('Error fetching token', error);
    }
  };

  const fetchPresignedUrl = async (accessToken) => {
    try {
      const res = await fetch(API_ENDPOINTS.UPLOAD_LINK, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Error fetching presigned URL', error);
    }
  };

  // Handle file upload for a given index (photo type)
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
        const presignedData = await fetchPresignedUrl(accessToken);
        // Upload file via PUT
        await fetch(presignedData.presigned_url, {
          method: 'PUT',
          body: file
        });
        // Save uploaded photo info
        setUploadedPhotos(prev => [...prev, { index: indexBackName, url: presignedData.url }]);
        // Remove from warned indexes if it was there
        setWarnedIndexes(prev => prev.filter(index => index !== indexBackName));
      } catch (error) {
        console.error('Upload failed', error);
      } finally {
        setUploading(false);
        setLoadingIndex(null);
      }
    };
    fileInput.click();
  };

  // Check that every index in the reuploadIndexes has an uploaded photo
  const allUploaded = reuploadIndexes.length > 0 &&
    reuploadIndexes.every(idx => uploadedPhotos.some(photo => photo.index === idx.index_back_name));

  // Handle submission: send POST request with order id, photos, and webhook_event
  const handleSubmit = async () => {
    if (!allUploaded) {
      // Find missing indexes
      const missingIndexes = reuploadIndexes
        .filter(idx => !uploadedPhotos.some(photo => photo.index === idx.index_back_name))
        .map(idx => idx.index_back_name);
      
      setWarnedIndexes(missingIndexes);
      setShowPopup(true);
      return;
    }

    if (uploading) return;
    
    try {
      const body = {
        id: orderId,
        webhook_event: "photos-reuploaded",
        photos: uploadedPhotos // array of { index, url }
      };
      const res = await fetch(WEBHOOKS.WEBHOOK_REUPLOAD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`Failed to submit: ${res.status}`);
      // Optionally process response...
      window.Telegram.WebApp.close();
    } catch (error) {
      console.error("Error during submission", error);
      alert("Ошибка при отправке. Попробуйте ещё раз.");
    }
  };

  return (
    <div className="flex flex-col h-full p-4" style={{ backgroundColor: colors.background }}>
      {reuploadIndexes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full space-y-6">
          <p className="text-center text-lg">
            Все фотографии загружены, команда аутентификаторов работает над вашим заказом!
          </p>
          <button
            onClick={() => window.Telegram.WebApp.close()}
            className="py-4 px-8 rounded-lg text-center"
            style={{
              backgroundColor: colors.primary,
              color: colors.text_on_primary
            }}
          >
            Закрыть
          </button>
        </div>
      ) : (
        <>
      <div className="grid grid-cols-3 gap-2">
  {reuploadIndexes.map((photoType, idx) => (
    <IndexSquare
      key={idx}
      photoType={photoType}
      uploadedPhotos={uploadedPhotos}
      handleUpload={handleUpload}
      loading={loadingIndex === photoType.index_back_name}
      warnedIndexes={warnedIndexes}
    />
  ))}
</div>
          <br />
          <button
            onClick={handleSubmit}
            className={`mt-auto py-4 rounded-lg text-center bg-orange-500 text-white`}
            style={{
              backgroundColor: colors.primary,
              color: colors.text_on_primary
            }}
          >
            Загрузить и отправить
          </button>
          <br></br>

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
                  Пожалуйста, загрузите все необходимые фотографии
                </p>
                <button
                  onClick={() => setShowPopup(false)}
                  className="w-full py-2 text-white rounded-lg"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.text_on_primary
                  }}
                >
                  Понятно
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReuploadScreen; 
