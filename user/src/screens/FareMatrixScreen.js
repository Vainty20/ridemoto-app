import { View, Text, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Logo from "../../assets/ridemoto-logo.png";

export default function FareMatrixScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Image style={styles.logo} source={Logo} />

      <View style={styles.table}>
        <View style={styles.row}>
          <Text style={styles.cellHeader}>Distance (km)</Text>
          <Text style={styles.cellHeader}>Amount</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cell}>In first 3 km</Text>
          <Text style={styles.cell}>Minimum Fare: ₱50</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cell}>Succeeding km</Text>
          <Text style={styles.cell}>Additional Fare: ₱20</Text>
        </View>
      </View>
      <Text style={styles.title}>Example Breakdown of Fare:</Text>
      <View style={styles.table}>
        <View style={styles.row}>
          <Text style={styles.cellHeader}>Ride Distance:</Text>
          <Text style={styles.cell}>15km</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellHeader}>3 km Minimum Fare:</Text>
          <Text style={styles.cell}>₱50</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellHeader}>12 km Fare/km:</Text>
          <Text style={styles.cell}>₱240</Text>
        </View>
        <Text style={{alignSelf: 'flex-end', margin: 12}}>
          Total of {""}
          <Text style={{ fontWeight: "bold", fontSize: 18 }}>
            ₱290
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  logo: {
    width: 300,
    height: 300,
  },
  title: {
    marginTop: 20,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },
  table: {
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  cellHeader: {
    flex: 1,
    padding: 10,
    backgroundColor: "#0066cc",
    color: '#fff',
    fontWeight: "bold",
  },
  cell: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
});
