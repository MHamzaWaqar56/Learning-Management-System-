// CertificateContext.jsx
import { createContext, useContext } from 'react';

const CertificateContext = createContext();

export const CertificateProvider = ({ children }) => {
  const downloadCertificate = async (certificateId) => {
    try {
      const url = `http://localhost:5000/api/v1/certificate/download/${certificateId}?t=${Date.now()}&rand=${Math.random().toString(36).substring(7)}`;

      const link = document.createElement('a');
      link.href = url;
      link.download = '';
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  return (
    <CertificateContext.Provider value={{ downloadCertificate }}>
      {children}
    </CertificateContext.Provider>
  );
};

export const useCertificate = () => {
  const context = useContext(CertificateContext);
  if (!context) {
    throw new Error('useCertificate must be used within a CertificateProvider');
  }
  return context;
};
