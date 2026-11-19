import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import LogoutButton from './components/LogoutButton';
import ItemForm from './components/ItemForm';
import ItemList from './components/ItemList';
import InvoiceForm from './components/InvoiceForm';
import InvoiceDashboard from './components/InvoiceDashboard';
import QuotationForm from './components/QuotationForm';
import QuotationDashboard from './components/QuotationDashboard';
import './App.css';

// Main application content component (protected routes)
function MainApp() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const handleItemAdded = () => {
    // Trigger refresh of item list
    setRefreshTrigger(prev => prev + 1);
  };

  // Determine current page from route
  const getCurrentPage = () => {
    if (location.pathname === '/invoice') return 'invoice';
    if (location.pathname === '/dashboard') return 'dashboard';
    if (location.pathname === '/quotation') return 'quotation';
    if (location.pathname === '/quotation-dashboard') return 'quotation-dashboard';
    return 'items';
  };

  const currentPage = getCurrentPage();

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="header-top">
            <div>
              <h1>M MARINE SERVICES</h1>
              <p>Marine Engineering Solutions & IT Services</p>
            </div>
            <LogoutButton />
          </div>
          
          <nav className="nav-tabs">
            <button 
              className={`nav-tab ${currentPage === 'items' ? 'active' : ''}`}
              onClick={() => navigate('/')}
            >
              Items
            </button>
            <button 
              className={`nav-tab ${currentPage === 'invoice' ? 'active' : ''}`}
              onClick={() => navigate('/invoice')}
            >
              Create Invoice
            </button>
            <button 
              className={`nav-tab ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={() => navigate('/dashboard')}
            >
              Invoice Dashboard
            </button>
            <button 
              className={`nav-tab ${currentPage === 'quotation' ? 'active' : ''}`}
              onClick={() => navigate('/quotation')}
            >
              Create Quotation
            </button>
            <button 
              className={`nav-tab ${currentPage === 'quotation-dashboard' ? 'active' : ''}`}
              onClick={() => navigate('/quotation-dashboard')}
            >
              Quotation Dashboard
            </button>
          </nav>
        </div>
      </header>
      
      <main className="app-main">
        <div className="container">
          <Routes>
            <Route path="/" element={
              <>
                <ItemForm onItemAdded={handleItemAdded} />
                <ItemList refreshTrigger={refreshTrigger} />
              </>
            } />
            <Route path="/invoice" element={<InvoiceForm />} />
            <Route path="/dashboard" element={<InvoiceDashboard />} />
            <Route path="/quotation" element={<QuotationForm />} />
            <Route path="/quotation-dashboard" element={<QuotationDashboard />} />
          </Routes>
        </div>
      </main>

      <footer className="app-footer">
        <p>Built with MERN Stack 🚀</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
