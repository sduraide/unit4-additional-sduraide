import React from 'react'
import { Extent, IAnchor, IFolderNode, INode } from '../../../types'
import { FolderContent } from './FolderContent'
import { ImageContent } from './ImageContent'
import './NodeContent.scss'
import { TextEditor } from './TextEditor'

/** Props needed to render any node content */

export interface INodeContentProps {
  childNodes?: INode[]
  currentNode: INode
  onCreateNodeButtonClick: () => void
  onDeleteButtonClick: (node: INode) => void
  onMoveButtonClick: (node: INode) => void
  setSelectedNode: (node: INode) => void
  setSelectedExtent: (extent: Extent | null | undefined) => void
  selectedAnchors: IAnchor[]
  setSelectedAnchors: (anchor: IAnchor[]) => void
  refresh: boolean
  startAnchor: IAnchor | null
}

/**
 * This is the node content.
 *
 * @param props: INodeContentProps
 * @returns Content that any type of node renders
 */
export const NodeContent = (props: INodeContentProps) => {
  const {
    currentNode,
    setSelectedExtent,
    onCreateNodeButtonClick,
    onDeleteButtonClick,
    onMoveButtonClick,
    setSelectedNode,
    startAnchor,
    childNodes,
    selectedAnchors,
    setSelectedAnchors,
    refresh,
  } = props
  switch (currentNode.type) {
    case 'image':
      /* TODO If you created a new IImageNode object, then it would
      make sense to modify something here, have a look at IFolderNode
      below */
      return (
        <ImageContent
          currentNode={currentNode}
          selectedAnchors={selectedAnchors}
          setSelectedAnchors={setSelectedAnchors}
          setSelectedExtent={setSelectedExtent}
          setSelectedNode={setSelectedNode}
          startAnchor={startAnchor}
          refresh={refresh}
        />
      )
    case 'text':
      return (
        <TextEditor
          currentNode={currentNode}
          selectedAnchors={selectedAnchors}
          setSelectedAnchors={setSelectedAnchors}
          setSelectedExtent={setSelectedExtent}
          setSelectedNode={setSelectedNode}
          startAnchor={startAnchor}
          refresh={refresh}
        />
      )
      break
    case 'folder':
      if (childNodes) {
        return (
          <FolderContent
            node={currentNode as IFolderNode}
            onCreateNodeButtonClick={onCreateNodeButtonClick}
            onDeleteButtonClick={onDeleteButtonClick}
            onMoveButtonClick={onMoveButtonClick}
            setSelectedExtent={setSelectedExtent}
            setSelectedNode={setSelectedNode}
            childNodes={childNodes}
          />
        )
      }
  }
  return null
}
