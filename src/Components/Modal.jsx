import { useEffect } from 'react';

/**
 * @param {{
 *  open: boolean,
 *  title?: string,
 *  onClose: () => void,
 *  children: any,
 * }} props
 */
export default function Modal({ open, title, onClose, children }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {title ?? 'Details'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 flex items-center justify-center"
              title="Close"
              type="button"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="p-5 overflow-auto max-h-[calc(90vh-64px)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

