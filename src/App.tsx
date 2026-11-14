import { Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AboutPage } from "@/pages/AboutPage";
import { AccountPage } from "@/pages/AccountPage";
import { AuthPage } from "@/pages/AuthPage";
import { BookingPage } from "@/pages/BookingPage";
import { CompaniesPage } from "@/pages/CompaniesPage";
import { HomePage } from "@/pages/HomePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ResultsPage } from "@/pages/ResultsPage";
import { SuccessPage } from "@/pages/SuccessPage";
import { SupportPage } from "@/pages/SupportPage";
import { TrackingPage } from "@/pages/TrackingPage";
import { TripsPage } from "@/pages/TripsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="companies" element={<CompaniesPage />} />
        <Route path="booking/:tripId" element={<BookingPage />} />
        <Route path="trips" element={<TripsPage />} />
        <Route path="tracking" element={<TrackingPage />} />
        <Route path="tracking/:bookingId" element={<TrackingPage />} />
        <Route path="success/:bookingId" element={<SuccessPage />} />
        <Route path="login" element={<AuthPage mode="login" />} />
        <Route path="register" element={<AuthPage mode="register" />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
