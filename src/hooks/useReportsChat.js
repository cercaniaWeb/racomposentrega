import { useState } from 'react';

export const useReportsChat = () => {
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const openChatModal = () => {
    setIsChatModalOpen(true);
  };

  const closeChatModal = () => {
    setIsChatModalOpen(false);
  };

  return {
    isChatModalOpen,
    openChatModal,
    closeChatModal
  };
};