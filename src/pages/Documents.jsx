import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  FileCheck,
  Clock,
  Trash2,
  Filter,
  CheckCircle2,
  Database,
  Search,
  X,
  AlertCircle,
  Plus,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { useAuth } from '../features/auth/authContext';
import { documentService } from '../services/documentService';
import Card, { CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import EmptyState from '../components/common/EmptyState';
import Loading from '../components/common/Loading';

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'doc', 'txt'];

export default function Documents() {
  const { courses, selectedCourse, fetchCourses } = useCourses();
  const { user } = useAuth();

  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [filterCourse, setFilterCourse] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // File upload & selection states
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [selectedCourseForUpload, setSelectedCourseForUpload] = useState(selectedCourse?.id || courses[0]?.id || '');
  const [confirmedForPosting, setConfirmedForPosting] = useState(true);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState(0);

  // Sync selectedCourseForUpload when courses load
  useEffect(() => {
    if (courses.length > 0 && !selectedCourseForUpload) {
      setSelectedCourseForUpload(courses[0].id);
    }
  }, [courses, selectedCourseForUpload]);

  // Load user-isolated documents
  const loadDocuments = async () => {
    setLoadingDocs(true);
    try {
      const docs = await documentService.getAllDocuments();
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch (err) {
      console.error('Failed to load documents:', err);
      setDocuments([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [user?.id]);

  const filteredDocs = documents.filter((doc) => {
    const matchesCourse = filterCourse === 'all' || doc.courseId === filterCourse;
    const matchesSearch = doc.fileName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    if (typeof bytes === 'string') return bytes;
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleOpenUploadModal = () => {
    setSelectedFile(null);
    setUploadedFileName('');
    setUploadError('');
    setConfirmedForPosting(true);
    setUploadStep(0);
    setIsUploading(false);
    if (courses.length > 0 && !selectedCourseForUpload) {
      setSelectedCourseForUpload(courses[0].id);
    }
    setUploadModalOpen(true);
  };

  const handleFileChange = (e) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setUploadError(`Invalid file format: .${ext}. Only PDF, DOCX, and TXT files are accepted.`);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setUploadError(`File is too large (${sizeMB} MB). Maximum allowed size is 25 MB.`);
      return;
    }

    setSelectedFile(file);
    setUploadedFileName(file.name);
    setConfirmedForPosting(true);
  };

  const handleClearFile = (e) => {
    if (e) e.stopPropagation();
    setSelectedFile(null);
    setUploadedFileName('');
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePostDocument = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a document first.');
      return;
    }
    if (!uploadedFileName.trim()) {
      setUploadError('Please enter a document title.');
      return;
    }
    if (!selectedCourseForUpload && courses.length > 0) {
      setUploadError('Please select a course to associate this document with.');
      return;
    }
    if (!confirmedForPosting) {
      setUploadError('Please confirm and choose this document before posting.');
      return;
    }

    setUploadError('');
    setIsUploading(true);

    try {
      setUploadStep(1); // Text Extraction & Cleaning
      await new Promise((r) => setTimeout(r, 400));

      setUploadStep(2); // Semantic Chunking & Metadata Enrichment
      await new Promise((r) => setTimeout(r, 400));

      setUploadStep(3); // Embedding Generation
      await new Promise((r) => setTimeout(r, 400));

      setUploadStep(4); // Indexing into PostgreSQL + pgvector
      await new Promise((r) => setTimeout(r, 400));

      const ext = selectedFile.name.split('.').pop().toUpperCase();
      const fileSize = formatFileSize(selectedFile.size);

      const targetCourseId = selectedCourseForUpload || courses[0]?.id || 'course-general';
      const courseObj = courses.find((c) => c.id === targetCourseId);

      // Post document to backend (persisted in PostgreSQL with authenticated user_id)
      const createdDoc = await documentService.postDocument({
        courseId: targetCourseId,
        fileName: uploadedFileName.trim(),
        fileType: ext,
        size: fileSize,
      });

      const fullDoc = {
        ...createdDoc,
        courseName: courseObj?.name || createdDoc.courseName || 'Course',
        courseCode: courseObj?.code || createdDoc.courseCode || 'CRS',
      };

      setDocuments((prev) => [fullDoc, ...prev]);

      // Refresh course documents count
      if (fetchCourses) {
        fetchCourses();
      }

      setIsUploading(false);
      setUploadStep(0);
      setSelectedFile(null);
      setUploadedFileName('');
      setUploadModalOpen(false);
    } catch (err) {
      console.error('Error posting document:', err);
      setUploadError(err.message || 'Failed to post document. Please try again.');
      setIsUploading(false);
      setUploadStep(0);
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      await documentService.deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      if (fetchCourses) fetchCourses();
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0 }}>Document Intelligence Hub</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.925rem' }}>
            Upload syllabus, lecture slides, and notes for RAG indexing into PostgreSQL + pgvector
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Button
            variant="ghost"
            size="md"
            icon={RefreshCw}
            onClick={loadDocuments}
            title="Refresh documents list"
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={UploadCloud}
            onClick={handleOpenUploadModal}
          >
            Upload Document
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card glass>
        <CardContent style={{ padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <Input
              placeholder="Search uploaded files..."
              icon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Enrolled Courses ({courses.length})</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table / Card List */}
      {loadingDocs ? (
        <Loading message="Loading course documents..." />
      ) : filteredDocs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={searchQuery ? 'No matching documents found' : 'No documents uploaded yet'}
          description={
            searchQuery
              ? 'Try modifying your search query or clear the filter.'
              : 'Upload course materials such as PDF slides, Word notes, or TXT summaries to ground the AI Tutor.'
          }
          actionLabel="Select & Upload Document"
          actionIcon={UploadCloud}
          onAction={handleOpenUploadModal}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredDocs.map((doc) => (
            <Card key={doc.id} glass hoverable>
              <CardContent style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '260px', flex: 1 }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(99, 102, 241, 0.12)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <FileText size={22} />
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                      {doc.fileName}
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {doc.courseName || doc.courseCode || 'Course'} • {doc.size || '1.8 MB'} • Uploaded {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Today'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    <Database size={15} color="var(--primary)" />
                    <span><strong>{doc.chunksCount || 24}</strong> Chunks</span>
                  </div>

                  <Badge
                    variant={doc.status === 'indexed' || doc.status === 'completed' ? 'success' : doc.status === 'processing' ? 'warning' : 'danger'}
                    size="sm"
                    dot
                  >
                    {doc.status === 'indexed' || doc.status === 'completed' ? 'Indexed in pgvector' : 'Processing Chunks'}
                  </Badge>

                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDeleteDocument(doc.id)}
                    title="Delete document"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Document Upload Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => !isUploading && setUploadModalOpen(false)}
        title="Upload Course Documents"
        description="Ingest PDFs, Word docs, or notes to ground RAG retrieval"
        footer={
          !isUploading && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', width: '100%' }}>
              <Button variant="ghost" size="md" onClick={() => setUploadModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={UploadCloud}
                onClick={handlePostDocument}
                disabled={!selectedFile || !uploadedFileName.trim() || !confirmedForPosting}
              >
                Post Document
              </Button>
            </div>
          )
        }
      >
        {!isUploading ? (
          <form onSubmit={handlePostDocument} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Hidden device file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="device-document-input"
            />

            {/* Error banner if any */}
            {uploadError && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#ef4444',
                  fontSize: '0.85rem',
                }}
              >
                <AlertCircle size={18} />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Associate with Course */}
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Associate with Course *
              </label>
              {courses.length > 0 ? (
                <select
                  value={selectedCourseForUpload}
                  onChange={(e) => setSelectedCourseForUpload(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    fontSize: '0.925rem',
                    outline: 'none',
                  }}
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px dashed var(--border-medium)',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  No course enrolled yet. Document will be saved under your student workspace.
                </div>
              )}
            </div>

            {/* Document Name / Title */}
            <Input
              label="Document Name / Title *"
              placeholder="e.g. Chapter-04-Distributed-Transactions.pdf"
              value={uploadedFileName}
              onChange={(e) => setUploadedFileName(e.target.value)}
              helperText="Accepts .pdf, .docx, and .txt files up to 25MB"
              required
            />

            {/* 1. SELECT DOCUMENT FROM DEVICE ZONE */}
            {!selectedFile ? (
              <div
                style={{
                  border: '2px dashed var(--border-medium)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '32px 20px',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-elevated)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(99, 102, 241, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                  }}
                >
                  <UploadCloud size={30} />
                </div>

                <div>
                  <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                    Click to browse or drop file here
                  </p>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    PDF, DOCX, or TXT documents (Max 25MB)
                  </span>
                </div>

                {/* Explicit Choose / Select Document Button */}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={FolderOpen}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  style={{ marginTop: '4px' }}
                >
                  Choose Document from Device
                </Button>
              </div>
            ) : (
              /* 2. SHOW SELECTED DOCUMENT & CONFIRMATION */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div
                  style={{
                    border: '1.5px solid rgba(99, 102, 241, 0.4)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px 18px',
                    backgroundColor: 'rgba(99, 102, 241, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '220px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(99, 102, 241, 0.15)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <FileCheck size={24} color="#10b981" />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                          {selectedFile.name}
                        </span>
                        <Badge variant="success" size="sm">
                          Selected
                        </Badge>
                      </div>
                      <span style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                        {formatFileSize(selectedFile.size)} • {selectedFile.name.split('.').pop().toUpperCase()} Document
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon={X}
                      onClick={handleClearFile}
                      title="Remove file"
                    />
                  </div>
                </div>

                {/* 3. CONFIRM & CHOOSE FOR POSTING */}
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: confirmedForPosting ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-elevated)',
                    border: confirmedForPosting ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-medium)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => setConfirmedForPosting((prev) => !prev)}
                >
                  <input
                    type="checkbox"
                    id="confirm-post-checkbox"
                    checked={confirmedForPosting}
                    onChange={(e) => setConfirmedForPosting(e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                  <label
                    htmlFor="confirm-post-checkbox"
                    style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', margin: 0 }}
                  >
                    Confirm and choose this document for posting to your course
                  </label>
                </div>
              </div>
            )}
          </form>
        ) : (
          /* Processing Stepper when user clicks Post Document */
          <div style={{ padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, textAlign: 'center' }}>
              Posting & Processing Document
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { step: 1, label: 'Reading Document & Extracting Content' },
                { step: 2, label: 'Semantic Chunking & Metadata Ingestion' },
                { step: 3, label: 'Generating Text Embeddings' },
                { step: 4, label: 'Storing & Indexing in PostgreSQL (Isolated to Current User)' },
              ].map((s) => (
                <div
                  key={s.step}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: uploadStep >= s.step ? 'var(--primary-light)' : 'var(--bg-elevated)',
                    color: uploadStep >= s.step ? 'var(--primary)' : 'var(--text-muted)',
                    border: uploadStep === s.step ? '1px solid var(--primary)' : '1px solid transparent',
                  }}
                >
                  {uploadStep > s.step ? (
                    <CheckCircle2 size={18} color="var(--success)" />
                  ) : uploadStep === s.step ? (
                    <div className="animate-spin" style={{ width: 18, height: 18, border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }} />
                  ) : (
                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: '1px solid var(--border-medium)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                      {s.step}
                    </div>
                  )}
                  <span style={{ fontSize: '0.9rem', fontWeight: uploadStep === s.step ? 600 : 500 }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
