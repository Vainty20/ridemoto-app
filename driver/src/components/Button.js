import React from "react";
import { TouchableOpacity, ActivityIndicator, Text, StyleSheet } from "react-native";

export default function Button({ onPress, loading, text, variant }) {
  const buttonStyles = getButtonStyles(variant);
  const buttonTextStyles = getButtonTextStyles(variant);

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size={25} color="white" />
      ) : (
        <Text style={buttonTextStyles}>{text}</Text>
      )}
    </TouchableOpacity>
  );
};

const getButtonStyles = (variant) => {
  switch (variant) {
    case "secondary":
      return styles.secondaryButton;
    case "danger":
      return styles.dangerButton;
    default:
      return styles.primaryButton;
  }
};

const getButtonTextStyles = (variant) => {
  switch (variant) {
    case "secondary":
      return styles.secondaryButtonText;
    case "danger":
      return styles.dangerButtonText;
    default:
      return styles.primaryButtonText;
  }
};

const styles = StyleSheet.create({
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#0066cc",
    padding: 15,
    marginTop: 20,
    borderRadius: 12,
    width: "100%",
  },
  primaryButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "gray",
    padding: 15,
    marginVertical: 20,
    borderRadius: 12,
    width: "100%",
  },
  secondaryButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  dangerButton: {
    alignItems: "center",
    backgroundColor: "red",
    padding: 15,
    marginVertical: 20,
    borderRadius: 12,
    width: "100%",
  },
  dangerButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
});

