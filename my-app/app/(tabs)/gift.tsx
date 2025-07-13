import { ExternalLink } from "@/components/ExternalLink";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import React from "react";
import { TouchableOpacity, Text, Image, StyleSheet, View } from "react-native";
import FontAwesome from 'react-native-vector-icons/FontAwesome';

// Sample Data for Items (like watches, etc.)
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
  const totalPoints = 500; // Maximum points for a full progress bar

  // Calculate percentage for the progress bar
  const progressPercentage = (availablePoints / totalPoints) * 100;

  return (
    <ThemedView style={styles.container}>
      {/* Title Section */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          style={{ color: "#f26621", fontStyle: "italic", padding: 10 }}
          type="title"
        >
          Gift & Reward
        </ThemedText>
      </ThemedView>

      {/* Progress Bar for Available Points */}
      <View style={styles.progressBarContainer}>
        <View
          style={[styles.progressBar, { width: `${progressPercentage}%` }]}
        />
        {/* Gift Icon at the end of the progress bar */}
        {/* <FontAwesomeIcon
          icon={faGift}
          size={30}
          color="#f26621"
          style={styles.giftIcon}
        /> */}
        <FontAwesome size={30} name="gift" color="#f26621" style={styles.giftIcon}/>
      </View>

      {/* Available Points Section */}
      <ThemedView style={styles.pointsContainer}>
        <ThemedText style={styles.pointText} type="defaultSemiBold">
          Available Points: {availablePoints}
        </ThemedText>
      </ThemedView>

      {/* List of Reward Items */}
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
    backgroundColor: "#f26621", // You can change the color to suit your theme
    borderRadius: 10,
    alignItems: "center",
  },
  radeemNowText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  progressBarContainer: {
    position: "relative",
    height: 15,
    backgroundColor: "#ddd",
    borderRadius: 10,
    marginVertical: 10,
    justifyContent: "center",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#f26621",
    borderRadius: 10,
  },
  giftIcon: {
    position: "absolute",
    right: -15,
    top: -5,
  },
});
