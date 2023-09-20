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
  let globs: string[] = []

  const routeSegments = route.split('/')
  const urlSegments = urlPathname.split('/')

  let urlIndex = 0
  let isGlobbing:
    | false
    | {
        match: string[]
        isTrailingGlob?: true
      } = false
  for (const routeIndex in routeSegments) {
    const routeSegment = routeSegments[routeIndex]

    if (routeSegment === '*') {
      isGlobbing = { match: [] }
      if (routeIndex === String(routeSegments.length - 1)) {
        isGlobbing.isTrailingGlob = true
      } else {
        continue
      }
    }

    while (true) {
      const urlSegment = urlSegments[urlIndex]
      urlIndex++
      if (urlSegment === undefined) {
        if (!isGlobbing || !isGlobbing.isTrailingGlob) {
          return false
        } else {
          globs.push(isGlobbing.match.join('/'))
          isGlobbing = false
          break
        }
      }
      if (urlSegment !== routeSegment) {
        if (!isGlobbing) {
          return false
        } else {
          isGlobbing.match.push(urlSegment)
        }
      } else {
        if (isGlobbing) {
          globs.push(isGlobbing.match.join('/'))
          isGlobbing = false
        }
        break
      }
    }
  }

  return globs
}
