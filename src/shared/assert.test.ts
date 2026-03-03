import { describe, it, expect } from 'vitest'
import { assert } from './assert'

describe('assert', () => {
  it('does not throw when condition is true', () => {
    expect(() => assert(true)).not.toThrow()
  })

  it('does not throw when condition is a truthy value', () => {
    expect(() => assert(1)).not.toThrow()
    expect(() => assert('non-empty')).not.toThrow()
    expect(() => assert({})).not.toThrow()
  })

  it('throws when condition is false', () => {
    expect(() => assert(false)).toThrow('Assertion failed')
  })

  it('throws when condition is a falsy value', () => {
    expect(() => assert(0)).toThrow('Assertion failed')
    expect(() => assert(null)).toThrow('Assertion failed')
    expect(() => assert(undefined)).toThrow('Assertion failed')
    expect(() => assert('')).toThrow('Assertion failed')
  })

  it('throws with a custom message when provided', () => {
    expect(() => assert(false, 'Custom error message')).toThrow(
      'Custom error message',
    )
  })

  it('throws an instance of Error', () => {
    expect(() => assert(false)).toThrow(Error)
  })
})
