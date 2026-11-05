// components/SeverityLevel.tsx
import React from 'react';
import Image from 'next/image';
import { CVEResponse } from '../types';
import './SeverityLevel.css';

const severityImages: Record<string, string> = {
  CRITICAL: '/images/critical2.png',
  HIGH: '/images/high.png',
  MEDIUM: '/images/medium.png',
  LOW: '/images/low.png',
};

interface SeverityLevelProps {
  cveData: CVEResponse;
  onSeverityClick: (severity: string) => void;
}

export const SeverityLevel: React.FC<SeverityLevelProps> = ({
  cveData,
  onSeverityClick,
}) => {
  const severities = Object.entries(cveData);

const getTotalCount = (severity: string): number => {
  const severityData = cveData[severity as keyof CVEResponse];
  return severityData?.count ?? 0;
};

  return (
    <div className="flex justify-center items-center min-h-96">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
        {severities.map(([severity]) => {
          const image = severityImages[severity.toUpperCase()];
          const count = getTotalCount(severity);

          return (
            <button
              key={severity}
              className="flex flex-col items-center gap-2 p-4 rounded-lg transition-transform hover:scale-105"
              aria-label={`${severity} severity, ${count} CVEs`}
              onClick={() => onSeverityClick(severity)}
            >
              {image && (
              <div className="relative h-64 w-64">
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="256px"
                  className="object-contain"
                />
              </div>
              )}
              <span className="text-lg font-semibold capitalize">
                {severity.toLowerCase()}
              </span>
              <span className="text-sm">{count} CVEs</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SeverityLevel;