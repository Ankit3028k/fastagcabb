import { useAuth } from '@/contexts/AuthContext';
import { useDrawer } from '@/contexts/DrawerContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

interface MenuItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

const menuItems: MenuItem[] = [
  { id: '1', title: 'Dashboard', icon: 'home', route: '/dashboard' },
  { id: '2', title: 'Redeem Status', icon: 'gift', route: '/redeem' },
  // { id: '3', title: 'Latest Update', icon: 'newspaper', route: '/updates' },
  { id: '4', title: 'Contact Us', icon: 'mail', route: '/contact' },
  { id: '5', title: 'Our Products', icon: 'storefront', route: '/products' },
  { id: '6', title: 'Schemes', icon: 'briefcase', route: '/schemes' },
  { id: '7', title: 'Terms & Conditions', icon: 'document-text', route: '/terms' },
  // { id: '8', title: 'Privacy Policy', icon: 'lock-closed', route: '/privacy' },
  // { id: '9', title: 'Point Details', icon: 'cash', route: '/points' },
];

const { width } = Dimensions.get('window');

export default function CustomDrawerContent() {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const { isDrawerOpen, closeDrawer } = useDrawer();
  const slideAnim = useRef(new Animated.Value(-width * 0.8)).current;

  useEffect(() => {
    if (isDrawerOpen) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -width * 0.8,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isDrawerOpen, slideAnim]);

  const handleMenuItemPress = (route: string) => {
    closeDrawer();
    // Add a small delay to ensure drawer closes before navigation
    setTimeout(() => {
      try {
        router.push(route as any); // Type assertion to fix TypeScript error
      } catch (error) {
        console.error('Navigation error:', error);
      }
    }, 100);
  };

  const handleLogout = () => {
    closeDrawer();
    // Add a small delay to ensure drawer closes before logout
    setTimeout(() => {
      try {
        logout(); // logout is synchronous in the current implementation
        router.replace('/login');
      } catch (error) {
        console.error('Logout error:', error);
      }
    }, 100);
  };

  if (!isDrawerOpen) return null;

  return (
    <Modal
      visible={isDrawerOpen}
      transparent
      animationType="none"
      onRequestClose={closeDrawer}
    >
      <TouchableWithoutFeedback onPress={closeDrawer}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.drawerContainer,
                { backgroundColor: colors.background, transform: [{ translateX: slideAnim }] }
              ]}
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View style={[styles.header, { backgroundColor: colors.primary }]}>
                  <View style={styles.userInfo}>
                    <View style={[styles.avatarContainer, { backgroundColor: colors.surface }]}>
                      {user?.profilePhoto ? (
                        <Image
                          source={{ uri: user.profilePhoto }}
                          style={styles.avatar}
                        />
                      ) : (
                        <Ionicons name="person" size={32} color={colors.primary} />
                      )}
                    </View>
                    <View style={styles.userDetails}>
                      <Text style={[styles.userName, { color: colors.surface }]}>
                        {user?.fullName|| 'Guest User'}
                      </Text>
                      <Text style={[styles.userEmail, { color: colors.surface + 'CC' }]}>
                        {user?.phoneNumber }
                      </Text>
                    </View>
                  </View>
                </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                { borderBottomColor: colors.border },
                index === menuItems.length - 1 && styles.lastMenuItem
              ]}
              onPress={() => handleMenuItemPress(item.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name={item.icon} size={22} color={colors.primary} />
              </View>
              <Text style={[styles.menuTitle, { color: colors.text }]}>
                {item.title}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
                </View>
              </ScrollView>

              {/* Footer Section */}
              <View style={[styles.footer, { borderTopColor: colors.border }]}>
                <TouchableOpacity
                  style={[styles.logoutButton, { backgroundColor: colors.secondary }]}
                  onPress={handleLogout}
                  activeOpacity={0.8}
                >
                  <Ionicons name="log-out-outline" size={20} color={colors.surface} />
                  <Text style={[styles.logoutText, { color: colors.surface }]}>
                    Logout
                  </Text>
                </TouchableOpacity>

                <View style={styles.appInfo}>
                  <Text style={[styles.appVersion, { color: colors.textSecondary }]}>
                    Version 1.0.0
                  </Text>
                </View>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerContainer: {
    width: width * 0.8,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    // Add safe area padding for better rendering
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  menuContainer: {
    paddingHorizontal: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  appInfo: {
    alignItems: 'center',
  },
  appVersion: {
    fontSize: 12,
  },
});