import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";
import BookConfirmScreen from "./src/screens/BookConfirmScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import ViewCurrentBookingScreen from "./src/screens/ViewCurrentBookingScreen";
import BookHistoryScreen from "./src/screens/BookHistoryScreen";
import ChangePersonalInfoScreen from "./src/screens/ChangePersonalInfoScreen";
import ChangePasswordScreen from "./src/screens/ChangePasswordScreen";
import ToastManager from "toastify-react-native";
import FareMatrixScreen from "./src/screens/FareMatrixScreen";
import ReportScreen from "./src/screens/ReportScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState("Login");
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setInitialRoute(user ? "Home" : "Login");
    });

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaProvider>
      <ToastManager
        width={320}
        height={100}
        style={{ padding: 4 }}
        textStyle={{ fontSize: 16 }}
      />
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute}>
          <Stack.Screen
            options={{ headerShown: false }}
            name="Login"
            component={LoginScreen}
          />
          <Stack.Screen
            options={{ title: "Create your account" }}
            name="Register"
            component={RegisterScreen}
          />
          <Stack.Screen
            options={{ headerShown: false }}
            name="Home"
            component={HomeScreen}
          />
          <Stack.Screen
            options={{ headerShown: false }}
            name="BookConfirm"
            component={BookConfirmScreen}
          />
          <Stack.Screen
            options={{ headerShown: false }}
            name="ViewCurrentBooking"
            component={ViewCurrentBookingScreen}
          />
          <Stack.Screen
            options={{ title: "Account Settings" }}
            name="Profile"
            component={ProfileScreen}
          />
          <Stack.Screen
            options={{ title: "Recent Bookings" }}
            name="BookHistory"
            component={BookHistoryScreen}
          />
          <Stack.Screen
            options={{ title: "Change Personal Info" }}
            name="ChangePersonalInfo"
            component={ChangePersonalInfoScreen}
          />
          <Stack.Screen
            options={{ title: "Change Password" }}
            name="ChangePassword"
            component={ChangePasswordScreen}
          />
          <Stack.Screen
            options={{ title: "Fare Matrix" }}
            name="FareMatrix"
            component={FareMatrixScreen}
          />
           <Stack.Screen
            options={{ title: "Reports" }}
            name="Reports"
            component={ReportScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
