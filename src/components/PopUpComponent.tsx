import React from 'react';
import { Modal, View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { scaler } from 'utils';

interface IPopupComponent {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const PopupComponent: React.FC<IPopupComponent> = ({ isOpen, onClose, children }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isOpen}
      onRequestClose={() => onClose()}
    >
      <TouchableWithoutFeedback onPress={() => onClose()}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            {children}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: scaler(24),

  },
});

export default PopupComponent;
