import { INode, makeIFolderNode, makeINode, NodeIdsToNodesMap } from '../../types'
import { traverseTree, TreeWrapper } from '../../types/TreeWrapper'

export const createNodeIdsToNodesMap = (rootNodes: any) => {
  const result: NodeIdsToNodesMap = {}
  for (const root of rootNodes) {
    traverseTree(root, (tree) => {
      result[tree.node.nodeId] = tree.node
    })
  }
  return result
}

export const makeRootWrapper = (rootNodes: any) => {
  const rootTreeWrapper: TreeWrapper = {
    addChild: () => null,
    children: rootNodes,
    node: makeIFolderNode('root', [], [], 'folder', 'MyHypermedia Dashboard', '', 'grid'),
  }
  return rootTreeWrapper
}

export const emptyNode: INode = makeINode(
  '404',
  [],
  [],
  'text',
  'Error 404',
  'Empty node'
)
