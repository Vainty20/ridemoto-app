import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View, Text, Image } from "react-native";
import Map from "../components/Map";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function ViewCurrentBookingScreen({ route }) {
  const { latestOngoingBooking } = route.params;
  return (
    <SafeAreaView style={styles.container}>
      <Map
        origin={latestOngoingBooking.pickupLocation}
        originCoords={latestOngoingBooking.pickupCoords}
        destination={latestOngoingBooking.dropoffLocation}
        destinationCoords={latestOngoingBooking.dropoffCoords}
      />
      <View style={styles.contentContainer}>
        <View style={styles.cardContainer}>
          <View style={styles.header}>
            <Text style={styles.status}>
              {latestOngoingBooking.driverId
                ? latestOngoingBooking.isPickUp
                  ? "Pickup"
                  : latestOngoingBooking.isDropoff
                  ? "Dropoff"
                  : "Waiting"
                : "Not Confirmed "}
            </Text>
            <View style={styles.rideInfoContainer}>
              <View style={styles.rideInfoDiv}>
                <Ionicons name="speedometer-outline" size={18} />
                <Text>{latestOngoingBooking.rideDistance}</Text>
              </View>
              <View style={styles.rideInfoDiv}>
                <Ionicons name="time-outline" size={18} />
                <Text>{latestOngoingBooking.rideTime}</Text>
              </View>
            </View>
          </View>
          <View style={styles.locationContainer}>
            <View style={styles.locationDiv}>
              <Image
                style={styles.profilePic}
                source={{
                  uri:
                    (latestOngoingBooking &&
                      latestOngoingBooking.profilePicture) ||
                    "https://i.stack.imgur.com/l60Hf.png",
                }}
              />
              <Text>{latestOngoingBooking.pickupLocation}</Text>
            </View>
            <View style={styles.seperate}>
              <Ionicons name="arrow-down-outline" size={18} />
              <View style={styles.seperateLine} />
            </View>
            <View style={styles.locationDiv}>
              <Ionicons name="location-outline" size={32} />
              <Text>{latestOngoingBooking.dropoffLocation}</Text>
            </View>
          </View>
          <Text>{latestOngoingBooking.userFirstName}</Text>

          <Text>
            Total of{" "}
            <Text style={{ fontWeight: "bold", fontSize: 18 }}>
              {latestOngoingBooking.ridePrice}
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  contentContainer: {
    justifyContent: "flex-end",
    alignItems: "center",
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  cardContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: 20,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  status: {
    textAlign: "center",
    color: "white",
    backgroundColor: "red",
    borderRadius: 12,
    padding: 12,
  },
  locationContainer: {
    padding: 15,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 12,
  },
  locationDiv: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 20,
    paddingVertical: 6,
    gap: 12,
  },
  seperate: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    gap: 2,
  },
  seperateLine: {
    width: "90%",
    height: 1,
    backgroundColor: "gray",
  },
  profilePic: {
    width: 32,
    height: 32,
    borderWidth: 2,
    borderColor: "gray",
    borderRadius: 50,
  },
  rideInfoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  rideInfoDiv: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  button: {
    backgroundColor: "#0066cc",
    padding: 15,
    borderRadius: 12,
    width: "100%",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 15,
    fontWeight: "bold",
  },
});
