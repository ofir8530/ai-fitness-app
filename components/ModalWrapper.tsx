'use client'
import { useModal } from './ModalContext';
import AddFoodModal from './AddFoodModal';

export default function ModalWrapper() {
  const { isOpen, closeModal } = useModal();
  return isOpen ? <AddFoodModal onClose={closeModal} /> : null;
}