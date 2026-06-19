import { useState, useRef } from 'react';
import { api } from '../api';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function DataImport() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ testCases: number, tasks: number } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    setSuccess(null);
    
    // Check if it's an Excel file
    if (!selectedFile.name.toLowerCase().endsWith('.xlsx')) {
      setError('Please upload a valid Excel (.xlsx) file. PDFs and other formats are not supported for automated data extraction.');
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await api.uploadFile('Import/excel', file);
      setSuccess({
        testCases: response.testCasesAdded || 0,
        tasks: response.tasksAdded || 0
      });
      setFile(null); // clear after success
    } catch (err: any) {
      setError(err.message || 'Failed to upload and process file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="content-header">
        <div>
          <h1>Data Import</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Upload Excel sheets to automatically import test cases and task checklists.</p>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ 
              width: '64px', height: '64px', borderRadius: '16px', 
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(168, 85, 247, 0.2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
              color: 'var(--accent-cyan)'
            }}>
              <FileSpreadsheet size={32} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Automated Excel Importer</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              The system will scan the "Test Items Tracker" sheet and automatically extract all rows assigned to "Manjunath".
            </p>
          </div>

          {/* Upload Area */}
          <div 
            style={{ 
              border: `2px dashed ${isDragging ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
              borderRadius: '12px',
              padding: '3rem 2rem',
              textAlign: 'center',
              backgroundColor: isDragging ? 'rgba(6, 182, 212, 0.05)' : 'var(--bg-input)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              marginBottom: '1.5rem'
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileChange}
            />
            
            <UploadCloud size={48} style={{ color: isDragging ? 'var(--accent-cyan)' : 'var(--text-muted)', marginBottom: '1rem', transition: 'color 0.2s ease' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              {isDragging ? 'Drop file here' : 'Select an Excel file to upload'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              or drag and drop it here. Only .xlsx files are supported.
            </p>
          </div>

          {/* Selected File Indicator */}
          {file && !success && (
            <div style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1rem', backgroundColor: 'rgba(6, 182, 212, 0.1)', border: '1px solid var(--accent-cyan)',
              borderRadius: '8px', marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FileSpreadsheet size={20} style={{ color: 'var(--accent-cyan)' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{file.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{(file.size / 1024).toFixed(1)} KB</div>
                </div>
              </div>
              <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); handleUpload(); }} disabled={uploading}>
                {uploading ? <><RefreshCw size={16} className="spinner" /> Processing...</> : 'Import Data'}
              </button>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="animate-slideUp" style={{ 
              padding: '1.5rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-emerald)',
              borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center'
            }}>
              <CheckCircle2 size={36} style={{ color: 'var(--accent-emerald)', margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Import Successful!</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>The system successfully processed the file and updated the database.</p>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{success.testCases}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Test Cases Added</div>
                </div>
                <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-purple)' }}>{success.tasks}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tasks Added</div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="animate-slideUp" style={{ 
              display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
              padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-rose)',
              borderRadius: '8px', marginBottom: '1.5rem'
            }}>
              <AlertCircle size={20} style={{ color: 'var(--accent-rose)', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Warning Note */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <AlertCircle size={18} style={{ color: 'var(--accent-amber, #f59e0b)', flexShrink: 0 }} />
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <strong>Note:</strong> PDF uploads are disabled. Extracting accurate tabular data from PDFs is highly prone to errors and data loss. Please stick to uploading structured Excel files to guarantee database integrity.
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
