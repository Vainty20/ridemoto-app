import { Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function AccountSettingsList({ options, navigation }) {
  const renderOption = ({ item }) => (
    <TouchableOpacity style={styles.optionButton} onPress={item.onPress}>
      <Ionicons name={item.icon} color="#333" size={18} />
      <Text style={styles.optionText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={options}
      renderItem={renderOption}
      keyExtractor={(item, index) => index.toString()}
      width="100%"
    />
  );
}

const styles = StyleSheet.create({

  optionButton: {
    backgroundColor: '#fff',
    width: "100%",
    paddingHorizontal: 12,
    paddingVertical: 15,
    borderRadius: 5,
    marginVertical: 5,
    flexDirection: "row",
    justifyContent: 'flex-start',
    alignItems: "center",
  },
  optionText: {
    fontSize: 18,
    color: '#333',
    marginLeft: 10,
  },
});
