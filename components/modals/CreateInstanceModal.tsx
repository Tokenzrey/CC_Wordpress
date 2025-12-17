import React, { useState } from 'react';
import { useDashboard } from '../DashboardLayout';
import { 
  X, Server, Check, ArrowRight, ArrowLeft, 
  Cpu, HardDrive, Shield, Loader2, CheckCircle2
} from 'lucide-react';

interface CreateInstanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateInstanceModal: React.FC<CreateInstanceModalProps> = ({ isOpen, onClose }) => {
  const { addInstance } = useDashboard();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [config, setConfig] = useState({
    name: '',
    subdomain: '',
    region: 'us-east-1'
  });

  if (!isOpen) return null;

  const PLANS = [
    { id: 'starter', name: 'Starter', price: '$0', specs: '1 vCPU / 2GB RAM' },
    { id: 'pro', name: 'Pro', price: '$29', specs: '2 vCPU / 4GB RAM' },
    { id: 'biz', name: 'Business', price: '$79', specs: '4 vCPU / 8GB RAM' }
  ];

  const handleDeploy = () => {
    if (!config.name || !config.subdomain) return;
    
    setLoading(true);
    setTimeout(() => {
      const planDetails = PLANS.find(p => p.id === selectedPlan);
      
      addInstance({
        id: `inst_${Math.floor(Math.random() * 9000) + 1000}`,
        name: config.name,
        subdomain: config.subdomain,
        region: config.region,
        plan: planDetails?.name || 'Pro',
        status: 'provisioning',
        ip: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        specs: { 
          cpu: planDetails?.specs.split('/')[0].trim() || '2 vCPU', 
          ram: planDetails?.specs.split('/')[1].trim() || '4GB' 
        },
        created_at: new Date().toISOString().split('T')[0]
      });

      setLoading(false);
      setStep(1);
      setConfig({ name: '', subdomain: '', region: 'us-east-1' });
      onClose();
    }, 2500); // 2.5s simulation
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Create New Instance</h2>
            <p className="text-xs text-slate-500 mt-0.5">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto">
          
          {/* Step 1: Select Plan */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900 text-center mb-6">Choose your performance tier</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PLANS.map((plan) => (
                  <div 
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`cursor-pointer rounded-xl border-2 p-6 transition-all relative ${
                      selectedPlan === plan.id 
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600' 
                        : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
                    }`}
                  >
                    {selectedPlan === plan.id && (
                      <div className="absolute top-3 right-3 text-indigo-600"><CheckCircle2 className="w-5 h-5" /></div>
                    )}
                    <h4 className="font-bold text-slate-900">{plan.name}</h4>
                    <p className="text-2xl font-extrabold text-slate-900 mt-2">{plan.price}<span className="text-sm font-medium text-slate-500">/mo</span></p>
                    <div className="mt-4 pt-4 border-t border-slate-200/60 text-xs text-slate-600 space-y-2">
                      <p className="flex items-center gap-2"><Cpu className="w-3 h-3" /> {plan.specs.split('/')[0]}</p>
                      <p className="flex items-center gap-2"><HardDrive className="w-3 h-3" /> {plan.specs.split('/')[1]}</p>
                      <p className="flex items-center gap-2"><Shield className="w-3 h-3" /> Auto-Backups</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Configuration */}
          {step === 2 && (
            <div className="space-y-6 max-w-md mx-auto">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Instance Name</label>
                <input 
                  type="text" 
                  value={config.name}
                  onChange={(e) => setConfig({...config, name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  placeholder="My Awesome Project"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Subdomain</label>
                <div className="flex items-center">
                  <input 
                    type="text" 
                    value={config.subdomain}
                    onChange={(e) => setConfig({...config, subdomain: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    placeholder="project-slug"
                  />
                  <div className="bg-slate-100 border border-l-0 border-slate-300 px-4 py-2 text-slate-500 text-sm font-mono rounded-r-lg">
                    .wpcube.app
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Region</label>
                <select 
                  value={config.region}
                  onChange={(e) => setConfig({...config, region: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  <option value="us-east-1">US East (N. Virginia)</option>
                  <option value="eu-central-1">EU Central (Frankfurt)</option>
                  <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Summary</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-600">Plan</span>
                    <span className="font-bold text-slate-900">{PLANS.find(p => p.id === selectedPlan)?.name} ({PLANS.find(p => p.id === selectedPlan)?.price}/mo)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-600">Name</span>
                    <span className="font-bold text-slate-900">{config.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-600">URL</span>
                    <span className="font-mono text-indigo-600">{config.subdomain}.wpcube.app</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Region</span>
                    <span className="font-bold text-slate-900">{config.region}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 text-center">
                By deploying, you agree to our Terms of Service. Billing starts immediately.
              </p>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 border-t border-slate-100 flex justify-between bg-slate-50/50">
          <button 
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="text-slate-600 font-medium hover:text-slate-900 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            disabled={loading}
          >
            {step > 1 ? <ArrowLeft className="w-4 h-4" /> : null}
            {step > 1 ? 'Back' : 'Cancel'}
          </button>

          {step < 3 ? (
            <button 
              onClick={() => setStep(step + 1)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={handleDeploy}
              disabled={loading}
              className={`bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-8 rounded-lg transition-colors flex items-center gap-2 shadow-sm ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Server className="w-4 h-4" />}
              {loading ? 'Provisioning...' : 'Deploy Instance'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};