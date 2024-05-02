import { useEffect, useState } from 'react';
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from '../../firebase';

const getUserData = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const authUser = auth.currentUser;

        if (authUser) {
          const userDocRef = doc(db, 'users', authUser.uid);
          const userDocSnapshot = await getDoc(userDocRef);

          if (userDocSnapshot.exists()) {
            const fetchedUserData = userDocSnapshot.data();
            setUserData(fetchedUserData);
          } else {
            console.log('User document does not exist');
          }
        } else {
          console.log('User is not authenticated');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return { userData, loading };
};

export default getUserData;
