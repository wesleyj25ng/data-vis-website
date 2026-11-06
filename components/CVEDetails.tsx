import React from 'react';
import Image from 'next/image';
import type { CVEData } from '../types';
import './CVEDetails.css';
interface CVEDetailsProps {  cve: CVEData;}

const severityImages: Record<string, string> = {
  CRITICAL: '/images/yellow_jacket.png',
  HIGH: '/images/bee.png',
  MEDIUM: '/images/ant.png',
  LOW: '/images/ladybug.png',
};

const formatDate = (value?: string) => {
if (!value || value.toLowerCase() === 'n/a') return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
  ? value
  : date.toLocaleDateString();
  };

const formatCweTypes = (value?: string) => {  if (!value || value.toLowerCase() === 'n/a') return 'N/A';
  return value    .replace(/^\s*\[|\]\s*$/g, '')    .split(',')    .map((cwe) => cwe.trim().replace(/^['"]|['"]$/g, ''))    .filter(Boolean)    .join(', ');};


export const CVEDetails: React.FC<CVEDetailsProps> = ({ cve }) => {
const details = [
['Vendor', cve.Vendor],
['Product', cve.Product],
['Severity', cve['CVSS Severity']],
['CVSS Score', cve['CVSS Score']],
['CVE Problem Types', formatCweTypes(cve['CVE Problem Types'])],
['Assigner', cve['Assigner Short Name']],
['CNA ID', cve['CNA ID']],
['In KEV', cve['Is in KEV']],
['Date Reserved', formatDate(cve['Date Reserved'])],
['Date Published', formatDate(cve['Date Published'])],
['Description', cve['Description']]];

const image = severityImages[(cve['CVSS Severity'] ?? '').toUpperCase()];

return (
  <div className="cve-details-container">
    <div className="details-card">
      <h2>{cve['CVE ID']}</h2>

      {image && (
        <div className="cve-severity-image">
          <Image
            src={image}
            alt={`${cve['CVSS Severity']} severity`}
            fill
            sizes="256px"
            className="object-contain"
          />
        </div>
      )}

      <div className="details-grid">
        {details.map(([label, value]) => (
          <div
            className={`detail-section${label === 'Description' ? ' detail-description' : ''}`}
            key={label}
          >
            <h3>{label}</h3>
            <p>{value || 'N/A'}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);};
        
export default CVEDetails;