import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from "../../firebase";

const getAllBookings = () => {
  const [bookData, setBookData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        const bookingsCollection = collection(db, "book");

        const unsubscribe = onSnapshot(bookingsCollection, (snapshot) => {
          const userBookingsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setBookData(userBookingsData.reverse());
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching user data and bookings:", error);
        setLoading(false);
      }
    };

    fetchUserBookings();
  }, []);

  return { bookData, loading };
};

export default getAllBookings;
