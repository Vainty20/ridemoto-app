import { useEffect } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import Map from "../components/Map";
import getUserData from "../hooks/getUserData";
import getUserLocation from "../hooks/getUserLocation";
import Loading from "../components/Loading";
import BookForm from "../components/BookForm";
import getUserBookings from "../hooks/getUserBookings";
import { Toast } from "toastify-react-native";

export default function HomeScreen({ navigation }) {
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

  useEffect(() => {}, [sortedUserBookings,latestOngoingBooking]);

  if (isLoading) return <Loading />;

  if (!userData) {
    Toast.error("This App is for Commuters only.");
    signOut(auth); 
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  } else if (!userData.isApproved) {
    Toast.error("Your account is disabled by the admin.");
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
          <View style={styles.header}>
            <View>
              <Text style={styles.greetings}>{getGreeting()}</Text>
              <Text style={styles.username}>
                {`${userData?.firstName} ${userData?.lastName}` || "Username"}
              </Text>
            </View>
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
          </View>
          {!latestOngoingBooking ? (
            <BookForm
              userData={userData}
              pickupLocation={location}
              pickupCoordinates={locationCoordinates}
              navigation={navigation}
            />
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                navigation.push("ViewCurrentBooking", {
                  id: latestOngoingBooking.id,
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
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
    borderColor: "gray",
    borderWidth: 1,
  },
  greetings: {
    color: "#5c5c5c",
  },
  username: {
    fontSize: 25,
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
