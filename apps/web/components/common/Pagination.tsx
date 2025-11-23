/**
 * Pagination Component
 * Reusable pagination controls
 */

import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisible?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisible = 5,
}) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      let startPage = Math.max(2, currentPage - Math.floor(maxVisible / 2));
      let endPage = Math.min(totalPages - 1, startPage + maxVisible - 3);

      // Adjust start if we're near the end
      if (endPage === totalPages - 1) {
        startPage = Math.max(2, endPage - maxVisible + 3);
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('...');
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number') {
      onPageChange(page);
    }
  };

  return (
    <div className="pagination">
      <button
        className="pagination__button"
        onClick={handlePrevious}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        ← Previous
      </button>

      <div className="pagination__pages">
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            className={`pagination__page ${
              page === currentPage ? 'pagination__page--active' : ''
            } ${typeof page === 'string' ? 'pagination__page--ellipsis' : ''}`}
            onClick={() => handlePageClick(page)}
            disabled={typeof page === 'string'}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        className="pagination__button"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        Next →
      </button>

      <style jsx>{`
        .pagination {
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: center;
        }

        .pagination__button {
          padding: 8px 16px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .pagination__button:hover:not(:disabled) {
          background: #f5f5f5;
          border-color: #1976D2;
          color: #1976D2;
        }

        .pagination__button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination__pages {
          display: flex;
          gap: 4px;
        }

        .pagination__page {
          min-width: 40px;
          height: 40px;
          padding: 8px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .pagination__page:hover:not(:disabled):not(.pagination__page--active) {
          background: #f5f5f5;
          border-color: #1976D2;
          color: #1976D2;
        }

        .pagination__page--active {
          background: #1976D2;
          color: white;
          border-color: #1976D2;
          font-weight: 600;
        }

        .pagination__page--ellipsis {
          cursor: default;
          border-color: transparent;
        }

        .pagination__page--ellipsis:hover {
          background: white;
          border-color: transparent;
        }

        @media (max-width: 768px) {
          .pagination {
            flex-wrap: wrap;
          }

          .pagination__button {
            font-size: 12px;
            padding: 6px 12px;
          }

          .pagination__page {
            min-width: 32px;
            height: 32px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default Pagination;
