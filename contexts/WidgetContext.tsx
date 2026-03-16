import * as React from "react";
import { createContext, useCallback, useContext } from "react";
import { Platform } from "react-native";

type WidgetContextType = {
  refreshWidget: () => void;
};

const WidgetContext = createContext<WidgetContextType | null>(null);

export function WidgetProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    if (Platform.OS !== "ios") return;
    // Dynamically import the iOS-only module to avoid crashing on web/Android
    import("@bacons/apple-targets").then(({ ExtensionStorage }) => {
      ExtensionStorage.reloadWidget();
    }).catch(() => {/* ignore if not available */});
  }, []);

  const refreshWidget = useCallback(() => {
    if (Platform.OS !== "ios") return;
    import("@bacons/apple-targets").then(({ ExtensionStorage }) => {
      ExtensionStorage.reloadWidget();
    }).catch(() => {/* ignore if not available */});
  }, []);

  return (
    <WidgetContext.Provider value={{ refreshWidget }}>
      {children}
    </WidgetContext.Provider>
  );
}

export const useWidget = () => {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error("useWidget must be used within a WidgetProvider");
  }
  return context;
};
