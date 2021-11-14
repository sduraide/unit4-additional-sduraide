import { INode } from '.'

export class TreeWrapper {
  node: INode
  children: TreeWrapper[]

  constructor(node: INode) {
    this.node = node
    this.children = []
  }

  addChild(child: TreeWrapper) {
    this.children.push(child)
  }
}

export function traverseTree(tree: TreeWrapper, callback: (tree: TreeWrapper) => void) {
  callback(tree)
  if (tree.children) {
    tree.children.map((child) => traverseTree(child, callback))
  }
}
