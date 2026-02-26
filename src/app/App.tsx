import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
const HomePage = lazy(() => import("../pages/site/HomePage"));
const NotFound = lazy(() => import("../pages/site/NotFound"));
const SignPage = lazy(() => import("../pages/auth/SigninPage"));
const RegisterPage = lazy(() => import("../pages/auth/SignupPage"));
const Inventory = lazy(() => import("../pages/site/Inventory"));
const Settings = lazy(() => import("../pages/site/Settings"));
const SampleRequest = lazy(() => import("../pages/site/SampleRequest"));
import Buyer from "../pages/site/Buyers";
import MainLayout from "../layouts/SiteLayout";
import AuthLayout from "../layouts/AuthLayout";
import FallbackLoader from "../components/ui/FallbackLoader.tsx";
import { Toaster } from "react-hot-toast";
function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#0f172a",
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <Routes>
        <Route path="/auth" element={<AuthLayout />}>
          <Route
            path="/auth/signin"
            element={
              <Suspense fallback={<FallbackLoader />}>
                <SignPage />
              </Suspense>
            }
          />
          <Route
            path="/auth/signup"
            element={
              <Suspense fallback={<FallbackLoader />}>
                <RegisterPage />
              </Suspense>
            }
          />
        </Route>
        <Route path="/" element={<MainLayout />}>
          <Route
            path="/"
            element={
              <Suspense fallback={<FallbackLoader />}>
                <HomePage />
              </Suspense>
            }
          />
          <Route
            path="/sample-requests"
            element={
              <Suspense fallback={<FallbackLoader />}>
                <SampleRequest />
              </Suspense>
            }
          />
          <Route
            path="/Inventory"
            element={
              <Suspense fallback={<FallbackLoader />}>
                <Inventory />
              </Suspense>
            }
          />
          <Route
            path="/buyers"
            element={
              <Suspense fallback={<FallbackLoader />}>
                <Buyer />
              </Suspense>
            }
          />
          <Route
            path="/settings"
            element={
              <Suspense fallback={<FallbackLoader />}>
                <Settings />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <Suspense fallback={<FallbackLoader />}>
                <NotFound />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
