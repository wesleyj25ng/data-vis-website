// components/CVEList.tsx
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { CVEData } from '../types';
import './CVEList.css';

const severityImages: Record<string, string> = {
  CRITICAL: '/images/yellow_jacket.png',
  HIGH: '/images/bee.png',
  MEDIUM: '/images/ant.png',
  LOW: '/images/ladybug.png',
};

const PAGE_SIZE = 20;

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
const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
const image = severityImages[severity.toUpperCase()];

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [vendor, severity]);

  const visibleCves = cves.slice(0, visibleCount);
  const hasMore = visibleCount < cves.length;

  return (
    <div className="cve-list-container">
      <h2>
        {vendor} - {severity.toUpperCase()} CVEs
      </h2>
      <div className="cve-list">
      {visibleCves.map((cve) => (
     
          <button
            key={cve['CVE ID']}
            className="cve-item"
            onClick={() => onCVEClick(cve)}
          >
          {image && (
              <div className="relative h-32 w-32">
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="128px"
                  className="object-contain"
                />
              </div>
              )}
            <div className="cve-id">{cve['CVE ID']}</div>
            <div className="cve-product">{cve['Product']}</div>
            <div className="cve-score">Score: {cve['CVSS Score']}</div>
          </button>
        ))}
      </div>
      {hasMore && (
        <button
          type="button"
          className="show-more-button"
          onClick={() =>
            setVisibleCount((count) => Math.min(count + PAGE_SIZE, cves.length))
          }
        >
          Show {Math.min(PAGE_SIZE, cves.length - visibleCount)} more
        </button>
      )}
    </div>
  );
};

export default CVEList;

