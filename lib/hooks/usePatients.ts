/**
 * React Hooks for Patient Management - Backend API Integration
 */

import { useState, useEffect, useCallback } from 'react';
import { patientApi, ApiError } from '@/lib/api/backend';
import { Patient, PatientVisit, CreatePatientRequest } from '@/lib/types';

/**
 * Hook for listing patients with search and filters
 */
export function usePatients(params?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 20,
    current_page: 1,
    last_page: 1,
  });

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await patientApi.listPatients(params);
      setPatients(response.data);
      setPagination({
        total: response.total,
        per_page: response.per_page,
        current_page: response.current_page,
        last_page: response.last_page,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch patients');
      }
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const refetch = useCallback(() => {
    fetchPatients();
  }, [fetchPatients]);

  return {
    patients,
    loading,
    error,
    pagination,
    refetch,
  };
}

/**
 * Hook for creating a new patient
 */
export function useCreatePatient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPatient = useCallback(async (patientData: CreatePatientRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await patientApi.createPatient(patientData);
      return response.data;
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422 && err.errors) {
          const errorMessage = Object.values(err.errors).flat().join(', ');
          setError(errorMessage);
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to create patient');
      }
      console.error('Error creating patient:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createPatient,
    loading,
    error,
    clearError: () => setError(null),
  };
}

/**
 * Hook for getting a single patient's details
 */
export function usePatient(patientId: number | null) {
  const [patient, setPatient] = useState<Patient & { visits: PatientVisit[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatient = useCallback(async () => {
    if (!patientId) return;
    
    setLoading(true);
    setError(null);
    try {
      const patientData = await patientApi.getPatient(patientId);
      setPatient(patientData);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setError('Patient not found');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to fetch patient');
      }
      console.error('Error fetching patient:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  const updatePatient = useCallback(async (updateData: Partial<CreatePatientRequest>) => {
    if (!patientId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await patientApi.updatePatient(patientId, updateData);
      // After successful update, refetch the full patient data with visits
      await fetchPatient();
      return response.data;
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422 && err.errors) {
          const errorMessage = Object.values(err.errors).flat().join(', ');
          setError(errorMessage);
        } else if (err.status === 404) {
          setError('Patient not found');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to update patient');
      }
      console.error('Error updating patient:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [patientId, fetchPatient]);

  return {
    patient,
    loading,
    error,
    refetch: fetchPatient,
    updatePatient,
    clearError: () => setError(null),
  };
}

/**
 * Hook for getting patient visit history
 */
export function usePatientVisits(patientId: number | null) {
  const [visits, setVisits] = useState<PatientVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [lastVisit, setLastVisit] = useState<string>('');

  const fetchVisits = useCallback(async () => {
    if (!patientId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await patientApi.getPatientVisits(patientId);
      setVisits(response.data);
      setTotal(response.total);
      setLastVisit(response.last_visit);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch patient visits');
      }
      console.error('Error fetching patient visits:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  return {
    visits,
    loading,
    error,
    total,
    lastVisit,
    refetch: fetchVisits,
  };
}

/**
 * Hook for patient search (debounced)
 */
export function usePatientSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const searchPatients = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    try {
      const response = await patientApi.listPatients({
        search: query,
        limit: 10, // Limit search results
      });
      setSearchResults(response.data);
    } catch (err) {
      if (err instanceof ApiError) {
        setSearchError(err.message);
      } else {
        setSearchError('Failed to search patients');
      }
      console.error('Error searching patients:', err);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchPatients(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, searchPatients]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    searchLoading,
    searchError,
    clearSearch: () => {
      setSearchQuery('');
      setSearchResults([]);
      setSearchError(null);
    },
  };
}
