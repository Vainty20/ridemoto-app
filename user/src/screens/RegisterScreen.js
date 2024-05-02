import React, { useRef, useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  View,
} from "react-native";
import DatePicker from "@react-native-community/datetimepicker";
import { Toast } from "toastify-react-native";
import { auth, db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { GOOGLE_MAP_API_KEY } from "@env";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import PasswordInput from "../components/PasswordInput";
import Button from "../components/Button";

export default function RegisterScreen({ navigation }) {
  const autocompleteRef = useRef(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    showPassword: false,
    birthdate: new Date(),
    showDatePicker: false,
    phoneNumber: "",
    confirmPassword: "",
    showConfirmPassword: false,
    gender: "",
    weight: "",
    address: "",
  });
  const [role] = useState("user");
  const [loading, setLoading] = useState(false);

  const MIN_AGE = 18;

  const isValidFirstName = () =>
    /^[a-zA-Z]+$/.test(form.firstName) &&
    !/\d/.test(form.firstName) &&
    !/[^a-zA-Z0-9]/.test(form.firstName);
  const isValidLastName = () =>
    /^[a-zA-Z]+$/.test(form.lastName) &&
    !/\d/.test(form.lastName) &&
    !/[^a-zA-Z0-9]/.test(form.lastName);
  const isValidPhoneNumber = () => /^09\d{9}$/.test(form.phoneNumber);
  const isStrongPassword = () =>
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(form.password);

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || form.birthdate;
    setForm({ ...form, showDatePicker: false, birthdate: currentDate });
  };

  const showDatepicker = () => {
    setForm({ ...form, showDatePicker: true });
  };

  const handleSignUp = async () => {
    if (loading) return;

    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      birthdate,
      phoneNumber,
      gender,
      weight,
      address,
    } = form;

    if (!isValidFirstName()) {
      return Toast.error(
        "Invalid First Name! First Name should only contain letters"
      );
    }

    if (!isValidLastName()) {
      return Toast.error(
        "Invalid Last Name! Last Name should only contain letters"
      );
    }

    if (!isValidPhoneNumber()) {
      return Toast.error(
        "Invalid Phone Number! Phone number should start with 09 and be 11 digits long."
      );
    }

    if (password !== confirmPassword) {
      return Toast.error("Passwords do not match!");
    }

    if (!isStrongPassword()) {
      return Toast.error(
        "Weak Password! Password should be at least 8 characters long and contain at least one letter and one number."
      );
    }

    let currentDate = new Date();
    let age = currentDate.getFullYear() - birthdate.getFullYear();

    if (
      currentDate.getMonth() < birthdate.getMonth() ||
      (currentDate.getMonth() === birthdate.getMonth() &&
        currentDate.getDate() < birthdate.getDate())
    ) {
      age--;
    }

    if (age < MIN_AGE) {
      return Toast.error(
        `You must be at least ${MIN_AGE} years old to register!`
      );
    }

    if (!gender) {
      return Toast.error("Please select your gender.");
    }

    if (!weight) {
      return Toast.error("Please provide your weight.");
    }

    if (!address) {
      return Toast.error("Please provide your address.");
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password.trim()
      );

      const userData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        birthdate,
        phoneNumber: phoneNumber.trim(),
        role,
        gender: gender.trim(),
        weight: weight.trim(),
        address: address.trim(),
        isApproved: true
      };

      const userDocRef = doc(db, "users", userCredential.user.uid);

      await setDoc(userDocRef, userData);
      await sendEmailVerification(userCredential.user);

      Toast.success(
        "You have successfully created an account! Please check your email for verification."
      );

      navigation.replace("Login");
    } catch (error) {
      let errorMessage = "Error creating an account. Please try again later.";

      if (error.code === "auth/email-already-in-use") {
        errorMessage =
          "This email address is already in use. Please use a different email.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address. Please enter a valid email.";
      } else if (error.code === "auth/operation-not-allowed") {
        errorMessage =
          "Account creation is currently not allowed. Please try again later.";
      }

      Toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputCol}
          placeholder="First Name"
          value={form.firstName}
          onChangeText={(text) => setForm({ ...form, firstName: text })}
        />
        <TextInput
          style={styles.inputCol}
          placeholder="Last Name"
          value={form.lastName}
          onChangeText={(text) => setForm({ ...form, lastName: text })}
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={form.email}
        onChangeText={(text) => setForm({ ...form, email: text })}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={form.phoneNumber}
        onChangeText={(text) => setForm({ ...form, phoneNumber: text })}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.input} onPress={showDatepicker}>
        <Text>Birthdate: {form.birthdate.toDateString()}</Text>
      </TouchableOpacity>
      {form.showDatePicker && (
        <DatePicker
          testID="datePicker"
          value={form.birthdate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputCol}
          placeholder="Gender"
          value={form.gender}
          onChangeText={(text) => setForm({ ...form, gender: text })}
        />
        <TextInput
          style={styles.inputCol}
          placeholder="Weight in kilograms"
          value={form.weight}
          onChangeText={(text) => setForm({ ...form, weight: text })}
          keyboardType="numeric"
        />
      </View>
      <GooglePlacesAutocomplete
        ref={autocompleteRef}
        placeholder="Address"
        enablePoweredByContainer={false}
        suppressDefaultStyles
        fetchDetails
        query={{
          key: GOOGLE_MAP_API_KEY,
          language: "en",
          components: "country:ph",
          strictbounds: true,
          location: "16.0439, 120.3331",
          radius: "20000",
        }}
        onPress={(data) => {
          setForm({ ...form, address: data.description });
        }}
        renderRow={(data) => (
          <View style={styles.itemView}>
            <Text style={{ color: "#000" }}>{data.description}</Text>
          </View>
        )}
        styles={{
          container: styles.textInputContainer,
          textInput: styles.textInput,
          listView: styles.listView,
        }}
      />
      <PasswordInput
        value={form.password}
        onChangeText={(text) => setForm({ ...form, password: text })}
      />
      <PasswordInput
        placeholder="Confirm Password"
        value={form.confirmPassword}
        onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
      />
      <Button onPress={handleSignUp} text="Register" loading={loading} />
      <Text style={styles.additionalText}>
        By providing your email address, you agree to our{" "}
        <Text style={styles.privacyPolicyText}>Privacy Policy</Text> and{" "}
        <Text style={styles.privacyPolicyText}>Terms of Service</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  inputContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderColor: "gray",
    borderWidth: 1,
    justifyContent: "center",
    borderRadius: 12,
    marginVertical: 10,
    padding: 10,
  },
  inputCol: {
    flex: 1,
    width: "100%",
    height: 50,
    maxHeight: 50,
    backgroundColor: "#fff",
    borderColor: "gray",
    borderWidth: 1,
    justifyContent: "center",
    borderRadius: 12,
    marginVertical: 10,
    padding: 10,
  },
  textInputContainer: {
    width: "100%",
    marginVertical: 10,
  },
  textInput: {
    width: "100%",
    backgroundColor: "#fff",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  additionalText: {
    width: "100%",
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
    color: "gray",
  },
  privacyPolicyText: {
    color: "#0066cc",
    fontWeight: "bold",
  },
  listView: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "gray",
    padding: 10,
    borderRadius: 6,
    marginTop: 20,
  },
  itemView: {
    padding: 8,
    borderBottomWidth: 1,
    borderColor: "gray",
  },
});
