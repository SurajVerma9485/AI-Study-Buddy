import React, { useState } from 'react';
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
} from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { MOCK_DOCUMENTS } from '../services/mockData';
import Card, { CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import EmptyState from '../components/common/EmptyState';

export default function Documents() {
  const { courses, selectedCourse } = useCourses();
  const [documents, setDocuments] = useState(MOCK_DOCUMENTS);
  const [filterCourse, setFilterCourse] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Upload simulation state
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [selectedCourseForUpload, setSelectedCourseForUpload] = useState(selectedCourse?.id || courses[0]?.id || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState(0);

  const filteredDocs = documents.filter((doc) => {
    const matchesCourse = filterCourse === 'all' || doc.courseId === filterCourse;
    const matchesSearch = doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  const handleSimulateUpload = async (e) => {
    e.preventDefault();
    if (!uploadedFileName) return;

    setIsUploading(true);
    setUploadStep(1); // Parsing & Cleaning text
    await new Promise((r) => setTimeout(r, 600));

    setUploadStep(2); // Semantic Chunking
    await new Promise((r) => setTimeout(r, 600));

    setUploadStep(3); // Generating Embeddings
    await new Promise((r) => setTimeout(r, 600));

    setUploadStep(4); // Indexing in pgvector
    await new Promise((r) => setTimeout(r, 600));

    const courseObj = courses.find((c) => c.id === selectedCourseForUpload) || courses[0];
    const newDoc = {
      id: `doc-${Date.now()}`,
      courseId: courseObj.id,
      courseName: courseObj.name,
      fileName: uploadedFileName.endsWith('.pdf') || uploadedFileName.endsWith('.docx') ? uploadedFileName : `${uploadedFileName}.pdf`,
      fileType: uploadedFileName.endsWith('.docx') ? 'DOCX' : uploadedFileName.endsWith('.txt') ? 'TXT' : 'PDF',
      size: '2.4 MB',
      uploadedAt: new Date().toISOString().split('T')[0],
      status: 'indexed',
      chunksCount: 32,
      embeddingsCount: 32,
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setIsUploading(false);
    setUploadStep(0);
    setUploadedFileName('');
    setUploadModalOpen(false);
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

        <Button
          variant="primary"
          size="md"
          icon={UploadCloud}
          onClick={() => setUploadModalOpen(true)}
        >
          Upload Document
        </Button>
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
              <option value="all">All Enrolled Courses</option>
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
      {filteredDocs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents uploaded"
          description="Upload course materials such as PDF slides, Word notes, or TXT summaries to ground the AI Tutor."
          actionLabel="Upload First Document"
          actionIcon={UploadCloud}
          onAction={() => setUploadModalOpen(true)}
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
                      {doc.courseName} • {doc.size} • Uploaded {doc.uploadedAt}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    <Database size={15} color="var(--primary)" />
                    <span><strong>{doc.chunksCount}</strong> Chunks</span>
                  </div>

                  <Badge
                    variant={doc.status === 'indexed' ? 'success' : doc.status === 'processing' ? 'warning' : 'danger'}
                    size="sm"
                    dot
                  >
                    {doc.status === 'indexed' ? 'Indexed in pgvector' : 'Processing Chunks'}
                  </Badge>

                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => setDocuments((prev) => prev.filter((d) => d.id !== doc.id))}
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
            <>
              <Button variant="ghost" size="md" onClick={() => setUploadModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" onClick={handleSimulateUpload} disabled={!uploadedFileName}>
                Process & Embed
              </Button>
            </>
          )
        }
      >
        {!isUploading ? (
          <form onSubmit={handleSimulateUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Associate with Course
              </label>
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
            </div>

            <Input
              label="Document Name / Title"
              placeholder="e.g. Chapter-04-Distributed-Transactions.pdf"
              value={uploadedFileName}
              onChange={(e) => setUploadedFileName(e.target.value)}
              helperText="Accepts .pdf, .docx, and .txt files up to 25MB"
              required
            />

            {/* Drag & Drop Visual Zone */}
            <div
              style={{
                border: '2px dashed var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                padding: '36px 20px',
                textAlign: 'center',
                backgroundColor: 'var(--bg-elevated)',
                cursor: 'pointer',
              }}
              onClick={() => {
                if (!uploadedFileName) {
                  setUploadedFileName('Lecture-05-Consensus-Protocols.pdf');
                }
              }}
            >
              <UploadCloud size={36} color="var(--primary)" style={{ margin: '0 auto 12px auto' }} />
              <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                Click to browse or drop file here
              </p>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                PDF, DOCX, or TXT documents (Max 25MB)
              </span>
            </div>
          </form>
        ) : (
          /* Processing Stepper */
          <div style={{ padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, textAlign: 'center' }}>
              Document Intelligence Pipeline In Progress
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { step: 1, label: 'Text Extraction & Cleaning' },
                { step: 2, label: 'Semantic Chunking & Metadata Enrichment' },
                { step: 3, label: 'Embedding Generation via AI Provider' },
                { step: 4, label: 'Indexing into PostgreSQL + pgvector' },
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
