import React, { useState } from 'react';
import { colors, shadows } from '../styles/theme';
import brandData from '../data/brand.json';
import brandCategoryInfo from '../data/brand_category_info.json';

const BrandScreen = ({ onSelect, selectedCategory }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter brands based on selected category and search term
  const filteredBrands = brandData.filter((brand) => {
    const categoryInfo = brandCategoryInfo.find(
      (info) =>
        info.category_id === selectedCategory.id && info.brand_id === brand.id
    );
    const matchesSearch = brand.brand_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return categoryInfo && matchesSearch;
  });

  return (
    <div className="p-4" style={{ backgroundColor: colors.background }}>
      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Поиск бренда"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 rounded-lg transition-all focus:outline-none"
          style={{
            backgroundColor: colors.background,
            border: `1px solid ${colors.border}`,
            color: colors.text,
            fontFamily: '"Montserrat", sans-serif',
            fontSize: '14px',
          }}
        />
      </div>

      {/* Brands List */}
      <div>
        {filteredBrands.map((brand) => (
          <div
            key={brand.id}
            onClick={() => onSelect(brand)}
            className="py-3 px-2 mb-2 rounded-lg cursor-pointer transition-all"
            style={{
              backgroundColor: 'transparent',
              color: colors.text,
              fontFamily: '"Montserrat", sans-serif',
              fontSize: '16px',
              fontWeight: 500,
              border: `1px solid transparent`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.secondary_two;
              e.currentTarget.style.color = colors.background;
              e.currentTarget.style.boxShadow = shadows.small;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = colors.text;
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {brand.brand_name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandScreen;
