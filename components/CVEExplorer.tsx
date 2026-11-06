import React, { useState, useMemo } from 'react';
import cveDataJson from '../data/grouped-cves.json';
import { CVEResponse, CVEData } from '../types';
import SeverityLevel from './SeverityLevel';
import VendorSelector from './VendorSelector';
import CVEYearMap from './CVEYearMap'
import CVEDetails from './CVEDetails';
import './CVEExplorer.css';

const cveData = cveDataJson as CVEResponse;
type NavigationLevel = 'severity' | 'vendor' | 'cveList' | 'details';

interface NavigationState {
  level: NavigationLevel;
  selectedSeverity?: string;
  selectedVendor?: string;
  selectedCVE?: CVEData;
}

export const CVEExplorer: React.FC = () => {
  const [navigation, setNavigation] = useState<NavigationState>({
    level: 'severity',
  });

  // Memoized calculations for vendors and filtered CVEs
  const vendors = useMemo(() => {
    if (!navigation.selectedSeverity) return [];
    return Object.keys(cveData[navigation.selectedSeverity as keyof CVEResponse] || {});
  }, [navigation.selectedSeverity, cveData]);

  const cves =
  navigation.selectedSeverity && navigation.selectedVendor
    ? cveData[
        navigation.selectedSeverity.toUpperCase() as keyof CVEResponse
      ]?.vendors?.[navigation.selectedVendor] ?? []
    : [];

  // Navigation handlers
  const handleSeverityClick = (severity: string) => {
    setNavigation({
      level: 'vendor',
      selectedSeverity: severity,
    });
  };

  const handleVendorClick = (vendor: string) => {
    setNavigation({
      level: 'cveList',
      selectedSeverity: navigation.selectedSeverity,
      selectedVendor: vendor,
    });
  };

  const handleCVEClick = (cve: CVEData) => {
    setNavigation({
      level: 'details',
      selectedSeverity: navigation.selectedSeverity,
      selectedVendor: navigation.selectedVendor,
      selectedCVE: cve,
    });
  };

  const handleBack = () => {
    switch (navigation.level) {
      case 'vendor':
        setNavigation({ level: 'severity' });
        break;
      case 'cveList':
        setNavigation({
          level: 'vendor',
          selectedSeverity: navigation.selectedSeverity,
        });
        break;
      case 'details':
        setNavigation({
          level: 'cveList',
          selectedSeverity: navigation.selectedSeverity,
          selectedVendor: navigation.selectedVendor,
        });
        break;
      default:
        break;
    }
  };

return (
    <div className="cve-explorer">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">CVE Vulnerability Explorer</h1>
        {navigation.level !== 'severity' && (
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={handleBack}
          >
            ← Back
          </button>
        )}
      </div>

      <div className="content">
        {navigation.level === 'severity' && (
          <SeverityLevel
            cveData={cveData}
            onSeverityClick={handleSeverityClick}
          />
        )}

        {navigation.level === 'vendor' && navigation.selectedSeverity && (
          <VendorSelector
            severity={navigation.selectedSeverity}
            vendors={vendors}
            onVendorClick={handleVendorClick}
            cveData={cveData}
          />
        )}

        {navigation.level === 'cveList' && (
          <CVEYearMap
            cves={cves}
            severity={navigation.selectedSeverity || ''}
            onCVEClick={handleCVEClick}
          />
        )}

        {navigation.level === 'details' && navigation.selectedCVE && (
          <CVEDetails cve={navigation.selectedCVE} />
        )}
      </div>
    </div>
  );
};
