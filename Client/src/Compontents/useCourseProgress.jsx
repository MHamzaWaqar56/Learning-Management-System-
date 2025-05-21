

import { useState, useEffect, useCallback } from 'react';
import progressApi from '../APIs/ProgressApi';

const useCourseProgress = (courseId) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  const fetchProgress = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await progressApi.getCourseProgress(courseId, token);
      if (result.success) {
        setProgress(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to load progress');
    } finally {
      setLoading(false);
    }
  }, [courseId, token]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return { progress, loading, error, refetch: fetchProgress };
};

export default useCourseProgress;
