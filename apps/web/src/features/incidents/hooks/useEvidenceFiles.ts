
import { useEffect, useState, useRef } from 'react';
import type { IncidentEvidence } from '../types/incidentReport.types';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
]);

export function useEvidenceFiles() {
  const [files, setFiles] = useState<IncidentEvidence[]>([]);
  const [error, setError] = useState<string | null>(null);

  const filesRef = useRef<IncidentEvidence[]>([])


  useEffect(() => {
    filesRef.current = files;
    }, [files]);

    useEffect(() => {
    return () => {
        filesRef.current.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
        });
    };
    }, []);

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;

    setError(null);

    const selected = Array.from(fileList);
    const availableSlots = MAX_FILES - files.length;

    if (availableSlots <= 0) {
      setError(`You can upload a maximum of ${MAX_FILES} files, select your files.`);
      return;
    }

    if (selected.length > availableSlots) {
      setError(`You can upload a maximum of ${MAX_FILES} files.`);
    }

    const accepted: IncidentEvidence[] = [];

    for (const file of selected.slice(0, availableSlots)) {
      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        setError('Only JPEG, PNG, WebP and MP4 files are supported.');
        continue;
      }

      if (file.size === 0 || file.size > MAX_FILE_SIZE) {
        setError('Each file must be non-empty and no larger than 50 MB.');
        continue;
      }

      accepted.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    setFiles((current) => [...current, ...accepted]);
  }

  function removeFile(id: string) {
    setFiles((current) => {
      const removed = current.find((item) => item.id === id);

      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
      }

      return current.filter((item) => item.id !== id);
    });
  }

  function clearFiles() {
    setFiles((current) => {
      current.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
      });

      return [];
    });

    setError(null);
  }

  return {
    files,
    error,
    addFiles,
    removeFile,
    clearFiles,
  };
}
