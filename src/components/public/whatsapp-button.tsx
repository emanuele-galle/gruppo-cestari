'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';

const WHATSAPP_NUMBER = '39089952889'; // Gruppo Cestari phone number
const DEFAULT_MESSAGE = 'Salve, vorrei maggiori informazioni sui vostri servizi.';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
  showTooltip?: boolean;
}

export function WhatsAppButton({
  phoneNumber = WHATSAPP_NUMBER,
  message = DEFAULT_MESSAGE,
  showTooltip = true,
}: WhatsAppButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Show button after scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show tooltip after a delay
  useEffect(() => {
    if (isVisible && showTooltip && !dismissed) {
      const timer = setTimeout(() => {
        setShowMessage(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, showTooltip, dismissed]);

  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMessage(false);
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-6 right-6 z-50 flex items-end gap-3"
        >
          {/* Tooltip message */}
          <AnimatePresence>
            {showMessage && (
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                className="relative bg-white rounded-xl shadow-lg p-4 max-w-[200px] border border-slate-100"
              >
                {/* Close button */}
                <button
                  onClick={handleDismiss}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                  aria-label="Chiudi"
                >
                  <X className="w-3 h-3" />
                </button>

                {/* Message */}
                <p className="text-sm text-slate-700">
                  Hai bisogno di aiuto? Scrivici su WhatsApp!
                </p>

                {/* Arrow */}
                <div className="absolute right-4 -bottom-2 w-4 h-4 bg-white border-r border-b border-slate-100 transform rotate-45" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* WhatsApp button */}
          <motion.button
            onClick={handleClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-14 h-14 bg-[#25D366] rounded-full shadow-lg hover:shadow-xl flex items-center justify-center text-white transition-shadow group"
            aria-label="Contattaci su WhatsApp"
          >
            {/* Pulse animation */}
            <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />

            {/* Icon */}
            <MessageCircle className="w-7 h-7 relative z-10" />

            {/* Hover effect */}
            <span className="absolute inset-0 rounded-full bg-[#128C7E] opacity-0 group-hover:opacity-100 transition-opacity" />
            <MessageCircle className="w-7 h-7 absolute z-20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
