import React from 'react';
import useCompleteLesson from '../Compontents/useCompleteLesson';

const LessonCompleteButton = ({ courseId, lessonId , onComplete}) => {
  const { markLessonComplete, loading, error } = useCompleteLesson();

  const handleComplete = async () => {
    try {
      const result = await markLessonComplete(courseId, lessonId);
      
      console.log('Lesson completed!', result);
      alert(`Progress: ${result.progress.completionPercentage}% complete`);

      if (onComplete) {
        onComplete(); // ✅ Refresh progress on completion
      }
      
      // Update your UI state here
    } catch (err) {
      console.error('Completion failed:', err);
    }
  };

  return (
    <div>
      <button 
        onClick={handleComplete}
        disabled={loading}
        className="complete-button"
      >
        {loading ? 'Marking...' : 'Mark as Complete'}
      </button>
      
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default LessonCompleteButton;


