import { useCallback } from "react";
import { View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useFonts as useInter, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { useFonts as useRobotoSlab, RobotoSlab_600SemiBold } from "@expo-google-fonts/roboto-slab";
import { useFonts as usePlexMono, IBMPlexMono_500Medium } from "@expo-google-fonts/ibm-plex-mono";
import { StatusBar } from "expo-status-bar";

import { AuthProvider } from "./src/context/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [interLoaded] = useInter({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold });
  const [robotoSlabLoaded] = useRobotoSlab({ RobotoSlab_600SemiBold });
  const [plexMonoLoaded] = usePlexMono({ IBMPlexMono_500Medium });

  const fontsReady = interLoaded && robotoSlabLoaded && plexMonoLoaded;

  const onLayout = useCallback(async () => {
    if (fontsReady) await SplashScreen.hideAsync();
  }, [fontsReady]);

  if (!fontsReady) return null;

  return (
    <View style={{ flex: 1 }} onLayout={onLayout}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
      <StatusBar style="dark" />
    </View>
  );
}
