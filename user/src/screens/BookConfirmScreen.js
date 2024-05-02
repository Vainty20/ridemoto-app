import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { addDoc, collection } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { Toast } from "toastify-react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Map from "../components/Map";
import Button from "../components/Button";

export default function BookConfirmScreen({ route, navigation }) {
  const [loading, setLoading] = useState(false);

  const {
    userData,
    pickupLocation,
    pickupCoordinates,
    dropoffLocation,
    dropoffCoordinates,
    rideInfo,
  } = route.params;

  const createBooking = async () => {
    if (loading) return;

    setLoading(true);
    try {
      if (
        pickupLocation &&
        dropoffLocation &&
        pickupCoordinates &&
        dropoffCoordinates &&
        userData.firstName &&
        userData.lastName &&
        userData.phoneNumber
      ) {
        const bookingData = {
          pickupCoords: pickupCoordinates,
          dropoffCoords: dropoffCoordinates,
          pickupLocation: pickupLocation,
          dropoffLocation: dropoffLocation,
          userfirstName: userData.firstName,
          userlastName: userData.lastName,
          userId: auth.currentUser.uid,
          userPhoneNumber: userData.phoneNumber,
          userWeight: userData.weight,
          driverId: "",
          driverPhoneNumber: "",
          rideTime: rideInfo.rideTime,
          rideDistance: rideInfo.rideDistance,
          ridePrice: rideInfo.ridePrice,
          isDropoff: false,
          isPickUp: false,
          timestamp: Date.now(),
        };

        Alert.alert(
          "Confirmation",
          "Do you want to confirm the booking?",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Confirm",
              onPress: async () => {
                await addDoc(collection(db, "book"), bookingData);
                setLoading(false);
                Toast.success("You have successfully booked");
                navigation.replace("Home");
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        setLoading(false);
        Toast.error(
          "Incomplete Information, Please fill in all required fields."
        );
      }
    } catch (error) {
      Toast.error("Error adding booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Map
        origin={pickupLocation}
        originCoords={pickupCoordinates}
        destination={dropoffLocation}
        destinationCoords={dropoffCoordinates}
      />
      <View style={styles.contentContainer}>
        <View style={styles.cardContainer}>
          <View style={styles.rideInfoContainer}>
            <View style={styles.rideInfoDiv}>
              <Ionicons name="speedometer-outline" size={18} />
              <Text>{rideInfo.rideDistance}</Text>
            </View>
            <View style={styles.rideInfoDiv}>
              <Ionicons name="time-outline" size={18} />
              <Text>{rideInfo.rideTime}</Text>
            </View>
          </View>
          <View style={styles.locationContainer}>
            <View style={styles.locationDiv}>
              <Image
                style={styles.profilePic}
                source={{
                  uri:
                    (userData && userData.profilePicture) ||
                    "https://i.stack.imgur.com/l60Hf.png",
                }}
              />
              <Text>{pickupLocation}</Text>
            </View>
            <View style={styles.seperate}>
              <Ionicons name="arrow-down-outline" size={18} />
              <View style={styles.seperateLine} />
            </View>
            <View style={styles.locationDiv}>
              <Ionicons name="location-outline" size={32} />
              <Text>{dropoffLocation}</Text>
            </View>
          </View>
          <View style={styles.minimumPrice}>
            <Text>
              Total of{" "}
              <Text style={{ fontWeight: "bold", fontSize: 18 }}>
                {rideInfo.ridePrice}
              </Text>
            </Text>
            <TouchableOpacity onPress={() => navigation.push("FareMatrix")}>
              <Text style={{ fontWeight: "bold", color: "#0066cc" }}>
                View our Fare Matrix
              </Text>
            </TouchableOpacity>
          </View>
          <Button
            text="Confirm Booking"
            onPress={createBooking}
            loading={loading}
          />
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    borderBottomWidth: 1,
    borderColor: "#868686",
    paddingBottom: 12,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 6,
    color: "#5c5c5c",
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
  minimumPrice: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
});
