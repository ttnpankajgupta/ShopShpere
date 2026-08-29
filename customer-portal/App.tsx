import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { AuthProvider, useAuth } from './src/features/auth/AuthContext';
import { AuthNavigator } from './src/features/auth/navigation/AuthNavigator';
import { RootStackParamList } from './src/features/auth/navigation/types';
import { SessionRestorationScreen } from './src/features/auth/screens/SessionRestorationScreen';
import { HomeScreen } from './src/screens/HomeScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <View style={styles.screen}>
        <SessionRestorationScreen />
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false, contentStyle: styles.screen }}>
      {status === 'authenticated' ? (
        <RootStack.Screen name="App" component={HomeScreen} />
      ) : (
        <RootStack.Screen name="Auth">
          {() => (
            <AuthNavigator
              initialRoute={status === 'session_expired' ? 'SessionExpired' : 'Launch'}
            />
          )}
        </RootStack.Screen>
      )}
    </RootStack.Navigator>
  );
}

export default function App() {
  return (
    <View style={styles.appRoot}>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <View style={styles.navRoot}>
            <RootNavigator />
          </View>
        </NavigationContainer>
      </AuthProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  appRoot: { flex: 1 },
  navRoot: { flex: 1 },
  screen: { flex: 1 },
});
