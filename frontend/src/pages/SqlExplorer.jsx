import { useState, useEffect } from 'react'
import { RefreshCw, Trash2, ListTree, Table2, ChevronLeft, ChevronRight } from 'lucide-react'
import { sqlApi } from '../api'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'

const VERB_TYPES = {
  INSERT: 'success',
  DELETE: 'danger',
  UPDATE: 'warning',
}

const VERB_FILTERS = ['ALL', 'INSERT', 'UPDATE', 'DELETE']
const PAGE_SIZE = 100

function TabButton({ active, icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'border-primary-600 text-primary-700'
          : 'border-transparent text-slate-500 hover:text-slate-700'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )
}

function QueryLogTab() {
  const [queries, setQueries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [verbFilter, setVerbFilter] = useState('ALL')
  const [clearing, setClearing] = useState(false)

  useEffect(() => {
    loadQueries()
  }, [verbFilter])

  async function loadQueries() {
    try {
      setLoading(true)
      const data = await sqlApi.getQueries(verbFilter === 'ALL' ? {} : { verb: verbFilter })
      setQueries(data.queries || [])
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleClear() {
    setClearing(true)
    try {
      await sqlApi.clearQueries()
      await loadQueries()
    } catch (err) {
      setError(err.message)
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
          {VERB_FILTERS.map(v => (
            <button
              key={v}
              onClick={() => setVerbFilter(v)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                verbFilter === v
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        <button
          onClick={loadQueries}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>

        <button
          onClick={handleClear}
          disabled={clearing || queries.length === 0}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          {clearing ? 'Clearing...' : 'Clear log'}
        </button>

        <span className="text-xs text-slate-500 ml-auto">
          {queries.length} statement{queries.length === 1 ? '' : 's'}
        </span>
      </div>

      <p className="text-xs text-slate-500">
        Every INSERT / UPDATE / DELETE executed by the API is captured here, newest first &mdash;
        including the statements triggered by the Add and Delete buttons.
      </p>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading query log...</div>
        ) : queries.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No queries logged yet. Add or delete a record to see the SQL here.
          </div>
        ) : (
          queries.map(q => (
            <div key={q.id} className="p-4 border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-3 flex-wrap">
                <StatusBadge status={q.verb} type={VERB_TYPES[q.verb] || 'default'} />
                <span className="text-xs text-slate-500">
                  {new Date(q.timestamp).toLocaleString()}
                </span>
                {q.endpoint && (
                  <span className="text-xs font-mono text-slate-500">{q.endpoint}</span>
                )}
                <span className="text-xs text-slate-400 ml-auto">
                  {q.rowCount} row{q.rowCount === 1 ? '' : 's'} affected
                </span>
              </div>
              <pre className="mt-2 text-xs bg-slate-900 text-slate-100 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-words">
                {q.sql}
              </pre>
              {q.params?.length > 0 && (
                <p className="mt-1.5 text-xs text-slate-500 font-mono break-all">
                  params: {JSON.stringify(q.params)}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function TablesTab() {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTable, setSelectedTable] = useState(null)
  const [tableData, setTableData] = useState(null)
  const [rowsLoading, setRowsLoading] = useState(false)
  const [rowsError, setRowsError] = useState(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    loadTables()
  }, [])

  useEffect(() => {
    if (selectedTable) loadRows(selectedTable.name, offset)
  }, [selectedTable, offset])

  async function loadTables() {
    try {
      setLoading(true)
      const data = await sqlApi.getTables()
      const list = data.tables || []
      setTables(list)
      setSelectedTable(prev => prev || list[0] || null)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadRows(name, off) {
    try {
      setRowsLoading(true)
      const data = await sqlApi.getTableRows(name, { limit: PAGE_SIZE, offset: off })
      setTableData(data)
      setRowsError(null)
    } catch (err) {
      setRowsError(err.message)
    } finally {
      setRowsLoading(false)
    }
  }

  function selectTable(table) {
    setSelectedTable(table)
    setOffset(0)
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-sm">Loading tables...</div>
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
        {error}
      </div>
    )
  }

  const total = tableData?.total ?? 0
  const showingFrom = total === 0 ? 0 : offset + 1
  const showingTo = Math.min(offset + PAGE_SIZE, total)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5">
      {/* Table list */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-fit">
        <div className="px-4 py-3 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Tables ({tables.length})
        </div>
        <div className="max-h-[70vh] overflow-y-auto">
          {tables.map(t => (
            <button
              key={t.name}
              onClick={() => selectTable(t)}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm border-b border-slate-100 last:border-0 transition-colors ${
                selectedTable?.name === t.name
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="font-mono truncate">{t.name}</span>
              <span className="text-xs text-slate-400 ml-2">{t.rowCount}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table data */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {!selectedTable ? (
          <div className="p-8 text-center text-slate-400 text-sm">Select a table to view its rows.</div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 font-mono">
                  {selectedTable.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedTable.columns.length} columns &middot; {total} rows
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  {showingFrom}&ndash;{showingTo} of {total}
                </span>
                <button
                  onClick={() => setOffset(o => Math.max(o - PAGE_SIZE, 0))}
                  disabled={offset === 0 || rowsLoading}
                  className="p-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setOffset(o => o + PAGE_SIZE)}
                  disabled={showingTo >= total || rowsLoading}
                  className="p-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {rowsError && (
              <div className="m-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {rowsError}
              </div>
            )}

            {rowsLoading ? (
              <div className="p-8 text-center text-slate-400 text-sm">Loading rows...</div>
            ) : tableData && tableData.rows.length > 0 ? (
              <div className="overflow-x-auto max-h-[70vh]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0">
                    <tr className="border-b border-slate-200 bg-slate-50">
                      {tableData.columns.map(col => (
                        <th
                          key={col}
                          className="px-4 py-3 text-left font-semibold text-slate-600 uppercase tracking-wider text-xs whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tableData.rows.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        {tableData.columns.map(col => (
                          <td key={col} className="px-4 py-2.5 text-slate-700 whitespace-nowrap">
                            {row[col] === null || row[col] === undefined ? (
                              <span className="text-slate-300 italic">NULL</span>
                            ) : (
                              String(row[col])
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm">
                This table has no rows.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function SqlExplorer() {
  const [activeTab, setActiveTab] = useState('queries')

  return (
    <div className="flex-1 overflow-y-auto">
      <PageHeader
        title="SQL Explorer"
        subtitle="Inspect the SQL executed by create/delete actions and browse every table"
      />

      <div className="px-8 border-b border-slate-200 bg-white">
        <div className="flex gap-2">
          <TabButton
            active={activeTab === 'queries'}
            icon={ListTree}
            label="Query Log"
            onClick={() => setActiveTab('queries')}
          />
          <TabButton
            active={activeTab === 'tables'}
            icon={Table2}
            label="Tables & Data"
            onClick={() => setActiveTab('tables')}
          />
        </div>
      </div>

      <div className="p-8">
        {activeTab === 'queries' ? <QueryLogTab /> : <TablesTab />}
      </div>
    </div>
  )
}
