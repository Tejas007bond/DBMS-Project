import { useState } from 'react'

// fields: [{ key, label, type, required, options, placeholder, wide, defaultValue }]
// type: 'text' | 'number' | 'date' | 'select'
export default function FormModal({
  title,
  fields,
  initialValues = {},
  onSubmit,
  onClose,
  submitLabel = 'Save',
}) {
  const [values, setValues] = useState(() => {
    const init = {}
    fields.forEach(f => {
      init[f.key] = initialValues[f.key] ?? f.defaultValue ?? ''
    })
    return init
  })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  function setValue(key, value) {
    setValues(v => ({ ...v, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    for (const f of fields) {
      if (f.required && String(values[f.key] ?? '').trim() === '') {
        setError(`${f.label} is required`)
        return
      }
    }

    // Coerce number fields and trim text values
    const payload = {}
    for (const f of fields) {
      const raw = values[f.key]
      if (f.type === 'number') {
        payload[f.key] = raw === '' ? null : Number(raw)
      } else {
        payload[f.key] = typeof raw === 'string' ? raw.trim() : raw
      }
    }

    setSaving(true)
    try {
      await onSubmit(payload)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-slate-200 flex justify-between items-start sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(f => (
              <div key={f.key} className={f.wide ? 'sm:col-span-2' : ''}>
                <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1.5">
                  {f.label}
                  {f.required && <span className="text-red-500"> *</span>}
                </label>
                {f.type === 'select' ? (
                  <select
                    value={values[f.key]}
                    onChange={e => setValue(f.key, e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select {f.label}</option>
                    {(f.options || []).map(opt => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type || 'text'}
                    value={values[f.key]}
                    placeholder={f.placeholder}
                    onChange={e => setValue(f.key, e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-60"
            >
              {saving ? 'Saving...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
