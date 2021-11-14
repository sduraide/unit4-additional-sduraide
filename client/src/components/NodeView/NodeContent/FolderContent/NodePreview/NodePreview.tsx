import React from 'react'
import { Link } from 'react-router-dom'
import { nodeTypeIcon, pathToString } from '../../../../../global'
import { INode } from '../../../../../types'
import './NodePreview.scss'
import { NodePreviewContent } from './NodePreviewContent'

export interface INodePreviewProps {
  node: INode
  onDeleteButtonClick: (node: INode) => void
  onMoveButtonClick: (node: INode) => void
  setSelectedNode: (node: INode) => void
}

/** Full page view focused on a node's content, with annotations and links */
export const NodePreview = (props: INodePreviewProps) => {
  const { node, setSelectedNode } = props
  const { type, title, content } = node
  return (
    <Link to={`/${pathToString(node.filePath)}`}>
      <div
        className={'grid-nodePreview'}
        onClick={() => {
          setSelectedNode(node)
        }}
      >
        <div className="content-preview">
          <NodePreviewContent type={type} content={content} />
        </div>
        <div className="node-info">
          <div className="info-container">
            <div className="main-info">
              {nodeTypeIcon(node.type)}
              <div className="title">{title}</div>
            </div>
            <div className="sub-info">
              {node.dateCreated && (
                <div className="dateCreated">
                  {'Created on ' + new Date(node.dateCreated).toLocaleDateString('en-US')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
