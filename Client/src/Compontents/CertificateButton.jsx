
import { useCertificate } from "../APIs/Context/CertificateContext.jsx";
import { styled } from 'styled-components';


const MinimalButton = styled.button`
  background: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  margin-top: 5px;
  width: 100%;
  cursor: pointer;
  
  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
`;


const CertificateDownloadButton = ({ certificateId }) => {
  const { downloadCertificate, loading, error } = useCertificate();

  

  const handleDownload = async () => {
    try {
      await downloadCertificate(certificateId);
      
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  return (
    <div>
      <MinimalButton 
        onClick={handleDownload} 
        disabled={loading}>
        {loading ? 'Downloading...' : 'Download Certificate'}
      </MinimalButton>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default CertificateDownloadButton;

