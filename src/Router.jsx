import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import POSPage from './pages/POSPage';
import InventoryPage from './pages/InventoryPage';
import ProductsPage from './pages/ProductsPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import TransfersPage from './pages/TransfersPage';
import TransferDetailsPage from './pages/TransferDetailsPage';
import PurchasesPage from './pages/PurchasesPage';
import SettingsPage from './pages/SettingsPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import ReceiptPage from './pages/ReceiptPage';

import ClientsPage from './pages/ClientsPage';
import ExpensesPage from './pages/ExpensesPage';
import AddStoreForm from './features/admin/AddStoreForm';
import PasswordResetHandler from './features/auth/PasswordResetHandler';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<PasswordResetHandler />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/receipt" element={<ReceiptPage />} />

        <Route path="/pos/:storeId" element={
          <ProtectedRoute roles={['cajera', 'gerente', 'admin', 'dev']}>
            <Layout activeModule="pos">
              <POSPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/reports" element={
          <ProtectedRoute roles={['gerente', 'admin', 'dev']}>
            <Layout activeModule="reports">
              <ReportsPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/transfers" element={
          <ProtectedRoute roles={['gerente', 'admin', 'dev']}>
            <Layout activeModule="transfers">
              <TransfersPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/transfers/:id" element={
          <ProtectedRoute roles={['gerente', 'admin', 'dev']}>
            <Layout activeModule="transfers">
              <TransferDetailsPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/expenses" element={
          <ProtectedRoute roles={['gerente', 'admin', 'dev']}>
            <Layout activeModule="expenses">
              <ExpensesPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/users" element={
          <ProtectedRoute roles={['admin', 'dev']}>
            <Layout activeModule="users">
              <UsersPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/clients" element={
          <ProtectedRoute roles={['gerente', 'admin', 'dev']}>
            <Layout activeModule="clients">
              <ClientsPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute roles={['admin', 'gerente', 'dev']}>
            <Layout activeModule="settings">
              <SettingsPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/inventory" element={
          <ProtectedRoute roles={['gerente', 'admin', 'dev']}>
            <Layout activeModule="inventory">
              <InventoryPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/products" element={
          <ProtectedRoute roles={['gerente', 'admin', 'dev']}>
            <Layout activeModule="products">
              <ProductsPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin', 'gerente', 'dev']}>
            <Layout>
              <AdminDashboardPage />
            </Layout>
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="pos" />} />
          <Route path="pos" element={
            <ProtectedRoute roles={['admin', 'gerente', 'dev']}>
              <Layout activeModule="pos">
                <POSPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="products" element={
            <ProtectedRoute roles={['admin', 'gerente', 'dev']}>
              <Layout activeModule="products">
                <ProductsPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="inventory" element={
            <ProtectedRoute roles={['admin', 'gerente', 'dev']}>
              <Layout activeModule="inventory">
                <InventoryPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="reports" element={
            <ProtectedRoute roles={['admin', 'gerente', 'dev']}>
              <Layout activeModule="reports">
                <ReportsPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="users" element={
            <ProtectedRoute roles={['admin', 'gerente', 'dev']}>
              <Layout activeModule="users">
                <UsersPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="transfers" element={
            <ProtectedRoute roles={['admin', 'gerente', 'dev']}>
              <Layout activeModule="transfers">
                <TransfersPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="expenses" element={
            <ProtectedRoute roles={['admin', 'gerente', 'dev']}>
              <Layout activeModule="expenses">
                <ExpensesPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="settings" element={
            <ProtectedRoute roles={['admin', 'gerente', 'dev']}>
              <Layout activeModule="settings">
                <SettingsPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="clients" element={
            <ProtectedRoute roles={['admin', 'gerente', 'dev']}>
              <Layout activeModule="clients">
                <ClientsPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="add-store" element={
            <ProtectedRoute roles={['admin', 'dev']}>
              <Layout activeModule="settings">
                <AddStoreForm />
              </Layout>
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;