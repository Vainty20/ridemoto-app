import React, { useState } from "react";
import { auth } from "../../firebase";
import { Toast } from "toastify-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import PasswordInput from "../components/PasswordInput";

export default function ChangePasswordScreen() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const { oldPassword, newPassword, confirmNewPassword } = formData;

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value.trim(),
    });
  };

  const handleChangePassword = async () => {
    if (loading) return;

    try {
      setLoading(true);

      if (!auth.currentUser) return;

      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        formData.oldPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      if (formData.newPassword !== formData.confirmNewPassword) {
        setLoading(false);
        return Toast.error("Passwords do not match");
      }

      await updatePassword(auth.currentUser, formData.newPassword);

      Toast.success("You have successfully changed your password");
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (error) {
      if (error.code === "auth/invalid-credential") {
        return Toast.error(
          "Invalid credentials. Please enter your current password."
        );
      }
      return Toast.error("Error updating password!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text>Old Password</Text>
      <PasswordInput
        placeholder="Old Password"
        value={oldPassword}
        onChangeText={(text) => handleChange("oldPassword", text)}
      />
      <Text>New Password</Text>
      <PasswordInput
        placeholder="New Password"
        value={newPassword}
        onChangeText={(text) => handleChange("newPassword", text)}
      />
      <Text>Confirm New Password</Text>
      <PasswordInput
        placeholder="Confirm Password"
        value={confirmNewPassword}
        onChangeText={(text) => handleChange("confirmNewPassword", text)}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleChangePassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size={25} color="white" />
        ) : (
          <Text style={styles.buttonText}>Change Password</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
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
