import React from 'react'
import { INode } from '../../types'
import { TreeWrapper } from '../../types/TreeWrapper'
import { TreeViewItem } from './TreeViewItem'
import './TreeView.scss'

export interface ITreeViewProps {
  changeUrlOnClick?: boolean
  roots: TreeWrapper[]
  selectedNode: INode | null
  setSelectedNode: (node: INode) => void
}

export const TreeView = (props: ITreeViewProps) => {
  const { roots, selectedNode, setSelectedNode, changeUrlOnClick = true } = props
  return (
    <div className="treeView-wrapper">
      {roots.map((tree: TreeWrapper) => (
        <TreeViewItem
          node={tree.node}
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
          key={tree.node.nodeId}
          type={tree.node.type}
          title={tree.node.title}
          childNodes={tree.children}
          changeUrlOnClick={changeUrlOnClick}
        />
      ))}
    </div>
  )
}
