import React, { useState, useEffect } from "react";
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

export default function ChangePersonalInfoScreen() {
  const [loading, setLoading] = useState(false);
  const { userData, loading: userDataLoading } = getUserData();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [motorcycleModel, setMotorcycleModel] = useState("");
  const [motorcycleRegNo, setMotorcycleRegNo] = useState("");
  const [maxLoad, setMaxLoad] = useState("");
  const [weight, setWeight] = useState("");

  useEffect(() => {
    if (!userDataLoading) {
      setFirstName(userData.firstName || "");
      setLastName(userData.lastName || "");
      setPhoneNumber(userData.phoneNumber || "");
      setMotorcycleModel(userData.motorcycleModel || "");
      setMotorcycleRegNo(userData.motorcycleRegNo || "");
      setMaxLoad(userData.maxLoad || "");
      setWeight(userData.weight || "");
    }
  }, [userData, userDataLoading]);

  const handleChangeInfo = async () => {
    if (loading) return;

    setLoading(true);
    try {
      if (auth.currentUser) {
        const userDocRef = doc(db, "drivers", auth.currentUser.uid);
        await updateDoc(userDocRef, {
          firstName: firstName,
          lastName: lastName,
          phoneNumber: phoneNumber,
          motorcycleModel: motorcycleModel,
          motorcycleRegNo: motorcycleRegNo,
          maxLoad: maxLoad,
          weight: weight,
        });
        Toast.success("You have successfully changed your name");
      }
    } catch (error) {
      Toast.error("Error updating user information: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text>First Name</Text>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
        autoCapitalize="none"
      />
      <Text>Last Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
        autoCapitalize="none"
      />
      <Text>Phone Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        autoCapitalize="none"
        keyboardType="numeric"
      />
      <Text>Motorcycle Model</Text>
      <TextInput
        style={styles.input}
        placeholder="Motorcycle Model"
        value={motorcycleModel}
        onChangeText={setMotorcycleModel}
        autoCapitalize="none"
      />
      <Text>Motorcycle Reg No</Text>
      <TextInput
        style={styles.input}
        placeholder="Motorcycle Reg No"
        value={motorcycleRegNo}
        onChangeText={setMotorcycleRegNo}
        autoCapitalize="none"
      />
      <Text>Motorcycle Max Load</Text>
      <TextInput
        style={styles.input}
        placeholder="Motorcycle Max Load in kg"
        value={maxLoad}
        onChangeText={setMaxLoad}
        autoCapitalize="none"
        keyboardType="numeric"
      />
      <Text>Weight</Text>
      <TextInput
        style={styles.input}
        placeholder="Weight in kg"
        value={weight}
        onChangeText={setWeight}
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
