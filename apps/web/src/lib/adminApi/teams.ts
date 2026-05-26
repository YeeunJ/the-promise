import axios from 'axios';
import type { AdminTeam, AdminTeamWritePayload } from '../../types';

function endpoint(path = ''): string {
  return `${import.meta.env.VITE_API_BASE_URL}/api/v1/admin/teams/${path}`;
}

function authHeaders(token: string): { Authorization: string } {
  return { Authorization: `Token ${token}` };
}

export async function listTeams(token: string): Promise<AdminTeam[]> {
  const response = await axios.get<AdminTeam[]>(endpoint(), {
    headers: authHeaders(token),
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function createTeam(
  token: string,
  payload: AdminTeamWritePayload,
): Promise<AdminTeam> {
  const response = await axios.post<AdminTeam>(endpoint(), payload, {
    headers: authHeaders(token),
  });
  return response.data;
}

export async function updateTeam(
  token: string,
  id: number,
  payload: Partial<AdminTeamWritePayload>,
): Promise<AdminTeam> {
  const response = await axios.patch<AdminTeam>(
    endpoint(`${String(id)}/`),
    payload,
    {
      headers: authHeaders(token),
    },
  );
  return response.data;
}

export async function deleteTeam(token: string, id: number): Promise<void> {
  await axios.delete(endpoint(`${String(id)}/`), {
    headers: authHeaders(token),
  });
}
