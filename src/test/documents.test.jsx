import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DocumentUpload from '../features/documents/components/DocumentUpload';

describe('Document Upload UI Tests (Item 6)', () => {
  it('6. Document upload UI renders dropzone, file limits and validates extensions', async () => {
    const handleSuccess = vi.fn();

    render(
      <DocumentUpload courseId="course-cs301" onUploadSuccess={handleSuccess} />
    );

    // Verify upload zone and instructions
    expect(screen.getByText(/Click to browse or drag & drop documents/i)).toBeInTheDocument();
    expect(screen.getByText(/PDF/i)).toBeInTheDocument();
    expect(screen.getByText(/DOCX/i)).toBeInTheDocument();
    expect(screen.getByText(/TXT/i)).toBeInTheDocument();
    expect(screen.getByText(/25 MB/i)).toBeInTheDocument();

    // Verify hidden file input exists with correct accept types
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput.getAttribute('accept')).toContain('.pdf');
    expect(fileInput.getAttribute('accept')).toContain('.docx');
    expect(fileInput.getAttribute('accept')).toContain('.txt');
  });

  it('6. Document upload rejects invalid file formats with client validation message', async () => {
    render(
      <DocumentUpload courseId="course-cs301" />
    );

    const fileInput = document.querySelector('input[type="file"]');
    const invalidFile = new File(['executable code'], 'malicious.exe', { type: 'application/x-msdownload' });

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Invalid file type: \.exe/i)).toBeInTheDocument();
    });
  });
});
