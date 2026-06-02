'use client'
import { createContext, useContext, useState } from 'react';

// יוצרים את ה"מחסן"
const ModalContext = createContext({
  isOpen: false,
  openModal: () => {},
  closeModal: () => {},
});

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <ModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

// הוק קטן שמאפשר לכל קומפוננטה להשתמש במחסן
export const useModal = () => useContext(ModalContext);