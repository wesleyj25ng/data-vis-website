

// components/VendorSelector.tsx
import React from 'react';
import { CVEResponse } from '../types';
import './VendorSelector.css';

interface VendorSelectorProps {
  severity: string;
  onVendorClick: (vendor: string) => void;
  cveData: CVEResponse;
}

export const VendorSelector: React.FC<VendorSelectorProps> = ({
  severity,
  onVendorClick,
  cveData,
}) => {
  const severityKey = severity.toUpperCase() as keyof CVEResponse;
  const vendorData = cveData[severityKey]?.vendors ?? {};

  return (
    <div className="vendor-container">
      <h2>Vendors - {severity.toUpperCase()} Severity</h2>
      <div className="circles-grid">
        {Object.entries(vendorData).map(([vendor, cves]) => (
          <button
            key={vendor}
            className="vendor-circle"
            onClick={() => onVendorClick(vendor)}
            title={`${vendor}: ${cves.length} CVEs`}
          >
            <span className="label">{vendor}</span>
            <span className="count">{cves.length}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default VendorSelector;
