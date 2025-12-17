import React, { useState } from 'react';
import { 
  CreditCard, CheckCircle2, Download, Zap, 
  ArrowUpRight, AlertCircle, X, Loader2, Check
} from 'lucide-react';

export const BillingTab: React.FC = () => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const INVOICES = [
    { id: 'inv_001', date: 'Nov 01, 2023', amount: '$29.00', status: 'Paid' },
    { id: 'inv_002', date: 'Oct 01, 2023', amount: '$29.00', status: 'Paid' },
    { id: 'inv_003', date: 'Sep 01, 2023', amount: '$29.00', status: 'Paid' },
    { id: 'inv_004', date: 'Aug 01, 2023', amount: '$9.00', status: 'Paid' },
  ];

  // --- Actions ---

  const handleDownloadInvoice = (id: string) => {
    // Create a fake PDF blob and download it
    const element = document.createElement("a");
    const file = new Blob([`Invoice ${id}\nAmount: $29.00\nDate: 2023\nStatus: Paid`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${id}.txt`; // Simulating PDF as TXT for browser compatibility
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleUpdatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessingId('payment');
    setTimeout(() => {
        setProcessingId(null);
        setShowPaymentModal(false);
        alert("Payment method updated successfully.");
    }, 2000);
  };

  const handleUpgradePlan = (plan: string) => {
    setProcessingId(plan);
    setTimeout(() => {
        setProcessingId(null);
        setShowUpgradeModal(false);
        alert(`Successfully upgraded to ${plan} plan.`);
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-left-2 duration-300 relative">
      
      {/* --- Upgrade Modal --- */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden animate-in zoom-in-95">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900">Upgrade your Plan</h2>
                    <button onClick={() => setShowUpgradeModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-8 grid md:grid-cols-3 gap-6 bg-slate-50">
                    {/* Starter */}
                    <div className="border border-slate-200 bg-white rounded-xl p-6 opacity-60">
                        <h3 className="font-bold text-slate-900">Starter</h3>
                        <p className="text-2xl font-bold mt-2">$0<span className="text-sm font-normal text-slate-500">/mo</span></p>
                        <ul className="mt-4 space-y-2 text-sm text-slate-600">
                            <li>• 1 Instance</li>
                            <li>• Community Support</li>
                        </ul>
                        <button className="w-full mt-6 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-400 cursor-not-allowed">Current Plan (Downgrade)</button>
                    </div>
                    {/* Pro */}
                    <div className="border-2 border-indigo-600 bg-white rounded-xl p-6 relative shadow-lg transform scale-105">
                        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">CURRENT</div>
                        <h3 className="font-bold text-indigo-900">Pro</h3>
                        <p className="text-2xl font-bold mt-2 text-indigo-600">$29<span className="text-sm font-normal text-slate-500">/mo</span></p>
                        <ul className="mt-4 space-y-2 text-sm text-slate-700">
                            <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> 10 Instances</li>
                            <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Priority Support</li>
                            <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Advanced Analytics</li>
                        </ul>
                        <button disabled className="w-full mt-6 py-2 bg-slate-100 text-slate-500 rounded-lg text-sm font-bold cursor-default">Active Plan</button>
                    </div>
                    {/* Business */}
                    <div className="border border-slate-200 bg-white rounded-xl p-6 hover:border-indigo-300 transition-colors">
                        <h3 className="font-bold text-slate-900">Business</h3>
                        <p className="text-2xl font-bold mt-2">$79<span className="text-sm font-normal text-slate-500">/mo</span></p>
                        <ul className="mt-4 space-y-2 text-sm text-slate-600">
                            <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Unlimited Instances</li>
                            <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Dedicated Support</li>
                            <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Audit Logs</li>
                        </ul>
                        <button 
                            onClick={() => handleUpgradePlan('business')}
                            disabled={!!processingId}
                            className="w-full mt-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors flex justify-center gap-2"
                        >
                            {processingId === 'business' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upgrade'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* --- Payment Modal --- */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-in zoom-in-95">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-900">Update Card</h2>
                    <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6">
                    <form onSubmit={handleUpdatePayment} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Card Number</label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                                <input type="text" placeholder="0000 0000 0000 0000" className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Expiry</label>
                                <input type="text" placeholder="MM/YY" className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">CVC</label>
                                <input type="text" placeholder="123" className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" required />
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={!!processingId}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition-colors flex justify-center gap-2 mt-4"
                        >
                            {processingId === 'payment' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Card'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
      )}

      {/* 1. Usage & Plan Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Plan Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          
          <div>
            <div className="flex justify-between items-start mb-6">
                <div>
                <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Current Plan</p>
                <h2 className="text-3xl font-extrabold">Pro Plan</h2>
                </div>
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Zap className="w-6 h-6 text-white" />
                </div>
            </div>

            <div className="space-y-4">
                <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                    <span>Instance Usage</span>
                    <span>4 / 10 Active</span>
                </div>
                <div className="w-full bg-indigo-900/50 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
                </div>
                <p className="text-xs text-indigo-200">
                Next billing date: <strong>December 1, 2023</strong>
                </p>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button 
                onClick={() => setShowUpgradeModal(true)}
                className="flex-1 bg-white text-indigo-900 font-bold py-2 rounded-lg text-sm hover:bg-indigo-50 transition-colors shadow-sm"
            >
              Upgrade Plan
            </button>
            <button 
                onClick={() => setShowUpgradeModal(true)}
                className="px-3 py-2 bg-indigo-900/50 hover:bg-indigo-900/80 rounded-lg text-white transition-colors border border-indigo-500/30"
            >
              <ArrowUpRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-slate-400" /> Payment Method
            </h3>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-8 bg-white border border-slate-200 rounded flex items-center justify-center">
                <span className="font-bold text-indigo-800 italic text-xs">VISA</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">Visa ending in 4242</p>
                <p className="text-xs text-slate-500">Expires 12/2025</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>

            <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                Your card will be charged <strong>$29.00</strong> on Dec 1st.
              </p>
            </div>
          </div>

          <button 
            onClick={() => setShowPaymentModal(true)}
            className="w-full mt-6 border border-slate-300 text-slate-700 font-bold py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors"
          >
            Update Payment Method
          </button>
        </div>
      </div>

      {/* 2. Invoice History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">Invoice History</h3>
          <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Download All</button>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Invoice ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {INVOICES.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{inv.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{inv.date}</td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-700">{inv.amount}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                        onClick={() => handleDownloadInvoice(inv.id)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-slate-100"
                        title="Download Invoice"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};