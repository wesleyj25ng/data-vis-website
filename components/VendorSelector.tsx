


import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { CVEResponse } from '../types';
import './VendorSelector.css';

const PAGE_SIZE = 20;

const severityImages: Record<string, string> = {
  CRITICAL: '/images/yellow_jacket_nest.png',
  HIGH: '/images/beehive.png',
  MEDIUM: '/images/anthill.png',
  LOW: '/images/grass.png',
};

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
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const severityKey = severity.toUpperCase() as keyof CVEResponse;
  const vendorData = cveData[severityKey]?.vendors ?? {};
  const image = severityImages[severity.toUpperCase()];

  const vendors = Object.entries(vendorData);
  const visibleVendors = vendors.slice(0, visibleCount);
  const hasMore = visibleCount < vendors.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [severity]);

  return (
    <div className="vendor-container">
      <h2>Vendors - {severity.toUpperCase()} Severity</h2>

      <div className="circles-grid">
        {visibleVendors.map(([vendor, cves]) => (
          <button
            key={vendor}
            className="flex flex-col items-center gap-2 p-4 rounded-lg transition-transform hover:scale-105"
            onClick={() => onVendorClick(vendor)}
            title={`${vendor}: ${cves.length} CVEs`}
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

            <span className="label">{vendor}</span>
            <span className="count">{cves.length}</span>
          </button>
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          className="show-more-button"
          onClick={() =>
            setVisibleCount((count) =>
              Math.min(count + PAGE_SIZE, vendors.length)
            )
          }
        >
          Show {Math.min(PAGE_SIZE, vendors.length - visibleCount)} more vendors
        </button>
      )}
    </div>
  );
};

export default VendorSelector;