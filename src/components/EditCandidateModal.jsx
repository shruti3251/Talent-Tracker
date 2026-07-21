import CandidateForm from './CandidateForm'

export default function EditCandidateModal({ candidate, onSave, onUploadResume, onClose }) {
  return (
    <CandidateForm
      verb="Edit"
      submitLabel="Save Changes"
      initialValues={candidate}
      onSubmit={(fields) => onSave(candidate.id, fields)}
      onUploadResume={onUploadResume}
      onClose={onClose}
    />
  )
}
