import { BorderRadius, Colors, Spacing, Typography } from '@/constants/design-system';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface QrValidationModalProps {
  visible: boolean;
  onClose: () => void;
  onValidate: (amountGross: number, personsCount: number) => void;
  partnerId: string;
  storeId: string;
  operatorUserId: string;
  qrToken: string;
  storeName?: string;
  isValidating?: boolean;
}

export function QrValidationModal({
  visible,
  onClose,
  onValidate,
  partnerId,
  storeId,
  operatorUserId,
  qrToken,
  storeName,
  isValidating = false,
}: QrValidationModalProps) {
  const [amountGross, setAmountGross] = useState('');
  const [personsCount, setPersonsCount] = useState('1');

  const handleValidate = () => {
    // Validation des champs
    const amount = parseFloat(amountGross);
    const persons = parseInt(personsCount, 10);

    if (!amountGross || isNaN(amount) || amount < 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }

    if (!personsCount || isNaN(persons) || persons < 1) {
      Alert.alert('Erreur', 'Le nombre de personnes doit être au moins 1');
      return;
    }

    console.log('✅ [QR Validation Modal] Validation avec:', {
      amountGross: amount,
      personsCount: persons,
    });

    onValidate(amount, persons);
  };

  const handleCancel = () => {
    setAmountGross('');
    setPersonsCount('1');
    onClose();
  };

  const incrementPersons = () => {
    const current = parseInt(personsCount, 10) || 1;
    setPersonsCount(String(current + 1));
  };

  const decrementPersons = () => {
    const current = parseInt(personsCount, 10) || 1;
    if (current > 1) {
      setPersonsCount(String(current - 1));
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.headerLeft}>
                <Ionicons name="qr-code" size={28} color="#8B2F3F" />
                <Text style={styles.modalTitle}>Validation du QR Code</Text>
              </View>
              <TouchableOpacity
                onPress={handleCancel}
                style={styles.closeButton}
                disabled={isValidating}
              >
                <Ionicons name="close" size={28} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Informations QR Code */}
              {storeName && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Magasin</Text>

                  <View style={styles.storeCard}>
                    <View style={styles.storeIconContainer}>
                      <Ionicons name="storefront" size={32} color="#8B2F3F" />
                    </View>
                    <Text style={styles.storeName}>{storeName}</Text>
                  </View>
                </View>
              )}

              {/* Formulaire de saisie */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informations de la transaction</Text>

                {/* Montant */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Montant total <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="cash-outline" size={24} color="#8B2F3F" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={amountGross}
                      onChangeText={setAmountGross}
                      placeholder="0.00"
                      placeholderTextColor={Colors.text.secondary}
                      keyboardType="decimal-pad"
                      editable={!isValidating}
                    />
                    <Text style={styles.currency}>€</Text>
                  </View>
                  <Text style={styles.hint}>Montant total avant réduction</Text>
                </View>

                {/* Nombre de personnes */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Nombre de personnes <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.counterContainer}>
                    <TouchableOpacity
                      style={[styles.counterButton, personsCount === '1' && styles.counterButtonDisabled]}
                      onPress={decrementPersons}
                      disabled={isValidating || personsCount === '1'}
                    >
                      <Ionicons name="remove" size={24} color={personsCount === '1' ? Colors.text.muted : '#8B2F3F'} />
                    </TouchableOpacity>

                    <View style={styles.counterValueContainer}>
                      <Ionicons name="people" size={24} color="#8B2F3F" />
                      <TextInput
                        style={styles.counterInput}
                        value={personsCount}
                        onChangeText={setPersonsCount}
                        keyboardType="number-pad"
                        editable={!isValidating}
                      />
                    </View>

                    <TouchableOpacity
                      style={styles.counterButton}
                      onPress={incrementPersons}
                      disabled={isValidating}
                    >
                      <Ionicons name="add" size={24} color="#8B2F3F" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.hint}>Nombre de personnes concernées par la transaction</Text>
                </View>
              </View>

              {/* Note d'information */}
              <View style={styles.noteContainer}>
                <Ionicons name="information-circle" size={20} color="#3B82F6" />
                <Text style={styles.noteText}>
                  La réduction sera automatiquement calculée selon le plan d'abonnement du client.
                </Text>
              </View>
            </ScrollView>

            {/* Boutons d'action */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                disabled={isValidating}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.validateButton, isValidating && styles.buttonDisabled]}
                onPress={handleValidate}
                disabled={isValidating}
              >
                {isValidating ? (
                  <>
                    <Text style={styles.validateButtonText}>Validation...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                    <Text style={styles.validateButtonText}>Valider</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  } as ViewStyle,
  safeArea: {
    flex: 0,
  } as ViewStyle,
  modalContent: {
    backgroundColor: '#1A0A0E',
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    maxHeight: '90%',
  } as ViewStyle,
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  } as ViewStyle,
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  } as ViewStyle,
  modalTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: '700',
    color: Colors.text.light,
  } as TextStyle,
  closeButton: {
    padding: Spacing.xs,
  } as ViewStyle,
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  } as ViewStyle,
  section: {
    marginBottom: Spacing.xl,
  } as ViewStyle,
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
    color: Colors.text.light,
    marginBottom: Spacing.md,
  } as TextStyle,
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  } as ViewStyle,
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  } as ViewStyle,
  infoTextContainer: {
    flex: 1,
  } as ViewStyle,
  infoLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
    marginBottom: 2,
  } as TextStyle,
  infoValue: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.light,
    fontWeight: '600',
  } as TextStyle,
  formGroup: {
    marginBottom: Spacing.lg,
  } as ViewStyle,
  label: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    color: Colors.text.light,
    marginBottom: Spacing.sm,
  } as TextStyle,
  required: {
    color: '#EF4444',
  } as TextStyle,
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: 'rgba(139, 47, 63, 0.3)',
    paddingHorizontal: Spacing.md,
  } as ViewStyle,
  inputIcon: {
    marginRight: Spacing.sm,
  } as ViewStyle,
  input: {
    flex: 1,
    fontSize: Typography.sizes.xl,
    fontWeight: '700',
    color: Colors.text.light,
    paddingVertical: Spacing.md,
  } as TextStyle,
  currency: {
    fontSize: Typography.sizes.xl,
    fontWeight: '700',
    color: '#8B2F3F',
    marginLeft: Spacing.xs,
  } as TextStyle,
  hint: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  } as TextStyle,
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  } as ViewStyle,
  counterButton: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(139, 47, 63, 0.2)',
    borderWidth: 2,
    borderColor: '#8B2F3F',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  counterButtonDisabled: {
    opacity: 0.3,
    borderColor: Colors.text.muted,
  } as ViewStyle,
  counterValueContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: 'rgba(139, 47, 63, 0.3)',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  } as ViewStyle,
  counterInput: {
    flex: 1,
    fontSize: Typography.sizes.xl,
    fontWeight: '700',
    color: Colors.text.light,
    paddingVertical: Spacing.md,
    textAlign: 'center',
  } as TextStyle,
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  } as ViewStyle,
  noteText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: Colors.text.light,
    lineHeight: 20,
  } as TextStyle,
  modalFooter: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  } as ViewStyle,
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  } as ViewStyle,
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  } as ViewStyle,
  cancelButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    color: Colors.text.light,
  } as TextStyle,
  validateButton: {
    backgroundColor: '#8B2F3F',
  } as ViewStyle,
  validateButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: '700',
    color: 'white',
  } as TextStyle,
  buttonDisabled: {
    opacity: 0.5,
  } as ViewStyle,
});
