/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { CertificateViewer } from './components/CertificateViewer';

type RouteState = 
  | { type: 'home' }
  | { type: 'dashboard'; workspaceId: string; tab: 'overview' | 'programs' | 'templates' | 'recipients' | 'issued' | 'branding' | 'settings' | 'emails' }
  | { type: 'credential'; id: string };

export default function App() {
  const [route, setRoute] = useState<RouteState>({ type: 'home' });

  // Handle URL hash changes for robust link routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      
      if (hash.startsWith('#credential=')) {
        const id = hash.replace('#credential=', '').trim();
        setRoute({ type: 'credential', id });
      } else if (hash.startsWith('#/dashboard') || hash.startsWith('#dashboard')) {
        const queryIndex = hash.indexOf('?');
        let wsId = 'ws-google-infra';
        let activeTab: any = 'overview';
        if (queryIndex !== -1) {
          const params = new URLSearchParams(hash.substring(queryIndex));
          wsId = params.get('workspaceId') || 'ws-google-infra';
          activeTab = params.get('tab') || 'overview';
        }
        setRoute({ type: 'dashboard', workspaceId: wsId, tab: activeTab });
      } else {
        setRoute({ type: 'home' });
      }
    };

    // Run initial parse on mount
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Direct custom screen state updates
  const navigateToHome = () => {
    window.location.hash = '';
    setRoute({ type: 'home' });
  };

  const navigateToDashboard = (workspaceId: string = 'ws-google-infra', tab: string = 'overview') => {
    window.location.hash = `#/dashboard?workspaceId=${workspaceId}&tab=${tab}`;
    setRoute({ type: 'dashboard', workspaceId, tab: tab as any });
  };

  const navigateToCredential = (id: string) => {
    window.location.hash = `#credential=${id}`;
    setRoute({ type: 'credential', id });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] transition-colors duration-200">
      {route.type === 'home' && (
        <LandingPage 
          onStartFree={() => navigateToDashboard('ws-google-infra', 'overview')}
          onViewSample={(id) => navigateToCredential(id)}
          onSelectWorkspace={(id) => navigateToDashboard(id, 'overview')}
        />
      )}

      {route.type === 'dashboard' && (
        <Dashboard 
          currentWorkspaceId={route.workspaceId}
          activeTab={route.tab}
          onTabChange={(tab) => navigateToDashboard(route.workspaceId, tab)}
          onWorkspaceChange={(id) => navigateToDashboard(id, route.tab)}
          onViewCertificatePage={(id) => navigateToCredential(id)}
        />
      )}

      {route.type === 'credential' && (
        <CertificateViewer 
          certificateId={route.id}
          onBackToHome={navigateToHome}
        />
      )}
    </div>
  );
}
