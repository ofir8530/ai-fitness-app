'use client'
import { createContext, useContext, useMemo, useState, useCallback } from 'react';

type ModalContextValue = {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};

const ModalContext = createContext<ModalContextValue>({
  isOpen: false,
  openModal: () => {},
  closeModal: () => {},
});

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = useCallback(() => {
    console.log('[ModalContext] openModal called');
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    console.log('[ModalContext] closeModal called');
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({ isOpen, openModal, closeModal }),
    [isOpen, openModal, closeModal]
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);