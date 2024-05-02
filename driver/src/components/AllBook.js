import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import Loading from "./Loading";
import getAllBookings from "../hooks/getAllBookings";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../../firebase";
import getUserData from "../hooks/getUserData";
const AllBook = ({ location, locationCoordinates }) => {
  const navigation = useNavigation();
  const { bookData, loading: bookDataLoading } = getAllBookings();
  const { userData, loading: userDataLoading } = getUserData();

  const filteredBookData = bookData.filter(
    (item) =>
      !item.isDropoff &&
      (!item.driverId || item.driverId === auth.currentUser.uid) &&
      (userData && parseInt(item.userWeight) + parseInt(userData.weight) + 10 < parseInt(userData.maxLoad))
  );

  const formatDate = (timestamp) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    const formattedDate = new Date(timestamp).toLocaleString("en-US", options);
    return formattedDate;
  };

  const renderItem = ({ item }) => (
    <View style={styles.bookingItem}>
      <View style={styles.bookingHeader}>
        <Text style={styles.timestampText}>{formatDate(item.timestamp)}</Text>
        <Text style={styles.ridePrice}>{item.ridePrice}</Text>
      </View>
      <View style={styles.bookingInfo}>
        <View>
          <Text style={{ marginTop: 12, marginBottom: 6, fontSize: 16 }}>
            🔵 Pickup Location:
          </Text>
          <Text style={styles.locationText}>{item.pickupLocation}</Text>
        </View>
        <View>
          <Text style={{ marginTop: 12, marginBottom: 6, fontSize: 16 }}>
            📍Dropoff Location:
          </Text>
          <Text style={styles.locationText}>{item.dropoffLocation}</Text>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.push("BookConfirm", {
              id: item.id,
              userId: item.userId,
              location: location,
              locationCoordinates: locationCoordinates,
              pickupLocation: item.pickupLocation,
              pickupCoordinates: item.pickupCoords,
              dropoffLocation: item.dropoffLocation,
              dropoffCoordinates: item.dropoffCoords,
              rideDistance: item.rideDistance,
              rideTime: item.rideTime,
              ridePrice: item.ridePrice,
              driverId: item.driverId,
              userfirstName: item.userfirstName,
              userlastName: item.userlastName,
              userPhoneNumber: item.userPhoneNumber,
            })
          }
        >
          <Text style={styles.buttonText}>View booking</Text>
        </TouchableOpacity>
      </View>
    </View>
  );


  if (bookDataLoading && userDataLoading) return <Loading/>;

  return (
    <View style={styles.bookingContainer}>
      {filteredBookData.length > 0 ? (
        <FlatList
          data={filteredBookData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      ) : (
        <Text style={styles.noBookingText}>
          {bookData.length === 0
            ? "They haven't booked a ride yet."
            : "No booking information found."}
        </Text>
      )}
    </View>
  );
};

export default AllBook;

const styles = StyleSheet.create({
  bookingContainer: {
    backgroundColor: "gray",
    borderRadius: 12,
    padding: 20,
    height: 340,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 10,
  },
  noBookingText: {
    textAlign: "center",
    marginTop: 10,
  },
  bookingItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  timestampText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  ridePrice: {
    fontSize: 16,
  },
  bookingInfo: {
    flexDirection: "column",
    justifyContent: "space-between",
  },
  locationText: {
    fontSize: 14,
    width: "80%",
  },
  bookingButton: {
    alignItems: "center",
    backgroundColor: "#0066cc",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  button: {
    alignItems: "center",
    backgroundColor: "#0066cc",
    padding: 15,
    marginTop: 20,
    borderRadius: 12,
    width: "100%",
  },
});
