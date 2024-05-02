import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function Loading() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={80} color="#0066cc" />
    </View>  
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
});

