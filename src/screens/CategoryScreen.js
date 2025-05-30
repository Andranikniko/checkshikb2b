import React from 'react';
import { colors, shadows } from '../styles/theme';
import categoryData from '../data/category.json';

const CategoryScreen = ({ onSelect }) => {
  return (
    <div className="p-4" style={{ backgroundColor: colors.background }}>
      <div className="grid grid-cols-2 gap-4 max-w-[440px] mx-auto">
        {categoryData.map((category) => (
          <div
            key={category.id}
            className="relative cursor-pointer rounded-lg overflow-hidden transition-all w-full min-w-[160px] max-w-[200px] mx-auto"
            style={{
              boxShadow: shadows.small,
            }}
            onClick={() => onSelect(category)}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = shadows.medium;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = shadows.small;
            }}
          >
            <img
              src={`/assets/category/${category.category_back_name}.jpeg`}
              alt={category.category_display_name}
              className="w-full h-[200px] object-cover"
            />
            <div
              className="absolute bottom-0 left-0 w-full p-2"
              style={{
                backgroundColor: 'rgba(50, 23, 77, 0.7)', // Прозрачный Russian Violet
              }}
            >
              <span
                className="block text-center text-sm uppercase"
                style={{
                  color: colors.background,
                  fontFamily: '"Montserrat", sans-serif',
                  fontWeight: 600,
                }}
              >
                {category.category_display_name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryScreen;
