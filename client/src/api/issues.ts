import api from "./axios";
import type { IssueFormData } from "../components/CreateIssueModal";
import type { EditableIssue } from "../components/EditIssueModal";

export interface IssueApiResponse {
  _id: string;
  title: string;
  description: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  priority: "Low" | "Medium" | "High" | "Critical";
  severity: string;
  createdAt: string;
  updatedAt: string;
}

export const getIssues = async (): Promise<IssueApiResponse[]> => {
  const res = await api.get<IssueApiResponse[]>("/issues");
  return res.data;
};

export const createIssue = async (
  data: IssueFormData
): Promise<IssueApiResponse> => {
  const res = await api.post<IssueApiResponse>("/issues", data);
  return res.data;
};

export const updateIssue = async (
  id: string,
  data: Partial<EditableIssue>
): Promise<IssueApiResponse> => {
  const res = await api.put<IssueApiResponse>(`/issues/${id}`, data);
  return res.data;
};

export const deleteIssue = async (
  id: string
): Promise<{ message: string }> => {
  const res = await api.delete<{ message: string }>(`/issues/${id}`);
  return res.data;
};