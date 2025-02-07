import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAsync } from '../useAsync';

describe('useAsync', () => {
  it('should handle successful async operation', async () => {
    const mockData = { id: 1, name: 'Test' };
    const asyncFunction = vi.fn().mockResolvedValue(mockData);
    
    const { result } = renderHook(() => useAsync(asyncFunction));
    
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    
    await act(async () => {
      await result.current.execute();
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('should handle async operation error', async () => {
    const error = new Error('Test error');
    const asyncFunction = vi.fn().mockRejectedValue(error);
    
    const { result } = renderHook(() => useAsync(asyncFunction));
    
    await act(async () => {
      await result.current.execute();
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(error);
  });

  it('should reset state', async () => {
    const mockData = { id: 1, name: 'Test' };
    const asyncFunction = vi.fn().mockResolvedValue(mockData);
    
    const { result } = renderHook(() => useAsync(asyncFunction));
    
    await act(async () => {
      await result.current.execute();
    });
    
    expect(result.current.data).toEqual(mockData);
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
