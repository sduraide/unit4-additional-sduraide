import { ChakraProvider } from '@chakra-ui/react'
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { NodeGateway } from '../../nodes'
import { Extent, IAnchor, INode, NodeIdsToNodesMap, TreeWrapper } from '../../types'
import { Alert } from '../Alert'
import { ContextMenu } from '../ContextMenu/ContextMenu'
import { Header } from '../Header'
import { LoadingScreen } from '../LoadingScreen'
import { CompleteLinkModal, CreateNodeModal, MoveNodeModal } from '../Modals'
import { NodeView } from '../NodeView'
import { TreeView } from '../TreeView'
import './MainView.scss'
import { createNodeIdsToNodesMap, emptyNode, makeRootWrapper } from './mainViewUtils'

export const MainView = React.memo(function MainView() {
  // app states
  const [isAppLoaded, setIsAppLoaded] = useState(false)
  const [isLinking, setIsLinking] = useState(false)
  // modal states
  const [createNodeModalOpen, setCreateNodeModalOpen] = useState(false)
  const [completeLinkModalOpen, setCompleteLinkModalOpen] = useState(false)
  const [moveNodeModalOpen, setMoveNodeModalOpen] = useState(false)
  // node states
  const [selectedNode, setSelectedNode] = useState<INode | null>(null)
  const [rootNodes, setRootNodes] = useState<TreeWrapper[]>([new TreeWrapper(emptyNode)])
  // link states
  const [startAnchor, setStartAnchor] = useState<IAnchor | null>(null)
  const [endAnchor, setEndAnchor] = useState<IAnchor | null>(null)
  const [refresh, setRefresh] = useState(false)
  // anchor states
  const [selectedAnchors, setSelectedAnchors] = useState<IAnchor[]>([])
  const [selectedExtent, setSelectedExtent] = useState<Extent | null | undefined>(null)

  /** update our frontend root nodes from the database */
  const loadRootsFromDB = useCallback(async () => {
    const rootsFromDB = await NodeGateway.getRoots()
    if (rootsFromDB.success) {
      rootsFromDB.payload && setRootNodes(rootsFromDB.payload)
      setIsAppLoaded(true)
    }
  }, [])

  useEffect(() => {
    loadRootsFromDB()
  }, [loadRootsFromDB, refresh])

  const rootTreeWrapper: TreeWrapper = useMemo(
    () => makeRootWrapper(rootNodes),
    [rootNodes]
  )

  // map each nodeId to its full node object for easy access
  const nodeIdsToNodesMap: NodeIdsToNodesMap = useMemo(
    () => createNodeIdsToNodesMap(rootNodes),
    [rootNodes]
  )

  // node routing	logic
  const url = useLocation().pathname.slice(0, -1)
  const lastUrlParam = url.substring(url.lastIndexOf('/') + 1)

  useEffect(() => {
    const currentNodeId = lastUrlParam
    async function fetchNodeFromUrl() {
      const fetchResp = await NodeGateway.getNode(currentNodeId)
      if (fetchResp.success) {
        setSelectedNode(fetchResp.payload)
      } else {
        console.log('Couldn\'t fetch')
      }
    }
    fetchNodeFromUrl()
  }, [lastUrlParam])

  const globalKeyHandlers = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        setSelectedAnchors([])
        setSelectedExtent(null)
    }
  }

  // Trigger on app load
  useEffect(() => {
    document.addEventListener('keydown', globalKeyHandlers)
  }, [])

  // button handlers
  const handleCreateNodeButtonClick = useCallback(() => {
    setCreateNodeModalOpen(true)
  }, [setCreateNodeModalOpen])

  const handleDeleteNodeButtonClick = useCallback(
    async (node: INode) => {
      if (node) {
        const deleteResp = await NodeGateway.deleteNode(node.nodeId)
        if (!deleteResp.success) {
          setAlertIsOpen(true)
          setAlertTitle('Delete node failed')
          setAlertMessage('Delete node failed in MainView.tsx:97')
          return
        }
        const path: string[] = node.filePath.path
        if (path.length > 1) {
          const parentId: string = path[path.length - 2]
          const parentResp = await NodeGateway.getNode(parentId)
          if (parentResp.success) {
            setSelectedNode(parentResp.payload)
            return
          }
        }
        setSelectedNode(null)
        loadRootsFromDB()
      }
    },
    [loadRootsFromDB]
  )

  const handleMoveNodeButtonClick = useCallback(() => {
    setMoveNodeModalOpen(true)
  }, [])

  const handleCompleteLinkClick = useCallback(() => {
    setCompleteLinkModalOpen(true)
  }, [])

  const handleHomeClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const getSelectedNodeChildren = useCallback(() => {
    if (!selectedNode) return undefined
    return selectedNode.filePath.children.map(
      (childNodeId) => nodeIdsToNodesMap[childNodeId]
    )
  }, [nodeIdsToNodesMap, selectedNode])

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

    if (treeView.current && dragging) {
      const treeViewElement = treeView.current
      let width = parseFloat(treeViewElement.style.width)
      const deltaX = e.screenX - xLast // The change in the x location
      const newWidth = (width += deltaX)
      if (!(newWidth < 100 || newWidth > 480)) {
        treeViewElement.style.width = String(width) + 'px'
        xLast = e.screenX
      }
    }
  }

  const onPointerUp = (e: PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragging = false
    document.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerup', onPointerUp)
  }

  const treeView = useRef<HTMLHeadingElement>(null)
  const [isAlertOpen, setAlertIsOpen] = React.useState<boolean>(false)
  const [alertMessage, setAlertMessage] = React.useState<string>('')
  const [alertTitle, setAlertTitle] = React.useState<string>('')

  return (
    <ChakraProvider>
      {!isAppLoaded ? (
        <LoadingScreen hasTimeout={true} />
      ) : (
        <div className="main-container">
          <Alert
            isOpen={isAlertOpen}
            setIsOpen={setAlertIsOpen}
            title={alertTitle}
            body={alertMessage}
          ></Alert>
          <Header
            onHomeClick={handleHomeClick}
            onCreateNodeButtonClick={handleCreateNodeButtonClick}
            isLinking={isLinking}
            startAnchor={startAnchor}
            setStartAnchor={setStartAnchor}
            setIsLinking={setIsLinking}
            setSelectedExtent={setSelectedExtent}
            nodeIdsToNodesMap={nodeIdsToNodesMap}
          />
          <CreateNodeModal
            isOpen={createNodeModalOpen}
            onClose={() => setCreateNodeModalOpen(false)}
            setSelectedNode={setSelectedNode}
            roots={rootNodes}
            nodeIdsToNodesMap={nodeIdsToNodesMap}
            onSubmit={loadRootsFromDB}
          />
          <CompleteLinkModal
            isOpen={completeLinkModalOpen}
            onClose={() => setCompleteLinkModalOpen(false)}
            startAnchor={startAnchor}
            endAnchor={endAnchor}
            setStartAnchor={setStartAnchor}
            setIsLinking={setIsLinking}
            setSelectedAnchors={setSelectedAnchors}
            setRefresh={setRefresh}
            refresh={refresh}
            nodeIdsToNodes={nodeIdsToNodesMap}
          />
          {selectedNode && (
            <MoveNodeModal
              isOpen={moveNodeModalOpen}
              onClose={() => setMoveNodeModalOpen(false)}
              onSubmit={loadRootsFromDB}
              setSelectedNode={setSelectedNode}
              node={selectedNode}
              roots={rootNodes}
            />
          )}
          <div className="content">
            <div className="treeView-container" ref={treeView} style={{ width: 350 }}>
              <TreeView
                roots={rootNodes}
                selectedNode={selectedNode}
                setSelectedNode={setSelectedNode}
              />
            </div>
            <div className="divider" onPointerDown={onPointerDown} />
            <div className="node-wrapper">
              <NodeView
                childNodes={
                  selectedNode
                    ? getSelectedNodeChildren()
                    : rootNodes.map((root) => root.node)
                }
                setSelectedNode={setSelectedNode}
                currentNode={selectedNode ? selectedNode : rootTreeWrapper.node}
                onDeleteButtonClick={handleDeleteNodeButtonClick}
                onMoveButtonClick={handleMoveNodeButtonClick}
                onCompleteLinkClick={handleCompleteLinkClick}
                onCreateNodeButtonClick={handleCreateNodeButtonClick}
                nodeIdsToNodesMap={nodeIdsToNodesMap}
                setStartAnchor={setStartAnchor}
                setEndAnchor={setEndAnchor}
                startAnchor={startAnchor}
                isLinking={isLinking}
                setIsLinking={setIsLinking}
                selectedAnchors={selectedAnchors}
                setSelectedAnchors={setSelectedAnchors}
                selectedExtent={selectedExtent}
                setSelectedExtent={setSelectedExtent}
                refresh={refresh}
                setRefresh={setRefresh}
                setAlertIsOpen={setAlertIsOpen}
                setAlertMessage={setAlertMessage}
                setAlertTitle={setAlertTitle}
              />
            </div>
          </div>
        </div>
      )}
      <ContextMenu />
    </ChakraProvider>
  )
})
