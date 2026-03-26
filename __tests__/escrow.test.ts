import { test } from 'node:test'
import * as assert from 'node:assert'

test('Escrow: timer correctly calculates 48-hour holds', () => {
  // Given a payment made exactly 24 hours ago
  const now = new Date()
  const paymentTime = new Date(now.getTime() - (24 * 60 * 60 * 1000))
  
  // The escrow period is 48 hours
  const escrowEnd = new Date(paymentTime.getTime() + (48 * 60 * 60 * 1000))
  
  // 1. Verify total milliseconds remaining
  const remainingMs = escrowEnd.getTime() - now.getTime()
  
  // It should roughly equal 24 hours (with minor ms variance for execution time)
  const hoursRemaining = remainingMs / (1000 * 60 * 60)
  assert.ok(Math.abs(hoursRemaining - 24) < 0.1, 'Should have exactly 24 hours remaining')
  
  // 2. Formatting tests
  const seconds = Math.floor(remainingMs / 1000)
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  
  assert.equal(h, 23) // 23h 59m 59s essentially
  assert.equal(m, 59)
})
