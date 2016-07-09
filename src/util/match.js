import Regexp from 'path-to-regexp'

export function createMatcher ({ pathMap, nameMap }) {
  return function match (location) {
    const {
      name,
      path,
      query = {},
      params = {}
    } = location

    if (name) {
      const entry = nameMap[location.name]
      if (entry) {
        return Object.freeze({
          path: Regexp.compile(entry.path)(params),
          query,
          params,
          matched: formatMatch(entry)
        })
      }
    } else {
      const params = {}
      for (const route in pathMap) {
        if (matchRoute(route, params, path)) {
          return Object.freeze({
            path,
            query,
            params,
            matched: formatMatch(pathMap[route])
          })
        }
      }
    }
  }
}

function matchRoute (path, params, pathname) {
  const keys = []
  const regexp = Regexp(path, keys)
  const m = regexp.exec(pathname)

  if (!m) {
    return false
  } else if (!params) {
    return true
  }

  for (var i = 1, len = m.length; i < len; ++i) {
    var key = keys[i - 1]
    var val = 'string' == typeof m[i] ? decodeURIComponent(m[i]) : m[i]
    if (key) params[key.name] = val
  }

  return true
}

function formatMatch (record) {
  const res = []
  while (record) {
    res.unshift(record)
    record = record.parent
  }
  return res
}