'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import {
  TransformComponent,
  TransformWrapper,
  useControls,
} from 'react-zoom-pan-pinch';
import { CVEData } from '../types';
import './CVEYearMap.css';

const severityImages: Record<string, string> = {
  CRITICAL: '/images/yellow_jacket.png',
  HIGH: '/images/bee.png',
  MEDIUM: '/images/ant.png',
  LOW: '/images/ladybug.png',
};

interface CVEYearMapProps {
  cves: CVEData[];
  severity: string;
  onCVEClick: (cve: CVEData) => void;
}

function ZoomControls() {
  const { zoomIn, zoomOut, resetTransform } = useControls();

  return (
    <div className="cve-map-controls">
      <button type="button" onClick={() => zoomIn()} aria-label="Zoom in">
        +
      </button>
      <button type="button" onClick={() => zoomOut()} aria-label="Zoom out">
        −
      </button>
      <button type="button" onClick={() => resetTransform()}>
        Reset
      </button>
    </div>
  );
}

export default function CVEYearMap({
  cves,
  severity,
  onCVEClick,
}: CVEYearMapProps) {
  const image = severityImages[severity.toUpperCase()];
  const yearGroups = useMemo(() => {
    const groups = new Map<string, CVEData[]>();

    for (const cve of cves) {
      const match = String(cve['CVE ID']).match(/^CVE-(\d{4})-/i);
      const year = match?.[1] ?? 'Unknown year';
      const group = groups.get(year) ?? [];
      group.push(cve);
      groups.set(year, group);
    }

    return [...groups.entries()].sort(([a], [b]) => {
      if (a === 'Unknown year') return 1;
      if (b === 'Unknown year') return -1;
      return Number(b) - Number(a);
    });
  }, [cves]);

  return (
    <div className="cve-map">
      <TransformWrapper
        initialScale={0.8}
        initialPositionY={0}
        minScale={0.4}
        maxScale={4}
        limitToBounds
        centerZoomedOut
      >
        <ZoomControls />

        <TransformComponent
          wrapperClass="cve-map-viewport"
          contentClass="cve-map-content"
        >
          <div className="cve-map-world">
            {yearGroups.map(([year, yearCves]) => (
              <section className="cve-year-cluster" key={year}>
                <h3 className="cve-year-heading">
                  {year} <span>({yearCves.length})</span>
                </h3>

                <div className="cve-year-icons">
                  {yearCves.map((cve) => {
                    const id = String(cve['CVE ID']);

                    return (
                      <button
                        type="button"
                        className="cve-map-icon"
                        key={id}
                        onClick={() => onCVEClick(cve)}
                        aria-label={`Open details for ${id}`}
                      >
                        <Image
                          src={image}
                          alt={id}
                          width={48}
                          height={48}
                          className="cve-map-png"
                        />

                        <span className="cve-map-tooltip" role="tooltip">
                          <strong>{id}</strong>
                          <span>{cve['Product'] || 'Product not specified'}</span>
                          <span>CVSS score: {cve['CVSS Score'] ?? 'N/A'}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
