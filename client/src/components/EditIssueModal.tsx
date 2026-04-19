import { useEffect, useState, ChangeEvent, FormEvent } from "react";

export type IssuePriority = "Low" | "Medium" | "High" | "Critical";
export type IssueStatus = "Open" | "In Progress" | "Resolved" | "Closed";

export interface IssueFormData {
  title: string;
  description: string;
  priority: IssuePriority;
  status: IssueStatus;
  severity: string;
}

export interface EditableIssue extends IssueFormData {
  id: number | string;
  date: string;
}

interface EditIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: EditableIssue | null;
  onUpdateIssue: (updatedIssue: EditableIssue) => void;
}

function EditIssueModal({
  isOpen,
  onClose,
  issue,
  onUpdateIssue,
}: EditIssueModalProps) {
  const [formData, setFormData] = useState<IssueFormData>({
    title: "",
    description: "",
    priority: "Medium",
    status: "Open",
    severity: "",
  });

  useEffect(() => {
    if (issue) {
      setFormData({
        title: issue.title,
        description: issue.description,
        priority: issue.priority,
        status: issue.status,
        severity: issue.severity,
      });
    }
  }, [issue]);

  if (!isOpen || !issue) return null;

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    onUpdateIssue({
      ...issue,
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      severity: formData.severity.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <h2 className="text-xl font-bold text-zinc-900">Edit Issue</h2>

          <button
            onClick={onClose}
            className="text-3xl leading-none text-zinc-400 transition hover:text-zinc-600"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Issue title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  placeholder="Detailed description of the issue"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full resize-none rounded-xl border border-zinc-300 px-4 py-3 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-700">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-700">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700">
                  Severity (Optional)
                </label>
                <input
                  type="text"
                  name="severity"
                  placeholder="e.g., Low, Medium, High"
                  value={formData.severity}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-200 px-6 py-4">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-zinc-300 px-5 py-2.5 text-base font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-base font-semibold text-white transition hover:bg-blue-700"
              >
                Update Issue
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditIssueModal;