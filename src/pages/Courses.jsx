import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Plus,
  Search,
  Calendar,
  Layers,
  FileText,
  ArrowRight,
  Edit2,
  Trash2,
  AlertTriangle,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import Card, { CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input, { TextArea } from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import Modal from '../components/ui/Modal';
import Loading from '../components/common/Loading';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';

export default function Courses() {
  const navigate = useNavigate();
  const {
    courses,
    loading,
    error,
    fetchCourses,
    addCourse,
    editCourse,
    deleteCourse,
    setSelectedCourseId,
  } = useCourses();

  const [searchTerm, setSearchTerm] = useState('');

  // Create Course Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createExamDate, setCreateExamDate] = useState('2026-11-20');
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState('');

  // Edit Course Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editExamDate, setEditExamDate] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete Confirmation Dialog
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const filteredCourses = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.code && c.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createName.trim()) {
      setCreateError('Course name is required.');
      return;
    }
    setCreateError('');
    setCreateSubmitting(true);
    try {
      await addCourse({
        name: createName,
        description: createDescription,
        examDate: createExamDate,
      });
      setCreateName('');
      setCreateDescription('');
      setCreateModalOpen(false);
    } catch (err) {
      setCreateError(err.message || 'Failed to create course.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleOpenEdit = (course, e) => {
    e.stopPropagation();
    setEditingCourseId(course.id);
    setEditName(course.name);
    setEditDescription(course.description || '');
    setEditExamDate(course.examDate || '2026-11-20');
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;

    setEditSubmitting(true);
    try {
      await editCourse(editingCourseId, {
        name: editName,
        description: editDescription,
        examDate: editExamDate,
      });
      setEditModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleOpenDelete = (course, e) => {
    e.stopPropagation();
    setDeletingCourse(course);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCourse) return;
    setDeleteSubmitting(true);
    try {
      await deleteCourse(deletingCourse.id);
      setDeleteModalOpen(false);
      setDeletingCourse(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  if (loading && courses.length === 0) {
    return <Loading message="Loading your enrolled courses from API..." fullPage size="lg" />;
  }

  if (error && courses.length === 0) {
    return (
      <ErrorState
        title="Failed to Load Courses"
        message={error}
        onRetry={fetchCourses}
        retryLabel="Retry Connection"
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      {/* Top Header */}
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
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0 }}>Courses & Curriculum Management</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.925rem' }}>
            Browse enrolled courses, track syllabus mastery, and manage upcoming exam dates
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Button
            variant="ghost"
            size="md"
            icon={RefreshCw}
            onClick={fetchCourses}
            title="Refresh from server"
          />

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setCreateModalOpen(true)}
          >
            Create Course
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ maxWidth: '420px', width: '100%' }}>
        <Input
          placeholder="Filter courses by name or subject code..."
          icon={Search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Courses List */}
      {filteredCourses.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={searchTerm ? 'No matching courses found' : 'No courses registered yet'}
          description={
            searchTerm
              ? 'Try modifying your search term or clear the filter.'
              : 'Add your first course syllabus to start generating AI study materials and quizzes.'
          }
          actionLabel="Create First Course"
          actionIcon={Plus}
          onAction={() => setCreateModalOpen(true)}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '22px',
          }}
        >
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              hoverable
              onClick={() => {
                setSelectedCourseId(course.id);
                navigate(`/courses/${course.id}`);
              }}
            >
              <CardContent style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Course Top Line: Code, Exam Date, Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--primary-light)',
                      color: course.color || 'var(--primary)',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      letterSpacing: '0.03em',
                    }}
                  >
                    {course.code || 'COURSE'}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Badge variant="outline" size="sm">
                      Exam: {course.examDate}
                    </Badge>

                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={(e) => handleOpenEdit(course, e)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Edit course details"
                    >
                      <Edit2 size={16} />
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => handleOpenDelete(course, e)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Delete course"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Course Name */}
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                  {course.name}
                </h3>

                {/* Course Description */}
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '18px', flex: 1, lineHeight: 1.5 }}>
                  {course.description}
                </p>

                {/* Progress Bar */}
                <div style={{ marginBottom: '16px' }}>
                  <ProgressBar
                    value={course.progress}
                    label="Topic Mastery"
                    size="sm"
                    variant="auto"
                  />
                </div>

                {/* Number of topics, Number of docs, Action */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Layers size={14} /> {course.topics?.length || course.topicsCount || 0} Topics
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FileText size={14} /> {course.documentsCount || 0} Docs
                    </span>
                  </div>

                  <span style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Open Details <ArrowRight size={14} />
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Course Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Course"
        description="Fill in syllabus details to create a new curriculum"
        footer={
          <>
            <Button
              variant="ghost"
              size="md"
              onClick={() => setCreateModalOpen(false)}
              disabled={createSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleCreateSubmit}
              loading={createSubmitting}
              disabled={!createName.trim() || createSubmitting}
            >
              Save & Create
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {createError && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--danger-light)',
                color: '#f87171',
                fontSize: '0.85rem',
              }}
            >
              {createError}
            </div>
          )}

          <Input
            label="Course Name"
            placeholder="e.g. Operating Systems & Kernel Internals"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            required
          />

          <TextArea
            label="Course Description"
            placeholder="Key concepts, syllabus modules, or exam targets covered in this curriculum..."
            rows={3}
            value={createDescription}
            onChange={(e) => setCreateDescription(e.target.value)}
          />

          <Input
            label="Exam Date"
            type="date"
            icon={Calendar}
            value={createExamDate}
            onChange={(e) => setCreateExamDate(e.target.value)}
            required
          />
        </form>
      </Modal>

      {/* Edit Course Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Course Details"
        description="Update course title, description, or target exam date"
        footer={
          <>
            <Button
              variant="ghost"
              size="md"
              onClick={() => setEditModalOpen(false)}
              disabled={editSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleEditSubmit}
              loading={editSubmitting}
              disabled={!editName.trim() || editSubmitting}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Course Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />

          <TextArea
            label="Course Description"
            rows={3}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />

          <Input
            label="Exam Date"
            type="date"
            icon={Calendar}
            value={editExamDate}
            onChange={(e) => setEditExamDate(e.target.value)}
            required
          />
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Course?"
        description="This action cannot be undone."
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              size="md"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleteSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleDeleteConfirm}
              loading={deleteSubmitting}
              disabled={deleteSubmitting}
            >
              Delete Course
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'var(--danger-light)',
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={22} />
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.5, margin: 0 }}>
            Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{deletingCourse?.name}</strong>? All associated syllabus topics and progress metrics will be removed.
          </p>
        </div>
      </Modal>
    </div>
  );
}
