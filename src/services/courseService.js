import apiClient from './api';
import { MOCK_COURSES } from './mockData';

const ENABLE_MOCK_FALLBACK = import.meta.env.VITE_ENABLE_MOCK_FALLBACK === 'true';

// Local storage key for fallback persistence during offline/mock dev
const LOCAL_COURSES_KEY = 'study_buddy_courses_data';

const getLocalCourses = () => {
  try {
    const saved = localStorage.getItem(LOCAL_COURSES_KEY);
    return saved ? JSON.parse(saved) : MOCK_COURSES;
  } catch {
    return MOCK_COURSES;
  }
};

const setLocalCourses = (courses) => {
  try {
    localStorage.setItem(LOCAL_COURSES_KEY, JSON.stringify(courses));
  } catch (err) {
    console.error('Failed to save courses locally', err);
  }
};

/**
 * Course Service
 * Communicates with backend endpoints:
 * - GET /api/v1/courses
 * - GET /api/v1/courses/:id
 * - POST /api/v1/courses
 * - PUT /api/v1/courses/:id
 * - DELETE /api/v1/courses/:id
 */
export const courseService = {
  /**
   * Fetch all courses for the authenticated student
   */
  async getCourses() {
    try {
      const response = await apiClient.get('/courses');
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_FALLBACK && (!error.response || error.code === 'ERR_NETWORK')) {
        await new Promise((r) => setTimeout(r, 300));
        return getLocalCourses();
      }
      const msg = error.response?.data?.message || error.message || 'Failed to fetch courses.';
      throw new Error(msg);
    }
  },

  /**
   * Fetch a single course by ID
   */
  async getCourseById(id) {
    try {
      const response = await apiClient.get(`/courses/${id}`);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_FALLBACK && (!error.response || error.code === 'ERR_NETWORK')) {
        await new Promise((r) => setTimeout(r, 200));
        const courses = getLocalCourses();
        const found = courses.find((c) => c.id === id);
        if (!found) throw new Error('Course not found.');
        return found;
      }
      const msg = error.response?.data?.message || error.message || 'Failed to fetch course details.';
      throw new Error(msg);
    }
  },

  /**
   * Create a new course
   */
  async createCourse(courseData) {
    try {
      const response = await apiClient.post('/courses', courseData);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_FALLBACK && (!error.response || error.code === 'ERR_NETWORK')) {
        await new Promise((r) => setTimeout(r, 400));
        const courses = getLocalCourses();
        const newCourse = {
          id: `course-${Date.now()}`,
          code: courseData.code || 'CS ' + (courses.length + 1) * 100,
          name: courseData.name,
          description: courseData.description || 'Comprehensive course syllabus and lecture notes.',
          examDate: courseData.examDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          color: courseData.color || '#6366f1',
          progress: 0,
          documentsCount: 0,
          topicsCount: 1,
          lastStudied: 'Just created',
          topics: [
            {
              id: `top-${Date.now()}-1`,
              title: 'Module 1: Foundations & Core Concepts',
              order: 1,
              mastery: 0,
              status: 'weak',
              summary: 'Initial topic overview and introductory learning objectives.',
              subtopics: ['Core Definitions', 'Syllabus Breakdown'],
            },
          ],
        };
        const updated = [newCourse, ...courses];
        setLocalCourses(updated);
        return newCourse;
      }
      const msg = error.response?.data?.message || error.message || 'Failed to create course.';
      throw new Error(msg);
    }
  },

  /**
   * Update an existing course
   */
  async updateCourse(id, courseData) {
    try {
      const response = await apiClient.put(`/courses/${id}`, courseData);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_FALLBACK && (!error.response || error.code === 'ERR_NETWORK')) {
        await new Promise((r) => setTimeout(r, 300));
        const courses = getLocalCourses();
        const updated = courses.map((c) => (c.id === id ? { ...c, ...courseData } : c));
        setLocalCourses(updated);
        return updated.find((c) => c.id === id);
      }
      const msg = error.response?.data?.message || error.message || 'Failed to update course.';
      throw new Error(msg);
    }
  },

  /**
   * Delete a course
   */
  async deleteCourse(id) {
    try {
      const response = await apiClient.delete(`/courses/${id}`);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_FALLBACK && (!error.response || error.code === 'ERR_NETWORK')) {
        await new Promise((r) => setTimeout(r, 300));
        const courses = getLocalCourses();
        const updated = courses.filter((c) => c.id !== id);
        setLocalCourses(updated);
        return { success: true, id };
      }
      const msg = error.response?.data?.message || error.message || 'Failed to delete course.';
      throw new Error(msg);
    }
  },

  /**
   * Add a syllabus topic to a course
   */
  async addTopic(courseId, topicData) {
    try {
      const response = await apiClient.post(`/courses/${courseId}/topics`, topicData);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_FALLBACK && (!error.response || error.code === 'ERR_NETWORK')) {
        await new Promise((r) => setTimeout(r, 300));
        const courses = getLocalCourses();
        const updated = courses.map((c) => {
          if (c.id !== courseId) return c;
          const newTopic = {
            id: `top-${Date.now()}`,
            title: topicData.title,
            order: (c.topics?.length || 0) + 1,
            mastery: 0,
            status: 'weak',
            summary: topicData.summary || 'Topic learning summary',
            subtopics: topicData.subtopics || ['Key Concept 1'],
          };
          const topics = [...(c.topics || []), newTopic];
          return { ...c, topics, topicsCount: topics.length };
        });
        setLocalCourses(updated);
        return updated.find((c) => c.id === courseId);
      }
      throw error;
    }
  },
};

export default courseService;
