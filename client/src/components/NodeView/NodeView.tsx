import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnchorGateway } from '../../anchors'
import { generateObjectId } from '../../global'
import { Extent, IAnchor, INode, isSameExtent, NodeIdsToNodesMap } from '../../types'
import { NodeBreadcrumb } from './NodeBreadcrumb'
import { NodeContent } from './NodeContent'
import { NodeHeader } from './NodeHeader'
import { NodeLinkMenu } from './NodeLinkMenu'
import './NodeView.scss'

export interface INodeViewProps {
  // for folder node content
  currentNode: INode
  // linking state
  isLinking: boolean
  // toggling linking state
  setIsLinking: (isLinking: boolean) => void
  // first anchor of link (anchor1)
  startAnchor: IAnchor | null
  // set anchor1 of link
  setStartAnchor: (anchor: IAnchor) => void
  // set anchor2 of link
  setEndAnchor: (anchor: IAnchor) => void
  // map of nodeIds to nodes
  nodeIdsToNodesMap: NodeIdsToNodesMap
  // handler for completing link
  onCompleteLinkClick: () => void
  // handler for opening create node modal
  onCreateNodeButtonClick: () => void
  // handler for deleting currentNode
  onDeleteButtonClick: (node: INode) => void
  // handler for opening move node modal
  onMoveButtonClick: (node: INode) => void
  // useEffect dependency for refreshing link list
  refresh: boolean
  // setter for refresh
  setRefresh: (refresh: boolean) => void
  // list of currently highlighted anchors
  selectedAnchors: IAnchor[]
  // currently selected Extent on node
  selectedExtent: Extent | null | undefined
  // setter for selectedExtent
  setSelectedExtent: (extent: Extent | null | undefined) => void
  // setter for selectedAnchors
  setSelectedAnchors: (anchor: IAnchor[]) => void
  // setter for selectedNode
  setSelectedNode: (node: INode | null) => void
  // children used when rendering folder node
  childNodes?: INode[]
  setAlertIsOpen: (open: boolean) => void
  setAlertMessage: (message: string) => void
  setAlertTitle: (title: string) => void
}

/** Full page view focused on a node's content, with annotations and links */
export const NodeView = (props: INodeViewProps) => {
  const {
    currentNode,
    isLinking,
    setIsLinking,
    startAnchor,
    setStartAnchor,
    setEndAnchor,
    nodeIdsToNodesMap,
    onCompleteLinkClick,
    onCreateNodeButtonClick,
    onDeleteButtonClick,
    onMoveButtonClick,
    refresh,
    setRefresh,
    selectedAnchors,
    setSelectedExtent,
    selectedExtent,
    setSelectedAnchors,
    setSelectedNode,
    setAlertIsOpen,
    setAlertMessage,
    setAlertTitle,
    childNodes,
  } = props

  const [anchors, setAnchors] = useState<IAnchor[]>([])
  const {
    filePath: { path },
  } = currentNode

  const loadAnchorsFromNodeId = useCallback(async () => {
    const anchorsFromNode = await AnchorGateway.getAnchorsByNodeId(currentNode.nodeId)
    if (anchorsFromNode.success && anchorsFromNode.payload) {
      setAnchors(anchorsFromNode.payload)
    }
  }, [currentNode])

  const handleStartLinkClick = () => {
    if (selectedExtent === undefined) {
      setAlertIsOpen(true)
      setAlertTitle('Cannot start link from this anchor')
      setAlertMessage(
        // eslint-disable-next-line
        'There are overlapping anchors, or this anchor contains other anchors. Before you create this anchor you must remove the other anchors.'
      )
    } else {
      const anchor = {
        anchorId: generateObjectId('anchor'),
        extent: selectedExtent,
        nodeId: currentNode.nodeId,
      }
      setStartAnchor(anchor)
      setIsLinking(true)
    }
  }

  const handleCompleteLinkClick = async () => {
    const anchorsByNodeResp = await AnchorGateway.getAnchorsByNodeId(currentNode.nodeId)
    let anchor2: IAnchor | undefined = undefined
    if (
      anchorsByNodeResp.success &&
      anchorsByNodeResp.payload &&
      selectedExtent !== undefined
    ) {
      anchorsByNodeResp.payload?.forEach((nodeAnchor) => {
        if (isSameExtent(nodeAnchor.extent, selectedExtent)) {
          anchor2 = nodeAnchor
        }
        if (startAnchor && isSameExtent(nodeAnchor.extent, startAnchor.extent)) {
          setStartAnchor(nodeAnchor)
        }
      })
    }
    if (selectedExtent !== undefined) {
      anchor2 = {
        anchorId: generateObjectId('anchor'),
        extent: selectedExtent,
        nodeId: currentNode.nodeId,
      }
      setEndAnchor(anchor2)
      onCompleteLinkClick()
    }
  }

  useEffect(() => {
    loadAnchorsFromNodeId()
  }, [loadAnchorsFromNodeId, currentNode, refresh, setSelectedAnchors])

  const hasBreadcrumb: boolean = path.length > 1
  const hasAnchors: boolean = anchors.length > 0
  let nodePropertiesWidth: number = hasAnchors ? 200 : 0
  const nodeViewWidth: string = `calc(100% - ${nodePropertiesWidth}px)`

  const nodeProperties = useRef<HTMLHeadingElement>(null)
  const divider = useRef<HTMLHeadingElement>(null)
  let xLast: number
  let dragging: boolean = false

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragging = true
    xLast = e.screenX
    document.removeEventListener('pointermove', onPointerMove)
    document.addEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerup', onPointerUp)
    document.addEventListener('pointerup', onPointerUp)
  }

  const onPointerMove = (e: PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (divider.current) divider.current.style.width = '10px'
    if (nodeProperties.current && dragging) {
      const nodePropertiesElement = nodeProperties.current
      let width = parseFloat(nodePropertiesElement.style.width)
      const deltaX = e.screenX - xLast // The change in the x location
      const newWidth = (width -= deltaX)
      if (!(newWidth < 200 || newWidth > 480)) {
        nodePropertiesElement.style.width = String(width) + 'px'
        nodePropertiesWidth = width
        xLast = e.screenX
      }
    }
  }

  const onPointerUp = (e: PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragging = false
    if (divider.current) divider.current.style.width = ''
    document.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerup', onPointerUp)
  }

  return (
    <div className="node">
      <div className="nodeView" style={{ width: nodeViewWidth }}>
        <NodeHeader
          currentNode={currentNode}
          onMoveButtonClick={onMoveButtonClick}
          isLinking={isLinking}
          onDeleteButtonClick={onDeleteButtonClick}
          onHandleStartLinkClick={handleStartLinkClick}
          onHandleCompleteLinkClick={handleCompleteLinkClick}
          setSelectedNode={setSelectedNode}
          setAlertIsOpen={setAlertIsOpen}
          setAlertMessage={setAlertMessage}
          setAlertTitle={setAlertTitle}
          refresh={refresh}
          setRefresh={setRefresh}
        />
        <div className="nodeView-scrollable">
          {hasBreadcrumb && (
            <div className="nodeView-breadcrumb">
              <NodeBreadcrumb
                path={path}
                nodeIdsToNodesMap={nodeIdsToNodesMap}
                setSelected={setSelectedNode}
              />
            </div>
          )}
          <div className="nodeView-content">
            <NodeContent
              selectedAnchors={selectedAnchors}
              setSelectedAnchors={setSelectedAnchors}
              refresh={refresh}
              setSelectedExtent={setSelectedExtent}
              startAnchor={startAnchor}
              childNodes={childNodes}
              currentNode={currentNode}
              onCreateNodeButtonClick={onCreateNodeButtonClick}
              onDeleteButtonClick={onDeleteButtonClick}
              setSelectedNode={setSelectedNode}
              onMoveButtonClick={onMoveButtonClick}
            />
          </div>
        </div>
      </div>
      {hasAnchors && (
        <div className="divider" ref={divider} onPointerDown={onPointerDown} />
      )}
      {hasAnchors && (
        <div
          className={'nodeProperties'}
          ref={nodeProperties}
          style={{ width: nodePropertiesWidth }}
        >
          <NodeLinkMenu
            currentNode={currentNode}
            setSelectedNode={setSelectedNode}
            setSelectedAnchors={setSelectedAnchors}
            selectedAnchors={selectedAnchors}
            nodeIdsToNodesMap={nodeIdsToNodesMap}
            setRefresh={setRefresh}
            refresh={refresh}
            setAlertIsOpen={setAlertIsOpen}
            setAlertMessage={setAlertMessage}
            setAlertTitle={setAlertTitle}
          />
        </div>
      )}
    </div>
  )
}
