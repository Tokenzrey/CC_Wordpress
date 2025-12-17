import React, { useState, useEffect } from 'react';
import { useDashboard } from '../DashboardLayout';
import { 
  X, ChevronRight, Check, Server, Globe, Cpu, 
  HardDrive, Layers, Zap, AlertCircle, Plus, Trash2,
  Box, CreditCard, ArrowRight, ArrowLeft, Loader2
} from 'lucide-react';

interface CreateInstanceWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateInstanceWizard: React.FC<CreateInstanceWizardProps> = ({ isOpen, onClose }) => {
  const { addInstance } = useDashboard();
  const [currentStep, setCurrentStep] = useState(1);
  const [isDeploying, setIsDeploying] = useState(false);

  // --- Form State ---
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    region: 'us-east-1',
    planType: 'preset' as 'preset' | 'custom',
    presetId: 'pro',
    customSpecs: {
      cpu: 2, // vCPU
      ram: 4, // GB
      storage: 20 // GB
    },
    stack: {
      wpVersion: '6.4.1',
      phpVersion: '8.1'
    },
    envVars: [] as { key: string; value: string }[]
  });

  // --- Constants & Calculations ---
  const PRESETS = [
    { id: 'starter', name: 'Starter', price: 0, cpu: 1, ram: 2, storage: 10, desc: 'For hobby sites' },
    { id: 'pro', name: 'Pro', price: 29, cpu: 2, ram: 4, storage: 20, desc: 'For growing businesses' },
    { id: 'biz', name: 'Business', price: 79, cpu: 4, ram: 8, storage: 50, desc: 'High traffic scale' },
  ];

  const calculateCost = () => {
    if (formData.planType === 'preset') {
      return PRESETS.find(p => p.id === formData.presetId)?.price || 0;
    }
    // Custom Formula: Base $5 + ($4/CPU) + ($2/RAM) + ($0.10/Storage)
    const { cpu, ram, storage } = formData.customSpecs;
    return 5 + (cpu * 4) + (ram * 2) + (storage * 0.1);
  };

  const cost = calculateCost();

  const handleEnvVarChange = (index: number, field: 'key' | 'value', value: string) => {
    const newVars = [...formData.envVars];
    newVars[index][field] = value;
    setFormData({ ...formData, envVars: newVars });
  };

  const addEnvVar = () => {
    setFormData({ ...formData, envVars: [...formData.envVars, { key: '', value: '' }] });
  };

  const removeEnvVar = (index: number) => {
    const newVars = formData.envVars.filter((_, i) => i !== index);
    setFormData({ ...formData, envVars: newVars });
  };

  const handleDeploy = () => {
    setIsDeploying(true);
    setTimeout(() => {
      // Create Specs String
      let specsText = '';
      let planName = 'Custom';
      
      if (formData.planType === 'preset') {
        const p = PRESETS.find(x => x.id === formData.presetId);
        specsText = `${p?.cpu} vCPU / ${p?.ram}GB`;
        planName = p?.name || 'Pro';
      } else {
        specsText = `${formData.customSpecs.cpu} vCPU / ${formData.customSpecs.ram}GB`;
        planName = 'Custom';
      }

      addInstance({
        id: `inst_${Math.floor(Math.random() * 9000) + 1000}`,
        name: formData.name,
        subdomain: formData.subdomain,
        region: formData.region,
        plan: planName,
        status: 'provisioning',
        ip: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        specs: { 
          cpu: specsText.split('/')[0].trim(), 
          ram: specsText.split('/')[1].trim() 
        },
        created_at: new Date().toISOString()
      });

      setIsDeploying(false);
      onClose();
      // Reset form to step 1 for next time
      setCurrentStep(1);
      setFormData(prev => ({...prev, name: '', subdomain: ''}));
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] md:h-[650px] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Left Sidebar: Steps */}
        <div className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-6 flex-shrink-0">
          <h2 className="text-lg font-extrabold text-slate-900 mb-8 flex items-center gap-2">
            <Box className="w-6 h-6 text-indigo-600" /> New Instance
          </h2>
          
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {['Basics', 'Resources', 'Stack', 'Review'].map((step, idx) => {
              const stepNum = idx + 1;
              const isActive = currentStep === stepNum;
              const isCompleted = currentStep > stepNum;

              return (
                <div 
                  key={step} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 
                    isCompleted ? 'text-green-600' : 'text-slate-500'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                    isActive ? 'border-indigo-600 bg-white' : 
                    isCompleted ? 'border-green-600 bg-green-600 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {isCompleted ? <Check className="w-3 h-3" /> : stepNum}
                  </div>
                  {step}
                </div>
              );
            })}
          </div>

          <div className="mt-auto hidden md:block pt-8 border-t border-slate-200">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Est. Monthly Cost</p>
            <div className="text-2xl font-bold text-slate-900">${cost.toFixed(2)}</div>
            <p className="text-xs text-slate-500">Billed hourly</p>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Header (Mobile Cost) */}
          <div className="md:hidden px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <span className="text-sm font-medium text-slate-500">Est. Cost</span>
             <span className="font-bold text-slate-900">${cost.toFixed(2)}/mo</span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            
            {/* Step 1: Basics */}
            {currentStep === 1 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Let's get started</h3>
                  <p className="text-slate-500 mt-1">Name your instance and choose where it lives.</p>
                </div>

                <div className="space-y-6 max-w-lg">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Instance Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      placeholder="e.g. Production Blog"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Subdomain</label>
                    <div className="flex items-center">
                      <input 
                        type="text" 
                        className="flex-1 px-4 py-2.5 border border-r-0 border-slate-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="my-site"
                        value={formData.subdomain}
                        onChange={(e) => setFormData({...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                      />
                      <span className="bg-slate-100 border border-slate-300 border-l-0 px-4 py-2.5 text-slate-500 text-sm font-mono rounded-r-lg font-medium">
                        .wpcube.app
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">Region</label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'us-east-1', name: 'US East', loc: 'N. Virginia', flag: '🇺🇸' },
                        { id: 'eu-central-1', name: 'EU Central', loc: 'Frankfurt', flag: '🇩🇪' },
                        { id: 'ap-south-1', name: 'Asia Pacific', loc: 'Singapore', flag: '🇸🇬' },
                        { id: 'ca-central-1', name: 'Canada', loc: 'Montreal', flag: '🇨🇦' },
                      ].map((region) => (
                        <div 
                          key={region.id}
                          onClick={() => setFormData({...formData, region: region.id})}
                          className={`cursor-pointer border rounded-xl p-4 flex items-center gap-3 transition-all ${
                            formData.region === region.id 
                              ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' 
                              : 'border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                          }`}
                        >
                          <span className="text-2xl">{region.flag}</span>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{region.name}</div>
                            <div className="text-xs text-slate-500">{region.loc}</div>
                          </div>
                          {formData.region === region.id && <Check className="ml-auto w-4 h-4 text-indigo-600" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Resources */}
            {currentStep === 2 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Resource Allocation</h3>
                  <p className="text-slate-500 mt-1">Choose a preset plan or configure custom limits.</p>
                </div>

                {/* Toggle Plan Type */}
                <div className="flex bg-slate-100 p-1 rounded-xl max-w-sm">
                  <button 
                    onClick={() => setFormData({...formData, planType: 'preset'})}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                      formData.planType === 'preset' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Preset Plans
                  </button>
                  <button 
                    onClick={() => setFormData({...formData, planType: 'custom'})}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                      formData.planType === 'custom' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Custom Config
                  </button>
                </div>

                {formData.planType === 'preset' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {PRESETS.map((plan) => (
                      <div 
                        key={plan.id}
                        onClick={() => setFormData({...formData, presetId: plan.id})}
                        className={`cursor-pointer rounded-xl border-2 p-6 relative transition-all ${
                          formData.presetId === plan.id 
                            ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600' 
                            : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
                        }`}
                      >
                        <h4 className="font-bold text-slate-900">{plan.name}</h4>
                        <div className="mt-2 text-xs text-slate-500">{plan.desc}</div>
                        <div className="mt-4 pt-4 border-t border-slate-200/50 space-y-2 text-sm text-slate-700">
                          <p className="flex items-center gap-2"><Cpu className="w-4 h-4 text-slate-400" /> {plan.cpu} vCPU</p>
                          <p className="flex items-center gap-2"><Layers className="w-4 h-4 text-slate-400" /> {plan.ram} GB RAM</p>
                          <p className="flex items-center gap-2"><HardDrive className="w-4 h-4 text-slate-400" /> {plan.storage} GB SSD</p>
                        </div>
                        <div className="mt-4 font-bold text-xl text-slate-900">${plan.price}<span className="text-sm text-slate-500 font-normal">/mo</span></div>
                        {formData.presetId === plan.id && (
                          <div className="absolute top-3 right-3 bg-indigo-600 text-white rounded-full p-1"><Check className="w-3 h-3" /></div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-8 bg-slate-50 p-6 rounded-xl border border-slate-200">
                    {/* Sliders */}
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Cpu className="w-4 h-4" /> CPU Cores</label>
                          <span className="text-sm font-mono font-bold text-indigo-600">{formData.customSpecs.cpu} vCPU</span>
                        </div>
                        <input 
                          type="range" min="0.5" max="8" step="0.5"
                          value={formData.customSpecs.cpu}
                          onChange={(e) => setFormData({...formData, customSpecs: {...formData.customSpecs, cpu: parseFloat(e.target.value)}})}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-1"><span>0.5</span><span>8.0</span></div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Layers className="w-4 h-4" /> RAM</label>
                          <span className="text-sm font-mono font-bold text-indigo-600">{formData.customSpecs.ram} GB</span>
                        </div>
                        <input 
                          type="range" min="1" max="32" step="1"
                          value={formData.customSpecs.ram}
                          onChange={(e) => setFormData({...formData, customSpecs: {...formData.customSpecs, ram: parseInt(e.target.value)}})}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-1"><span>1 GB</span><span>32 GB</span></div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><HardDrive className="w-4 h-4" /> NVMe Storage</label>
                          <span className="text-sm font-mono font-bold text-indigo-600">{formData.customSpecs.storage} GB</span>
                        </div>
                        <input 
                          type="range" min="10" max="500" step="10"
                          value={formData.customSpecs.storage}
                          onChange={(e) => setFormData({...formData, customSpecs: {...formData.customSpecs, storage: parseInt(e.target.value)}})}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-1"><span>10 GB</span><span>500 GB</span></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Stack */}
            {currentStep === 3 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Software Stack</h3>
                  <p className="text-slate-500 mt-1">Configure runtime versions and environment variables.</p>
                </div>

                <div className="grid grid-cols-2 gap-6 max-w-lg">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">WordPress Version</label>
                    <select 
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                      value={formData.stack.wpVersion}
                      onChange={(e) => setFormData({...formData, stack: {...formData.stack, wpVersion: e.target.value}})}
                    >
                      <option value="6.4.1">6.4.1 (Latest)</option>
                      <option value="6.3">6.3</option>
                      <option value="6.2">6.2</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">PHP Version</label>
                    <select 
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                      value={formData.stack.phpVersion}
                      onChange={(e) => setFormData({...formData, stack: {...formData.stack, phpVersion: e.target.value}})}
                    >
                      <option value="8.2">8.2 (Recommended)</option>
                      <option value="8.1">8.1</option>
                      <option value="8.0">8.0</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-sm font-bold text-slate-900">Environment Variables</label>
                    <button 
                      onClick={addEnvVar}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Variable
                    </button>
                  </div>
                  
                  <div className="space-y-3 max-w-2xl">
                    {formData.envVars.length === 0 && (
                      <div className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
                        No environment variables configured.
                      </div>
                    )}
                    {formData.envVars.map((v, i) => (
                      <div key={i} className="flex gap-2">
                        <input 
                          placeholder="KEY" 
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono uppercase placeholder:normal-case"
                          value={v.key}
                          onChange={(e) => handleEnvVarChange(i, 'key', e.target.value)}
                        />
                        <input 
                          placeholder="VALUE" 
                          className="flex-[2] px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          value={v.value}
                          onChange={(e) => handleEnvVarChange(i, 'value', e.target.value)}
                        />
                        <button 
                          onClick={() => removeEnvVar(i)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="text-center max-w-lg mx-auto">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Zap className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Ready to Deploy</h3>
                  <p className="text-slate-500 mt-2">
                    Review your configuration below. Your instance will be provisioned instantly.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden max-w-2xl mx-auto">
                  <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white">
                    <span className="font-bold text-slate-900">Monthly Cost</span>
                    <span className="font-bold text-xl text-indigo-600">${cost.toFixed(2)}</span>
                  </div>
                  <div className="p-6 space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Instance Name</span>
                      <span className="font-medium text-slate-900">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Domain</span>
                      <span className="font-medium text-slate-900 font-mono">{formData.subdomain}.wpcube.app</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Region</span>
                      <span className="font-medium text-slate-900 uppercase">{formData.region}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Hardware</span>
                      <span className="font-medium text-slate-900">
                        {formData.planType === 'preset' 
                          ? PRESETS.find(p => p.id === formData.presetId)?.name 
                          : `${formData.customSpecs.cpu}vCPU / ${formData.customSpecs.ram}GB`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Stack</span>
                      <span className="font-medium text-slate-900">WP {formData.stack.wpVersion} / PHP {formData.stack.phpVersion}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer Navigation */}
          <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-white">
            <button 
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1 || isDeploying}
              className={`flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors ${currentStep === 1 ? 'invisible' : ''}`}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {currentStep < 4 ? (
              <button 
                onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
                disabled={!formData.name || !formData.subdomain}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2.5 px-6 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={handleDeploy}
                disabled={isDeploying}
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2.5 px-8 rounded-lg shadow-sm transition-colors flex items-center gap-2"
              >
                {isDeploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                {isDeploying ? 'Provisioning...' : 'Deploy Instance'}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};