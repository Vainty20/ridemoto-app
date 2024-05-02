import { useState } from "react";
import { TextInput, View, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

export default function PasswordInput({ placeholder, value, onChangeText }) {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View style={styles.passwordContainer}>
      <TextInput
        style={styles.passwordInput}
        placeholder={placeholder || "Password"}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!showPassword}
      />
      <TouchableOpacity onPress={toggleShowPassword}>
        <Icon
          name={showPassword ? "eye-slash" : "eye"}
          size={20}
          color="gray"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  passwordContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
    backgroundColor: "#fff",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  passwordInput: {
    flex: 1,
  },
});

