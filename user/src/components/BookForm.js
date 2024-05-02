import { useState, useRef } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { GOOGLE_MAP_API_KEY } from "@env";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import axios from "axios";
import Button from "./Button";

export default function BookForm({
  userData,
  pickupLocation,
  pickupCoordinates,
  navigation
}) {
  const autocompleteRef = useRef(null);
  const [showBtn, setShowBtn] = useState(false);
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [dropoffCoordinates, setDropoffCoordinates] = useState([0, 0]);
  const [rideInfo, setRideInfo] = useState({
    rideTime: "0 min",
    rideDistance: "0 km",
    ridePrice: "₱0",
  });

  const calculateRideInfo = async (origin, destination) => {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${GOOGLE_MAP_API_KEY}`
    );

    if (
      response.data.rows &&
      response.data.rows[0].elements &&
      response.data.rows[0].elements[0]
    ) {
      const duration = response.data.rows[0].elements[0].duration.text;
      const distance = response.data.rows[0].elements[0].distance.text;

      const price = await calculatePrice(
        response.data.rows[0].elements[0].distance.value
      );

      await setRideInfo({
        rideTime: duration,
        rideDistance: distance,
        ridePrice: `₱${price}`,
      });
    } else {
      await setRideInfo({
        rideTime: "0 min",
        rideDistance: "0 km",
        ridePrice: "₱0.00",
      });
    }
  };

  const calculatePrice = (distanceInMeters) => {
    let totalPrice;
    const minimumPrice = 50
    const pricePerKilometer = 20;
    const distanceInKilometers = distanceInMeters / 1000;

    if (distanceInKilometers > 2) {
      totalPrice = (distanceInKilometers * pricePerKilometer) + minimumPrice;
    } else {
      totalPrice = 50
    }

    return parseInt(totalPrice);
  };


  const clearSelection = () => {
    setShowBtn(false);
    setDropoffLocation("");
    setDropoffCoordinates([0, 0]);
    autocompleteRef.current?.clear();
  };

  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        ref={autocompleteRef}
        placeholder="Where to?"
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
        onPress={(data, details = null) => {
          const { lat, lng } = details.geometry.location;
          setDropoffCoordinates([lat, lng]);
          console.log([lat, lng])
          setDropoffLocation(data.description);
          calculateRideInfo(pickupLocation, data.description);
          setShowBtn(true);
        }}
        renderRow={(data) => (
          <View style={styles.itemView}>
            <Text>{data.description}</Text>
          </View>
        )}
        styles={{
          container: styles.autocompleteContainer,
          textInput: styles.textInput,
          listView: styles.listView,
        }}
      />
      {showBtn && (
        <Button
          text="Create a booking"
          onPress={() =>
            navigation.push("BookConfirm", {
              userData,
              pickupLocation,
              pickupCoordinates,
              dropoffLocation,
              dropoffCoordinates,
              rideInfo,
            })
          }
        />
      )}
      {showBtn && (
        <Button
          variant="secondary"
          text="Clear Selection"
          onPress={clearSelection}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  autocompleteContainer: {
    width: "100%",
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 50,
    paddingLeft: 10,
  },
  listView: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "gray",
    padding: 10,
    borderRadius: 12,
    marginTop: 10,
  },
  itemView: {
    padding: 8,
    borderBottomWidth: 1,
    borderColor: "gray",
  },
  clearButton: {
    backgroundColor: "gray",
    padding: 15,
    marginTop: 10,
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
