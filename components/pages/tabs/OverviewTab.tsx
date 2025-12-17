import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  ExternalLink, Power, RotateCw, Copy, Eye, EyeOff, 
  Check, Server, Database, Globe, Cpu, HardDrive, 
  Zap, GitBranch, Layers, Activity 
} from 'lucide-react';

// --- Mock Data Generators ---
const generateData = (range: '1H' | '24H' | '7D') => {
  const points = range === '1H' ? 12 : range === '24H' ? 24 : 7;
  return Array.from({ length: points }, (_, i) => ({
    time: range === '1H' ? `${i * 5}m` : range === '24H' ? `${i}:00` : `Day ${i + 1}`,
    requests: Math.floor(Math.random() * 150) + 50, // req/sec
    latency: Math.floor(Math.random() * 60) + 20,   // ms
  }));
};

interface OverviewTabProps {
  instance: any;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ instance }) => {
  // State
  const [timeRange, setTimeRange] = useState<'1H' | '24H' | '7D'>('24H');
  const [chartData, setChartData] = useState(generateData('24H'));
  const [showDbPass, setShowDbPass] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Action States
  const [isPurging, setIsPurging] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  // Update chart when range changes
  useEffect(() => {
    setChartData(generateData(timeRange));
  }, [timeRange]);

  // Handlers
  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleAction = (type: 'purge' | 'restart') => {
    if (type === 'purge') {
      setIsPurging(true);
      setTimeout(() => setIsPurging(false), 1500);
    } else {
      setIsRestarting(true);
      setTimeout(() => setIsRestarting(false), 2000);
    }
  };

  // Helper for resource colors
  const getLoadColor = (percent: number) => {
    if (percent > 90) return 'bg-red-500';
    if (percent > 70) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const cpuLoad = 45;
  const ramLoad = 30; // 1.2GB of 4GB
  const storageLoad = 37; // 15GB of 40GB

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Status Bar & Quick Actions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Left: Identity */}
        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 text-green-700 rounded-lg">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <a href={instance.url} target="_blank" rel="noreferrer" className="text-sm font-bold text-slate-900 hover:text-indigo-600 flex items-center gap-1 transition-colors">
                  {instance.subdomain}.wpcube.app <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer hover:text-slate-700 group" onClick={() => handleCopy(instance.ip, 'ip')}>
                <span className="font-mono">{instance.ip}</span>
                {copiedField === 'ip' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
              </div>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
          <div className="hidden md:block">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Uptime</span>
             <p className="text-sm font-bold text-green-600">99.99%</p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            onClick={() => window.open(`${instance.url}/wp-admin`, '_blank')}
            className="flex-1 md:flex-none inline-flex justify-center items-center px-4 py-2 border border-slate-200 shadow-sm text-xs font-bold rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            <Layers className="w-3 h-3 mr-2 text-slate-400" /> WP Admin
          </button>
          
          <button 
            onClick={() => handleAction('purge')}
            disabled={isPurging}
            className="flex-1 md:flex-none inline-flex justify-center items-center px-4 py-2 border border-slate-200 shadow-sm text-xs font-bold rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            <Zap className={`w-3 h-3 mr-2 ${isPurging ? 'text-indigo-500 animate-pulse' : 'text-amber-500'}`} />
            {isPurging ? 'Purging...' : 'Purge Cache'}
          </button>

          <button 
            onClick={() => handleAction('restart')}
            disabled={isRestarting}
            className="flex-1 md:flex-none inline-flex justify-center items-center px-4 py-2 border border-slate-200 shadow-sm text-xs font-bold rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            <RotateCw className={`w-3 h-3 mr-2 ${isRestarting ? 'animate-spin text-indigo-600' : 'text-slate-400'}`} />
            {isRestarting ? 'Restarting...' : 'Restart PHP'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" /> Traffic & Latency
              </h3>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {(['1H', '24H', '7D'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    timeRange === range ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />
                <Area yAxisId="left" type="monotone" dataKey="requests" name="Requests/s" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorReq)" />
                <Area yAxisId="right" type="monotone" dataKey="latency" name="Latency (ms)" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorLat)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Resource Gauges */}
        <div className="space-y-4">
          
          {/* CPU Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Cpu className="w-4 h-4 text-slate-400" /> CPU Load
              </div>
              <span className="text-sm font-mono font-bold text-slate-900">{cpuLoad}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
              <div className={`h-full rounded-full transition-all duration-1000 ${getLoadColor(cpuLoad)}`} style={{ width: `${cpuLoad}%` }}></div>
            </div>
            <p className="text-xs text-slate-500 text-right">Allocated: {instance.specs.cpu}</p>
          </div>

          {/* RAM Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Server className="w-4 h-4 text-slate-400" /> Memory
              </div>
              <span className="text-sm font-mono font-bold text-slate-900">{ramLoad}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
              <div className={`h-full rounded-full transition-all duration-1000 ${getLoadColor(ramLoad)}`} style={{ width: `${ramLoad}%` }}></div>
            </div>
            <p className="text-xs text-slate-500 text-right">1.2 GB / {instance.specs.ram}</p>
          </div>

          {/* Storage Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <HardDrive className="w-4 h-4 text-slate-400" /> NVMe Storage
              </div>
              <span className="text-sm font-mono font-bold text-slate-900">{storageLoad}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
              <div className={`h-full rounded-full transition-all duration-1000 bg-indigo-500`} style={{ width: `${storageLoad}%` }}></div>
            </div>
            <p className="text-xs text-slate-500 text-right">15 GB / 40 GB</p>
          </div>

        </div>
      </div>

      {/* 4. Connection Details & Deployment Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Database & SFTP */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-500" /> Connection Details
            </h3>
          </div>
          <div className="p-6 grid gap-6">
            
            {/* Database Row */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Database (Internal)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative group">
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Host</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                    <code className="text-xs font-mono text-slate-700 flex-1 truncate">{instance.db.host}</code>
                    <button onClick={() => handleCopy(instance.db.host, 'db-host')} className="ml-2 text-slate-400 hover:text-indigo-600">
                      {copiedField === 'db-host' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="relative group">
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Database</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                    <code className="text-xs font-mono text-slate-700 flex-1 truncate">{instance.db.name}</code>
                    <button onClick={() => handleCopy(instance.db.name, 'db-name')} className="ml-2 text-slate-400 hover:text-indigo-600">
                      {copiedField === 'db-name' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="relative group">
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">User</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                    <code className="text-xs font-mono text-slate-700 flex-1 truncate">{instance.db.user}</code>
                    <button onClick={() => handleCopy(instance.db.user, 'db-user')} className="ml-2 text-slate-400 hover:text-indigo-600">
                      {copiedField === 'db-user' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="relative group">
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Password</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                    <code className="text-xs font-mono text-slate-700 flex-1 truncate">
                      {showDbPass ? '8x!a9_pLm2@' : '••••••••••••'}
                    </code>
                    <button onClick={() => setShowDbPass(!showDbPass)} className="ml-2 text-slate-400 hover:text-slate-600">
                      {showDbPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                    <button onClick={() => handleCopy('8x!a9_pLm2@', 'db-pass')} className="ml-2 text-slate-400 hover:text-indigo-600">
                      {copiedField === 'db-pass' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SFTP Row */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">SFTP Access</h4>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-3 justify-between">
                <div className="flex gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">Host</label>
                    <code className="text-xs font-mono text-slate-700">sftp.wpcube.io</code>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">Port</label>
                    <code className="text-xs font-mono text-slate-700">2222</code>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">User</label>
                    <code className="text-xs font-mono text-slate-700">{instance.id}_ftp</code>
                  </div>
                </div>
                <button onClick={() => handleCopy(`sftp -P 2222 ${instance.id}_ftp@sftp.wpcube.io`, 'sftp')} className="text-slate-400 hover:text-indigo-600">
                  {copiedField === 'sftp' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Deployment Info */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-slate-500" /> Deployment Info
            </h3>
          </div>
          <div className="p-6 flex-1 flex flex-col gap-6">
            
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white">
                  <GitBranch className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">main</div>
                  <div className="text-xs text-slate-500 font-mono">commit 7a2b91c</div>
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Last deployed by <span className="font-bold">alexdev</span> 2 hours ago.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Software Stack</h4>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                  WordPress 6.4.1
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                  PHP 8.2
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                  Nginx 1.25
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                  Redis 7.0
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};