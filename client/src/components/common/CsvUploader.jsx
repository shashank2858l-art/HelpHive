import { motion } from 'framer-motion';
import { FileUp, X, UploadCloud } from 'lucide-react';
import Papa from 'papaparse';
import { useCallback, useState } from 'react';

const CsvUploader = ({ onUpload, onCancel, title = 'Bulk Upload CSV' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const processFile = (file) => {
    if (!file) return;
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }

    setLoading(true);
    setError('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setLoading(false);
        if (results.errors.length > 0) {
          setError(`Error parsing CSV: ${results.errors[0].message}`);
          return;
        }
        if (results.data && results.data.length > 0) {
          onUpload(results.data);
        } else {
          setError('The CSV file is empty.');
        }
      },
      error: (err) => {
        setLoading(false);
        setError(`Failed to read file: ${err.message}`);
      },
    });
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-elevated)] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--border-muted)] bg-[var(--surface-soft)] px-6 py-4">
          <h2 className="font-['Sora'] text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
          <button
            onClick={onCancel}
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors
              ${
                isDragging
                  ? 'border-cyan-500 bg-cyan-500/5'
                  : 'border-[var(--border-muted)] hover:border-[var(--text-muted)] bg-[var(--surface-soft)] aspect-video cursor-pointer'
              }
            `}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleChange}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              disabled={loading}
            />
            <div className="flex h-12 w-12 items-center justify-center gap-2 rounded-full bg-[var(--card-elevated)] text-[var(--text-muted)] shadow-md mb-4">
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="font-medium text-[var(--text-primary)]">
              {loading ? 'Processing Document...' : 'Click or drag CSV file here'}
            </p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Supports standard CSV formats with headers.
            </p>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-500 border border-rose-500/20">
              {error}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CsvUploader;
