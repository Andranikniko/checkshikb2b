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
  const [unableToProvide, setUnableToProvide] = useState({});
  const [loadingIndexes, setLoadingIndexes] = useState(true);

  // Fetch the indexes that need reuploading when the component mounts
  useEffect(() => {
    setLoadingIndexes(true);
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
        setLoadingIndexes(false);
      })
      .catch(err => {
        console.error('Error fetching reupload indexes', err);
        setLoadingIndexes(false);
      });
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

  // Check that every index in the reuploadIndexes has an uploaded photo or is marked as unable to provide
  const allUploaded = reuploadIndexes.length > 0 &&
    reuploadIndexes.every(idx =>
      uploadedPhotos.some(photo => photo.index === idx.index_back_name) ||
      unableToProvide[idx.index_back_name]
    );

  // Handle submission: send POST request with order id, photos, and webhook_event
  const handleSubmit = async () => {
    if (uploading) return;
    setUploading(true);
    if (!allUploaded) {
      // Find missing indexes
      const missingIndexes = reuploadIndexes
        .filter(idx =>
          !uploadedPhotos.some(photo => photo.index === idx.index_back_name) &&
          !unableToProvide[idx.index_back_name]
        )
        .map(idx => idx.index_back_name);
      setWarnedIndexes(missingIndexes);
      setShowPopup(true);
      setUploading(false);
      return;
    }

    try {
      const photos = reuploadIndexes.map(idx => {
        if (unableToProvide[idx.index_back_name]) {
          return { index: idx.index_back_name, is_unable_to_provide: true };
        }
        const uploaded = uploadedPhotos.find(photo => photo.index === idx.index_back_name);
        if (uploaded) {
          return { index: idx.index_back_name, url: uploaded.url };
        }
        return null;
      }).filter(Boolean);
      const body = {
        id: orderId,
        webhook_event: "photos-reuploaded",
        photos
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
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4" style={{ backgroundColor: colors.background }}>
      {/* Loader overlay for initial fetch */}
      {loadingIndexes && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-10 w-10 text-primary mb-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span style={{ color: colors.primary }}>Загрузка...</span>
          </div>
        </div>
      )}
      {/* Loader overlay */}
      {uploading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-10 w-10 text-primary mb-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span style={{ color: colors.primary }}>Загрузка...</span>
          </div>
        </div>
      )}
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
    <div key={idx} className="flex flex-col items-center">
      <IndexSquare
        photoType={photoType}
        uploadedPhotos={uploadedPhotos}
        handleUpload={handleUpload}
        loading={loadingIndex === photoType.index_back_name}
        warnedIndexes={warnedIndexes}
      />
      <label className="mt-2 flex items-center text-xs">
        <input
          type="checkbox"
          checked={!!unableToProvide[photoType.index_back_name]}
          onChange={e => setUnableToProvide(prev => ({
            ...prev,
            [photoType.index_back_name]: e.target.checked
          }))}
          className="mr-1"
        />
        Не могу предоставить
      </label>
    </div>
  ))}
</div>
          <br />
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className={`mt-auto py-4 rounded-lg text-center bg-orange-500 text-white ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
            style={{
              backgroundColor: colors.primary,
              color: colors.text_on_primary
            }}
          >
            {uploading ? (
              <span className="flex items-center justify-center">x
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Загрузка...
              </span>
            ) : (
              'Загрузить и отправить'
            )}
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
