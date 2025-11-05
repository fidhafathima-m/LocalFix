import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useBreadcrumb = () => {
  const location = useLocation();
  const [breadcrumb, setBreadcrumb] = useState({
    serviceName: '',
    technicianName: ''
  });

  useEffect(() => {
    // Update breadcrumb from location state
    if (location.state) {
      setBreadcrumb(prev => ({
        serviceName: location.state.serviceName || prev.serviceName,
        technicianName: location.state.technicianName || prev.technicianName
      }));
    }
  }, [location.state]);

  const updateBreadcrumb = (updates: Partial<typeof breadcrumb>) => {
    setBreadcrumb(prev => ({ ...prev, ...updates }));
  };

  return {
    breadcrumb,
    updateBreadcrumb
  };
};