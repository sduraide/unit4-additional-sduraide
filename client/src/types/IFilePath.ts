export interface IFilePath {
  children: string[]
  path: string[]
}

export function makeIFilePath(filePath: string[], children?: string[]): IFilePath {
  return {
    children: children ?? [],
    path: filePath,
  }
}
