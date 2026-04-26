/**
 * React Hooks for Invoice Management - Backend API Integration
 */

import { useState, useEffect, useCallback } from 'react';
import { invoiceApi, ApiError } from '@/lib/api/backend';
import { BackendInvoice } from '@/lib/types';

/**
 * Hook for listing invoices with advanced filtering
 */
export function useInvoices(params?: {
  search?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}) {
  const [invoices, setInvoices] = useState<BackendInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 20,
    current_page: 1,
    last_page: 1,
  });

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await invoiceApi.listInvoices(params);
      setInvoices(response.data);
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
        setError('Failed to fetch invoices');
      }
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const refetch = useCallback(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return {
    invoices,
    loading,
    error,
    pagination,
    refetch,
  };
}

/**
 * Hook for getting a single invoice's details
 */
export function useInvoice(invoiceId: number | null) {
  const [invoice, setInvoice] = useState<BackendInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoice = useCallback(async () => {
    if (!invoiceId) return;
    
    setLoading(true);
    setError(null);
    try {
      const invoiceData = await invoiceApi.getInvoice(invoiceId);
      setInvoice(invoiceData);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setError('Invoice not found');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to fetch invoice');
      }
      console.error('Error fetching invoice:', err);
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  return {
    invoice,
    loading,
    error,
    refetch: fetchInvoice,
    clearError: () => setError(null),
  };
}

/**
 * Hook for getting invoice by visit ID
 */
export function useInvoiceByVisit(visitId: string | null) {
  const [invoice, setInvoice] = useState<BackendInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoiceByVisit = useCallback(async () => {
    if (!visitId) return;
    
    setLoading(true);
    setError(null);
    try {
      const invoiceData = await invoiceApi.getInvoiceByVisit(visitId);
      setInvoice(invoiceData);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setError('Invoice not found for this visit');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to fetch invoice');
      }
      console.error('Error fetching invoice by visit:', err);
    } finally {
      setLoading(false);
    }
  }, [visitId]);

  useEffect(() => {
    fetchInvoiceByVisit();
  }, [fetchInvoiceByVisit]);

  return {
    invoice,
    loading,
    error,
    refetch: fetchInvoiceByVisit,
    clearError: () => setError(null),
  };
}

/**
 * Hook for invoice search (debounced)
 */
export function useInvoiceSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BackendInvoice[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const searchInvoices = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    try {
      const response = await invoiceApi.listInvoices({
        search: query,
        limit: 10, // Limit search results
      });
      setSearchResults(response.data);
    } catch (err) {
      if (err instanceof ApiError) {
        setSearchError(err.message);
      } else {
        setSearchError('Failed to search invoices');
      }
      console.error('Error searching invoices:', err);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchInvoices(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, searchInvoices]);

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

/**
 * Hook for invoice statistics
 */
export function useInvoiceStats() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    paid: 0,
    partially_paid: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await invoiceApi.listInvoices({ limit: 1000 }); // Get all for stats
      
      const total = response.total;
      const pending = response.data.filter(inv => inv.status === 'pending').length;
      const paid = response.data.filter(inv => inv.status === 'paid').length;
      const partially_paid = response.data.filter(inv => inv.status === 'partially_paid').length;
      const totalRevenue = response.data.reduce((sum, inv) => sum + inv.total_paid, 0);
      
      setStats({
        total,
        pending,
        paid,
        partially_paid,
        totalRevenue,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch invoice stats');
      }
      console.error('Error fetching invoice stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
