import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Sparkles,
  HelpCircle,
  UploadCloud,
  Layers,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useCourses } from '../../../context/CourseContext';
import { documentService } from '../../../services/documentService';
import DocumentUpload from '../components/DocumentUpload';
import DocumentList from '../components/DocumentList';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Card, { CardContent } from '../../../components/ui/Card';
import Modal from '../../../components/ui/Modal';
import Loading from '../../../components/common/Loading';
import ErrorState from '../../../components/common/ErrorState';

export default function CourseDocumentsPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { courses, setSelectedCourseId } = useCourses();

  const course = courses.find((c) => c.id === courseId) || null;

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (courseId) {
      setSelectedCourseId(courseId);
    }
  }, [courseId, setSelectedCourseId]);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const docs = await documentService.getCourseDocuments(courseId);
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load course documents:', err);
      setError(err.message || 'Failed to load course materials.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUploadSuccess = (newDoc) => {
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleUpdateDocumentStatus = useCallback((docId, newStatus, chunksCount) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId ? { ...doc, status: newStatus, chunksCount: chunksCount || doc.chunksCount } : doc
      )
    );
  }, []);

  const handlePromptDelete = (docId) => {
    setDeletingDocId(docId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDocId) return;
    setIsDeleting(true);
    try {
      await documentService.deleteDocument(deletingDocId);
      setDocuments((prev) => prev.filter((d) => d.id !== deletingDocId));
      setDeleteModalOpen(false);
      setDeletingDocId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading && documents.length === 0) {
    return <Loading message="Fetching course documents from server..." fullPage size="lg" />;
  }

  if (error && documents.length === 0) {
    return (
      <ErrorState
        title="Failed to Load Course Documents"
        message={error}
        onRetry={fetchDocuments}
        retryLabel="Retry"
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      {/* Navigation Breadcrumb */}
      <div>
        <button
          onClick={() => navigate(`/courses/${courseId}`)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: 0,
            marginBottom: '16px',
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} /> Back to {course?.code || 'Course'}
        </button>

        {/* Header Banner */}
        <div
          style={{
            padding: '28px 32px',
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(17, 24, 39, 0.85) 100%)',
            border: '1px solid var(--border-glow)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Badge variant="primary" size="md">
                {course?.code || 'COURSE'}
              </Badge>
              <Badge variant="outline" size="md">
                Document Hub
              </Badge>
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 6px 0' }}>
              Course Materials & Documents
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Upload syllabus slides, PDFs, and notes to ground AI Tutor explanations and practice tests
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Button
              variant="secondary"
              size="md"
              icon={Sparkles}
              onClick={() => navigate('/tutor')}
            >
              Ask AI Tutor
            </Button>
            <Button
              variant="secondary"
              size="md"
              icon={HelpCircle}
              onClick={() => navigate('/quizzes')}
            >
              Start Quiz
            </Button>
          </div>
        </div>
      </div>

      {/* Upload Zone Card */}
      <Card glass>
        <CardContent style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>
            Upload Course Material
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Upload lecture slides, notes, or readings. Accepted formats: <strong>PDF</strong>, <strong>DOCX</strong>, and <strong>TXT</strong> (Max 25 MB).
          </p>

          <DocumentUpload
            courseId={courseId}
            onUploadSuccess={handleUploadSuccess}
          />
        </CardContent>
      </Card>

      {/* Uploaded Documents List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>
              Indexed Materials ({documents.length})
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Real-time processing status automatically synced via backend API
            </span>
          </div>
        </div>

        <DocumentList
          documents={documents}
          onDeleteDocument={handlePromptDelete}
          onRefresh={fetchDocuments}
          onUpdateDocumentStatus={handleUpdateDocumentStatus}
          onUploadClick={() => window.scrollTo({ top: 120, behavior: 'smooth' })}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Document?"
        description="This document will be removed from your course materials and vector store."
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              size="md"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleConfirmDelete}
              loading={isDeleting}
              disabled={isDeleting}
            >
              Delete Document
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', margin: 0 }}>
          Are you sure you want to delete this document? The AI tutor will no longer be able to reference its chunks.
        </p>
      </Modal>
    </div>
  );
}
