import * as ImagePicker from "expo-image-picker";

import { useState, useEffect } from "react";
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
  FlatList,
  StyleSheet,
} from "react-native";
import { Toast } from "toastify-react-native";
import getUserData from "../hooks/getUserData";
import Loading from "../components/Loading";
import Button from "../components/Button";
import AccountSettingsList from "../components/AccountSettingList";

export default function ProfileScreen({ navigation }) {
  const authUser = auth.currentUser;
  const storage = getStorage();
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

                  const userDocRef = doc(db, "users", authUser.uid);
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

  const options = [
    {
      title: "Book History",
      icon: "book-outline",
      onPress: () => navigation.push("BookHistory"),
    },
    {
      title: "Fare Matrix",
      icon: "card-outline",
      onPress: () => navigation.push("FareMatrix"),
    },
    {
      title: "Change Personal Info",
      icon: "person-outline",
      onPress: () => navigation.push("ChangePersonalInfo"),
    },
    {
      title: "Change Password",
      icon: "lock-closed-outline",
      onPress: () => navigation.push("ChangePassword"),
    },
    {
      title: "Reports",
      icon: "alert-circle-outline",
      onPress: () => navigation.push("Reports"),
    },
  ];

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
      <AccountSettingsList options={options} navigation={navigation} />
      <Button variant="danger" text="Logout" onPress={handleLogout} />
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
    borderRadius: 180,
    marginBottom: 16,
  },
  username: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 18,
    marginBottom: 20,
    color: "#333",
  },
});
