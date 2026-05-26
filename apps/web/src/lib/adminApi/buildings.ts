import axios from 'axios';
import type { AdminBuilding, AdminBuildingWritePayload } from '../../types';

function endpoint(path = ''): string {
  return `${import.meta.env.VITE_API_BASE_URL}/api/v1/admin/buildings/${path}`;
}

function authHeaders(token: string): { Authorization: string } {
  return { Authorization: `Token ${token}` };
}

export async function listBuildings(token: string): Promise<AdminBuilding[]> {
  const response = await axios.get<AdminBuilding[]>(endpoint(), {
    headers: authHeaders(token),
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function createBuilding(
  token: string,
  payload: AdminBuildingWritePayload,
): Promise<AdminBuilding> {
  const response = await axios.post<AdminBuilding>(endpoint(), payload, {
    headers: authHeaders(token),
  });
  return response.data;
}

export async function updateBuilding(
  token: string,
  id: number,
  payload: Partial<AdminBuildingWritePayload>,
): Promise<AdminBuilding> {
  const response = await axios.patch<AdminBuilding>(
    endpoint(`${String(id)}/`),
    payload,
    {
      headers: authHeaders(token),
    },
  );
  return response.data;
}

export async function deleteBuilding(token: string, id: number): Promise<void> {
  await axios.delete(endpoint(`${String(id)}/`), {
    headers: authHeaders(token),
  });
}
