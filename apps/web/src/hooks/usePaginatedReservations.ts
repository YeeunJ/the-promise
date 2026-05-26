import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import type { PaginatedResponse, Reservation, ReservationStatus } from '../types';

export interface PaginatedReservationsFilters {
  from_date?: string;
  to_date?: string;
  space_id?: number;
  building_id?: number;
  search?: string;
  ordering?: string;
  status?: ReservationStatus;
}

interface PublicCredentials {
  name: string;
  phone: string;
}

interface UsePaginatedReservationsParams {
  endpoint: string;
  authToken?: string;
  publicCredentials?: PublicCredentials;
  filters: PaginatedReservationsFilters;
  page: number;
  pageSize: number;
  enabled?: boolean;
}

interface UsePaginatedReservationsResult {
  results: Reservation[];
  count: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function buildParams(
  filters: PaginatedReservationsFilters,
  publicCredentials: PublicCredentials | undefined,
  page: number,
  pageSize: number,
): Record<string, string | number> {
  const params: Record<string, string | number> = { page, page_size: pageSize };

  if (publicCredentials) {
    params.name = publicCredentials.name;
    params.phone = publicCredentials.phone;
  }

  if (filters.from_date) params.from_date = filters.from_date;
  if (filters.to_date) params.to_date = filters.to_date;
  if (typeof filters.space_id === 'number') params.space_id = filters.space_id;
  if (typeof filters.building_id === 'number') params.building_id = filters.building_id;
  if (typeof filters.search === 'string') {
    const trimmed = filters.search.trim();
    if (trimmed) params.search = trimmed;
  }
  if (filters.ordering) params.ordering = filters.ordering;
  if (filters.status) params.status = filters.status;

  return params;
}

export function usePaginatedReservations(
  params: UsePaginatedReservationsParams,
): UsePaginatedReservationsResult {
  const {
    endpoint,
    authToken,
    publicCredentials,
    filters,
    page,
    pageSize,
    enabled = true,
  } = params;

  const [results, setResults] = useState<Reservation[]>([]);
  const [count, setCount] = useState(0);
  const [responsePage, setResponsePage] = useState(page);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtersKey = JSON.stringify(filters);
  const credentialsKey = publicCredentials
    ? `${publicCredentials.name}|${publicCredentials.phone}`
    : '';
  const abortRef = useRef<AbortController | null>(null);

  const doFetch = useCallback(async (): Promise<void> => {
    if (!enabled) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {};
      if (authToken) headers.Authorization = `Token ${authToken}`;

      const requestParams = buildParams(filters, publicCredentials, page, pageSize);

      const response = await axios.get<PaginatedResponse<Reservation>>(endpoint, {
        headers,
        params: requestParams,
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;

      setResults(response.data.results);
      setCount(response.data.count);
      setResponsePage(response.data.page);
      setTotalPages(response.data.total_pages);
    } catch (err: unknown) {
      if (controller.signal.aborted || axios.isCancel(err)) return;
      setError('예약 목록을 불러오는 데 실패했습니다.');
      setResults([]);
    } finally {
      if (abortRef.current === controller) {
        setIsLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, authToken, credentialsKey, filtersKey, page, pageSize, enabled]);

  useEffect(() => {
    void doFetch();
    return () => {
      abortRef.current?.abort();
    };
  }, [doFetch]);

  return {
    results,
    count,
    page: responsePage,
    totalPages,
    isLoading,
    error,
    refetch: doFetch,
  };
}
