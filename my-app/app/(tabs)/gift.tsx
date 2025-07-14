import React from "react";
import {
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  View,
  Dimensions,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

// Screen Width
const screenWidth = Dimensions.get("window").width;

// Sample Data
const itemsData = [
  {
    id: "1",
    name: "Watch",
    points: 50,
    image:
      "https://images.unsplash.com/photo-1622434641406-a158123450f9?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHdhdGNofGVufDB8fDB8fHww",
  },
  {
    id: "2",
    name: "Bag",
    points: 100,
    image:
      "https://shop.imgacademy.com/cdn/shop/products/newroyalbackpacks.jpg?v=1653333565",
  },
  {
    id: "3",
    name: "Shoes",
    points: 200,
    image: "https://m.media-amazon.com/images/I/71f3BmjCwtL.jpg",
  },
];

export default function TabTwoScreen() {
  const availablePoints = 250;
  const totalPoints = 500;
  const progressPercentage = (availablePoints / totalPoints) * 100;
  const giftPosition = (screenWidth - 80) * (progressPercentage / 100); // Adjust for padding

  return (
    <ThemedView style={styles.container}>
      {/* Title */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          style={{ color: "#f26621", fontStyle: "italic", padding: 10 }}
          type="title"
        >
          Gift & Reward
        </ThemedText>
      </ThemedView>

      {/* Fancy Progress Path */}
      <View style={styles.progressPathContainer}>
        {/* Background Path */}
        <LinearGradient
          colors={["#fbe8d3", "#fde7c2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.pathBackground}
        />

        {/* Filled Path */}
        <View
          style={[
            styles.pathFill,
            { width: `${progressPercentage}%` },
          ]}
        >
          <LinearGradient
            colors={["#ffb347", "#f26621"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </View>

        {/* Moving Gift Icon */}
        <View style={[styles.movingGiftIcon, { left: giftPosition }]}>
          <FontAwesome name="gift" size={28} color="#fff" />
        </View>
      </View>

      {/* Percentage Text */}
      <Text style={styles.creativeProgressText}>
        {availablePoints} / {totalPoints} Points
      </Text>

      {/* Points Display */}
      <ThemedView style={styles.pointsContainer}>
        <ThemedText style={styles.pointText} type="defaultSemiBold">
          Available Points: {availablePoints}
        </ThemedText>
      </ThemedView>

      {/* Items */}
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

  // Creative Progress Bar
  progressPathContainer: {
    height: 30,
    width: "100%",
    backgroundColor: "#fbe8d3",
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 15,
    position: "relative",
  },
  pathBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 15,
  },
  pathFill: {
    height: "100%",
    borderRadius: 15,
    overflow: "hidden",
  },
  movingGiftIcon: {
    position: "absolute",
    top: -6,
    backgroundColor: "#f26621",
    borderRadius: 20,
    padding: 6,
    elevation: 5,
    zIndex: 10,
  },
  creativeProgressText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#444",
    fontSize: 16,
    marginBottom: 5,
  },
});
