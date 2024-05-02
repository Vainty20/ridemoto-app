import { useState } from "react";
import {
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  StyleSheet,
  ImageBackground,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../../firebase";
import { Toast } from "toastify-react-native";
import Logo from "../../assets/ridemoto-logo.png";
import getUserData from "../hooks/getUserData";
import PasswordInput from "../components/PasswordInput";
import Button from "../components/Button";

export default function LoginScreen() {
  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { userData } = getUserData();



  const handleLogin = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (user.emailVerified) {
        Toast.success("You have successfully logged in");
        navigation.replace("Home");
      } else {
        Toast.error("Please verify your email before logging in.");
        await sendEmailVerification(user);
      }
    } catch (error) {
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        errorMessage =
          "Invalid email or password. Please check your credentials.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many unsuccessful login attempts. Try again later.";
      } else if (error.code === "auth/invalid-credential") {
        errorMessage =
          "Invalid credentials. Please check your email and password.";
      }

      Toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const forgetPassword = async () => {
    if (loading) return;

    setLoading(true);

    try {
      if (!email) {
        return Toast.warning(
          "Please enter your email before resetting the password."
        );
      }

      await sendPasswordResetEmail(auth, email);
      setEmail("");
      setPassword("");

      Toast.success("Password reset email sent");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        Toast.error("User not found. Please check your email address.");
      } else {
        Toast.error(
          "Error sending password reset email. Please try again later."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground resizeMode="cover" style={styles.imageBackground}>
        <Image style={styles.logo} source={Logo} />
        <Text style={styles.title}>RideMoto</Text>
        <Text style={styles.subTitle}>Welcome back Driver!</Text>
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <PasswordInput
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={forgetPassword}
            style={styles.forgetPassword}
          >
            <Text style={styles.link}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        <Button onPress={handleLogin} text="Login" loading={loading} />
        <View style={styles.registerContainer}>
          <Text>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.push("Register")}>
            <Text style={styles.link}>Register</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.registerContainer}>
          <Text style={{ color: "gray" }}>To check for Fare Matrix</Text>
          <TouchableOpacity onPress={() => navigation.push("FareMatrix")}>
            <Text style={styles.link}>Click here!</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",

  },
  imageBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 300,
    height: 300,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0066cc",
    alignSelf: "flex-start",
  },
  subTitle: {
    fontSize: 22,
    fontWeight: "semibold",
    alignSelf: "flex-start",
    color: "gray",
  },
  form: {
    width: "100%",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 12,
    marginVertical: 10,
    padding: 10,
  },
  forgetPassword: {
    alignSelf: "flex-end",
  },
  registerContainer: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  link: {
    color: "#0066cc",
    fontWeight: "bold",
    marginLeft: 5,
  },
});
