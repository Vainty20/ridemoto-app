import { useEffect, useState } from "react";
import { GOOGLE_MAP_API_KEY } from "@env";
import { Toast } from "toastify-react-native";
import * as Location from "expo-location";
import axios from "axios";

const getUserLocation = () => {
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [locationCoordinates, setLocationCoordinates] = useState([]);

  useEffect(() => {
    const getLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          alert("Permission to access location was denied");
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
          maximumAge: 10000,
        });

        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.coords.latitude},${location.coords.longitude}&key=${GOOGLE_MAP_API_KEY}`
        );
        const formattedAddress = response.data.results[0].formatted_address;
        setLocation(formattedAddress);
        setLocationCoordinates([
          location.coords.latitude,
          location.coords.longitude,
        ]);
      } catch (error) {
        Toast.error(
          "Error getting current location, Please try to reload the app!"
        );
      } finally {
        setLoading(false);
      }
    };

    getLocation();
  }, []);

  return { location, locationCoordinates, loading };
};

export default getUserLocation;
