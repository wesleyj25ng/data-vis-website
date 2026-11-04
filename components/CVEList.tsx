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
            key={cve.id}
            className="cve-item"
            onClick={() => onCVEClick(cve)}
          >
            <div className="cve-id">{cve.id}</div>
            <div className="cve-title">{cve.title}</div>
            <div className="cve-score">Score: {cve.score}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CVEList;
