import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDashboard } from '../DashboardLayout';
import { StatusBadge } from '../StatusBadge';
import { 
  Server, ExternalLink, ArrowLeft, Settings
} from 'lucide-react';

// Import new tabs
import { OverviewTab } from './tabs/OverviewTab';
import { AnalyticsTab } from './tabs/AnalyticsTab';
import { SettingsTab } from './tabs/SettingsTab';
import { BackupsTab } from './tabs/BackupsTab';

export const InstanceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Use global state instead of legacy mockApi
  const { instances } = useDashboard();
  
  const [instance, setInstance] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'settings' | 'backups'>('overview');

  useEffect(() => {
    if (!id) return;
    
    // Find instance in the global context
    const foundInstance = instances.find(i => i.id === id);
    
    if (foundInstance) {
      // Enrich with missing details for the view (DB info etc aren't in the list view model)
      const enrichedInstance = {
        ...foundInstance,
        url: `https://${foundInstance.subdomain}.wpcube.app`,
        db: {
          host: `db-cluster-${foundInstance.region.split('-')[1] || '01'}.internal`,
          name: `wp_${foundInstance.subdomain.replace(/-/g, '_')}`,
          user: `user_${foundInstance.id.split('_')[1] || 'admin'}`
        }
      };
      setInstance(enrichedInstance);
    } else {
      setInstance(null);
    }
    setLoading(false);
  }, [id, instances]);

  if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  
  if (!instance) return (
    <div className="p-10 text-center">
      <h2 className="text-xl font-bold text-slate-900">Instance not found</h2>
      <p className="text-slate-500 mb-4">The instance with ID {id} does not exist or has been deleted.</p>
      <button onClick={() => navigate('/dashboard/instances')} className="text-indigo-600 font-bold hover:underline">
        Return to List
      </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/dashboard/instances')} className="text-slate-500 hover:text-indigo-600 flex items-center gap-1 text-sm font-bold mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to List
        </button>
      </div>

      <div className="bg-white shadow rounded-xl border border-slate-200 overflow-hidden">
        {/* Main Info */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-200">
              <Server className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">{instance.name}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                <StatusBadge status={instance.status} />
                <span>•</span>
                <span className="font-mono">{instance.id}</span>
                <span>•</span>
                <a href={instance.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">
                  {instance.url} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
             <button 
               onClick={() => window.open(`${instance.url}/wp-admin`, '_blank')}
               className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-colors text-sm"
             >
                Open WP-Admin
             </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-slate-200 flex gap-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'analytics', label: 'Analytics' },
            { id: 'settings', label: 'Settings' },
            { id: 'backups', label: 'Backups' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 text-sm font-bold border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 bg-slate-50 min-h-[600px]">
          
          {activeTab === 'overview' && <OverviewTab instance={instance} />}

          {activeTab === 'analytics' && <AnalyticsTab />}
          
          {activeTab === 'settings' && <SettingsTab instance={instance} />}
          
          {activeTab === 'backups' && <BackupsTab instanceName={instance.name} />}

        </div>
      </div>
    </div>
  );
};