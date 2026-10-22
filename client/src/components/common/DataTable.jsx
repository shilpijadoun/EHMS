import { useMemo, useState } from 'react'

/**
 * Reusable table with a fixed first column and horizontally scrollable remaining columns.
 * columns: [{ key, label, render?, width? }]
 * rows: array of objects; rowKey defaults to "id".
 */
function DataTable({
  columns = [],
  rows = [],
  rowKey = 'id',
  searchable = true,
  searchPlaceholder = 'Search records...',
  pageSize = 10,
}) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return rows
    return rows.filter((row) =>
      columns.some((column) => {
        const value = row[column.key]
        return String(value ?? '').toLowerCase().includes(term)
      }),
    )
  }, [rows, columns, search])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const visibleRows = filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize)

  return (
    <section className="data-table-card">
      {searchable && (
        <div className="data-table-toolbar">
          <div className="data-table-search">
            <i className="bi bi-search" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} aria-label="Clear search">
                <i className="bi bi-x-lg" />
              </button>
            )}
          </div>
          <span className="data-table-count">{filteredRows.length} records</span>
        </div>
      )}

      <div className="data-table-scroll">
        <table className="table data-table">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key}
                  className={index === 0 ? 'data-table-sticky-column' : ''}
                  style={{ minWidth: column.width || (index === 0 ? 180 : 160) }}
                  scope="col"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, rowIndex) => (
              <tr key={row[rowKey] ?? row.id ?? rowIndex}>
                {columns.map((column, index) => (
                  <td
                    key={column.key}
                    className={index === 0 ? 'data-table-sticky-column' : ''}
                  >
                    {column.render ? column.render(row[column.key], row) : (row[column.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
            {visibleRows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="data-table-empty">
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="data-table-footer">
        <span>
          Showing {filteredRows.length ? (safePage - 1) * pageSize + 1 : 0}
          {' '}to {Math.min(safePage * pageSize, filteredRows.length)} of {filteredRows.length}
        </span>
        <div className="data-table-pagination">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            disabled={safePage <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            Previous
          </button>
          <span>Page {safePage} of {totalPages}</span>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            disabled={safePage >= totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}

export default DataTable
