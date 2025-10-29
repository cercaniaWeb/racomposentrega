import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Zap,
  Package,
  BarChart3,
  Users as UsersIcon,
  UserCircle,
  LogOut,
  ArrowRightLeft,
  ShoppingCart,
  Menu,
  Settings,
  ListTodo,
} from 'lucide-react';
import useAppStore from '../store/useAppStore';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import AlertsBell from '../features/alerts/AlertsBell';
import ShoppingListModal from '../features/purchases/ShoppingListModal';

import logo from '../utils/logo.png';

const AdminDashboardPage = () => {
  const { handleLogout, currentUser, darkMode } = useAppStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isShoppingListModalOpen, setIsShoppingListModalOpen] = useState(false);
  const location = useLocation();
  const activeTab = location.pathname.split('/').pop();

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'bg-[#0f0f0f]' : 'bg-gray-100'} font-sans`}>
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button onClick={() => setIsSidebarOpen(!isSidebarOpen)} variant="outline" className="p-2 rounded-md shadow">
          <Menu size={24} />
        </Button>
      </div>

      {/* Top Navigation Bar */}
      <nav className={`w-full ${darkMode ? 'bg-[#202020]' : 'bg-white'} shadow-lg flex items-center py-3 px-4 z-40
                      fixed top-0 left-0 right-0
                      transform transition-transform duration-200 ease-in-out
                      ${isSidebarOpen ? 'h-auto' : 'h-auto'}`}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="RACOM POS Logo" className="w-10 h-10 object-contain" />
            <Button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              variant="outline" 
              className="p-2 rounded-lg lg:hidden"
            >
              <Menu size={18} />
            </Button>
          </div>
          
          {/* Navigation Links - Now horizontal with icons only on all screens */}
          <div className="hidden lg:flex items-center space-x-1 mx-4">
            <Link to="pos" className={`p-2.5 rounded-lg flex items-center ${activeTab === 'pos' ? (darkMode ? 'bg-[#7c4dff] text-white shadow-md' : 'bg-blue-500 text-white shadow-md') : (darkMode ? 'text-[#a0a0a0] hover:bg-[#404040]' : 'text-gray-500 hover:bg-gray-200')} transition-all duration-200`}>
              <Zap size={18} />
            </Link>
            <Link to="inventory" className={`p-2.5 rounded-lg flex items-center ${activeTab === 'inventory' ? (darkMode ? 'bg-[#7c4dff] text-white shadow-md' : 'bg-blue-500 text-white shadow-md') : (darkMode ? 'text-[#a0a0a0] hover:bg-[#404040]' : 'text-gray-500 hover:bg-gray-200')} transition-all duration-200`}>
              <Package size={18} />
            </Link>
            <Link to="reports" className={`p-2.5 rounded-lg flex items-center ${activeTab === 'reports' ? (darkMode ? 'bg-[#7c4dff] text-white shadow-md' : 'bg-blue-500 text-white shadow-md') : (darkMode ? 'text-[#a0a0a0] hover:bg-[#404040]' : 'text-gray-500 hover:bg-gray-200')} transition-all duration-200`}>
              <BarChart3 size={18} />
            </Link>
            <Link to="users" className={`p-2.5 rounded-lg flex items-center ${activeTab === 'users' ? (darkMode ? 'bg-[#7c4dff] text-white shadow-md' : 'bg-blue-500 text-white shadow-md') : (darkMode ? 'text-[#a0a0a0] hover:bg-[#404040]' : 'text-gray-500 hover:bg-gray-200')} transition-all duration-200`}>
              <UsersIcon size={18} />
            </Link>
            <Link to="clients" className={`p-2.5 rounded-lg flex items-center ${activeTab === 'clients' ? (darkMode ? 'bg-[#7c4dff] text-white shadow-md' : 'bg-blue-500 text-white shadow-md') : (darkMode ? 'text-[#a0a0a0] hover:bg-[#404040]' : 'text-gray-500 hover:bg-gray-200')} transition-all duration-200`}>
              <UsersIcon size={18} />
            </Link>
            <Link to="transfers" className={`p-2.5 rounded-lg flex items-center ${activeTab === 'transfers' ? (darkMode ? 'bg-[#7c4dff] text-white shadow-md' : 'bg-blue-500 text-white shadow-md') : (darkMode ? 'text-[#a0a0a0] hover:bg-[#404040]' : 'text-gray-500 hover:bg-gray-200')} transition-all duration-200`}>
              <ArrowRightLeft size={18} />
            </Link>
            <Link to="purchases" className={`p-2.5 rounded-lg flex items-center ${activeTab === 'purchases' ? (darkMode ? 'bg-[#7c4dff] text-white shadow-md' : 'bg-blue-500 text-white shadow-md') : (darkMode ? 'text-[#a0a0a0] hover:bg-[#404040]' : 'text-gray-500 hover:bg-gray-200')} transition-all duration-200`}>
              <ShoppingCart size={18} />
            </Link>
            {(currentUser.role === 'admin' || currentUser.role === 'gerente') && (
              <Link to="settings" className={`p-2.5 rounded-lg flex items-center ${activeTab === 'settings' ? (darkMode ? 'bg-[#7c4dff] text-white shadow-md' : 'bg-blue-500 text-white shadow-md') : (darkMode ? 'text-[#a0a0a0] hover:bg-[#404040]' : 'text-gray-500 hover:bg-gray-200')} transition-all duration-200`}>
                <Settings size={18} />
              </Link>
            )}
          </div>
          
          {/* User Actions */}
          <div className="flex items-center space-x-2">
            <AlertsBell />
            <Button onClick={() => setIsShoppingListModalOpen(true)} variant="outline" className="p-2 rounded-lg">
              <ListTodo size={18} />
            </Button>
            <div className="flex items-center space-x-1">
              <UserCircle size={20} className="text-[#a0a0a0]" />
              <span className="text-[#c0c0c0] text-sm hidden md:block">{currentUser?.name}</span>
            </div>
            <a href="#" onClick={handleLogout} className="p-2 rounded-lg text-[#a0a0a0] hover:bg-[#404040] transition-colors">
              <LogOut size={18} />
            </a>
            {/* Mobile menu button for navigation links */}
            <div className="lg:hidden ml-2">
              <Button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                variant="outline" 
                className="p-2 rounded-lg"
              >
                <Menu size={18} />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation Links */}
        {isSidebarOpen && (
          <div className="lg:hidden flex flex-wrap justify-center items-center gap-2 mt-3 pt-3 border-t border-[#333333]">
            <Link to="pos" className={`p-2 rounded-lg flex flex-col items-center ${activeTab === 'pos' ? (darkMode ? 'bg-[#7c4dff] text-white shadow-md' : 'bg-blue-500 text-white shadow-md') : (darkMode ? 'text-[#a0a0a0] hover:bg-[#404040]' : 'text-gray-500 hover:bg-gray-200')} transition-all duration-200 min-w-[60px]`} onClick={() => setIsSidebarOpen(false)}>
              <Zap size={18} />
              <span className="text-xs mt-1">POS</span>
            </Link>
            <Link to="inventory" className={`p-2 rounded-lg flex flex-col items-center ${activeTab === 'inventory' ? (darkMode ? 'bg-[#7c4dff] text-white shadow-md' : 'bg-blue-500 text-white shadow-md') : (darkMode ? 'text-[#a0a0a0] hover:bg-[#404040]' : 'text-gray-500 hover:bg-gray-200')} transition-all duration-200 min-w-[60px]`} onClick={() => setIsSidebarOpen(false)}>
              <Package size={18} />
              <span className="text-xs mt-1">Inv</span>
            </Link>
            <Link to="reports" className={`p-2 rounded-lg flex flex-col items-center ${activeTab === 'reports' ? (darkMode ? 'bg-[#7c4dff] text-white shadow-md' : 'bg-blue-500 text-white shadow-md') : (darkMode ? 'text-[#a0a0a0] hover:bg-[#404040]' : 'text-gray-500 hover:bg-gray-200')} transition-all duration-200 min-w-[60px]`} onClick={() => setIsSidebarOpen(false)}>
              <BarChart3 size={18} />
              <span className="text-xs mt-1">Rep</span>
            </Link>
            <Link to="users" className={`p-2 rounded-lg flex flex-col items-center ${activeTab === 'users' ? (darkMode ? 'bg-[#7c4dff] text-white shadow-md' : 'bg-blue-500 text-white shadow-md') : (darkMode ? 'text-[#a0a0a0] hover:bg-[#404040]' : 'text-gray-500 hover:bg-gray-200')} transition-all duration-200 min-w-[60px]`} onClick={() => setIsSidebarOpen(false)}>
              <UsersIcon size={18} />
              <span className="text-xs mt-1">Usu</span>
            </Link>
            <Link to="clients" className={`p-2 rounded-lg flex flex-col items-center ${activeTab === 'clients' ? (darkMode ? 'bg-[#7c4dff] text-white shadow-md' : 'bg-blue-500 text-white shadow-md') : (darkMode ? 'text-[#a0a0a0] hover:bg-[#404040]' : 'text-gray-500 hover:bg-gray-200')} transition-all duration-200 min-w-[60px]`} onClick={() => setIsSidebarOpen(false)}>
              <UsersIcon size={18} />
              <span className="text-xs mt-1">Cli</span>
            </Link>
            <Link to="transfers" className={`p-2 rounded-lg flex flex-col items-center ${activeTab === 'transfers' ? (darkMode ? 'bg-[#7c4dff] text-white shadow-md' : 'bg-blue-500 text-white shadow-md') : (darkMode ? 'text-[#a0a0a0] hover:bg-[#404040]' : 'text-gray-500 hover:bg-gray-200')} transition-all duration-200 min-w-[60px]`} onClick={() => setIsSidebarOpen(false)}>
              <ArrowRightLeft size={18} />
              <span className="text-xs mt-1">Trs</span>
            </Link>
            <Link to="purchases" className={`p-2 rounded-lg flex flex-col items-center ${activeTab === 'purchases' ? (darkMode ? 'bg-[#7c4dff] text-white shadow-md' : 'bg-blue-500 text-white shadow-md') : (darkMode ? 'text-[#a0a0a0] hover:bg-[#404040]' : 'text-gray-500 hover:bg-gray-200')} transition-all duration-200 min-w-[60px]`} onClick={() => setIsSidebarOpen(false)}>
              <ShoppingCart size={18} />
              <span className="text-xs mt-1">Com</span>
            </Link>
            {(currentUser.role === 'admin' || currentUser.role === 'gerente') && (
              <Link to="settings" className={`p-2 rounded-lg flex flex-col items-center ${activeTab === 'settings' ? (darkMode ? 'bg-[#7c4dff] text-white shadow-md' : 'bg-blue-500 text-white shadow-md') : (darkMode ? 'text-[#a0a0a0] hover:bg-[#404040]' : 'text-gray-500 hover:bg-gray-200')} transition-all duration-200 min-w-[60px]`} onClick={() => setIsSidebarOpen(false)}>
                <Settings size={18} />
                <span className="text-xs mt-1">Cfg</span>
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className={`flex-1 pt-14 pb-2 px-3 ${darkMode ? 'bg-[#0f0f0f] text-white' : 'bg-gray-100'} transition-colors duration-200`}>
        <div className="max-w-full h-full">
          <Outlet />
        </div>
      </main>

      <Modal isOpen={isShoppingListModalOpen} onClose={() => setIsShoppingListModalOpen(false)} title="Lista de Compras">
        <ShoppingListModal onClose={() => setIsShoppingListModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default AdminDashboardPage;
