import React, { useState, createContext, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Server, CreditCard, Settings, 
  FileText, LogOut, Bell, Search, Box, ChevronRight,
  Plus, LifeBuoy, Menu, CheckCircle2, AlertTriangle, User
} from 'lucide-react';
import { CreateInstanceWizard } from './modals/CreateInstanceWizard';

// --- Types & Context ---
export interface Instance {
  id: string;
  name: string;
  subdomain: string;
  region: string;
  plan: string;
  status: 'running' | 'stopped' | 'provisioning' | 'error';
  ip: string;
  specs: { cpu: string; ram: string };
  created_at: string;
}

interface DashboardContextType {
  instances: Instance[];
  addInstance: (instance: Instance) => void;
  updateInstanceStatus: (id: string, status: Instance['status']) => void;
  deleteInstance: (id: string) => void;
  isCreateModalOpen: boolean;
  setCreateModalOpen: (isOpen: boolean) => void;
  user: any; 
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useDashboard must be used within DashboardLayout");
  return context;
};

// --- Mock Data ---
const INITIAL_INSTANCES: Instance[] = [
  { id: 'inst_101', name: 'Tech Blog Prod', subdomain: 'tech-blog', region: 'us-east-1', plan: 'Pro', status: 'running', ip: '45.77.12.99', specs: { cpu: '2 vCPU', ram: '4GB' }, created_at: '2023-10-15' },
  { id: 'inst_102', name: 'Marketing Site', subdomain: 'marketing-lp', region: 'eu-central-1', plan: 'Starter', status: 'stopped', ip: '10.0.0.45', specs: { cpu: '1 vCPU', ram: '2GB' }, created_at: '2023-11-01' },
  { id: 'inst_103', name: 'Staging Env', subdomain: 'staging-v2', region: 'us-east-1', plan: 'Pro', status: 'running', ip: '192.168.1.5', specs: { cpu: '2 vCPU', ram: '4GB' }, created_at: '2023-11-20' },
  { id: 'inst_104', name: 'Client Portal', subdomain: 'portal-secure', region: 'us-east-1', plan: 'Business', status: 'running', ip: '10.0.12.44', specs: { cpu: '4 vCPU', ram: '8GB' }, created_at: '2023-12-05' },
  { id: 'inst_105', name: 'Legacy App', subdomain: 'legacy-v1', region: 'ap-south-1', plan: 'Starter', status: 'stopped', ip: '10.0.5.11', specs: { cpu: '1 vCPU', ram: '2GB' }, created_at: '2023-09-10' },
  { id: 'inst_106', name: 'WooCommerce Store', subdomain: 'shop-main', region: 'eu-central-1', plan: 'Business', status: 'provisioning', ip: '192.168.0.1', specs: { cpu: '4 vCPU', ram: '8GB' }, created_at: '2023-12-10' },
  { id: 'inst_107', name: 'Dev Sandbox A', subdomain: 'sandbox-a', region: 'us-east-1', plan: 'Starter', status: 'error', ip: '10.0.0.99', specs: { cpu: '1 vCPU', ram: '2GB' }, created_at: '2023-12-08' },
  { id: 'inst_108', name: 'Internal Wiki', subdomain: 'wiki-int', region: 'us-east-1', plan: 'Pro', status: 'running', ip: '10.2.4.55', specs: { cpu: '2 vCPU', ram: '4GB' }, created_at: '2023-11-25' },
];

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // Global State
  const [instances, setInstances] = useState<Instance[]>(INITIAL_INSTANCES);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Actions
  const addInstance = (instance: Instance) => setInstances([instance, ...instances]);
  const updateInstanceStatus = (id: string, status: Instance['status']) => {
    setInstances(instances.map(i => i.id === id ? { ...i, status } : i));
  };
  const deleteInstance = (id: string) => {
    setInstances(instances.filter(i => i.id !== id));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const closeDropdowns = () => {
      setIsProfileOpen(false);
      setIsNotifOpen(false);
    };
    document.addEventListener('click', closeDropdowns);
    return () => document.removeEventListener('click', closeDropdowns);
  }, []);

  // --- ROBUST LINK LOGIC ---
  const getLinkClass = (path: string, strict: boolean = false, requiredTab?: string) => {
    const baseClass = "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200";
    const activeClass = "bg-indigo-50 text-indigo-700";
    const inactiveClass = "text-slate-600 hover:bg-slate-50 hover:text-slate-900";

    const isPathMatch = strict 
      ? location.pathname === path 
      : location.pathname.startsWith(path);

    if (!isPathMatch) return `${baseClass} ${inactiveClass}`;

    if (requiredTab) {
      const searchParams = new URLSearchParams(location.search);
      const currentTab = searchParams.get('tab');

      if (currentTab === requiredTab) {
        return `${baseClass} ${activeClass}`;
      }
      
      if (requiredTab === 'general' && !currentTab) {
        return `${baseClass} ${activeClass}`;
      }

      return `${baseClass} ${inactiveClass}`;
    }

    return `${baseClass} ${activeClass}`;
  };

  const getPageTitle = () => {
    if (location.pathname.includes('/dashboard/instances')) return 'My Instances';
    if (location.pathname === '/dashboard') return 'Overview';
    if (location.pathname === '/settings') {
      const tab = new URLSearchParams(location.search).get('tab');
      return tab === 'billing' ? 'Billing & Usage' : 'Settings';
    }
    if (location.pathname === '/profile') return 'Profile';
    return 'Dashboard';
  };

  // Display Plan Logic
  const getPlanBadgeColor = (plan: string) => {
    switch(plan.toLowerCase()) {
      case 'enterprise': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'business': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'pro': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'starter': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200'; // Custom
    }
  };

  return (
    <DashboardContext.Provider value={{ 
      instances, addInstance, updateInstanceStatus, deleteInstance, 
      isCreateModalOpen, setCreateModalOpen, 
      user: user || { name: 'Guest', email: 'guest@wpcube.io' } 
    }}>
      <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
        
        {/* Create Instance Wizard */}
        <CreateInstanceWizard isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} />

        {/* --- Sidebar --- */}
        <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            {/* Logo - Navigates to Home */}
            <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-slate-100">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition-colors">
                  <Box className="w-5 h-5" />
                </div>
                <span className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">WPCube</span>
              </Link>
            </div>

            {/* Nav Items */}
            <div className="flex-1 flex flex-col overflow-y-auto pt-6 px-4 space-y-1">
              <div className="mb-6 px-2">
                <button 
                  onClick={() => setCreateModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2.5 rounded-lg transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" /> New Instance
                </button>
              </div>

              <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Platform</p>
              
              <Link to="/dashboard" className={getLinkClass('/dashboard', true)} onClick={() => setMobileMenuOpen(false)}>
                <LayoutDashboard className="mr-3 h-5 w-5 flex-shrink-0" /> Overview
              </Link>
              
              <Link to="/dashboard/instances" className={getLinkClass('/dashboard/instances')} onClick={() => setMobileMenuOpen(false)}>
                <Server className="mr-3 h-5 w-5 flex-shrink-0" /> My Instances
              </Link>
              
              {/* Billing */}
              <Link to="/settings?tab=billing" className={getLinkClass('/settings', false, 'billing')} onClick={() => setMobileMenuOpen(false)}>
                <CreditCard className="mr-3 h-5 w-5 flex-shrink-0" /> Billing & Usage
              </Link>

              <div className="pt-6">
                <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Configuration</p>
                
                {/* Settings */}
                <Link to="/settings?tab=general" className={getLinkClass('/settings', false, 'general')} onClick={() => setMobileMenuOpen(false)}>
                  <Settings className="mr-3 h-5 w-5 flex-shrink-0" /> Settings
                </Link>
                
                <Link to="/api-reference" className={getLinkClass('/api-reference')} onClick={() => setMobileMenuOpen(false)}>
                  <FileText className="mr-3 h-5 w-5 flex-shrink-0" /> API Reference
                </Link>
                
                <Link to="/contact" className={getLinkClass('/contact')} onClick={() => setMobileMenuOpen(false)}>
                  <LifeBuoy className="mr-3 h-5 w-5 flex-shrink-0" /> Support
                </Link>
              </div>
            </div>

            {/* User Footer */}
            <div className="flex-shrink-0 border-t border-slate-200 p-4">
              <div 
                className="flex items-center w-full p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={(e) => { e.stopPropagation(); setIsProfileOpen(!isProfileOpen); }}
              >
                <div className="relative">
                  <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs border border-indigo-200 uppercase">
                    {user?.name ? user.name.substring(0, 2) : 'GU'}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.name || 'Guest'}</p>
                    {user?.plan && (
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded uppercase border ${getPlanBadgeColor(user.plan)}`}>
                        {user.plan}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{user?.email || 'guest@example.com'}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* --- Main Content --- */}
        <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300">
          
          {/* Topbar */}
          <header className="sticky top-0 z-30 flex-shrink-0 flex h-16 bg-white border-b border-slate-200 shadow-sm">
            <div className="flex-1 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
              
              {/* Left: Mobile Menu & Breadcrumbs */}
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100"
                >
                  <Menu className="w-6 h-6" />
                </button>

                <nav className="hidden sm:flex items-center text-sm font-medium text-slate-500">
                  <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">Home</Link>
                  <ChevronRight className="w-4 h-4 mx-2 text-slate-300" />
                  <span className="text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide">
                    {getPageTitle()}
                  </span>
                </nav>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-4">
                
                {/* Search */}
                <div className="relative w-64 hidden md:block group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search resources..."
                    className="block w-full pl-10 pr-3 py-1.5 border border-slate-200 rounded-lg leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                  />
                </div>

                {/* Notifications */}
                <div className="relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
                    className="p-2 text-slate-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors relative"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                  </button>

                  {/* Dropdown */}
                  {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                        <span className="font-bold text-sm text-slate-900">Notifications</span>
                        <span className="text-xs text-indigo-600 cursor-pointer">Mark all read</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        <div className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50">
                          <div className="flex items-start gap-3">
                            <div className="bg-green-100 p-1.5 rounded-full text-green-600 mt-0.5"><CheckCircle2 className="w-4 h-4"/></div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">Invoice Paid</p>
                              <p className="text-xs text-slate-500 mt-0.5">Your October invoice for $29.00 has been processed.</p>
                            </div>
                          </div>
                        </div>
                        <div className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
                          <div className="flex items-start gap-3">
                            <div className="bg-yellow-100 p-1.5 rounded-full text-yellow-600 mt-0.5"><AlertTriangle className="w-4 h-4"/></div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">Usage Warning</p>
                              <p className="text-xs text-slate-500 mt-0.5">Instance 'Marketing Site' is at 85% CPU usage.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative ml-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
                    className="flex items-center max-w-xs rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs border border-indigo-200 uppercase">
                      {user?.name ? user.name.substring(0, 2) : 'ME'}
                    </div>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        <div className="mt-1 flex items-center gap-1">
                           <span className="text-xs text-slate-400">Current Plan:</span>
                           <span className="text-xs font-bold text-indigo-600 uppercase">{user?.plan}</span>
                        </div>
                      </div>
                      <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600" onClick={() => setIsProfileOpen(false)}>
                        <User className="w-4 h-4" /> Your Profile
                      </Link>
                      <Link to="/settings?tab=general" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600" onClick={() => setIsProfileOpen(false)}>
                        <Settings className="w-4 h-4" /> Settings
                      </Link>
                      <div className="border-t border-slate-100 my-1"></div>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </DashboardContext.Provider>
  );
};