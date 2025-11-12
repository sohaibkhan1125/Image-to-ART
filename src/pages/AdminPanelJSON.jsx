// AdminPanelJSON.jsx - Admin panel using JSON backend instead of Firebase
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { SettingsProvider } from '../contexts/SettingsContext';
import MaintenanceModeJSON from '../components/MaintenanceModeJSON';
import TitleManagementJSON from '../components/TitleManagementJSON';
import FooterManagementUpgraded from '../components/FooterManagementUpgraded';
import ContentManagement from '../components/ContentManagement';
import ErrorBoundary from '../components/ErrorBoundary';
import HeroManagement from '../components/HeroManagement';

const AdminPanelJSON = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('maintenance');
  const [showSubMenu, setShowSubMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <SettingsProvider>
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className="w-1/5 bg-gray-800 text-white">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-6">Admin Settings</h2>
            <nav className="space-y-2">
              <div>
                <button
                  onClick={() => {
                    setActiveSection('general');
                    setShowSubMenu(!showSubMenu);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 ${
                    activeSection === 'general' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>General Settings</span>
                    <span className={`transform transition-transform ${showSubMenu ? 'rotate-90' : ''}`}>
                      ▶
                    </span>
                  </div>
                </button>

                {showSubMenu && (
                  <div className="ml-4 mt-2 space-y-1">
                    <button
                      onClick={() => setActiveSection('maintenance')}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm transition duration-200 ${
                        activeSection === 'maintenance' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      Maintenance Mode
                    </button>
                    <button
                      onClick={() => setActiveSection('title-management')}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm transition duration-200 ${
                        activeSection === 'title-management' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      Website Title Management
                    </button>
                    <button
                      onClick={() => setActiveSection('footer-management')}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm transition duration-200 ${
                        activeSection === 'footer-management' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      Footer Management
                    </button>
                    <button
                      onClick={() => setActiveSection('content-management')}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm transition duration-200 ${
                        activeSection === 'content-management' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      Content Management
                    </button>
                    <button
                      onClick={() => setActiveSection('hero-management')}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm transition duration-200 ${
                        activeSection === 'hero-management' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      Hero Management
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>
          
          {/* Logout Button */}
          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={handleLogout}
              className="block mx-auto bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div className="w-4/5 bg-white p-8 overflow-y-auto">
          {activeSection === 'maintenance' && (
            <ErrorBoundary>
              <MaintenanceModeJSON />
            </ErrorBoundary>
          )}

          {activeSection === 'title-management' && (
            <ErrorBoundary>
              <TitleManagementJSON />
            </ErrorBoundary>
          )}

          {activeSection === 'footer-management' && (
            <ErrorBoundary>
              <FooterManagementUpgraded />
            </ErrorBoundary>
          )}

          {activeSection === 'content-management' && (
            <ErrorBoundary>
              <ContentManagement />
            </ErrorBoundary>
          )}

          {activeSection === 'hero-management' && (
            <ErrorBoundary>
              <HeroManagement />
            </ErrorBoundary>
          )}

          {activeSection === 'general' && (
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">General Settings</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Welcome to Admin Panel</h3>
                <p className="text-blue-700 mb-4">
                  Use the sidebar to navigate between different settings sections.
                </p>
                <ul className="text-blue-700 space-y-2">
                  <li>• <strong>Maintenance Mode:</strong> Toggle website maintenance status</li>
                  <li>• <strong>Website Title Management:</strong> Update website title</li>
                  <li>• <strong>Footer Management:</strong> Manage social media links in footer</li>
                  <li>• <strong>Content Management:</strong> Create and manage content displayed above FAQ</li>
                </ul>
                <div className="mt-4 p-4 bg-white rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Backend Information</h4>
                  <p className="text-sm text-gray-600">
                    This admin panel uses a JSON backend hosted on Vercel for data persistence.
                    Firebase is only used for authentication.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SettingsProvider>
  );
};

export default AdminPanelJSON;
