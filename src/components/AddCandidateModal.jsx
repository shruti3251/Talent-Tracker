import CandidateForm from './CandidateForm'

export default function AddCandidateModal({ onAdd, onClose }) {
  return (
    <CandidateForm
      verb="Add"
      submitLabel="Save Candidate"
      initialValues={{}}
      onSubmit={onAdd}
      onClose={onClose}
    />
  )
}
