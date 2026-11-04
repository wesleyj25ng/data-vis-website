// components/CVEList.tsx
import React from 'react';
import { CVEData } from '../types';
import './CVEList.css';

interface CVEListProps {
  cves: CVEData[];
  vendor: string;
  severity: string;
  onCVEClick: (cve: CVEData) => void;
}

export const CVEList: React.FC<CVEListProps> = ({
  cves,
  vendor,
  severity,
  onCVEClick,
}) => {
  return (
    <div className="cve-list-container">
      <h2>
        {vendor} - {severity.toUpperCase()} CVEs
      </h2>
      <div className="cve-list">
        {cves.map((cve) => (
          <button
            key={cve['CVE ID']}
            className="cve-item"
            onClick={() => onCVEClick(cve)}
          >
            <div className="cve-id">{cve['CVE ID']}</div>
            <div className="cve-product">{cve['Product']}</div>
            <div className="cve-score">Score: {cve['CVSS Score']}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CVEList;
