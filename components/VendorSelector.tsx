// components/VendorSelector.tsx
import React, { useMemo } from 'react';
import { CVEResponse } from '../types';
import './VendorSelector.css';

interface VendorSelectorProps {
  severity: string;
  vendors: string[];
  onVendorClick: (vendor: string) => void;
  cveData: CVEResponse;
}

export const VendorSelector: React.FC<VendorSelectorProps> = ({
  severity,
  vendors,
  onVendorClick,
  cveData,
}) => {
  const vendorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const vendorData = cveData[severity as keyof CVEResponse];
    Object.entries(vendorData).forEach(([vendor, cves]) => {
      counts[vendor] = cves.length;
    });
    return counts;
  }, [severity, cveData]);

  return (
    <div className="vendor-container">
      <h2>Vendors - {severity.toUpperCase()} Severity</h2>
      <div className="circles-grid">
        {vendors.map((vendor) => (
          <button
            key={vendor}
            className="vendor-circle"
            onClick={() => onVendorClick(vendor)}
            title={`${vendor}: ${vendorCounts[vendor] || 0} CVEs`}
          >
            <span className="label">{vendor}</span>
            <span className="count">{vendorCounts[vendor]}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default VendorSelector;
