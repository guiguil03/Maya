import { AnimatedButton } from '@/components/common/animated-button';
import { NavigationTransition } from '@/components/common/navigation-transition';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/design-system';
import { useAuth } from '@/hooks/use-auth';
import { QrService, QrTokenData } from '@/services/qr.service';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { user } = useAuth();
  const [qrData, setQrData] = useState<QrTokenData | null>(null);
  const [qrLoading, setQrLoading] = useState(true);
  const [qrError, setQrError] = useState<string | null>(null);
  const [qrCodeResponse, setQrCodeResponse] = useState<any | null>(null);

  // Vérifier si l'utilisateur est un partenaire
  useEffect(() => {
    // Détecter si l'email contient "partner" ou si l'utilisateur a un rôle partenaire
    const isPartner = user?.email?.toLowerCase().includes('partner') || 
                      user?.email?.toLowerCase().includes('partenaire') ||
                      (user as any)?.role === 'partner' ||
                      (user as any)?.isPartner === true;
    
    if (isPartner) {
      // Rediriger vers l'interface partenaire
      router.replace('/(tabs)/partner-home');
    }
  }, [user]);

  // Charger le QR Code côté client
  const loadQrToken = useCallback(async (forceRefresh: boolean = false) => {
    setQrLoading(true);
    setQrError(null);
    try {
      // Récupérer le QR Code complet avec l'image
      const qrCode = await QrService.getCurrentQrCode();
      console.log('✅ [Home] QR Code récupéré:', {
        hasToken: !!qrCode.token,
        hasImage: !!qrCode.imageBase64,
        hasUrl: !!qrCode.qrCodeUrl,
        tokenPreview: qrCode.token ? qrCode.token.substring(0, 30) + '...' : 'undefined',
      });
      
      setQrCodeResponse(qrCode);
      
      // Utiliser le token pour l'affichage
      // IMPORTANT: Ce même token sera utilisé dans l'app ET dans le PDF
      if (qrCode.token) {
        const token: QrTokenData = {
          token: qrCode.token,
          expiresAt: qrCode.expiresAt,
        };
        setQrData(token);
        console.log('🔑 [Home] Token sauvegardé pour affichage et PDF:', token.token.substring(0, 30) + '...');
      } else {
        throw new Error('Token manquant dans la réponse');
      }
    } catch (error) {
      console.error('Erreur lors du chargement du QR Code:', error);
      // Fallback sur issueQrToken si getCurrentQrCode échoue
      try {
        const token = await QrService.issueQrToken(forceRefresh);
        if (token?.token) {
          setQrData(token);
          setQrCodeResponse(null); // Réinitialiser pour forcer l'utilisation du fallback
        } else {
          throw new Error('Token manquant');
        }
      } catch (fallbackError) {
        console.error('Erreur lors du fallback:', fallbackError);
        setQrError("Impossible de charger le QR Code.");
      }
    } finally {
      setQrLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.email?.toLowerCase().includes('partner')) {
      loadQrToken();
    }
  }, [loadQrToken, user]);

  const handleReloadQR = useCallback(() => {
    loadQrToken(true);
  }, [loadQrToken]);

  // Générer et partager le QR Code en PDF
  const handleShareQR = useCallback(async () => {
    if (!qrData) {
      Alert.alert('Erreur', 'Aucun QR Code disponible à partager');
      return;
    }

    try {
      console.log('📤 [Home] Génération du PDF avec QR Code...');
      console.log('🔑 [Home] Token utilisé pour le PDF:', qrData.token.substring(0, 30) + '...');
      console.log('🔍 [Home] Vérification de la cohérence avec l\'app:', {
        hasImageBase64: !!qrCodeResponse?.imageBase64,
        hasQrCodeUrl: !!qrCodeResponse?.qrCodeUrl,
        tokenMatch: qrData.token === (qrCodeResponse?.token || qrData.token),
      });
      
      // Récupérer l'image base64 du QR Code ou générer une URL
      // IMPORTANT: Utiliser exactement la même source que dans l'app pour garantir la cohérence
      let qrImageSrc = qrCodeResponse?.imageBase64;
      
      // Si on a l'image base64, s'assurer qu'elle a le bon format
      if (qrImageSrc) {
        if (!qrImageSrc.startsWith('data:')) {
          qrImageSrc = `data:image/png;base64,${qrImageSrc}`;
        }
        console.log('✅ [Home] Utilisation de l\'image base64 du QR Code');
      } else if (qrCodeResponse?.qrCodeUrl) {
        // Utiliser l'URL directement
        qrImageSrc = qrCodeResponse.qrCodeUrl;
        console.log('✅ [Home] Utilisation de l\'URL du QR Code:', qrImageSrc);
      } else {
        // Générer une URL de QR Code en ligne à partir du token
        // Utiliser les mêmes paramètres que dans l'app pour garantir la cohérence
        console.log('🔄 [Home] Génération d\'une URL QR Code à partir du token...');
        qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData.token)}&format=png&margin=1`;
        console.log('✅ [Home] URL QR Code générée (même token que l\'app):', qrImageSrc);
        console.log('🔑 [Home] Token utilisé:', qrData.token.substring(0, 30) + '...');
      }

      // Créer le HTML pour le PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                margin: 0;
                padding: 40px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: #1F2937;
              }
              .container {
                background: white;
                border-radius: 20px;
                padding: 40px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                max-width: 500px;
                width: 100%;
                text-align: center;
              }
              .logo {
                font-size: 32px;
                font-weight: bold;
                color: #8B2F3F;
                margin-bottom: 10px;
              }
              .title {
                font-size: 24px;
                font-weight: bold;
                color: #1F2937;
                margin-bottom: 10px;
              }
              .subtitle {
                font-size: 16px;
                color: #6B7280;
                margin-bottom: 30px;
              }
              .qr-container {
                display: flex;
                justify-content: center;
                align-items: center;
                margin: 30px 0;
                padding: 20px;
                background: #F9FAFB;
                border-radius: 12px;
              }
              .qr-image {
                width: 300px;
                height: 300px;
                object-fit: contain;
              }
              .token-info {
                margin-top: 30px;
                padding: 20px;
                background: #F3F4F6;
                border-radius: 12px;
                font-size: 12px;
                color: #6B7280;
                word-break: break-all;
              }
              .footer {
                margin-top: 30px;
                font-size: 12px;
                color: #9CA3AF;
              }
              .expiry {
                margin-top: 15px;
                font-size: 14px;
                color: #6B7280;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">✨ Maya</div>
              <div class="title">Mon QR Code Maya</div>
              <div class="subtitle">Présentez ce code chez tous nos partenaires</div>
              
              <div class="qr-container">
                <img src="${qrImageSrc}" alt="QR Code Maya" class="qr-image" />
              </div>
              
              <div class="token-info">
                <strong>Token:</strong><br>
                ${qrData.token}
              </div>
              
              ${qrData.expiresAt ? `
                <div class="expiry">
                  <strong>Expire le:</strong> ${new Date(qrData.expiresAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              ` : ''}
              
              <div class="footer">
                Scannez ce QR Code pour valider votre visite chez un partenaire Maya
              </div>
            </div>
          </body>
        </html>
      `;

      console.log('📄 [Home] Génération du PDF...');
      
      // Générer le PDF
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      console.log('✅ [Home] PDF généré:', uri);

      // Partager le PDF
      const shareOptions: any = {
        url: uri,
        mimeType: 'application/pdf',
        title: 'Mon QR Code Maya.pdf',
      };

      const result = await Share.share(shareOptions);
      
      if (result.action === Share.sharedAction) {
        console.log('✅ [Home] PDF partagé avec succès');
        if (result.activityType) {
          console.log('📱 [Home] Partagé via:', result.activityType);
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('❌ [Home] Partage annulé');
      }

      // Nettoyer le fichier temporaire après un délai
      setTimeout(async () => {
        try {
          const fileInfo = await FileSystem.getInfoAsync(uri);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(uri, { idempotent: true });
            console.log('🗑️ [Home] Fichier PDF temporaire supprimé');
          }
        } catch (error) {
          console.warn('⚠️ [Home] Impossible de supprimer le fichier temporaire:', error);
        }
      }, 60000); // Supprimer après 1 minute

    } catch (error) {
      console.error('❌ [Home] Erreur lors de la génération du PDF:', error);
      Alert.alert(
        'Erreur',
        'Impossible de générer le PDF. Voulez-vous partager le token en texte ?',
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {
            text: 'Partager le token',
            onPress: async () => {
              try {
                const shareMessage = `Mon QR Code Maya\n\nToken: ${qrData.token}\n\nScannez ce code pour valider ma visite chez un partenaire Maya.`;
                await Share.share({
                  message: shareMessage,
                  title: 'Mon QR Code Maya',
                });
              } catch (shareError) {
                console.error('❌ [Home] Erreur lors du partage du token:', shareError);
              }
            },
          },
        ]
      );
    }
  }, [qrData, qrCodeResponse]);



  return (
    <NavigationTransition>
      <LinearGradient
        colors={Colors.gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
            {/* Statistiques en haut */}
            <View style={styles.statsContainer}>
              <View style={[styles.statCard, styles.savingsCard]}>
                <Text style={styles.statValue}>47,80 €</Text>
                <Text style={styles.statLabel}>ÉCONOMIES TOTALES</Text>
              </View>

              <View style={[styles.statCard, styles.visitsCard]}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>PARTENAIRES VISITÉS</Text>
              </View>
            </View>

            {/* Accès rapide */}
          <View style={styles.quickActions}>
            <View style={styles.quickAction}>
              <Ionicons name="storefront" size={24} color="#3B82F6" />
              <Text style={styles.quickActionText}>Partenaires</Text>
            </View>
            <View style={styles.quickAction}>
              <Ionicons name="card" size={24} color="#F59E0B" />
              <Text style={styles.quickActionText}>Abonnement</Text>
            </View>
          </View>
          <View style={styles.qrCard}>
            <View style={styles.qrCardHeader}>
              <View>
                <Text style={styles.qrTitle}>Votre QR Code Maya</Text>
                <Text style={styles.qrSubtitle}>Présentez ce code chez tous nos partenaires</Text>
              </View>
              <View style={styles.qrHeaderActions}>
                <TouchableOpacity 
                  style={styles.qrActionButton}
                  onPress={handleShareQR}
                  disabled={qrLoading || !qrData}
                >
                  <Ionicons 
                    name="share-outline" 
                    size={20} 
                    color={Colors.text.light} 
                    style={(qrLoading || !qrData) && { opacity: 0.5 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.qrReloadButton}
                  onPress={handleReloadQR}
                  disabled={qrLoading}
                >
                  <Ionicons 
                    name="refresh" 
                    size={20} 
                    color={Colors.text.light} 
                    style={qrLoading && { opacity: 0.5 }}
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.qrContainer}>
              {qrLoading ? (
                <View style={styles.qrLoadingContainer}>
                  <ActivityIndicator size="large" color={Colors.text.light} />
                  <Text style={styles.qrLoadingText}>Génération du QR Code...</Text>
                </View>
              ) : qrError ? (
                <View style={styles.qrErrorContainer}>
                  <Ionicons name="alert-circle" size={32} color={Colors.status.error} />
                  <Text style={styles.qrErrorText}>{qrError}</Text>
                  <TouchableOpacity 
                    style={styles.qrRetryButton}
                    onPress={() => loadQrToken(true)}
                  >
                    <Text style={styles.qrRetryText}>Réessayer</Text>
                  </TouchableOpacity>
                </View>
              ) : qrData?.token ? (
                <View style={styles.qrCodeWrapper}>
                  <View style={styles.qrCodeContainer}>
                    {/* Priorité 1: Image base64 de l'API */}
                    {qrCodeResponse?.imageBase64 ? (
                      <Image
                        source={{ 
                          uri: qrCodeResponse.imageBase64.startsWith('data:') 
                            ? qrCodeResponse.imageBase64 
                            : `data:image/png;base64,${qrCodeResponse.imageBase64}`
                        }}
                        style={styles.qrCodeImage}
                        resizeMode="contain"
                      />
                    ) : qrCodeResponse?.qrCodeUrl ? (
                      /* Priorité 2: URL du QR Code de l'API */
                      <Image
                        source={{ uri: qrCodeResponse.qrCodeUrl }}
                        style={styles.qrCodeImage}
                        resizeMode="contain"
                      />
                    ) : qrData?.token ? (
                      /* Priorité 3: Génération via API externe à partir du token */
                      <Image
                        source={{ 
                          uri: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrData.token)}&format=png&margin=1`
                        }}
                        style={styles.qrCodeImage}
                        resizeMode="contain"
                        onError={(error) => {
                          console.error('❌ [Home] Erreur lors du chargement du QR Code:', error);
                        }}
                        onLoad={() => {
                          console.log('✅ [Home] QR Code chargé avec succès');
                        }}
                      />
                    ) : null}
                  </View>
                  {qrData.expiresAt && (
                    <View style={styles.qrExpiryContainer}>
                      <Ionicons name="time-outline" size={14} color={Colors.text.secondary} />
                      <Text style={styles.qrExpiryText}>
                        Expire le {new Date(qrData.expiresAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  )}
                </View>
              ) : null}
            </View>

          </View>
        </ScrollView>
        </SafeAreaView>
      </LinearGradient>

    </NavigationTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,
  safeArea: {
    flex: 1,
  } as ViewStyle,
  scrollContainer: {
    flex: 1,
  } as ViewStyle,
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  } as ViewStyle,
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  } as ViewStyle,
  quickAction: {
    flex: 1,
    backgroundColor: Colors.background.cardDark,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    ...Shadows.md,
  } as ViewStyle,
  quickActionText: {
    marginTop: 6,
    color: Colors.text.light,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold as any,
  } as TextStyle,
  qrCard: {
    backgroundColor: Colors.background.cardDark,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.lg,
  } as ViewStyle,
  qrCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  } as ViewStyle,
  qrHeaderActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  } as ViewStyle,
  qrActionButton: {
    padding: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  } as ViewStyle,
  qrReloadButton: {
    padding: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  } as ViewStyle,
  qrTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold as any,
    color: Colors.text.light,
    marginBottom: Spacing.sm,
  } as TextStyle,
  qrSubtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.text.secondary,
  } as TextStyle,
  qrLoadingContainer: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  } as ViewStyle,
  qrLoadingText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  } as TextStyle,
  qrErrorContainer: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
  } as ViewStyle,
  qrErrorText: {
    fontSize: Typography.sizes.sm,
    color: Colors.status.error,
    textAlign: 'center',
  } as TextStyle,
  qrRetryButton: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.primary[600],
    borderRadius: BorderRadius.md,
  } as ViewStyle,
  qrRetryText: {
    color: 'white',
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
  } as TextStyle,
  qrContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  } as ViewStyle,
  qrCodeWrapper: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  } as ViewStyle,
  qrCodeContainer: {
    backgroundColor: 'white',
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: '#8B2F3F',
    ...Shadows.lg,
    shadowColor: '#8B2F3F',
    shadowOpacity: 0.3,
    elevation: 8,
  } as ViewStyle,
  qrCodeImage: {
    width: 220,
    height: 220,
    borderRadius: BorderRadius.lg,
  } as ViewStyle,
  qrCode: {
    width: 220,
    height: 220,
    backgroundColor: 'white',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  } as ViewStyle,
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    ...Shadows.md,
  } as ViewStyle,
  savingsCard: {},
  visitsCard: {},
  statValue: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold as any,
    color: Colors.text.light,
    marginBottom: Spacing.xs,
  } as TextStyle,
  statLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
    fontWeight: Typography.weights.medium as any,
    letterSpacing: 0.5,
  } as TextStyle,
});
