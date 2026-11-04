// components/CVEDetails.tsx
import React from 'react';
import { CVEData } from '../types';
import './CVEDetails.css';

interface CVEDetailsProps {
  cve: CVEData;
}

export const CVEDetails: React.FC<CVEDetailsProps> = ({ cve }) => {
  return (
    <div className="cve-details-container">
      <div className="details-card">
        <h2>{cve.id}</h2>
        <div className="detail-section">
          <h3>Title</h3>
          <p>{cve.title}</p>
        </div>
        <div className="detail-section">
          <h3>Description</h3>
          <p>{cve.description}</p>
        </div>
        <div className="detail-row">
          <div className="detail-section">
            <h3>CVSS Score</h3>
            <p className="score">{cve.score}</p>
          </div>
          <div className="detail-section">
            <h3>Published</h3>
            <p>{new Date(cve.publishedDate).toLocaleDateString()}</p>
          </div>
        </div>
        {cve.references && cve.references.length > 0 && (
          <div className="detail-section">
            <h3>References</h3>
            <ul>
              {cve.references.map((ref, idx) => (
                <li key={idx}>
                  <a href={ref} target="_blank" rel="noopener noreferrer">
                    {ref}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CVEDetails;