import CandidateForm from './CandidateForm'

export default function AddCandidateModal({ onAdd, onUploadResume, onClose }) {
  return (
    <CandidateForm
      verb="Add"
      submitLabel="Save Candidate"
      initialValues={{}}
      onSubmit={onAdd}
      onUploadResume={onUploadResume}
      onClose={onClose}
    />
  )
}
