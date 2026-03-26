// __tests__/slots.test.ts
import { test } from 'node:test'
import * as assert from 'node:assert'

// Simulating the slot availability logic used in the pools detail page
test('Slots: correctly calculates pool fullness and remaining seats', () => {
  const evaluatePool = (current: number, max: number) => {
    return {
      isFull: current >= max,
      slotsRemaining: max - current
    }
  }

  // Test 1: Empty Pool
  const empty = evaluatePool(0, 4)
  assert.equal(empty.isFull, false)
  assert.equal(empty.slotsRemaining, 4)

  // Test 2: Partially Full Pool
  const partial = evaluatePool(2, 4)
  assert.equal(partial.isFull, false)
  assert.equal(partial.slotsRemaining, 2)

  // Test 3: Completely Full Pool
  const full = evaluatePool(4, 4)
  assert.equal(full.isFull, true)
  assert.equal(full.slotsRemaining, 0)

  // Test 4: Overbooked (Safety Edge Case)
  const over = evaluatePool(5, 4)
  assert.equal(over.isFull, true)
  assert.equal(over.slotsRemaining, -1)
})
