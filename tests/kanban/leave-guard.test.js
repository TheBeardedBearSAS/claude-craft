import { describe, it, expect, vi } from 'vitest';
import { createLeaveGuard } from '../../cli/kanban/client/src/lib/leave-guard.js';

describe('createLeaveGuard', () => {
  it('lets the navigation through when no guard is registered or none is dirty', async () => {
    const guard = createLeaveGuard();
    expect(await guard.mayLeave()).toBe(true);
    const confirm = vi.fn();
    guard.add({ dirty: () => false, confirm });
    expect(await guard.mayLeave()).toBe(true);
    expect(confirm).not.toHaveBeenCalled();
  });

  it('asks the first dirty guard and follows its answer', async () => {
    const guard = createLeaveGuard();
    guard.add({ dirty: () => false, confirm: async () => false });
    const ask = vi.fn(async () => false);
    guard.add({ dirty: () => true, confirm: ask });
    expect(await guard.mayLeave()).toBe(false);
    ask.mockResolvedValueOnce(true);
    expect(await guard.mayLeave()).toBe(true);
    expect(ask).toHaveBeenCalledTimes(2);
  });

  it('isDirty() tells synchronously whether a question would be asked', () => {
    const guard = createLeaveGuard();
    expect(guard.isDirty()).toBe(false);
    let dirty = false;
    guard.add({ dirty: () => dirty, confirm: async () => true });
    expect(guard.isDirty()).toBe(false);
    dirty = true;
    expect(guard.isDirty()).toBe(true);
  });

  it('add() returns a remover', async () => {
    const guard = createLeaveGuard();
    const remove = guard.add({ dirty: () => true, confirm: async () => false });
    remove();
    expect(await guard.mayLeave()).toBe(true);
  });

  it('busy while a question is open', async () => {
    const guard = createLeaveGuard();
    let answer;
    guard.add({ dirty: () => true, confirm: () => new Promise((r) => (answer = r)) });
    const pending = guard.mayLeave();
    expect(guard.busy).toBe(true);
    answer(true);
    expect(await pending).toBe(true);
    expect(guard.busy).toBe(false);
  });
});
