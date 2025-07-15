import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { QRScanner } from '@/components/QRScanner';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import WhatsAppButton from '@/components/WhatsappIcon';

// Safe dimension access for React Native
const { width } = Dimensions.get('window');

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'success' | 'warning' | 'error' | 'info';
  read: boolean;
}

export default function HomeScreen() {
  const { user, addPoints, processQRCode, processRecharge } = useAuth();
  const { colors, isDark } = useTheme();
  const { openDrawer } = require('@/contexts/DrawerContext').useDrawer();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showLanguageSwitcher, setShowLanguageSwitcher] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);

  // Professional banner images
  const bannerImages = [
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&crop=center&auto=format&q=80',
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop&crop=center&auto=format&q=80',
    'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&h=200&fit=crop&crop=center&auto=format&q=80',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop&crop=center&auto=format&q=80',
  ];

  // Offer images
  const offerImages = [
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&crop=center&auto=format&q=80',
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop&crop=center&auto=format&q=80',
    'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&h=200&fit=crop&crop=center&auto=format&q=80',
  ];

  // Auto-sliding banner
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) =>
        prevIndex === bannerImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [bannerImages.length]);

  const handleStatusPress = (status: string) => {
    Alert.alert('Status', `Current status: ${status}`);
  };

  const handleQRScan = () => {
    setShowQRScanner(true);
  };

  const handleRecharge = () => {
    Alert.prompt(
      'Recharge',
      'Enter recharge amount (₹)',
      async (amount) => {
        if (amount && !isNaN(Number(amount))) {
          try {
            const result = await processRecharge(Number(amount));
            Alert.alert(
              result.success ? 'Success' : 'Error',
              result.message
            );
          } catch (error) {
            Alert.alert('Error', 'Failed to process recharge');
          }
        } else {
          Alert.alert('Error', 'Please enter a valid amount');
        }
      },
      'numeric'
    );
  };

  const handleSchemes = (scheme: string) => {
    router.push(`/schemes/${scheme.toLowerCase()}`);
  };

  const handleReferralShare = async () => {
    if (!user?.referralCode) {
      Alert.alert('Error', 'Referral code not available');
      return;
    }
    const referralLink = `https://myapp.com/ref/${user.referralCode}`;
    try {
      await Share.share({
        message: `Join me on this amazing app and earn 200 points! Use my referral code: ${user.referralCode}\n\n${referralLink}`,
        title: 'Join and Earn Points!',
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share referral link');
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved': return colors.success;
      case 'pending': return colors.warning;
      case 'declined': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const fetchNotifications = async () => {
    setIsLoadingNotifications(true);
    setNotificationError(null);

    try {
      const backendUrl = process.env.EXPO_PUBLIC_API_URL;
      if (!backendUrl) {
        throw new Error('API URL not configured');
      }
      const response = await fetch(`${backendUrl}/notifications`, {
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      setNotificationError('Failed to load notifications');
      console.error(error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const handleNotificationPress = async () => {
    setShowNotificationModal(true);
    await fetchNotifications();
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.read).length;
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'approved': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'declined': return 'close-circle';
      default: return 'help-circle';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={openDrawer} activeOpacity={0.7}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logoImage}
            />
          </TouchableOpacity>
          <Text style={[styles.appName, { color: colors.text }]}>
            <Text style={{ color: '#52b948' }}>FAS</Text>
            <Text style={{ color: '#f26621' }}>TAG</Text>
            <Text style={{ color: '#817f7f' }}>CAB</Text>
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.languageButtonContainer}
            onPress={() => setShowLanguageSwitcher(true)}
          >
            <Ionicons name="language" size={20} color={colors.primary} />
            <Text style={[styles.languageCode, { color: colors.text }]}>
              {i18n.language.toUpperCase()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={handleNotificationPress}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.primary} />
            {getUnreadCount() > 0 && (
              <View style={[styles.notificationBadge, { backgroundColor: colors.error }]}>
                <Text style={styles.notificationBadgeText}>
                  {getUnreadCount() > 99 ? '99+' : getUnreadCount().toString()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section - User Profile Card */}
        <View style={[styles.heroSection, { backgroundColor: colors.surface }]}>
          <View style={styles.profileRow}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: user?.profilePhoto || 'https://via.placeholder.com/80' }}
                style={styles.profileImage}
              />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.welcomeText, { color: colors.text }]}>
                {t('welcome')}, {user?.fullName || 'Guest'}!
              </Text>
              <Text style={[styles.phoneNumber, { color: colors.textSecondary }]}>
                {t('mobileNumber')}: {user?.phoneNumber || 'Not provided'}
              </Text>
              <Text style={[styles.registerDate, { color: colors.textSecondary }]}>
                {t('Role')}: {user?.role || 'Not assigned'}
              </Text>
              <TouchableOpacity
                style={[styles.statusButton, { backgroundColor: getStatusColor(user?.status) }]}
                onPress={() => handleStatusPress(user?.status || 'unknown')}
              >
                <Ionicons
                  name={getStatusIcon(user?.status) as any}
                  size={16}
                  color="white"
                />
                <Text style={styles.statusText}>
                  {user?.status ? t(user.status) : 'Unknown'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Points Summary Section */}
        <View style={styles.pointsSection}>
          <View style={styles.pointsRow}>
            <View style={styles.pointsCard}>
              <Text style={[styles.pointsLabel, { color: colors.textSecondary }]}>
                {t('Monthly Points')}
              </Text>
              <Text style={[styles.pointsValue, { color: colors.warning }]}>
                {user?.monthlyPoints || 0}
              </Text>
            </View>
            <View style={styles.pointsCard}>
              <Text style={[styles.pointsLabel, { color: colors.textSecondary }]}>
                {t('Yearly Points')}
              </Text>
              <Text style={[styles.pointsValue, { color: colors.warning }]}>
                {user?.yearlyPoints || 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Auto Sliding Banner */}
        <View style={styles.bannerSection}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setCurrentBannerIndex(index);
            }}
          >
            {bannerImages.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.bannerImage}
              />
            ))}
          </ScrollView>
          <View style={styles.bannerIndicators}>
            {bannerImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  {
                    backgroundColor: index === currentBannerIndex ? colors.primary : colors.border
                  }
                ]}
              />
            ))}
          </View>
        </View>

        {/* Contact Us Button */}
        <TouchableOpacity
          style={[styles.contactButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/contact')}
        >
          <Ionicons name="mail-outline" size={20} color="white" />
          <Text style={styles.contactButtonText}>Contact Us</Text>
        </TouchableOpacity>

        {/* QR Code and Recharge Section */}
        <View style={styles.qrRechargeSection}>
          <View style={styles.qrRechargeRow}>
            <TouchableOpacity
              style={[styles.qrButton, { borderColor: colors.primary, backgroundColor: colors.primary + '10' }]}
              onPress={handleQRScan}
            >
              <Ionicons name="qr-code" size={40} color={colors.primary} />
              <Text style={[styles.qrButtonText, { color: colors.primary }]}>
                {t('qrScanner')}
              </Text>
              <Text style={[styles.qrButtonSubtext, { color: colors.textSecondary }]}>
                {t('scanQR')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.rechargeButton, { borderColor: colors.secondary, backgroundColor: colors.secondary + '10' }]}
              onPress={handleRecharge}
            >
              <Ionicons name="card" size={40} color={colors.secondary} />
              <Text style={[styles.rechargeButtonText, { color: colors.secondary }]}>
                {t('recharge')}
              </Text>
              <Text style={[styles.rechargeButtonSubtext, { color: colors.textSecondary }]}>
                {t('enterAmount')}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.qrRechargeRow}>
            <TouchableOpacity
              style={[styles.qrButton, { borderColor: colors.primary, backgroundColor: colors.primary + '10' }]}
              onPress={() => handleSchemes('FASTAGCAB')}
            >
              <Ionicons name="car-sport" size={40} color={colors.primary} />
              <Text style={[styles.qrButtonText, { color: colors.primary }]}>
                {t('Schemes')}
              </Text>
              <Text style={[styles.qrButtonSubtext, { color: colors.textSecondary }]}>
                {t('FASTAGCAB')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.rechargeButton, { borderColor: colors.secondary, backgroundColor: colors.secondary + '10' }]}
              onPress={() => handleSchemes('DDH')}
            >
              <Ionicons name="home" size={40} color={colors.secondary} />
              <Text style={[styles.rechargeButtonText, { color: colors.secondary }]}>
                {t('Schemes')}
              </Text>
              <Text style={[styles.rechargeButtonSubtext, { color: colors.textSecondary }]}>
                {t('DDH')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Offers */}
          <View style={[styles.offersSection, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('offers')}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {offerImages.map((image, index) => (
                <View key={index} style={[styles.offerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Image
                    source={{ uri: image }}
                    style={styles.offerImage}
                  />
                  <Text style={[styles.offerDescription, { color: colors.textSecondary }]}>
                    Get up to {50 - index * 10}% off on recharges
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Products */}
          <View style={[styles.productsSection, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('Products')}
            </Text>
            <View style={styles.productsGrid}>
              {[
                { name: 'Smartphone', description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&h=100&fit=crop&crop=center&auto=format&q=80' },
                { name: 'Headphones', description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop&crop=center&auto=format&q=80' },
                { name: 'Laptop', description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=100&h=100&fit=crop&crop=center&auto=format&q=80' },
                { name: 'Watch', description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop&crop=center&auto=format&q=80' },
              ].map((product, index) => (
                <View key={index} style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.itemImageContainer}>
                    <Image source={{ uri: product.image }} style={styles.productImage} />
                  </View>
                  <View style={styles.itemDetailContainer}>
                    <Text style={[styles.productName, { color: colors.text }]}>
                      {product.name}
                    </Text>
                    <Text style={[styles.productDescription, { color: colors.textSecondary }]}>
                      {product.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* WhatsApp Floating Button */}
<View style={styles.whatsappButtonContainer}>
 <WhatsAppButton style={{ backgroundColor: colors.primary}} />
</View>

      {/* Modals */}
      <QRScanner
        visible={showQRScanner}
        onClose={() => setShowQRScanner(false)}
      />

      <LanguageSwitcher
        visible={showLanguageSwitcher}
        onClose={() => setShowLanguageSwitcher(false)}
      />

      {/* Notification Modal */}
      <Modal
        visible={showNotificationModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotificationModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Notifications</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowNotificationModal(false)}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Notification Content */}
          <View style={styles.modalContent}>
            {isLoadingNotifications ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Loading notifications...
                </Text>
              </View>
            ) : notificationError ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {notificationError}
                </Text>
                <TouchableOpacity
                  style={[styles.retryButton, { backgroundColor: colors.primary }]}
                  onPress={fetchNotifications}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.notificationsList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.notificationItem,
                      {
                        backgroundColor: colors.surface,
                        borderLeftColor: item.read ? colors.border : colors.primary,
                      }
                    ]}
                    onPress={() => markNotificationAsRead(item.id)}
                  >
                    <View style={styles.notificationHeader}>
                      <View style={styles.notificationIconContainer}>
                        <Ionicons
                          name={
                            item.type === 'success' ? 'checkmark-circle' :
                            item.type === 'warning' ? 'warning' :
                            item.type === 'error' ? 'close-circle' :
                            'information-circle'
                          }
                          size={24}
                          color={
                            item.type === 'success' ? colors.primary :
                            item.type === 'warning' ? colors.warning :
                            item.type === 'error' ? colors.error :
                            colors.info
                          }
                        />
                      </View>
                      <View style={styles.notificationContent}>
                        <Text style={[
                          styles.notificationTitle,
                          { color: colors.text },
                          !item.read && styles.unreadNotificationTitle
                        ]}>
                          {item.title}
                        </Text>
                        <Text style={[
                          styles.notificationMessage,
                          { color: colors.textSecondary }
                        ]}>
                          {item.message}
                        </Text>
                        <Text style={[styles.notificationTimestamp, { color: colors.textSecondary }]}>
                          {new Date(item.timestamp).toLocaleString()}
                        </Text>
                      </View>
                      {!item.read && (
                        <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                      )}
                    </View>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                  <View style={styles.emptyNotifications}>
                    <Ionicons name="notifications-off" size={64} color={colors.textSecondary} />
                    <Text style={[styles.emptyNotificationsText, { color: colors.textSecondary }]}>
                      No notifications yet
                    </Text>
                  </View>
                )}
              />
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  languageCode: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    margin: 16,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mobileNumber: {
    fontSize: 14,
    marginBottom: 2,
  },
  registerDate: {
    fontSize: 14,
    marginBottom: 8,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  pointsSection: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pointsCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  pointsLabel: {
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
  pointsValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  bannerSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  bannerImage: {
    width: width - 32,
    height: 180,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bannerIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 12,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  qrRechargeSection: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  qrRechargeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  qrButton: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderWidth: 1,
    borderRadius: 16,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  qrButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  qrButtonSubtext: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  rechargeButton: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderWidth: 1,
    borderRadius: 16,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  rechargeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  rechargeButtonSubtext: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  bottomSection: {
    paddingBottom: 80, // Increased padding to prevent overlap with WhatsApp button
  },
  offersSection: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  offerCard: {
    width: 200,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 12,
  },
  offerImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  offerDescription: {
    fontSize: 14,
  },
  productsSection: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productsGrid: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    width: '100%',
  },
  productImage: {
    width: 110,
    height: 110,
    borderRadius: 10,
    marginLeft: 14,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    marginLeft: 14,
  },
  productDescription: {
    fontSize: 14,
    marginLeft: 14,
    lineHeight: 20,
  },
  logoImage: {
    width: 44,
    height: 44,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationsList: {
    paddingVertical: 8,
  },
  notificationItem: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  notificationIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  unreadNotificationTitle: {
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTimestamp: {
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  emptyNotifications: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyNotificationsText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  itemImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetailContainer: {
    flex: 2,
    paddingLeft: 20,
    justifyContent: 'center',
  },
  whatsappButtonContainer: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});