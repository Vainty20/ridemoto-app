import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View, Text, Image, Modal, Alert } from "react-native";
import Map from "../components/Map";
import Ionicons from "react-native-vector-icons/Ionicons";
import getCurrentBooking from "../hooks/getCurrentBooking";
import Loading from "../components/Loading";
import getUserLocation from "../hooks/getUserLocation";
import Button from "../components/Button";
import { db } from "../../firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { Toast } from "toastify-react-native";
import { useEffect, useState, useRef } from "react";

function AutomaticAlert({ onCancel, id }) {
  const [modalVisible, setModalVisible] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    console.log(id)
    if (id) {
      setModalVisible(false);
    } else if (!id) {
      timerRef.current = setTimeout(() => {
        setModalVisible(true);
      }, 30000);
    } else {
      clearTimeout(timerRef.current);
      setModalVisible(false);
    }

    return () => {
      clearTimeout(timerRef.current);
    };
  }, [id]);

  const handleYes = () => {
    setModalVisible(false);
    clearTimeout(timerRef.current);
  };
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={onCancel}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>
            It's been 30 seconds, do you still want to continue this ride?
          </Text>
          <View style={styles.buttonContainer}>
            <Button text="No" onPress={onCancel} variant="danger" />
            <Button text="Yes" onPress={handleYes} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function ViewCurrentBookingScreen({ route, navigation }) {
  const { id } = route.params;
  const { currentBooking, loading: currentBookingLoading } = getCurrentBooking({
    id,
  });
  const {
    location,
    locationCoordinates,
    loading: locationLoading,
  } = getUserLocation();

  if (currentBookingLoading || locationLoading) return <Loading />;

  if (currentBooking.isDropoff) return navigation.replace("Home");

  const handleDeleteBooking = async () => {
    if (!currentBooking.driverId) {
      Alert.alert(
        "Confirmation",
        "Are you sure you want to delete this booking?",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Delete canceled"),
            style: "cancel",
          },
          {
            text: "Delete",
            onPress: async () => {
              try {
                await deleteDoc(doc(db, "book", id));
                Toast.success("Booking deleted successfully!");
                navigation.replace("Home");
              } catch (error) {
                Toast.error("Error deleting booking. Please try again later.");
                console.error("Error deleting booking:", error);
              }
            },
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Map
        origin={location}
        originCoords={locationCoordinates}
        destination={currentBooking.dropoffLocation}
        destinationCoords={currentBooking.dropoffCoords}
      />
      <View style={styles.contentContainer}>
        <View style={styles.cardContainer}>
          <View style={styles.header}>
            <Text style={styles.status}>
              {currentBooking.isDropoff
                ? "Dropoff"
                : currentBooking.isPickUp
                ? "Pickup"
                : currentBooking.driverId
                ? "Confirmed"
                : "Waiting"}
            </Text>

            <View style={styles.rideInfoContainer}>
              <View style={styles.rideInfoDiv}>
                <Ionicons name="speedometer-outline" size={18} />
                <Text>{currentBooking.rideDistance}</Text>
              </View>
              <View style={styles.rideInfoDiv}>
                <Ionicons name="time-outline" size={18} />
                <Text>{currentBooking.rideTime}</Text>
              </View>
            </View>
          </View>
          <View style={styles.locationContainer}>
            <View style={styles.locationDiv}>
              <Image
                style={styles.profilePic}
                source={{
                  uri:
                    (currentBooking && currentBooking.profilePicture) ||
                    "https://i.stack.imgur.com/l60Hf.png",
                }}
              />
              <Text>{currentBooking.pickupLocation}</Text>
            </View>
            <View style={styles.seperate}>
              <Ionicons name="arrow-down-outline" size={18} />
              <View style={styles.seperateLine} />
            </View>
            <View style={styles.locationDiv}>
              <Ionicons name="location-outline" size={32} />
              <Text>{currentBooking.dropoffLocation}</Text>
            </View>
          </View>
          <Text>
            Total of {""}
            <Text style={{ fontWeight: "bold", fontSize: 18 }}>
              {currentBooking.ridePrice}
            </Text>
          </Text>
          {!currentBooking.driverId && (
            <Button
              onPress={handleDeleteBooking}
              text="Cancel Booking"
              variant="danger"
            />
          )}
        </View>
        {!currentBooking.driverId && (
          <AutomaticAlert
            onCancel={handleDeleteBooking}
            id={currentBooking.driverId}
          />
        )}
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
    backgroundColor: "gray",
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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "column",
    justifyContent: "space-around",
    width: "100%",
  },
});
