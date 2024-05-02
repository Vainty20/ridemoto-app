import React, { useEffect, useRef, useState } from "react";
import MapView, { Marker, Polyline } from "react-native-maps";
import Ionicons from "react-native-vector-icons/Ionicons";
import { GOOGLE_MAP_API_KEY } from "@env";
import { Image, View, Alert } from "react-native";
import getUserData from "../hooks/getUserData";
import axios from "axios";
import { useNavigation, useRoute } from "@react-navigation/native";

const Map = ({ origin, destination, originCoords, destinationCoords }) => {
  const mapRef = useRef(null);
  const currentRoute = useRoute();
  const navigation = useNavigation();
  const { userData } = getUserData();
  const [polylineCoordinates, setPolylineCoordinates] = useState([]);

  const calculatePrice = (distanceInMeters) => {
    let totalPrice;
    const minimumPrice = 50;
    const pricePerKilometer = 20;
    const distanceInKilometers = distanceInMeters / 1000;

    if (distanceInKilometers > 2) {
      totalPrice = distanceInKilometers * pricePerKilometer + minimumPrice;
    } else {
      totalPrice = 50;
    }

    return parseInt(totalPrice);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const handleMapPress = async (event) => {
    if (currentRoute.name === "Home") {
      const { coordinate } = event.nativeEvent;
      const centerLat = 16.0439;
      const centerLon = 120.3331;
      const radius = 20;

      const options = {
        method: "GET",
        url: "https://isitwater-com.p.rapidapi.com/",
        params: {
          latitude:  coordinate.latitude,
          longitude:  coordinate.longitude,
        },
        headers: {
          "X-RapidAPI-Key":
            "3980f93a2cmsh89b090737f6bfd3p137234jsn5e2904bf8258",
          "X-RapidAPI-Host": "isitwater-com.p.rapidapi.com",
        },
      };
      
      const distance = calculateDistance(
        centerLat,
        centerLon,
        coordinate.latitude,
        coordinate.longitude
      );

      if (distance > radius) {
        Alert.alert(
          "Location Outside Desired Area",
          `Please select a location within ${radius} km of the specified center point.`,
          [{ text: "OK", onPress: () => console.log("OK Pressed") }],
          { cancelable: false }
        );
        return;
      }

      try {
        const response = await axios.request(options);
        console.log(response.data)
        if (response.data.water) return alert("Please select a location in land area.")
        const geoResponse = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinate.latitude},${coordinate.longitude}&key=${GOOGLE_MAP_API_KEY}&enable_address_descriptor=true`
        );

        if (
          geoResponse.data &&
          geoResponse.data.results &&
          geoResponse.data.results.length > 0
        ) {
          const addressComponents =
            geoResponse.data.results[0].address_components;

          const isOnWater = addressComponents.some((component) =>
            component.types.includes("water")
          );

          if (isOnWater) {
            return Alert.alert("Please select a location on land.");
          }

          const formattedAddress =
            geoResponse.data.results[0].formatted_address;

          Alert.alert(
            "Create Booking",
            `Dropoff: ${formattedAddress}`,
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "OK",
                onPress: async () => {
                  const response = await axios.get(
                    `https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${coordinate.latitude},${coordinate.longitude}&origins=${originCoords[0]},${originCoords[1]}&key=${GOOGLE_MAP_API_KEY}`
                  );

                  if (
                    response.data.rows &&
                    response.data.rows[0].elements &&
                    response.data.rows[0].elements[0]
                  ) {
                    const duration =
                      response.data.rows[0].elements[0].duration.text;
                    const distance =
                      response.data.rows[0].elements[0].distance.text;

                    const price = calculatePrice(
                      response.data.rows[0].elements[0].distance.value
                    );

                    await navigation.push("BookConfirm", {
                      userData,
                      pickupLocation: origin,
                      pickupCoordinates: originCoords,
                      dropoffLocation: formattedAddress,
                      dropoffCoordinates: [
                        coordinate.latitude,
                        coordinate.longitude,
                      ],
                      rideInfo: {
                        rideTime: duration,
                        rideDistance: distance,
                        ridePrice: `₱${price}`,
                      },
                    });
                  }
                },
              },
            ],
            { cancelable: false }
          );
        } else {
          Alert.alert(
            "No Address Found",
            "Failed to retrieve address information."
          );
        }
      } catch (error) {
        console.error("Error fetching address:", error);
        Alert.alert("Error", "Failed to fetch address. Please try again.");
      }
    }
  };

  useEffect(() => {
    if (!originCoords || !destinationCoords) return;

    mapRef.current.fitToSuppliedMarkers(["origin", "destination"], {
      edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
    });

    fetchPolylineCoordinates();
  }, [originCoords, destinationCoords]);

  const fetchPolylineCoordinates = async () => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${originCoords[0]},${originCoords[1]}&destination=${destinationCoords[0]},${destinationCoords[1]}&key=${GOOGLE_MAP_API_KEY}`
      );
      const data = await response.json();
      if (data.routes.length > 0) {
        const points = data.routes[0].overview_polyline.points;
        const polylineCoords = decodePolyline(points);
        setPolylineCoordinates(polylineCoords);
      }
    } catch (error) {
      console.error("Error fetching polyline coordinates: ", error);
    }
  };

  const decodePolyline = (encoded) => {
    const len = encoded.length;
    let index = 0;
    const array = [];
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = (result & 1) != 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;
      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = (result & 1) != 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;
      const position = { latitude: lat / 1e5, longitude: lng / 1e5 };
      array.push(position);
    }
    return array;
  };

  return (
    <MapView
      ref={mapRef}
      style={{ flex: 1 }}
      onPress={handleMapPress}
      showsBuildings={true}
      initialRegion={{
        latitude: originCoords[0] ? originCoords[0] : 16.0439,
        longitude: originCoords[1] ? originCoords[1] : 120.3331,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    >
      {polylineCoordinates.length > 0 && (
        <Polyline
          coordinates={polylineCoordinates}
          strokeColor="#0066cc"
          strokeWidth={5}
        />
      )}

      {originCoords && (
        <Marker
          coordinate={{ latitude: originCoords[0], longitude: originCoords[1] }}
          title="Your Location"
          description={origin || ""}
          identifier="origin"
        >
          <Image
            style={{
              width: 32,
              height: 32,
              borderWidth: 2.5,
              borderColor: "#0066cc",
              borderRadius: 50,
            }}
            source={{
              uri:
                (userData && userData.profilePicture) ||
                "https://i.stack.imgur.com/l60Hf.png",
            }}
          />
        </Marker>
      )}
      {destinationCoords &&
        destinationCoords[0] !== 0 &&
        destinationCoords[1] !== 0 && (
          <Marker
            coordinate={{
              latitude: destinationCoords[0],
              longitude: destinationCoords[1],
            }}
            title="Destination"
            description={destination || ""}
            identifier="destination"
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderWidth: 2.5,
                borderColor: "#0066cc",
                borderRadius: 50,
                backgroundColor: "#fff",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="bicycle" color="#0066cc" size={20} />
            </View>
          </Marker>
        )}
    </MapView>
  );
};

export default Map;
