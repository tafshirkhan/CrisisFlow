
import type { IncidentEvidence } from '../types/incidentReport.types';

interface EvidenceUploaderProps {
  files: IncidentEvidence[];
  error?: string;
  onAddFiles: (files: FileList | null) => void;
  onRemoveFile: (id: string) => void;
}

export default function EvidenceUploader({
  files,
  error,
  onAddFiles,
  onRemoveFile,
}: EvidenceUploaderProps) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">
          Supporting evidence
          <span className="ml-2 font-normal text-slate-500">
            (optional)
          </span>
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          Upload photos or a video that may help responders understand
          the situation.
        </p>
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white px-5 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50/40">
        <span className="mb-3 text-3xl" aria-hidden="true">
          📎
        </span>

        <span className="text-sm font-semibold text-slate-800">
          Choose photos or videos
        </span>

        <span className="mt-1 text-xs text-slate-500">
          JPEG, PNG, WebP or MP4 · Maximum 50 MB per file · Up to 5 files
        </span>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4"
          multiple
          disabled={files.length >= 5}
          onChange={(event) => {
            onAddFiles(event.currentTarget.files);

            // Allow selecting the same file again after removing it.
            event.currentTarget.value = '';
          }}
          className="sr-only"
        />
      </label>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {files.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-slate-600">
            Selected files ({files.length}/5)
          </p>

          {files.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
            >
              {item.file.type.startsWith('image/') ? (
                <img
                  src={item.previewUrl}
                  alt={`Preview of ${item.file.name}`}
                  className="h-14 w-14 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <video
                  src={item.previewUrl}
                  className="h-14 w-14 shrink-0 rounded-lg bg-slate-100 object-cover"
                  muted
                  preload="metadata"
                />
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">
                  {item.file.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>

              <button
                type="button"
                onClick={() => onRemoveFile(item.id)}
                aria-label={`Remove ${item.file.name}`}
                className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
