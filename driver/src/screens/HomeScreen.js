import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Map from "../components/Map";
import getUserData from "../hooks/getUserData";
import getUserLocation from "../hooks/getUserLocation";
import Loading from "../components/Loading";
import getUserBookings from "../hooks/getUserBookings";
import AllBook from "../components/AllBook";
import { Toast } from "toastify-react-native";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { userData, loading: userDataLoading } = getUserData();
  const {
    location,
    locationCoordinates,
    loading: locationLoading,
  } = getUserLocation();
  const { userBookings, loading: bookLoading } = getUserBookings();

  const isLoading = userDataLoading || locationLoading || bookLoading;

  const getGreeting = () => {
    const currentHour = new Date().getHours();

    if (currentHour >= 5 && currentHour < 12) {
      return "Good morning,";
    } else if (currentHour >= 12 && currentHour < 18) {
      return "Good afternoon,";
    } else {
      return "Good evening,";
    }
  };

  const sortedUserBookings = userBookings.sort(
    (a, b) => b.timestamp - a.timestamp
  );
  const latestOngoingBooking = sortedUserBookings.find(
    (booking) => !booking.isDropoff
  );

  useEffect(() => {}, [userData, latestOngoingBooking]);

  if (isLoading) return <Loading />;

  if (!userData) {
    Toast.error("This App is for drivers only.")
    signOut(auth);
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  }

  if (userData && userData.isApprovedDriver === false) {
    Toast.error("Please wait for confirmation email.")
    signOut(auth); 
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <Map origin={location} originCoords={locationCoordinates} />
      <View style={styles.contentContainer}>
        <View style={styles.cardContainer}>
          <Text style={styles.title}>RideMoto</Text>
          <View style={styles.profileContainer}>
            <TouchableOpacity onPress={() => navigation.push("Profile")}>
              <Image
                style={styles.profileImage}
                source={{
                  uri:
                    (userData && userData.profilePicture) ||
                    "https://i.stack.imgur.com/l60Hf.png",
                }}
              />
            </TouchableOpacity>
            <View>
              <Text style={styles.greetings}>{getGreeting()}</Text>
              <Text style={styles.username}>
                {`${userData?.firstName} ${userData?.lastName}` || "Username"}
              </Text>
            </View>
          </View>
          {!latestOngoingBooking ? (
            <AllBook
              location={location}
              locationCoordinates={locationCoordinates}
            />
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                navigation.push("BookConfirm", {
                  id: latestOngoingBooking.id,
                  userId: latestOngoingBooking.userId,
                  location: location,
                  locationCoordinates: locationCoordinates,
                  pickupLocation: latestOngoingBooking.pickupLocation,
                  pickupCoordinates: latestOngoingBooking.pickupCoords,
                  dropoffLocation: latestOngoingBooking.dropoffLocation,
                  dropoffCoordinates: latestOngoingBooking.dropoffCoords,
                  rideDistance: latestOngoingBooking.rideDistance,
                  rideTime: latestOngoingBooking.rideTime,
                  ridePrice: latestOngoingBooking.ridePrice,
                  driverId: latestOngoingBooking.driverId,
                  userfirstName: latestOngoingBooking.userfirstName,
                  userlastName: latestOngoingBooking.userlastName,
                  userPhoneNumber: latestOngoingBooking.userPhoneNumber
                })
              }
            >
              <Text style={styles.buttonText}>View Current Booking</Text>
            </TouchableOpacity>
          )}
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
    alignlatestOngoingBookings: "center",
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
  profileContainer: {
    flexDirection: "row",
    alignlatestOngoingBookings: "center",
    gap: 12,
  },
  profileImage: {
    width: 35,
    height: 35,
    borderRadius: 50,
  },
  greetings: {
    color: "#5c5c5c",
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
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
