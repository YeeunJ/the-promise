import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SegmentedControl } from '../components/admin/SegmentedControl';

describe('SegmentedControl', () => {
  const options = [
    { value: 'calendar', label: '달력' },
    { value: 'list', label: '리스트' },
  ];

  it('모든 옵션의 label을 버튼으로 렌더한다', () => {
    render(
      <SegmentedControl
        value="calendar"
        options={options}
        onChange={vi.fn()}
        ariaLabel="뷰 모드"
      />,
    );

    expect(screen.getByRole('button', { name: '달력' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '리스트' })).toBeInTheDocument();
  });

  it('현재 활성 옵션에 aria-pressed=true 가 부여된다', () => {
    render(
      <SegmentedControl
        value="list"
        options={options}
        onChange={vi.fn()}
        ariaLabel="뷰 모드"
      />,
    );

    expect(
      screen.getByRole('button', { name: '리스트' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('button', { name: '달력' }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('비활성 옵션 클릭 시 onChange가 해당 value로 호출된다', async () => {
    const handleChange = vi.fn();
    render(
      <SegmentedControl
        value="calendar"
        options={options}
        onChange={handleChange}
        ariaLabel="뷰 모드"
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: '리스트' }));
    expect(handleChange).toHaveBeenCalledWith('list');
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('이미 활성인 옵션을 클릭해도 onChange는 호출되지 않는다', async () => {
    const handleChange = vi.fn();
    render(
      <SegmentedControl
        value="calendar"
        options={options}
        onChange={handleChange}
        ariaLabel="뷰 모드"
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: '달력' }));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('group role과 ariaLabel을 부여한다', () => {
    render(
      <SegmentedControl
        value="calendar"
        options={options}
        onChange={vi.fn()}
        ariaLabel="뷰 모드"
      />,
    );

    expect(screen.getByRole('group', { name: '뷰 모드' })).toBeInTheDocument();
  });
});
