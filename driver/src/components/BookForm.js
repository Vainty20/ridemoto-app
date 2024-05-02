import React, { useState, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { GOOGLE_MAP_API_KEY } from "@env";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";


export default function BookForm({ userData, pickupLocation, pickupCoordinates }) {
  const navigation = useNavigation();
  const autocompleteRef = useRef(null);
  const [showBtn, setShowBtn] = useState(false);
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [dropoffCoordinates, setDropoffCoordinates] = useState([0, 0]);
  const [rideInfo, setRideInfo] = useState({
    rideTime: '0 min',
    rideDistance: '0 km',
    ridePrice: '₱0',
  });

  const calculateRideInfo = async (origin, destination) => {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${GOOGLE_MAP_API_KEY}`
    );
  
    if (response.data.rows && response.data.rows[0].elements && response.data.rows[0].elements[0]) {
      const duration = response.data.rows[0].elements[0].duration.text;
      const distance = response.data.rows[0].elements[0].distance.text;
  
      const price = calculatePrice(response.data.rows[0].elements[0].duration.value, response.data.rows[0].elements[0].distance.value);
  
      setRideInfo({
        rideTime: duration,
        rideDistance: distance,
        ridePrice: `₱${price.toFixed(2)}`,
      });
    } else {
      setRideInfo({
        rideTime: '0 min',
        rideDistance: '0 km',
        ridePrice: '₱0.00',
      });
    }
  };
  
  const calculatePrice = (durationInSeconds, distanceInMeters) => {
    const pricePerKilometer = 10;
    const pricePerMinute = 2;
  
    const distanceInKilometers = distanceInMeters / 1000;
    const durationInMinutes = durationInSeconds / 60;
  
    const totalPrice = distanceInKilometers * pricePerKilometer + durationInMinutes * pricePerMinute;
  
    return totalPrice;
  };

  const clearSelection = () => {
    setShowBtn(false);
    setDropoffLocation('');
    setDropoffCoordinates([0, 0]);
    autocompleteRef.current?.clear(); 
  };
  
  return (
    <View>
      <View>
        <GooglePlacesAutocomplete
          ref={autocompleteRef}
          placeholder="Where to?"
          enablePoweredByContainer={false}        
          suppressDefaultStyles
          fetchDetails
          query={{
            key: GOOGLE_MAP_API_KEY,
            language: 'en',
            components: 'country:ph',
            strictbounds: true,
            location: "16.0439, 120.3331",
            radius: "20000", 
          }}
          onPress={(data, details = null) => {
            const { lat, lng } = details.geometry.location;
            setDropoffCoordinates([lat, lng]);
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
      </View>
      {
        showBtn && (
          <TouchableOpacity style={styles.button} onPress={() => 
            navigation.push('BookConfirm', {
              userData,
              pickupLocation,
              pickupCoordinates,
              dropoffLocation,
              dropoffCoordinates,
              rideInfo,
            })
          }>
            <Text style={styles.buttonText}>Create a booking</Text>
          </TouchableOpacity>
        )
      }
      {showBtn ? (
        <TouchableOpacity style={styles.clearButton} onPress={clearSelection}>
          <Text style={styles.buttonText}>Clear Selection</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  autocompleteContainer: {
    width: '100%',
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 50,
    paddingLeft: 10,
  },
  listView: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    borderRadius: 12,
    marginTop: 10,
  },
  itemView: {
    padding: 8,
    borderBottomWidth: 1,
    borderColor: 'gray',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#0066cc',
    padding: 15,
    marginTop: 20,
    borderRadius: 12,
    width: '100%',
  },
  clearButton: {
    backgroundColor: 'gray',
    padding: 15,
    marginTop: 10,
    borderRadius: 12,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'bold'
  },
});
