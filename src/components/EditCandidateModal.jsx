import CandidateForm from './CandidateForm'

export default function EditCandidateModal({ candidate, onSave, onClose }) {
  return (
    <CandidateForm
      verb="Edit"
      submitLabel="Save Changes"
      initialValues={candidate}
      onSubmit={(fields) => onSave(candidate.id, fields)}
      onClose={onClose}
    />
  )
}
