/**
 * PaginationLinks Component
 * Adds rel="prev" and rel="next" links for paginated content
 * Helps search engines understand pagination structure
 */

export default function PaginationLinks({ currentPage, totalPages, baseUrl }) {
  if (!currentPage || !totalPages || totalPages <= 1) return null;

  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  return (
    <>
      {prevPage && (
        <link
          rel="prev"
          href={prevPage === 1 ? baseUrl : `${baseUrl}?page=${prevPage}`}
        />
      )}
      {nextPage && (
        <link
          rel="next"
          href={`${baseUrl}?page=${nextPage}`}
        />
      )}
    </>
  );
}
