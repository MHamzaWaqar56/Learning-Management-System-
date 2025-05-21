import React from 'react';
import styled from 'styled-components';

const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: ${props => props.visible ? 'block' : 'none'};
`;

const ModalMask = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 8px;
  width: 80%;
  max-width: 800px;
  max-height: 80vh;
  overflow: auto;
  padding: 24px;
`;

const FixedModal = ({ visible, onClose, children }) => {
  if (!visible) return null;

  return (
    <ModalWrapper visible={visible}>
    <ModalMask onClick={onClose} />
    <ModalContent onClick={e => e.stopPropagation()}>
      {children}
    </ModalContent>
  </ModalWrapper>
  );
};

export default FixedModal;

