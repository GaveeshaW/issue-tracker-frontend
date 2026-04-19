import { useEffect, useMemo, useState } from "react";
import CreateIssueModal, { IssueFormData } from "../components/CreateIssueModal";
import EditIssueModal, { EditableIssue } from "../components/EditIssueModal";
import ViewIssueModal from "../components/ViewIssueModal";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import type { RootState, AppDispatch } from "../app/store";
import {
  getIssues,
  createIssue as createIssueApi,
  updateIssue as updateIssueApi,
  deleteIssue as deleteIssueApi,
  type IssueApiResponse,
} from "../api/issues";
import toast from "react-hot-toast";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type IssueStatus = "Open" | "In Progress" | "Resolved" | "Closed";
type IssuePriority = "Low" | "Medium" | "High" | "Critical";

interface Issue extends EditableIssue {}

interface StatCardProps {
  label: string;
  value: number;
  className?: string;
}

const ITEMS_PER_PAGE = 5;

const statusColors: Record<IssueStatus, string> = {
  Open: "bg-blue-100 text-blue-700",
  "In Progress": "bg-amber-100 text-amber-700",
  Resolved: "bg-green-100 text-green-700",
  Closed: "bg-zinc-200 text-zinc-700",
};

const priorityColors: Record<IssuePriority, string> = {
  Low: "bg-slate-100 text-slate-700",
  Medium: "bg-indigo-100 text-indigo-700",
  High: "bg-orange-100 text-orange-700",
  Critical: "bg-rose-100 text-rose-700",
};

function formatIssueFromApi(issue: IssueApiResponse): Issue {
  return {
    id: issue._id,
    title: issue.title,
    description: issue.description,
    status: issue.status,
    priority: issue.priority,
    severity: issue.severity ?? "",
    date: new Date(issue.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };
}

function StatCard({ label, value, className = "" }: StatCardProps) {
  return (
    <div className={`rounded-xl border border-zinc-200 p-4 ${className}`}>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-zinc-900">{value}</p>
    </div>
  );
}

function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const [searchInput, setSearchInput] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  const [statusFilter, setStatusFilter] = useState<IssueStatus | "All">("All");
  const [priorityFilter, setPriorityFilter] = useState<IssuePriority | "All">(
    "All"
  );

  const [issues, setIssues] = useState<Issue[]>([]);
  const [loadingIssues, setLoadingIssues] = useState<boolean>(true);
  const [issuesError, setIssuesError] = useState<string>("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);

  const [selectedIssue, setSelectedIssue] = useState<EditableIssue | null>(
    null
  );

  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const fetchIssues = async () => {
    try {
      setLoadingIssues(true);
      setIssuesError("");
      const data = await getIssues();
      setIssues(data.map(formatIssueFromApi));
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to load issues.";
      setIssuesError(message);
      toast.error(message);
    } finally {
      setLoadingIssues(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesSearch =
        issue.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        issue.description
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ? true : issue.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" ? true : issue.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [issues, debouncedSearch, statusFilter, priorityFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, priorityFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredIssues.length / ITEMS_PER_PAGE)
  );

  const paginatedIssues = filteredIssues.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const stats = {
    total: issues.length,
    open: issues.filter((i) => i.status === "Open").length,
    inProgress: issues.filter((i) => i.status === "In Progress").length,
    resolved: issues.filter((i) => i.status === "Resolved").length,
    closed: issues.filter((i) => i.status === "Closed").length,
  };

  const initials =
    user?.email?.slice(0, 1)?.toUpperCase() ||
    user?.firstname?.slice(0, 1)?.toUpperCase() ||
    "U";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleCreateIssue = async (newIssue: IssueFormData) => {
    try {
      const created = await createIssueApi(newIssue);
      setIssues((prev) => [formatIssueFromApi(created), ...prev]);
      toast.success("Issue created successfully.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create issue.");
    }
  };

  const handleEditClick = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsEditModalOpen(true);
  };

  const handleViewClick = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsViewModalOpen(true);
  };

  const handleUpdateIssue = async (updatedIssue: EditableIssue) => {
    try {
      const updated = await updateIssueApi(String(updatedIssue.id), {
        title: updatedIssue.title,
        description: updatedIssue.description,
        priority: updatedIssue.priority,
        status: updatedIssue.status,
        severity: updatedIssue.severity,
      });

      const formatted = formatIssueFromApi(updated);

      setIssues((prev) =>
        prev.map((issue) => (issue.id === updatedIssue.id ? formatted : issue))
      );

      setSelectedIssue(formatted);
      toast.success("Issue updated successfully.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update issue.");
    }
  };

  const handleDeleteIssue = async (id: string | number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this issue?"
    );
    if (!confirmed) {
      toast("Delete cancelled");
      return;
    };

    try {
      await deleteIssueApi(String(id));
      setIssues((prev) => prev.filter((issue) => issue.id !== id));
      toast.success("Issue deleted successfully.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete issue.");
    }
  };

  const handleChangeIssueStatus = async (
    issue: Issue,
    newStatus: "Resolved" | "Closed"
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to mark this issue as "${newStatus}"?`
    );

    if (!confirmed){
      toast(`${newStatus} action cancelled.`);
      return;
    };

    try {
      const updated = await updateIssueApi(String(issue.id), {
        status: newStatus,
      });

      const formatted = formatIssueFromApi(updated);

      setIssues((prev) =>
        prev.map((currentIssue) =>
          currentIssue.id === issue.id ? formatted : currentIssue
        )
      );

      toast.success(`Issue marked as ${newStatus}.`);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          `Failed to mark issue as ${newStatus}.`
      );
    }
  };

  const exportIssuesToJSON = () => {
    const dataStr = JSON.stringify(filteredIssues, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "issues.json";
    link.click();

    URL.revokeObjectURL(url);
  };

  const exportIssuesToCSV = () => {
    const headers = [
      "Title",
      "Description",
      "Status",
      "Priority",
      "Severity",
      "Date",
    ];

    const rows = filteredIssues.map((issue) => [
      `"${issue.title.replace(/"/g, '""')}"`,
      `"${issue.description.replace(/"/g, '""')}"`,
      `"${issue.status}"`,
      `"${issue.priority}"`,
      `"${issue.severity}"`,
      `"${issue.date}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
      "\n"
    );

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "issues.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedIssue(null);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedIssue(null);
  };

  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">
              Issue Management
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Track and manage your project issues efficiently.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + New Issue
            </button>

            <div className="relative">
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white"
              >
                {initials}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-36 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg">
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-700 hover:bg-red-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Open" value={stats.open} className="bg-blue-50" />
          <StatCard
            label="In Progress"
            value={stats.inProgress}
            className="bg-amber-50"
          />
          <StatCard
            label="Resolved"
            value={stats.resolved}
            className="bg-green-50"
          />
          <StatCard label="Closed" value={stats.closed} className="bg-zinc-50" />
        </div>

        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">
              Filter & Search
            </h2>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={exportIssuesToCSV}
                disabled={filteredIssues.length === 0}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Export CSV
              </button>

              <button
                onClick={exportIssuesToJSON}
                disabled={filteredIssues.length === 0}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Export JSON
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Search
              </label>
              <input
                type="text"
                placeholder="Search issues by title or description..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as IssueStatus | "All")
                }
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Priority
              </label>
              <select
                value={priorityFilter}
                onChange={(e) =>
                  setPriorityFilter(e.target.value as IssuePriority | "All")
                }
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
              >
                <option value="All">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">
            Issues ({filteredIssues.length} total)
          </h2>

          {!loadingIssues && filteredIssues.length > 0 && (
            <p className="text-sm text-zinc-500">
              Page {currentPage} of {totalPages}
            </p>
          )}
        </div>

        {loadingIssues ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-10 shadow-sm">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />
              <p className="mt-4 text-sm text-zinc-500">Loading issues...</p>
            </div>
          </div>
        ) : issuesError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600 shadow-sm">
            {issuesError}
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-10 shadow-sm">
            <div className="text-center">
              <p className="text-lg font-semibold text-zinc-900">
                No issues found
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Try changing your search or filters, or create a new issue.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                + Create Issue
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-zinc-900">
                        {issue.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm text-zinc-600">
                        {issue.description}
                      </p>
                      <p className="mt-3 text-xs text-zinc-400">{issue.date}</p>
                    </div>

                    <div className="flex items-center gap-2">
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

                  <div className="mt-4 flex flex-wrap justify-end gap-4">
                    <button
                      onClick={() => handleViewClick(issue)}
                      className="text-sm font-medium text-zinc-700 hover:underline"
                    >
                      View
                    </button>

                    {issue.status !== "Resolved" && issue.status !== "Closed" && (
                      <button
                        onClick={() =>
                          handleChangeIssueStatus(issue, "Resolved")
                        }
                        className="text-sm font-medium text-green-600 hover:underline"
                      >
                        Mark Resolved
                      </button>
                    )}

                    {issue.status !== "Closed" && (
                      <button
                        onClick={() => handleChangeIssueStatus(issue, "Closed")}
                        className="text-sm font-medium text-zinc-700 hover:underline"
                      >
                        Close
                      </button>
                    )}

                    <button
                      onClick={() => handleEditClick(issue)}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDeleteIssue(issue.id)}
                      className="text-sm font-medium text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) {
                            setCurrentPage((prev) => prev - 1);
                          }
                        }}
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, index) => index + 1)
                      .filter((page) => {
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, index, filteredPages) => {
                        const prevPage = filteredPages[index - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;

                        return (
                          <div key={page} className="flex items-center">
                            {showEllipsis && (
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                            )}

                            <PaginationItem>
                              <PaginationLink
                                href="#"
                                isActive={currentPage === page}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(page);
                                }}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          </div>
                        );
                      })}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) {
                            setCurrentPage((prev) => prev + 1);
                          }
                        }}
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>

      <CreateIssueModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateIssue={handleCreateIssue}
      />

      <EditIssueModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        issue={selectedIssue}
        onUpdateIssue={handleUpdateIssue}
      />

      <ViewIssueModal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        issue={selectedIssue}
      />
    </div>
  );
}

export default Dashboard;