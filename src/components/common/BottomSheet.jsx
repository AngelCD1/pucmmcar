import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function BottomSheet({ 
  children, 
  isOpen, 
  onClose, 
  title,
  maxHeight = "60vh"
}) {
  const [startY, setStartY] = useState(null);
  const [currentY, setCurrentY] = useState(0);
  const sheetRef = useRef(null);

  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    if (startY === null) return;
    const deltaY = e.touches[0].clientY - startY;
    if (deltaY > 0) {
      setCurrentY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (currentY > 100) {
      onClose();
    }
    setStartY(null);
    setCurrentY(0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[100] md:hidden"
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: currentY }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#081229] z-[101] rounded-t-[32px] shadow-2xl md:hidden overflow-hidden flex flex-col"
            style={{ maxHeight, transform: `translateY(${currentY}px)` }}
          >
            {/* Drag Handle */}
            <div 
              className="w-full py-4 flex flex-col items-center cursor-grab active:cursor-grabbing"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mb-2" />
              {title && <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</h3>}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-24">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
