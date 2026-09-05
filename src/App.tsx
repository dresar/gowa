import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LoginModal } from "./components/LoginModal";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import DevicesPage from "./pages/DevicesPage";
import MessagesPage from "./pages/MessagesPage";
import BroadcastPage from "./pages/BroadcastPage";
import ChatsPage from "./pages/ChatsPage";
import GroupsPage from "./pages/GroupsPage";
import ContactsPage from "./pages/ContactsPage";
import AutoReplyPage from "./pages/AutoReplyPage";
import NewsletterPage from "./pages/NewsletterPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginModal open={true} />;
  }

  return (
    <ErrorBoundary>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/broadcast" element={<BroadcastPage />} />
          <Route path="/chats" element={<ChatsPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/auto-reply" element={<AutoReplyPage />} />
          <Route path="/newsletter" element={<NewsletterPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </DashboardLayout>
    </ErrorBoundary>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
