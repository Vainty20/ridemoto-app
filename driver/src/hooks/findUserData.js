import { useEffect, useState } from 'react';
import { doc, getDoc } from "firebase/firestore";
import { db } from '../../firebase';

const findUserData = ({userId}) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        const userDocRef = doc(db, 'users', userId);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          const fetchedUserData = userDocSnapshot.data();
          setUserData(fetchedUserData);
        } else {
          console.log('User document does not exist');
        }
        
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userData]);

  return { userData, loading };
};

export default findUserData;
