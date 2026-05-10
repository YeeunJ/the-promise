import { useEffect, useState } from 'react';
import type { ApiDepartment } from '../types';

interface UseDepartmentsResult {
  departments: ApiDepartment[];
  isLoading: boolean;
  error: string | null;
}

let cachedDepartments: ApiDepartment[] | null = null;

export function useDepartments(): UseDepartmentsResult {
  const [departments, setDepartments] = useState<ApiDepartment[]>(cachedDepartments ?? []);
  const [isLoading, setIsLoading] = useState(cachedDepartments === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedDepartments !== null) {
      setDepartments(cachedDepartments);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/departments/`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: unknown) => {
        const list = Array.isArray(data) ? (data as ApiDepartment[]) : [];
        cachedDepartments = list;
        setDepartments(list);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError('부서 정보를 불러오지 못했습니다');
        setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { departments, isLoading, error };
}
