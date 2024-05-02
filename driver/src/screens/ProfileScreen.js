import * as ImagePicker from "expo-image-picker";
import Ionicons from "react-native-vector-icons/Ionicons";
import getUserData from "../hooks/getUserData";
import Loading from "../components/Loading";
import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { ref, getStorage, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Image,
  View,
  StyleSheet,
} from "react-native";
import { Toast } from "toastify-react-native";

export default function ProfileScreen() {
  const authUser = auth.currentUser;
  const storage = getStorage();
  const navigation = useNavigation();
  const [image, setImage] = useState(null);
  const { userData, loading } = getUserData();

  const uploadImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.cancelled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        const imageUri = selectedImage.uri;

        Alert.alert(
          "Change Profile Picture",
          "Do you want to change your profile picture?",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "OK",
              onPress: async () => {
                const blob = await fetch(imageUri).then((response) =>
                  response.blob()
                );

                const storageRef = ref(storage, "user/profilePic");
                const snapshot = uploadBytes(storageRef, blob);

                try {
                  await snapshot;

                  const url = await getDownloadURL(storageRef);
                  setImage(url);

                  const userDocRef = doc(db, "drivers", authUser.uid);
                  await setDoc(
                    userDocRef,
                    { profilePicture: url },
                    { merge: true }
                  );

                  Toast.success(
                    "You have successfully updated your Profile Picture!"
                  );
                } catch (error) {
                  Toast.error("Error uploading Profile Picture!");
                  console.error(error);
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      Toast.error("Error selecting image:", error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            await signOut(auth);
            Toast.success("You have successfully logged out!");
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          },
        },
      ],
      { cancelable: false }
    );
  };

  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
      }
    })();
  }, []);

  if (loading) return <Loading />;
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={uploadImage}>
        {userData ? (
          <Image
            source={{
              uri:
                image ||
                (userData && userData.profilePicture) ||
                "https://i.stack.imgur.com/l60Hf.png",
            }}
            style={styles.profileImage}
          />
        ) : (
          <ActivityIndicator size="large" color="black" />
        )}
      </TouchableOpacity>
      <Text style={styles.username}>
        {`${userData?.firstName} ${userData?.lastName}` || "Username"}
      </Text>
      <Text style={styles.phoneNumber}>{userData.phoneNumber}</Text>
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.push("Income")}
        >
          <Ionicons name="wallet-outline" color="#333" size={18} />
          <Text style={styles.optionText}>Driver's income</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.push("BookHistory")}
        >
          <Ionicons name="book-outline" color="#333" size={18} />
          <Text style={styles.optionText}>Book History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.push("FareMatrix")}
        >
          <Ionicons name="card-outline" color="#333" size={18} />
          <Text style={styles.optionText}>Fare Matrix</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.push("ChangePersonalInfo")}
        >
          <Ionicons name="person-outline" color="#333" size={18} />
          <Text style={styles.optionText}>Change Personal Info</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.push("ChangePassword")}
        >
          <Ionicons name="lock-closed-outline" color="#333" size={18} />
          <Text style={styles.optionText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.push("Report")}
        >
          <Ionicons name="alert-circle-outline" color="#333" size={18} />
          <Text style={styles.optionText}>Report</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: "center",
  },
  profileImage: {
    width: 180,
    height: 180,
    borderRadius: 50,
    marginBottom: 16,
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  phoneNumber: {
    marginBottom: 20,
  },
  logoutButton: {
    width: "90%",
    backgroundColor: "#FF5733",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  logoutButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  optionsContainer: {
    width: "90%",
    marginBottom: 20,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 12,
  },
  optionButton: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    flexDirection: "row",
    gap: 12,
  },
  optionText: {
    fontWeight: "bold",
  },
});
