export default function PageHeader({ title, subtitle }) {
  return (
    <div className="px-8 py-6 bg-white border-b border-slate-200">
      <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
  )
}
