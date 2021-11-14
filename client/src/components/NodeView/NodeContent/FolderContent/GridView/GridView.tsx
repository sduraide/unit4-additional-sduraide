import React from 'react'
import { INode } from '../../../../../types'
import { NodePreview } from '../NodePreview'
import './GridView.scss'
import * as ri from 'react-icons/ri'

export interface IGridViewProps {
  childNodes: INode[]
  onCreateNodeButtonClick: () => void
  onDeleteButtonClick: (node: INode) => void
  onMoveButtonClick: (node: INode) => void
  setSelectedNode: (node: INode) => void
}

/** Full page view focused on a node's content, with annotations and links */
export const GridView = (props: IGridViewProps) => {
  const {
    childNodes,
    setSelectedNode,
    onDeleteButtonClick,
    onMoveButtonClick,
    onCreateNodeButtonClick,
  } = props

  const nodePreviews = childNodes.map(
    (childNode: INode) =>
      childNode && (
        <NodePreview
          node={childNode}
          key={childNode.nodeId}
          setSelectedNode={setSelectedNode}
          onDeleteButtonClick={onDeleteButtonClick}
          onMoveButtonClick={onMoveButtonClick}
        />
      )
  )

  return (
    <div className={'gridView-wrapper'}>
      {nodePreviews}
      <div className="grid-newNode" onClick={onCreateNodeButtonClick}>
        <ri.RiAddFill />
      </div>
    </div>
  )
}
