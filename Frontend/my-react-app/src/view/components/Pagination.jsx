/**
 * Pagination control ("‹ 1 2 3 … N ›") used at the bottom of every
 * card grid. Presentational only — not wired to real paging yet,
 * since that depends on how the backend returns pages of results.
 */
export default function Pagination({ currentPage = 1, lastPage = 100 }) {
    const pageNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, "...", lastPage];

    return (
        <div className="page-nums">
            <button className="page-arrow">‹</button>
            {pageNumbers.map((page, index) => (
                <span key={index} className={page === currentPage ? "active" : ""}>
                    {page}
                </span>
            ))}
            <button className="page-arrow">›</button>
        </div>
    );
}
