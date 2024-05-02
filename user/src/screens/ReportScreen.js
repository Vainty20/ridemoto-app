import { Toast } from "toastify-react-native";
import { useState } from "react";
import { auth, db } from "../../firebase";
import { doc, setDoc, collection } from "firebase/firestore";

import { View, TextInput, StyleSheet } from "react-native";
import Button from "../components/Button";
import getUserData from "../hooks/getUserData";
import Loading from "../components/Loading";

export default function ReportScreen() {
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const { userData, loading: userDataLoading } = getUserData();

  if (userDataLoading) return <Loading />;
  const handleReport = async () => {
    if (loading) return;

    const { name, category, description } = form;

    setLoading(true);

    try {
      const userForm = {
        name: name,
        category: category,
        description: description,
        reportedBy: userData.firstName + " " + userData.lastName,
        reportId: auth.currentUser.uid,
      };

      const reportsCollectionRef = collection(db, "reports");

      await setDoc(doc(reportsCollectionRef), userForm);

      Toast.success("You have successfully reported it");
      setForm({
        name: "",
        category: "",
        description: "",
      });
    } catch (error) {
      Toast.error(error.message || "An error occurred while reporting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Name of driver that you want to report"
        value={form.name}
        onChangeText={(text) => setForm({ ...form, name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Category"
        value={form.category}
        onChangeText={(text) => setForm({ ...form, category: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={form.description}
        onChangeText={(text) => setForm({ ...form, description: text })}
      />

      <Button onPress={handleReport} text="Report" loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderColor: "gray",
    borderWidth: 1,
    justifyContent: "center",
    borderRadius: 12,
    marginVertical: 10,
    padding: 10,
  },
});
