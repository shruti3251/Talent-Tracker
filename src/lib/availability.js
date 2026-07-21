export const AVAILABILITY_OPTIONS = [
  { value: 'immediately', label: 'Immediately' },
  { value: '15_days', label: '15 Days' },
  { value: '1_month', label: '1 Month' },
  { value: '2_months', label: '2 Months' },
  { value: 'more_than_2_months', label: 'More than 2 Months' },
]

export const AVAILABILITY_LABEL = Object.fromEntries(
  AVAILABILITY_OPTIONS.map((o) => [o.value, o.label]),
)

export const DEFAULT_AVAILABILITY = AVAILABILITY_OPTIONS[0].value
