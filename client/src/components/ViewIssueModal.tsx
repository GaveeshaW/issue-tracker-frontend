import type { EditableIssue } from "./EditIssueModal";

interface ViewIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: EditableIssue | null;
}

const statusColors: Record<
  "Open" | "In Progress" | "Resolved" | "Closed",
  string
> = {
  Open: "bg-blue-100 text-blue-700",
  "In Progress": "bg-amber-100 text-amber-700",
  Resolved: "bg-green-100 text-green-700",
  Closed: "bg-zinc-200 text-zinc-700",
};

const priorityColors: Record<
  "Low" | "Medium" | "High" | "Critical",
  string
> = {
  Low: "bg-slate-100 text-slate-700",
  Medium: "bg-indigo-100 text-indigo-700",
  High: "bg-orange-100 text-orange-700",
  Critical: "bg-rose-100 text-rose-700",
};

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-sm text-zinc-800">{value || "-"}</p>
    </div>
  );
}

function ViewIssueModal({ isOpen, onClose, issue }: ViewIssueModalProps) {
  if (!isOpen || !issue) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <h2 className="text-xl font-bold text-zinc-900">Issue Details</h2>

          <button
            onClick={onClose}
            className="text-3xl leading-none text-zinc-400 transition hover:text-zinc-600"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-5">
            <h3 className="text-xl font-semibold text-zinc-900">
              {issue.title}
            </h3>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  statusColors[issue.status]
                }`}
              >
                {issue.status}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  priorityColors[issue.priority]
                }`}
              >
                {issue.priority}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Description
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-800">
                {issue.description}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DetailRow label="Severity" value={issue.severity || "-"} />
              <DetailRow label="Created Date" value={issue.date} />
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-200 px-6 py-4">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewIssueModal;