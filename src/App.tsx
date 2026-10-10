import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { WorkspaceShell } from './components/shell/WorkspaceShell';
import { LandingPage } from './pages/LandingPage';
import { HomePage } from './pages/app/HomePage';
import { IntakePage } from './pages/app/IntakePage';
import { CustomersPage } from './pages/app/CustomersPage';
import { CustomerViewPage } from './pages/app/CustomerViewPage';
import { SearchPage } from './pages/app/SearchPage';
import { QuoteBuilderPage } from './pages/app/QuoteBuilderPage';
import { CustomerQuoteViewPage } from './pages/app/CustomerQuoteViewPage';
import { OrderBookPage } from './pages/app/OrderBookPage';
import { CreateOrderPage } from './pages/app/CreateOrderPage';
import { AcrylicPage } from './pages/app/AcrylicPage';
import { AuditPage } from './pages/app/AuditPage';

export function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Layer */}
          <Route path="/" element={<LandingPage />} />

          {/* Customer-Facing Quote View Overlay */}
          <Route path="/customer-view/:ref" element={<CustomerQuoteViewPage />} />

          {/* Workspace Shell Layer (/app) */}
          <Route path="/app" element={<WorkspaceShell />}>
            <Route index element={<HomePage />} />
            <Route path="intake" element={<IntakePage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="customers/:id" element={<CustomerViewPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="quotes/:ref" element={<QuoteBuilderPage />} />
            <Route path="orders" element={<OrderBookPage />} />
            <Route path="orders/new/:quoteRef" element={<CreateOrderPage />} />
            <Route path="acrylic" element={<AcrylicPage />} />
            <Route path="audit" element={<AuditPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
