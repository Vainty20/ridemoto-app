import { useEffect, useState } from 'react';
import { doc, getDoc } from "firebase/firestore";
import { db } from '../../firebase';

const getCurrentBooking = ({ id }) => {
  const [currentBooking, setCurrentBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentBookData = async () => {
      try {

        const currentBookingDocRef = doc(db, 'book', id);
        const currentBookingDocSnapshot = await getDoc(currentBookingDocRef);

        if (currentBookingDocSnapshot.exists()) {
          const fetchedCurrentBooking = { id: currentBookingDocSnapshot.id, ...currentBookingDocSnapshot.data() };
          setCurrentBooking(fetchedCurrentBooking);
        } else {
          console.log('Book document does not exist');
        }

      } catch (error) {
        console.error('Error fetching book data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentBookData();
  }, [id, currentBooking]); 

  return { currentBooking, loading};
};

export default getCurrentBooking;
