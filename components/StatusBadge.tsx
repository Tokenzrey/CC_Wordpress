import React from 'react';
import { InstanceStatus } from '../types';
import { CheckCircle2, AlertCircle, Loader2, StopCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: InstanceStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'running':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Running
        </span>
      );
    case 'stopped':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          <StopCircle className="w-3.5 h-3.5" />
          Stopped
        </span>
      );
    case 'provisioning':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Provisioning
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
          <AlertCircle className="w-3.5 h-3.5" />
          Unknown
        </span>
      );
  }
};