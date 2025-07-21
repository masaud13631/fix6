import React from 'react';
import { 
  LayoutDashboard, 
  Monitor, 
  Smartphone, 
  Car, 
  FileText, 
  Users, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeSection, onSectionChange }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'داشبورد', icon: LayoutDashboard, permission: 'dashboard' },
    { id: 'office-equipment', label: 'تعمیر لوازم اداری', icon: Monitor, permission: 'officeEquipment' },
    { id: 'electronic-equipment', label: 'تعمیر لوازم الکترونیکی', icon: Smartphone, permission: 'electronicEquipment' },
    { id: 'vehicles', label: 'تعمیر خودرو', icon: Car, permission: 'vehicles' },
    { id: 'reports', label: 'گزارشات', icon: FileText, permission: 'reports' },
    { id: 'user-management', label: 'مدیریت کاربران', icon: Users, permission: 'userManagement' },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    user?.permissions[item.permission as keyof typeof user.permissions]
  );

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">سیستم تعمیر و نگهداری</h1>
          <p className="text-sm text-gray-600 mt-1">{user?.name}</p>
        </div>
        
        <nav className="mt-6">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center px-6 py-3 text-right transition-colors ${
                  activeSection === item.id
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="ml-3 h-5 w-5" />
                {item.label}
              </button>
            );
          })}
          
          <button
            onClick={logout}
            className="w-full flex items-center px-6 py-3 text-right text-red-600 hover:bg-red-50 transition-colors mt-4 border-t border-gray-200"
          >
            <LogOut className="ml-3 h-5 w-5" />
            خروج از سیستم
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;