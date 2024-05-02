import { useState } from 'react';
import { auth } from '../../firebase';
import { Toast } from 'toastify-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function ChangePasswordScreen() {
  const [loading, setLoading] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const handleChangePassword = async () => {
    if (loading) return;

    setLoading(true);
    try {
      if (!auth.currentUser) {
        return;
      }

      const credential = EmailAuthProvider.credential(auth.currentUser.email, oldPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      if (newPassword !== confirmNewPassword) {
        setLoading(false);
        return Toast.error("Passwords do not match");
      }

      await updatePassword(auth.currentUser, newPassword);

      Toast.success("You have successfully changed your password");
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      if (error.code === 'auth/invalid-credential') {
        return Toast.error('Invalid credentials. Please enter your current password.');
      }
      return Toast.error('Error updating password!');
    } finally {
      setLoading(false);
    }
  };

  const toggleShowOldPassword = () => setShowOldPassword(!showOldPassword);
  const toggleShowNewPassword = () => setShowNewPassword(!showNewPassword);
  const toggleShowConfirmNewPassword = () => setShowConfirmNewPassword(!showConfirmNewPassword);

  return (
    <SafeAreaView style={styles.container}>
        <Text>Old Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Old Password"
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry={!showOldPassword}
          />
          <TouchableOpacity onPress={toggleShowOldPassword}>
            <Icon name={showOldPassword ? 'eye-slash' : 'eye'} size={20} color="gray" />
          </TouchableOpacity>
        </View>
        <Text>New Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
          />
          <TouchableOpacity onPress={toggleShowNewPassword}>
            <Icon name={showNewPassword ? 'eye-slash' : 'eye'} size={20} color="gray" />
          </TouchableOpacity>
        </View>
        <Text>Confirm New Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password must match"
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
            secureTextEntry={!showConfirmNewPassword}
          />
          <TouchableOpacity onPress={toggleShowConfirmNewPassword}>
            <Icon name={showConfirmNewPassword ? 'eye-slash' : 'eye'} size={20} color="gray" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleChangePassword} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? <ActivityIndicator size={25} color="white"/> : 'Change Password'}</Text>
        </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20
  },
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor:'#fff',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  passwordInput: {
    flex: 1,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#0066cc',
    padding: 15,
    marginVertical: 20,
    borderRadius: 12,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold'
  },
});

