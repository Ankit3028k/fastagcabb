import React, { useEffect } from "react";
import { useAuth } from '@/contexts/AuthContext';
import {
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  View,
  Dimensions,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";

// Screen Width
const screenWidth = Dimensions.get("window").width;

// Sample Data (unchanged)
const itemsData = [
  {
    id: "1",
    name: "T-Shirt",
    points: 500,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "2",
    name: "Earbuds",
    points: 1000,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "3",
    name: "Pressure Cooker",
    points: 2000,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "4",
    name: "4 Burner Gas Oven",
    points: 5000,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "5",
    name: "LCD Television + Health Insurance 1 Lakh",
    points: 10000,
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "6",
    name: "Godrej Almirah / Smartphone",
    points: 20000,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "7",
    name: "AC 1.5 Tonne",
    points: 50000,
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "8",
    name: "1 Person Thailand Trip + Shopping Voucher Rs.15,000",
    points: 75000,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "9",
    name: "10 Grams Gold",
    points: 100000,
    image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "10",
    name: "2 Person Dubai Trip + Health Insurance 2 Lakh",
    points: 125000,
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "11",
    name: "Splendor Bike / Scooty",
    points: 150000,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "12",
    name: "Electric Scooty",
    points: 175000,
    image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "13",
    name: "3 Person Thailand Trip + Shopping Voucher Rs.35,000",
    points: 200000,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "14",
    name: "Bullet",
    points: 250000,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "15",
    name: "Sofa + AC + TV + Bed + Smartphone + Almirah + Dining Table + Kitchen Bartan Set & More + Health Insurance 5 Lakh",
    points: 300000,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "16",
    name: "40 Grams Gold",
    points: 350000,
    image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "17",
    name: "50 Grams Gold",
    points: 400000,
    image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "18",
    name: "60 Grams Gold",
    points: 450000,
    image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "19",
    name: "Car + Health Insurance 10 Lakh",
    points: 551000,
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },


];

export default function TabTwoScreen() {
  const { user, addPoints, processQRCode, processRecharge } = useAuth();
  const availablePoints = user?.monthlyPoints || 0;
  const totalPoints = 500;
  const progressPercentage = (availablePoints / totalPoints) * 100;
  const giftPosition = (screenWidth - 80) * (progressPercentage / 100); // Adjust for padding

  // Animation setup
  const progressAnimation = useSharedValue(0);
  const giftScale = useSharedValue(1);

  useEffect(() => {
    // Animate progress bar fill
    progressAnimation.value = withTiming(progressPercentage, { duration: 1000 });
    // Pulse animation for gift icon
    giftScale.value = withSpring(1.2, { damping: 2, stiffness: 80 }, () => {
      giftScale.value = withTiming(1, { duration: 500 });
    });
  }, [progressPercentage]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressAnimation.value}%`,
  }));

  const animatedGiftStyle = useAnimatedStyle(() => ({
    left: giftPosition,
    transform: [{ scale: giftScale.value }],
  }));

  return (
    <ThemedView style={styles.container}>
      {/* Title (unchanged) */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          style={{ color: "#f26621", fontStyle: "italic", padding: 10 }}
          type="title"
        >
          Gift & Reward
        </ThemedText>
      </ThemedView>

      {/* Enhanced Progress Path */}
       
      <View style={styles.progressPathContainer}>
        {/* Background Path with Glow */}
        <LinearGradient
          colors={["#e0f7fa", "#b2ebf2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.pathBackground}
        />

        {/* Animated Filled Path */}
        <Animated.View style={[styles.pathFill, animatedProgressStyle]}>
          <LinearGradient
            colors={["#ff6d00", "#ff8f00", "#ffab40"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* Moving Gift Icon with Percentage Tooltip */}
        <Animated.View style={[styles.movingGiftIcon, animatedGiftStyle]}>
          {/* <View style={styles.tooltip}>
            <Text style={styles.tooltipText}>{`${Math.round(progressPercentage)}%`}</Text>
          </View> */}
          <FontAwesome name="gift" size={28} color="#fff" />
        </Animated.View>
      </View>

      {/* Percentage Text */}
      <Text style={styles.creativeProgressText}>
        {availablePoints} / {totalPoints} Points
      </Text>

      {/* Points Display (unchanged) */}
      <ThemedView style={styles.pointsContainer}>
        <ThemedText style={styles.pointText} type="defaultSemiBold">
          Available Points: {availablePoints}
        </ThemedText>
      </ThemedView>

      {/* Items (unchanged) */}
<ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {itemsData.map((item) => (
        <View key={item.id} style={styles.itemContainer}>
          <View style={styles.itemImageContainer}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
          </View>
          <View style={styles.itemDetailContainer}>
            <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
            <ThemedText>{item.points} Points</ThemedText>
            <ThemedView style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.radeemNowText}>Redeem Now</Text>
              </TouchableOpacity>
            </ThemedView>
          </View>
        </View>
      ))}
      </ScrollView>
     
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#f2f2f2",
    padding: 10,
    marginVertical: 25,
  },
  pointText: {
    color: "white",
    fontSize: 20,
  },
  pointsContainer: {
    marginVertical: 15,
    alignItems: "center",
    backgroundColor: "#52b948",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  itemContainer: {
    flexDirection: "row",
    marginVertical: 10,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  itemImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  itemDetailContainer: {
    flex: 2,
    paddingLeft: 20,
    justifyContent: "center",
  },
  buttonContainer: {
    marginTop: 10,
  },
  button: {
    padding: 10,
    backgroundColor: "#f26621",
    borderRadius: 10,
    alignItems: "center",
  },
  radeemNowText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Enhanced Progress Bar Styles
  progressPathContainer: {
    height: 40, // Increased height for better visibility
    width: "100%",
    backgroundColor: "#e0f7fa",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 15,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8, // For Android shadow
  },
  pathBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
  pathFill: {
    height: "100%",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#ff6d00",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  movingGiftIcon: {
    position: "absolute",
    top: -3, // Adjusted for larger icon
    backgroundColor: "#ff6d00",
    borderRadius: 24,
    padding: 8,
    elevation: 10,
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tooltip: {
    position: "absolute",
    top: -30,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  tooltipText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  creativeProgressText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#333",
    fontSize: 18,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
});
