import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { Toast } from "toastify-react-native";
import Stars from 'react-native-stars';

export default function BookingItem({ item }) {
  const [rating, setRating] = useState(null);
  const [isRated, setIsRated] = useState(false);

  useEffect(() => {
    const checkRating = async () => {
      try {
        const bookingRef = doc(db, "book", item.id);
        const bookingDoc = await getDoc(bookingRef);
        if (bookingDoc.exists()) {
          const { rating } = bookingDoc.data();
          if (rating !== null && rating !== undefined) {
            setRating(rating);
            setIsRated(true);
          }
        }
      } catch (error) {
        console.error("Error checking rating:", error);
      }
    };

    checkRating();
  }, [item.id]);

  const formatDate = (timestamp) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    const formattedDate = new Date(timestamp).toLocaleString("en-US", options);
    return formattedDate;
  };

  const handleRating = async (newRating) => {
    try {
      const bookingRef = doc(db, "book", item.id);
      await updateDoc(bookingRef, {
        rating: newRating,
      });
      setIsRated(true);
      setRating(newRating);
      Toast.success("Rating submitted successfully!");
    } catch (error) {
      console.error("Error submitting rating:", error);
      Toast.error("An error occurred while submitting rating. Please try again later.");
    }
  };

  return (
    <View style={styles.bookingItem}>
      <View style={styles.bookingHeader}>
        <Text style={styles.timestampText}>{formatDate(item.timestamp)}</Text>
        <Text style={styles.ridePrice}>{item.ridePrice}</Text>
      </View>

      <View style={styles.bookingInfo}>
        <View>
          <Text style={styles.locationLabel}>🔵 Pickup Location:</Text>
          <Text style={styles.locationText}>{item.pickupLocation}</Text>
        </View>
        <View>
          <Text style={styles.locationLabel}>📍Dropoff Location:</Text>
          <Text style={styles.locationText}>{item.dropoffLocation}</Text>
        </View>
      </View>

      <View style={styles.ratingContainer}>
        <Text style={styles.ratingLabel}>Rate this ride:</Text>
        <Stars
          default={rating || 0}
          count={5}
          starSize={40}
          update={(val) => handleRating(val)}
          disabled={isRated} 
        />
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  bookingItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  timestampText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  ridePrice: {
    fontSize: 16,
  },
  bookingInfo: {
    flexDirection: "column",
    justifyContent: "space-between",
  },
  locationLabel: {
    marginTop: 12,
    marginBottom: 6,
    fontSize: 16,
  },
  locationText: {
    fontSize: 14,
    width: "80%",
  },
  ratingContainer: {
    marginTop: 10,
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  ratingLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
});
