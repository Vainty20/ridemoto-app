import React, { useEffect, useRef, useState } from "react";
import MapView, { Marker, Polyline } from "react-native-maps";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { GOOGLE_MAP_API_KEY } from "@env";
import { Image, View } from "react-native";
import getUserData from "../hooks/getUserData";

const Map = ({ origin, destination, originCoords, destinationCoords }) => {
  const { userData } = getUserData();
  const mapRef = useRef(null);
  const [polylineCoordinates, setPolylineCoordinates] = useState([]);

  useEffect(() => {
    if (!originCoords || !destinationCoords) return;

    mapRef.current.fitToSuppliedMarkers(["origin", "destination"], {
      edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
    });

    fetchPolylineCoordinates();
  }, [originCoords, destinationCoords]);

  const fetchPolylineCoordinates = async () => {
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${originCoords[0]},${originCoords[1]}&destination=${destinationCoords[0]},${destinationCoords[1]}&key=${GOOGLE_MAP_API_KEY}`);
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
      const dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
      lat += dlat;
      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
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
              borderColor: '#0066cc',
              borderRadius: 50,
            }}
            source={{ uri: (userData && userData.profilePicture) || 'https://i.stack.imgur.com/l60Hf.png' }}
          />
        </Marker>
      )}
      {destinationCoords && destinationCoords[0] !== 0 && destinationCoords[1] !== 0 && (
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
              borderColor: '#0066cc',
              borderRadius: 50,
              backgroundColor: '#fff',
              alignItems: 'center',
              justifyContent: 'center'
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
