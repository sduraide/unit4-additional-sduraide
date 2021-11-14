import React, { useEffect, useCallback } from 'react'
import { Extent, FolderContentType, IFolderNode, INode } from '../../../../types'
import './FolderContent.scss'
import { GridView } from './GridView'
import { ListView } from './ListView'
import { GraphView } from './GraphView'

export interface IFolderContentProps {
  childNodes: INode[]
  node: IFolderNode
  onCreateNodeButtonClick: () => unknown
  onDeleteButtonClick: (node: INode) => unknown
  onMoveButtonClick: (node: INode) => unknown
  setSelectedNode: (node: INode) => void
  setSelectedExtent: (extent: Extent | null | undefined) => void
  viewType?: FolderContentType
}

/** Full page view focused on a node's content, with annotations and links */
export const FolderContent = (props: IFolderContentProps) => {
  const {
    node,
    childNodes,
    setSelectedNode,
    onDeleteButtonClick,
    onMoveButtonClick,
    setSelectedExtent,
    onCreateNodeButtonClick,
  } = props

  // useEffect
  useEffect(() => {
    setSelectedExtent && setSelectedExtent(null)
  }, [])

  const handleSetView = useCallback(() => {
    let nodes
    switch ((node as IFolderNode).viewType) {
      case 'grid':
        nodes = (
          <GridView
            onCreateNodeButtonClick={onCreateNodeButtonClick}
            onDeleteButtonClick={onDeleteButtonClick}
            onMoveButtonClick={onMoveButtonClick}
            childNodes={childNodes}
            setSelectedNode={setSelectedNode}
          />
        )
        break
      case 'list':
        nodes = (
          <ListView
            onCreateNodeButtonClick={onCreateNodeButtonClick}
            onDeleteButtonClick={onDeleteButtonClick}
            onMoveButtonClick={onMoveButtonClick}
            childNodes={childNodes}
            setSelectedNode={setSelectedNode}
          />
        )
        break
      case 'graph':
        nodes = <GraphView childNodes={childNodes} />
        break
      default:
        nodes = null
        break
    }
    return nodes
  }, [childNodes, node])

  useEffect(() => {
    handleSetView()
  }, [node.viewType, handleSetView])

  return <div className="fullWidthFolder">{handleSetView()}</div>
}
