import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ProjectProvider } from "@/hooks/useProjectStore";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="project/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="task" options={{ headerShown: false }} />
      <Stack.Screen
        name="create-project"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen
        name="create-task"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}

const rootStyles = StyleSheet.create({
  container: { flex: 1 },
});

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ProjectProvider>
        <GestureHandlerRootView style={rootStyles.container}>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </ProjectProvider>
    </QueryClientProvider>
  );
}
