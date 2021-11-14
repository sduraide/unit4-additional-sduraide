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
