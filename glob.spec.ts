import { expect, describe, it } from 'vitest'
import route from './route.js'

describe('route()', () => {
  it('basics', () => {
    expect(test('/a', '/a')).toEqual([])
    expect(test('/', '/')).toEqual([])
    expect(test('/a', '/b')).toBe(false)
    expect(test('/a/b', '/a/b')).toEqual([])
  })
  it('globbing', () => {
    expect(test('/a/*/c', '/a/b/d')).toEqual(false)
    expect(test('/a/*', '/a/b/c')).toEqual(['b/c'])
    expect(test('/a/*/c', '/a/b/c')).toEqual(['b'])
    expect(test('/*', '/a')).toEqual(['a'])
    expect(test('/*', '/a/b/c/d')).toEqual(['a/b/c/d'])
    expect(test('/a/*', '/a/b/c/d')).toEqual(['b/c/d'])
    expect(test('/a/b/*', '/a/b/c/d')).toEqual(['c/d'])
    expect(test('/a/b/c/d', '/a/b/c/d')).toEqual([])
    expect(test('/a/*/c/*/e', '/a/b/c/d/e')).toEqual(['b', 'd'])
    expect(test('/a/*/c/*', '/a/b/c/d/e')).toEqual(['b', 'd/e'])
    expect(test('/a/*/e', '/a/b/c/d/e')).toEqual(['b/c/d'])
  })
})

function test(routeString: string, urlPathname: string) {
  const res = route({ urlPathname, expressRouteProvidedByUser: routeString })
  return res && res.routeParams.globs
}
