interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (next: number) => void;
  isLoading?: boolean;
}

const ELLIPSIS = '…' as const;
type PageItem = number | typeof ELLIPSIS;

function buildPageItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: PageItem[] = [1];

  if (page <= 3) {
    for (let p = 2; p <= 5; p++) items.push(p);
    items.push(ELLIPSIS);
  } else if (page >= totalPages - 2) {
    items.push(ELLIPSIS);
    for (let p = totalPages - 4; p <= totalPages - 1; p++) items.push(p);
  } else {
    items.push(ELLIPSIS);
    for (let p = page - 2; p <= page + 2; p++) items.push(p);
    items.push(ELLIPSIS);
  }

  items.push(totalPages);
  return items;
}

export function Pagination({
  page,
  totalPages,
  onChange,
  isLoading = false,
}: PaginationProps): JSX.Element | null {
  if (totalPages <= 1) return null;

  const isPrevDisabled = isLoading || page <= 1;
  const isNextDisabled = isLoading || page >= totalPages;
  const items = buildPageItems(page, totalPages);

  const baseBtnClass =
    'min-w-[36px] h-9 px-2 text-sm rounded-lg border border-[#E5E7EB] bg-white hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors';
  const currentBtnClass =
    'min-w-[36px] h-9 px-2 text-sm rounded-lg bg-brand-primary text-white font-semibold';

  return (
    <nav
      aria-label="페이지네이션"
      className="flex items-center justify-center gap-1.5 mt-4"
    >
      <button
        type="button"
        aria-label="이전 페이지"
        disabled={isPrevDisabled}
        onClick={() => onChange(page - 1)}
        className={baseBtnClass}
      >
        ◀
      </button>

      {items.map((item, idx) => {
        if (item === ELLIPSIS) {
          return (
            <span
              key={`ellipsis-${String(idx)}`}
              className="px-1 text-sm text-gray-400"
              aria-hidden="true"
            >
              {ELLIPSIS}
            </span>
          );
        }
        const isCurrent = item === page;
        return (
          <button
            key={item}
            type="button"
            aria-label={`${String(item)}페이지`}
            aria-current={isCurrent ? 'page' : undefined}
            disabled={isLoading || isCurrent}
            onClick={() => {
              if (!isCurrent) onChange(item);
            }}
            className={isCurrent ? currentBtnClass : baseBtnClass}
          >
            {item}
          </button>
        );
      })}

      <button
        type="button"
        aria-label="다음 페이지"
        disabled={isNextDisabled}
        onClick={() => onChange(page + 1)}
        className={baseBtnClass}
      >
        ▶
      </button>
    </nav>
  );
}
