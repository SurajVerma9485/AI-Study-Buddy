import apiClient from './api';
import { MOCK_DOCUMENTS } from './mockData';
import { getUserStorageKey, getCurrentUserId } from './storageHelper';

const ENABLE_MOCK_FALLBACK = import.meta.env.VITE_ENABLE_MOCK_FALLBACK === 'true';

const getDocumentsKey = () => getUserStorageKey('documents_data');

const getLocalDocs = () => {
  try {
    const key = getDocumentsKey();
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
    const uid = getCurrentUserId();
    if (uid === '00000000-0000-0000-0000-000000000001' || uid === 'anonymous') {
      return MOCK_DOCUMENTS;
    }
    return [];
  } catch {
    return [];
  }
};

const setLocalDocs = (docs) => {
  try {
    localStorage.setItem(getDocumentsKey(), JSON.stringify(docs));
  } catch (err) {
    console.error('Failed to save documents locally', err);
  }
};

/**
 * Document Service
 * Communicates with backend endpoints:
 * - POST /api/v1/courses/:courseId/documents
 * - GET /api/v1/courses/:courseId/documents
 * - GET /api/v1/documents/:id/status
 */
export const documentService = {
  /**
   * Fetch all documents across all courses for authenticated user
   */
  async getAllDocuments() {
    try {
      const response = await apiClient.get('/documents');
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_FALLBACK && (!error.response || error.code === 'ERR_NETWORK')) {
        return getLocalDocs();
      }
      return [];
    }
  },

  /**
   * Post document to user account with course association
   */
  async postDocument({ courseId, fileName, fileType, size }) {
    try {
      const response = await apiClient.post('/documents', {
        courseId,
        fileName,
        fileType,
        size,
      });
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_FALLBACK && (!error.response || error.code === 'ERR_NETWORK')) {
        const newDoc = {
          id: `doc-${Date.now()}`,
          courseId,
          fileName,
          fileType: fileType || 'PDF',
          size: size || '1.8 MB',
          uploadedAt: new Date().toISOString().split('T')[0],
          status: 'indexed',
          chunksCount: 24,
        };
        const allDocs = getLocalDocs();
        setLocalDocs([newDoc, ...allDocs]);
        return newDoc;
      }
      throw error;
    }
  },

  /**
   * Fetch all documents for a specific course
   */
  async getCourseDocuments(courseId) {
    try {
      const response = await apiClient.get(`/courses/${courseId}/documents`);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_FALLBACK && (!error.response || error.code === 'ERR_NETWORK')) {
        await new Promise((r) => setTimeout(r, 300));
        const allDocs = getLocalDocs();
        // Return docs matching this course or fallback mock docs
        const filtered = allDocs.filter((d) => d.courseId === courseId);
        return filtered.length > 0 ? filtered : allDocs.slice(0, 3).map(d => ({ ...d, courseId }));
      }
      const msg = error.response?.data?.message || error.message || 'Failed to fetch course documents.';
      throw new Error(msg);
    }
  },

  /**
   * Upload course material (PDF, DOCX, TXT) via multipart form data
   */
  async uploadDocument(courseId, file, onUploadProgress = null) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);

    try {
      const response = await apiClient.post(`/courses/${courseId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onUploadProgress(percentCompleted);
          }
        },
      });
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_FALLBACK && (!error.response || error.code === 'ERR_NETWORK')) {
        // Simulate upload progress
        if (onUploadProgress) {
          for (let p = 20; p <= 100; p += 20) {
            await new Promise((r) => setTimeout(r, 120));
            onUploadProgress(p);
          }
        }

        const ext = file.name.split('.').pop().toUpperCase();
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);

        const newDoc = {
          id: `doc-${Date.now()}`,
          courseId,
          fileName: file.name,
          fileType: ext === 'DOCX' ? 'DOCX' : ext === 'TXT' ? 'TXT' : 'PDF',
          size: `${fileSizeMB} MB`,
          uploadedAt: new Date().toISOString().split('T')[0],
          status: 'uploading', // will transition via polling: uploading -> processing -> completed
          chunksCount: 0,
          createdAt: Date.now(),
        };

        const allDocs = getLocalDocs();
        const updated = [newDoc, ...allDocs];
        setLocalDocs(updated);
        return newDoc;
      }

      const msg = error.response?.data?.message || error.message || 'Failed to upload document.';
      throw new Error(msg);
    }
  },

  /**
   * Poll processing status for an uploaded document
   * Possible statuses: 'uploading' | 'processing' | 'completed' | 'failed'
   */
  async getDocumentStatus(documentId) {
    try {
      const response = await apiClient.get(`/documents/${documentId}/status`);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_FALLBACK && (!error.response || error.code === 'ERR_NETWORK')) {
        await new Promise((r) => setTimeout(r, 200));
        const allDocs = getLocalDocs();
        const docIndex = allDocs.findIndex((d) => d.id === documentId);
        if (docIndex === -1) {
          return { id: documentId, status: 'completed', chunksCount: 24 };
        }

        const doc = allDocs[docIndex];
        const ageSeconds = (Date.now() - (doc.createdAt || Date.now())) / 1000;

        let newStatus = doc.status;
        let chunks = doc.chunksCount || 0;

        if (ageSeconds > 6) {
          newStatus = 'completed';
          chunks = Math.floor(Math.random() * 30) + 15;
        } else if (ageSeconds > 2) {
          newStatus = 'processing';
        } else {
          newStatus = 'uploading';
        }

        if (doc.status !== newStatus || doc.chunksCount !== chunks) {
          allDocs[docIndex] = { ...doc, status: newStatus, chunksCount: chunks };
          setLocalDocs(allDocs);
        }

        return { id: documentId, status: newStatus, chunksCount: chunks };
      }

      const msg = error.response?.data?.message || error.message || 'Failed to retrieve document status.';
      throw new Error(msg);
    }
  },

  /**
   * Delete a document
   */
  async deleteDocument(documentId) {
    try {
      const response = await apiClient.delete(`/documents/${documentId}`);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_FALLBACK && (!error.response || error.code === 'ERR_NETWORK')) {
        const allDocs = getLocalDocs();
        const updated = allDocs.filter((d) => d.id !== documentId);
        setLocalDocs(updated);
        return { success: true, id: documentId };
      }
      throw error;
    }
  },
};

export default documentService;
