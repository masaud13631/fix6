import React, { useState, useEffect } from 'react';
import { AuthContext, useAuthProvider } from './hooks/useAuth';
import { initializeDatabase } from './utils/database';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import OfficeEquipment from './components/OfficeEquipment';
import ElectronicEquipment from './components/ElectronicEquipment';
import Vehicles from './components/Vehicles';
import Reports from './components/Reports';
import UserManagement from './components/UserManagement';

function App() {
  const auth = useAuthProvider();
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    initializeDatabase();
  }, []);

  const renderActiveSection = () => {
    if (!auth.user) return null;

    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'office-equipment':
        return auth.user.permissions.officeEquipment ? <OfficeEquipment /> : <div className="p-6 text-center text-gray-500">شما دسترسی به این بخش را ندارید</div>;
      case 'electronic-equipment':
        return auth.user.permissions.electronicEquipment ? <ElectronicEquipment /> : <div className="p-6 text-center text-gray-500">شما دسترسی به این بخش را ندارید</div>;
      case 'vehicles':
        return auth.user.permissions.vehicles ? <Vehicles /> : <div className="p-6 text-center text-gray-500">شما دسترسی به این بخش را ندارید</div>;
      case 'reports':
        return auth.user.permissions.reports ? <Reports /> : <div className="p-6 text-center text-gray-500">شما دسترسی به این بخش را ندارید</div>;
      case 'user-management':
        return auth.user.permissions.userManagement ? <UserManagement /> : <div className="p-6 text-center text-gray-500">شما دسترسی به این بخش را ندارید</div>;
      default:
        return <Dashboard />;
    }
  };

  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={auth}>
      <div className="App">
        {auth.user ? (
          <Layout activeSection={activeSection} onSectionChange={setActiveSection}>
            {renderActiveSection()}
          </Layout>
        ) : (
          <Login />
        )}
      </div>
    </AuthContext.Provider>
  );
}

export default App;