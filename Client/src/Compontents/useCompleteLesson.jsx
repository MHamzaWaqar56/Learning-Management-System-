// hooks/useCompleteLesson.js
import { useState } from 'react';
import progressApi from '../APIs/ProgressApi';

const useCompleteLesson = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const markLessonComplete = async (courseId, lessonId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await progressApi.completeLesson(courseId, lessonId);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { markLessonComplete, loading, error };
};

export default useCompleteLesson;


