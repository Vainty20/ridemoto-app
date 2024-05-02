import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { Toast } from "toastify-react-native";
import getUserData from "../hooks/getUserData";
import Loading from "../components/Loading";

export default function ChangePersonalInfoScreen() {
  const [loading, setLoading] = useState(false);
  const { userData, loading: userDataLoading } = getUserData();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    weight: ""
  });

  useEffect(() => {
    if (!userDataLoading) {
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        phoneNumber: userData.phoneNumber || "",
        weight: userData.weight || "",
      });
    }
  }, [userData, userDataLoading]);

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value.trim(),
    });
  };

  const handleChangeInfo = async () => {
    if (loading) return;

    setLoading(true);
    try {
      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, formData);
        Toast.success("You have successfully changed your name");
      }
    } catch (error) {
      Toast.error("Error updating user information: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (userDataLoading) return <Loading/>
  
  return (
    <SafeAreaView style={styles.container}>
      <Text>First Name</Text>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={formData.firstName}
        onChangeText={(text) => handleChange("firstName", text)}
        autoCapitalize="none"
      />
      <Text>Last Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={formData.lastName}
        onChangeText={(text) => handleChange("lastName", text)}
        autoCapitalize="none"
      />
      <Text>Phone Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={formData.phoneNumber}
        onChangeText={(text) => handleChange("phoneNumber", text)}
        autoCapitalize="none"
        keyboardType="numeric"
      />
      <Text>Weight</Text>
      <TextInput
        style={styles.input}
        placeholder="Weight in kg"
        value={formData.weight}
        onChangeText={(text) => handleChange("weight", text)}
        autoCapitalize="none"
        keyboardType="numeric"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleChangeInfo}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? <ActivityIndicator size={25} color="white" /> : "Save"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 12,
    marginVertical: 10,
    padding: 10,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#0066cc",
    padding: 15,
    marginVertical: 20,
    borderRadius: 12,
    width: "100%",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
});
