import { arrayEquals } from '.'

export default interface IFilePath {
  children: string[]
  path: string[]
}

export function makeIFilePath(filePath: string[], children?: string[]): IFilePath {
  return {
    path: filePath,
    children: children ?? [],
  }
}

/**
 * Determines if a object is a valid FilePath.
 *
 * @param fp any type
 */
export function isIFilePath(fp: IFilePath | any): fp is IFilePath {
  const path = (fp as IFilePath).path
  const children = (fp as IFilePath).children
  const propsDefinied = path !== undefined && children !== undefined
  if (propsDefinied) {
    // check validity of path
    if (path.length <= 0) {
      return false
    }
    // check validity of children
    if (Array.isArray(children)) {
      children.forEach(function(item) {
        if (typeof item !== 'string') {
          return false
        }
      })
    } else {
      return false
    }
    // check validity of path
    const pathPrefix = path.slice(0, path.length - 1)
    if (pathPrefix.includes(path[path.length - 1])) {
      return false
    }
    const set = new Set(path)
    if (set.size !== path.length) {
      return false
    }
    return true
  }
  return false
}

export function isSameFilePath(fp1: IFilePath, fp2: IFilePath): boolean {
  return arrayEquals(fp1.children, fp2.children) && arrayEquals(fp1.path, fp2.path)
}
