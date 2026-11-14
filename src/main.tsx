import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import "@/styles/sairna.css";
import "@/styles/app.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000,
    },
  },
});

const container = document.getElementById("root");

if (!container) {
  throw new Error("تعذّر إيجاد عنصر #root في الصفحة.");
}

createRoot(container).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          {/* تفعيل سلوك React Router v7 مبكرًا لإسكات تحذيرات الترقية */}
          <BrowserRouter
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
