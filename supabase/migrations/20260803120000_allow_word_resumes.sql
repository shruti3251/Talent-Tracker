-- Allow Word documents (.doc, .docx) in addition to PDF for candidate resumes.

update storage.buckets
set allowed_mime_types = array[
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]
where id = 'resumes';
