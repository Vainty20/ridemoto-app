import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  TouchableOpacity,
  Modal,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import getUserBookings from "../hooks/getUserBookings";
import Loading from "../components/Loading";
import { BarChart } from "react-native-chart-kit";
import QrCode from "../../assets/gcash.png";
import DatePicker from "@react-native-community/datetimepicker";

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function IncomeScreen() {
  const { userBookings, loading } = getUserBookings();
  const [monthlyIncome, setMonthlyIncome] = useState([]);
  const [dailyIncome, setDailyIncome] = useState([]);
  const [filteredDailyIncome, setFilteredDailyIncome] = useState([]);
  const windowWidth = useWindowDimensions().width;
  const [totalAppIncome, setTotalAppIncome] = useState(0);
  const [totalDriverIncome, setTotalDriverIncome] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handlePayNow = () => {
    setModalVisible(true);
  };

  useEffect(() => {
    const incomeData = {};

    userBookings.forEach((booking) => {
      const date = new Date(booking.timestamp);
      const dayKey = `${date.getDate()} ${
        monthNames[date.getMonth()]
      } ${date.getFullYear()}`;
      const ridePriceInt = parseInt(
        booking.ridePrice.replace("₱", "").trim(),
        10
      );

      if (incomeData[dayKey]) {
        incomeData[dayKey] += ridePriceInt;
      } else {
        incomeData[dayKey] = ridePriceInt;
      }
    });

    const chartData = [];
    Object.keys(incomeData).forEach((key) => {
      chartData.push({ day: key, income: incomeData[key] });
    });

    setDailyIncome(chartData);
    setFilteredDailyIncome(chartData); // Initially set filtered daily income to all daily income
    let totalIncome = 0;
    chartData.forEach((item) => {
      totalIncome += item.income;
    });
    const appIncome = totalIncome * 0.4;
    const driverIncome = totalIncome * 0.6;
    setTotalAppIncome(appIncome);
    setTotalDriverIncome(driverIncome);
  }, [userBookings]);

  useEffect(() => {
    const incomeData = {};
    monthNames.forEach((month, index) => {
      incomeData[`${index}`] = 0;
    });

    userBookings.forEach((booking) => {
      const monthIndex = new Date(booking.timestamp).getMonth();
      const ridePriceInt = parseInt(
        booking.ridePrice.replace("₱", "").trim(),
        10
      );
      incomeData[`${monthIndex}`] += ridePriceInt;
    });

    const chartData = [];
    Object.keys(incomeData).forEach((key) => {
      chartData.push({
        month: monthNames[parseInt(key)],
        income: incomeData[key],
      });
    });

    setMonthlyIncome(chartData);
  }, [userBookings]);

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>{item.day}</Text>
      <Text style={styles.itemText}>₱{item.income}</Text>
    </View>
  );

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
      const formattedDate = `${selectedDate.getDate()} ${
        monthNames[selectedDate.getMonth()]
      } ${selectedDate.getFullYear()}`;
      const filteredData = dailyIncome.filter((item) => item.day === formattedDate);
      setFilteredDailyIncome(filteredData);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.chartContainer}>
        {loading ? (
          <Loading />
        ) : monthlyIncome.length > 0 ? (
          <BarChart
            data={{
              labels: monthNames,
              datasets: [{ data: monthlyIncome.map((data) => data.income) }],
            }}
            width={windowWidth}
            height={300}
            yAxisLabel="₱"
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 102, 204, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 102, 204, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            style={styles.chart}
          />
        ) : (
          <Text style={styles.noDataText}>No booking data available.</Text>
        )}
      </View>
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Daily Income</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.filterButtonText}>Filter by Date</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DatePicker
            testID="datePicker"
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
        {filteredDailyIncome.length > 0 ? (
          <FlatList
            data={filteredDailyIncome}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
          />
        ) : (
          <Text style={styles.noDataText}>No booking data available for the selected date.</Text>
        )}
      </View>
      <Text>Total App: ₱{Math.round(totalAppIncome)}</Text>
      <Text>Total Driver's Income: ₱{Math.round(totalDriverIncome)}</Text>
      <TouchableOpacity style={styles.button} onPress={handlePayNow}>
        <Text style={styles.buttonText}>Pay now!</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Image source={QrCode} style={styles.modalImage} />
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  chartContainer: {
    marginBottom: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  listContainer: {
    flex: 1,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  itemText: {
    fontSize: 16,
  },
  noDataText: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 16,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#0066cc",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    width: "100%",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 15,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalImage: {
    width: 200,
    height: 300,
    resizeMode: "cover",
    marginBottom: 20,
  },
  modalCloseText: {
    color: "#0066cc",
    fontSize: 16,
  },
});
