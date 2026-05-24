import "react-native-gesture-handler";

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { QuotesProvider } from "./src/contexts/QuotesContext";
import { RootStackParamList } from "./src/types";
import { ListingScreen } from "./src/screens/ListingScreen";
import { CreateEditScreen } from "./src/screens/CreateEditScreen";
import { DetailScreen } from "./src/screens/DetailScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <QuotesProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right",
            }}
          >
            <Stack.Screen name="Listing" component={ListingScreen} />
            <Stack.Screen name="CreateEdit" component={CreateEditScreen} />
            <Stack.Screen name="Detail" component={DetailScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </QuotesProvider>
    </SafeAreaProvider>
  );
}
