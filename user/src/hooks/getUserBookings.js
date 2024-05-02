import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase';

const getUserBookings = () => {
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserBookings = async () => {
    try {
      const bookingsCollection = collection(db, "book");
      const userBookingsQuery = query(
        bookingsCollection,
        where("userId", "==", auth.currentUser.uid)
      );
      const userBookingsSnapshot = await getDocs(userBookingsQuery);
      const userBookingsData = userBookingsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUserBookings(userBookingsData.reverse());
    } catch (error) {
      console.error("Error fetching user data and bookings:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUserBookings();
  }, []);

  return { userBookings, loading, fetchUserBookings }; 
};

export default getUserBookings;
