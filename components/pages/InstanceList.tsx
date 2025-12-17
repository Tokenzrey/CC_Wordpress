import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../DashboardLayout';
import { 
  Search, Filter, MoreHorizontal, Power, RotateCw, Trash2, 
  ExternalLink, Server, Terminal, Loader2, Database, Layout,
  CheckSquare, Square, Copy, ArrowRight, Layers
} from 'lucide-react';

import { LogViewerModal } from '../modals/LogViewerModal';
import { ConnectionInfoModal } from '../modals/ConnectionInfoModal';
import { BackupManagerModal } from '../modals/BackupManagerModal';
import { DeleteConfirmationModal } from '../modals/DeleteConfirmationModal';

export const InstanceList: React.FC = () => {
  const navigate = useNavigate();
  const { instances, updateInstanceStatus, deleteInstance, addInstance } = useDashboard();
  
  // -- UI State --
  const [filter, setFilter] = useState<'all' | 'running' | 'stopped'>('all');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeMenu, setActiveMenu] = useState<{ id: string; top: number; left: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  
  // -- Modal State --
  const [modalType, setModalType] = useState<'none' | 'logs' | 'connect' | 'backup' | 'delete'>('none');
  const [selectedInstance, setSelectedInstance] = useState<any>(null);

  // -- Helpers --
  const closeMenu = () => setActiveMenu(null);
  
  useEffect(() => {
    window.addEventListener('click', closeMenu);
    window.addEventListener('scroll', closeMenu, { capture: true });
    return () => {
      window.removeEventListener('click', closeMenu);
      window.removeEventListener('scroll', closeMenu, { capture: true });
    };
  }, []);

  // -- Logic --
  const filteredInstances = instances.filter(inst => {
    const matchesStatus = filter === 'all' || inst.status === filter;
    const matchesSearch = inst.name.toLowerCase().includes(search.toLowerCase()) || 
                          inst.subdomain.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredInstances.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredInstances.map(i => i.id)));
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // -- Action Handlers --
  const handleMenuAction = (action: string, instanceId: string) => {
    closeMenu();
    const inst = instances.find(i => i.id === instanceId);
    if (!inst) return;

    if (action === 'dashboard') {
      navigate(`/instance/${inst.id}`);
    } else if (action === 'wp-admin') {
      window.open(`https://${inst.subdomain}.wpcube.app/wp-admin`, '_blank');
    } else if (action === 'sftp') {
      setSelectedInstance(inst);
      setModalType('connect');
    } else if (action === 'restart') {
      updateInstanceStatus(inst.id, 'stopped'); // Fake restart cycle
      showToast(`Restarting ${inst.name}...`);
      setTimeout(() => {
        updateInstanceStatus(inst.id, 'running');
        showToast(`${inst.name} is back online.`);
      }, 3000);
    } else if (action === 'stop') {
      updateInstanceStatus(inst.id, 'stopped');
      showToast(`${inst.name} stopped.`);
    } else if (action === 'start') {
      updateInstanceStatus(inst.id, 'running');
      showToast(`${inst.name} started.`);
    } else if (action === 'logs') {
      setSelectedInstance(inst);
      setModalType('logs');
    } else if (action === 'backups') {
      setSelectedInstance(inst);
      setModalType('backup');
    } else if (action === 'staging') {
      showToast('Cloning to staging...');
      setTimeout(() => {
        addInstance({
          ...inst,
          id: `inst_${Math.floor(Math.random()*9000)}`,
          name: `[Staging] ${inst.name}`,
          subdomain: `${inst.subdomain}-staging`,
          status: 'running'
        });
        showToast('Staging environment created.');
      }, 1500);
    } else if (action === 'delete') {
      setSelectedInstance(inst);
      setModalType('delete');
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedInstance) {
      deleteInstance(selectedInstance.id);
      setModalType('none');
      showToast('Instance deleted successfully.');
    }
  };

  return (
    <div className="space-y-6 relative min-h-[500px]">
      
      {/* --- TOAST NOTIFICATION --- */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl z-[9999] animate-in slide-in-from-bottom-5">
          {toast}
        </div>
      )}

      {/* --- MODALS --- */}
      <ConnectionInfoModal 
        isOpen={modalType === 'connect'} 
        onClose={() => setModalType('none')} 
        instance={selectedInstance} 
      />
      <LogViewerModal 
        isOpen={modalType === 'logs'} 
        onClose={() => setModalType('none')} 
        instanceName={selectedInstance?.name || ''} 
      />
      <BackupManagerModal 
        isOpen={modalType === 'backup'} 
        onClose={() => setModalType('none')} 
        instanceName={selectedInstance?.name || ''} 
      />
      <DeleteConfirmationModal 
        isOpen={modalType === 'delete'} 
        onClose={() => setModalType('none')} 
        onConfirm={handleDeleteConfirm}
        instanceName={selectedInstance?.name || ''}
      />

      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Instances</h1>
          <p className="text-slate-500 text-sm">Manage your WordPress containers.</p>
        </div>
      </div>

      {/* --- TOOLBAR --- */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center transition-all">
        
        {selectedIds.size > 0 ? (
          <div className="flex items-center gap-4 w-full bg-indigo-50 p-2 rounded-lg border border-indigo-100 animate-in fade-in">
            <span className="text-sm font-bold text-indigo-900 ml-2">{selectedIds.size} selected</span>
            <div className="h-4 w-px bg-indigo-200"></div>
            <button className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1">
              <RotateCw className="w-3 h-3" /> Restart
            </button>
            <button className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1">
              <Trash2 className="w-3 h-3" /> Delete
            </button>
            <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-xs text-slate-500 hover:text-slate-700">Cancel</button>
          </div>
        ) : (
          <>
            <div className="flex bg-slate-100 p-1 rounded-lg w-full md:w-auto">
              {['all', 'running', 'stopped'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab as any)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-all flex-1 md:flex-none ${
                    filter === tab 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </>
        )}
      </div>

      {/* --- DATA GRID --- */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-visible">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 w-10">
                <button onClick={toggleAll} className="text-slate-400 hover:text-slate-600">
                  {selectedIds.size > 0 && selectedIds.size === filteredInstances.length 
                    ? <CheckSquare className="w-5 h-5 text-indigo-600" /> 
                    : <Square className="w-5 h-5" />}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Instance</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Spec</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Region</th>
              <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredInstances.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-300" />
                  </div>
                  <p>No instances found matching your criteria.</p>
                </td>
              </tr>
            ) : (
              filteredInstances.map((inst) => (
                <tr 
                  key={inst.id} 
                  className={`group transition-colors cursor-pointer ${selectedIds.has(inst.id) ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}
                  onClick={() => navigate(`/instance/${inst.id}`)}
                >
                  <td className="px-4 py-4" onClick={(e) => { e.stopPropagation(); toggleSelection(inst.id); }}>
                    <div className="text-slate-400 hover:text-indigo-600">
                      {selectedIds.has(inst.id) ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5" />}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
                        WP
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{inst.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 font-mono mt-0.5">
                          {inst.subdomain}.wpcube.app
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize gap-1.5 ${
                      inst.status === 'running' ? 'bg-green-100 text-green-700' :
                      inst.status === 'stopped' ? 'bg-slate-100 text-slate-600' :
                      inst.status === 'provisioning' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        inst.status === 'running' ? 'bg-green-500 animate-pulse' :
                        inst.status === 'stopped' ? 'bg-slate-400' :
                        inst.status === 'provisioning' ? 'bg-yellow-500 animate-bounce' :
                        'bg-red-500'
                      }`}></span>
                      {inst.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 hidden sm:table-cell">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{inst.plan}</span>
                      <span className="text-xs text-slate-400">{inst.specs.cpu}, {inst.specs.ram}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{inst.region.includes('us') ? '🇺🇸' : inst.region.includes('eu') ? '🇩🇪' : '🇸🇬'}</span>
                      <span className="capitalize text-xs font-medium bg-slate-100 px-1.5 py-0.5 rounded">{inst.region.split('-')[0].toUpperCase()}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        setActiveMenu({ id: inst.id, top: rect.bottom + window.scrollY + 6, left: rect.right + window.scrollX - 224 });
                      }}
                      className={`text-slate-400 hover:text-indigo-600 p-2 rounded-full hover:bg-slate-100 transition-colors ${activeMenu?.id === inst.id ? 'bg-slate-100 text-indigo-600' : ''}`}
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- DROPDOWN MENU PORTAL --- */}
      {activeMenu && createPortal(
        <div 
          className="fixed z-[9999] w-56 bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right"
          style={{ top: activeMenu.top, left: activeMenu.left }}
          onClick={(e) => e.stopPropagation()}
        >
          {(() => {
            const inst = instances.find(i => i.id === activeMenu.id);
            if (!inst) return null;
            const isRunning = inst.status === 'running';

            return (
              <>
                <div className="py-1 border-b border-slate-100">
                  <span className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Navigation</span>
                  <button onClick={() => handleMenuAction('dashboard', inst.id)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <Layout className="w-4 h-4 text-slate-400" /> Dashboard Overview
                  </button>
                  <button onClick={() => handleMenuAction('wp-admin', inst.id)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-slate-400" /> Open WP-Admin
                  </button>
                  <button onClick={() => handleMenuAction('sftp', inst.id)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <Server className="w-4 h-4 text-slate-400" /> SFTP Credentials
                  </button>
                </div>

                <div className="py-1 border-b border-slate-100">
                  <span className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Power</span>
                  {isRunning ? (
                    <>
                      <button onClick={() => handleMenuAction('restart', inst.id)} className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2">
                        <RotateCw className="w-4 h-4" /> Restart
                      </button>
                      <button onClick={() => handleMenuAction('stop', inst.id)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                        <Power className="w-4 h-4 text-slate-400" /> Stop Instance
                      </button>
                    </>
                  ) : (
                    <button onClick={() => handleMenuAction('start', inst.id)} className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2">
                      <Power className="w-4 h-4" /> Start Instance
                    </button>
                  )}
                </div>

                <div className="py-1 border-b border-slate-100">
                  <span className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Maintenance</span>
                  <button onClick={() => handleMenuAction('logs', inst.id)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-slate-400" /> View Logs
                  </button>
                  <button onClick={() => handleMenuAction('backups', inst.id)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <Database className="w-4 h-4 text-slate-400" /> Backups
                  </button>
                  <button onClick={() => handleMenuAction('staging', inst.id)} className="w-full text-left px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Create Staging
                  </button>
                </div>

                <div className="py-1 bg-red-50/30">
                  <button onClick={() => handleMenuAction('delete', inst.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Delete Instance
                  </button>
                </div>
              </>
            );
          })()}
        </div>,
        document.body
      )}

    </div>
  );
};