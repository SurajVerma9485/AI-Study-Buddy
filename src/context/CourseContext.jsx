import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { courseService } from '../services/courseService';
import { MOCK_COURSES } from '../services/mockData';

const CourseContext = createContext(null);

export function CourseProvider({ children }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await courseService.getCourses();
      setCourses(data);
      if (data.length > 0 && !selectedCourseId) {
        setSelectedCourseId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load courses from API:', err);
      setError(err.message || 'Failed to load courses.');
      // Fallback so UI remains functional
      setCourses(MOCK_COURSES);
      setSelectedCourseId(MOCK_COURSES[0].id);
    } finally {
      setLoading(false);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0] || null;

  const addCourse = async (courseData) => {
    setLoading(true);
    setError(null);
    try {
      const newCourse = await courseService.createCourse(courseData);
      setCourses((prev) => [newCourse, ...prev]);
      setSelectedCourseId(newCourse.id);
      return newCourse;
    } catch (err) {
      setError(err.message || 'Failed to create course.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editCourse = async (id, courseData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await courseService.updateCourse(id, courseData);
      setCourses((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update course.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await courseService.deleteCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      if (selectedCourseId === id) {
        const remaining = courses.filter((c) => c.id !== id);
        setSelectedCourseId(remaining[0]?.id || null);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete course.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addTopic = async (courseId, topicData) => {
    try {
      const updated = await courseService.addTopic(courseId, topicData);
      setCourses((prev) => prev.map((c) => (c.id === courseId ? updated : c)));
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to add topic.');
      throw err;
    }
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        selectedCourse,
        selectedCourseId,
        setSelectedCourseId,
        loading,
        error,
        fetchCourses,
        addCourse,
        editCourse,
        deleteCourse,
        addTopic,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
}

export default CourseContext;
