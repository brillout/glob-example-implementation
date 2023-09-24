import assert from 'assert'

export default function route(pageContext: { urlPathname: string; expressRouteProvidedByUser: string }) {
  // pageContext.expressRouteProvidedByUser would, for example, be provided by renderPage({ expressRouteProvidedByUser }) in your Express.js middleware
  const route = pageContext.expressRouteProvidedByUser
  const globs = router(route, pageContext.urlPathname)
  if (!globs) return false
  return {
    routeParams: {
      globs
    }
  }
}

function router(route: string, urlPathname: string): false | string[] {
  const routeSegments = splitRouteString(route)
  /*
  console.log()
  console.log('urlPathname', urlPathname)
  console.log('route', route)
  console.log('routeSegments', routeSegments)
  */
  let urlRest = urlPathname

  const globs: string[] = []
  let isGlobbing:
    | false
    | {
        match: string[]
        isTrailingGlob?: true
      } = false
  const pushGlob = () => {
    if (isGlobbing) {
      globs.push(isGlobbing.match.join('/'))
      isGlobbing = false
    }
  }

  for (const routeIndex in routeSegments) {
    const routeSegment = routeSegments[routeIndex]
    /*
    console.log('routeSegment', routeSegment)
    console.log('urlRest', urlRest)
    */
    if (routeSegment.static) {
      const { s } = routeSegment
      if (!isGlobbing) {
        if (!urlRest.startsWith(s)) return false
        urlRest = urlRest.slice(s.length)
      } else {
        if (!urlRest.includes(s)) return false
        const [match, ...rest] = urlRest.split(s)
        isGlobbing.match.push(match)
        pushGlob()
        urlRest = rest.join(s)
      }
    } else if (routeSegment.param) {
      // TODO
    } else {
      assert(routeSegment.glob)
      pushGlob()
      isGlobbing = { match: [] }
      if (routeIndex === String(routeSegments.length - 1)) {
        isGlobbing.isTrailingGlob = true
      }
    }
  }

  if (urlRest) {
    if (!isGlobbing) {
      return false
    } else {
      isGlobbing.match.push(urlRest)
      pushGlob()
    }
  }

  return globs
}

type Segment =
  | {
      glob: true
      static?: undefined
      param?: undefined
    }
  | {
      glob?: undefined
      static: true
      param?: undefined
      s: string
    }
  | {
      glob?: undefined
      static?: undefined
      param: true
      s: string
    }
function splitRouteString(s: string) {
  const segments: Segment[] = []
  const parts = s.split('/')
  parts.forEach((s, i) => {
    if (i !== parts.length - 1) s += '/'
    if (s.startsWith('@')) {
      segments.push({ param: true, s })
    } else {
      const parts = s.split('*')
      parts.forEach((s, i) => {
        if (i !== 0) segments.push({ glob: true })
        if (s !== '') {
          const segmentLast = segments[segments.length - 1]
          if (segmentLast?.static) {
            segmentLast.s += s
          } else {
            segments.push({ static: true, s })
          }
        }
      })
    }
  })
  return segments
}
