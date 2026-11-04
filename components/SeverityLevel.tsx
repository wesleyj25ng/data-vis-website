// components/SeverityLevel.tsx
import React from 'react';
import { CVEResponse } from '../types';
import './SeverityLevel.css';

interface SeverityLevelProps {
  cveData: CVEResponse;
  onSeverityClick: (severity: string) => void;
}

export const SeverityLevel: React.FC<SeverityLevelProps> = ({
  cveData,
  onSeverityClick,
}) => {
  const severities = Object.entries(cveData);

  const getTotalCount = (severity: string) => {
    const vendors = cveData[severity as keyof CVEResponse];
    return Object.values(vendors).reduce((sum, cves) => sum + cves.length, 0);
  };

  return (
    <div className="flex justify-center items-center min-h-96">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
        {severities.map(([severity, _]) => (
          <button
            key={severity}
            className={`w-32 h-32 rounded-full flex flex-col justify-center items-center text-white font-bold transition-transform hover:scale-110 shadow-lg hover:shadow-xl ${
              severity === 'critical'
                ? 'bg-red-600'
                : severity === 'high'
                ? 'bg-orange-600'
                : severity === 'medium'
                ? 'bg-yellow-500'
                : 'bg-green-600'
            }`}
            title={`${severity}: ${getTotalCount(severity)} CVEs`}
            onClick={() => onSeverityClick(severity)}
          >
            <span className="text-lg capitalize">{severity}</span>
            <span className="text-sm mt-2">{getTotalCount(severity)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SeverityLevel;