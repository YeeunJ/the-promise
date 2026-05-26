import axios from 'axios';
import type { AdminSpace, AdminSpaceWritePayload } from '../../types';

function endpoint(path = ''): string {
  return `${import.meta.env.VITE_API_BASE_URL}/api/v1/admin/spaces/${path}`;
}

function authHeaders(token: string): { Authorization: string } {
  return { Authorization: `Token ${token}` };
}

export async function listSpaces(token: string): Promise<AdminSpace[]> {
  const response = await axios.get<AdminSpace[]>(endpoint(), {
    headers: authHeaders(token),
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function createSpace(
  token: string,
  payload: AdminSpaceWritePayload,
): Promise<AdminSpace> {
  const response = await axios.post<AdminSpace>(endpoint(), payload, {
    headers: authHeaders(token),
  });
  return response.data;
}

export async function updateSpace(
  token: string,
  id: number,
  payload: Partial<AdminSpaceWritePayload>,
): Promise<AdminSpace> {
  const response = await axios.patch<AdminSpace>(
    endpoint(`${String(id)}/`),
    payload,
    {
      headers: authHeaders(token),
    },
  );
  return response.data;
}

export async function deleteSpace(token: string, id: number): Promise<void> {
  await axios.delete(endpoint(`${String(id)}/`), {
    headers: authHeaders(token),
  });
}
