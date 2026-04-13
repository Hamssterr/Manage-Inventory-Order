import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { Toaster } from "sonner";

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="app-provider-wrapper">{children}</div>;
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
};
