export interface HeadcountOption {
  value: number;
  label: string;
}

export const HEADCOUNT_OPTIONS: HeadcountOption[] = [
  { value: 10, label: '~10명' },
  { value: 20, label: '~20명' },
  { value: 30, label: '~30명' },
  { value: 50, label: '~50명' },
  { value: 100, label: '~100명' },
  { value: 200, label: '100명 이상' },
];

export const TIME_SLOT_MINUTES = 30;
