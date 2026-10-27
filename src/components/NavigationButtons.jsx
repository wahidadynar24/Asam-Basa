import React from 'react';

export default function NavigationButtons({
  onPrev,
  onNext,
  prevLabel = 'Kembali',
  nextLabel = 'Lanjut',
  isNextDisabled = false,
  showPrev = true,
  showNext = true,
  nextSubtext = ''
}) {
  return (
    <div className="nav-buttons-container">
      {showPrev ? (
        <button
          type="button"
          className="btn-nav btn-prev"
          onClick={onPrev}
        >
          <span className="btn-arrow">←</span>
          <span>{prevLabel}</span>
        </button>
      ) : <div />}

      {showNext && (
        <div className="nav-next-group">
          <button
            type="button"
            className="btn-nav btn-next"
            onClick={onNext}
            disabled={isNextDisabled}
          >
            <span>{nextLabel}</span>
            <span className="btn-arrow">→</span>
          </button>
          {nextSubtext && <p className="nav-subtext">{nextSubtext}</p>}
        </div>
      )}
    </div>
  );
}
