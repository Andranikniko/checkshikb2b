import React, { useState } from 'react';
import { colors, shadows } from '../styles/theme';

const IndexSquare = ({
  photoType,
  uploadedPhotos,
  handleUpload,
  loading,
  warnedIndexes,
}) => {
  const [showExample, setShowExample] = useState(false);
  const isUploaded = uploadedPhotos.some(
    (photo) => photo.index === photoType.index_back_name
  );
  const isRequired = photoType.important === 'TRUE';
  const isWarned = warnedIndexes?.includes(photoType.index_back_name);

  const getBorderClass = () => {
    if (isUploaded) return 'border-2';
    if (isRequired) return 'border-2 border-dotted';
    return 'border border-transparent'; // transparent border for non-required, non-uploaded items
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleUpload(photoType.index_back_name);
  };

  return (
    <div
      className={`relative p-4 rounded-lg ${getBorderClass()} transition-all cursor-pointer`}
      onClick={handleClick}
      style={{
        backgroundColor: colors.background,
        boxShadow: shadows.small,
        borderColor: isUploaded
          ? colors.primary
          : isRequired
            ? colors.border
            : 'transparent',
      }}
    >
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div
          className="flex flex-col items-center"
          style={{ backgroundColor: colors.background }}
        >
          <img
            src={photoType.icon_url}
            alt={photoType.index_display_name}
            className="w-18 h-18 mb-2"
          />
          <span className="text-center text-sm font-medium">
            {photoType.index_display_name}
          </span>
          {isUploaded && (
            <div className="absolute top-2 right-2 w-4 h-4 rounded-full" />
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowExample(!showExample);
            }}
            className="absolute top-2 right-2 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300"
          >
            ?
          </button>
        </div>
      )}
      {showExample && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowExample(false);
          }}
        >
          <div className="bg-white p-4 rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <img
              src={photoType.photo_example_url}
              alt={`Example for ${photoType.index_display_name}`}
              className="max-w-full h-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default IndexSquare;
