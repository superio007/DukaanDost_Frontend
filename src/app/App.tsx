import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
const HomePage = lazy(() => import("../pages/site/HomePage"));
const NotFound = lazy(() => import("../pages/site/NotFound"));
const SignPage = lazy(() => import("../pages/auth/SigninPage"));
const RegisterPage = lazy(() => import("../pages/auth/SignupPage"));
const Inventory = lazy(() => import("../pages/site/Inventory"));
const Settings = lazy(() => import("../pages/site/Settings"));
const SampleRequest = lazy(() => import("../pages/site/SampleRequest"));
import MainLayout from "../layouts/SiteLayout";
import AuthLayout from "../layouts/AuthLayout";
import FallbackLoader from "../components/ui/FallbackLoader.tsx";

function App() {
  return (
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
  );
}

export default App;
