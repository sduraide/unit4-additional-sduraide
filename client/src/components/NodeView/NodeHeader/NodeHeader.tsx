import { Select } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import * as bi from 'react-icons/bi'
import * as ri from 'react-icons/ri'
import { NodeGateway } from '../../../nodes'
import { IFolderNode, INode, INodeProperty, makeINodeProperty } from '../../../types'
import { Button } from '../../Button'
import { ContextMenuItems } from '../../ContextMenu'
import { EditableText } from '../../EditableText'
import './NodeHeader.scss'

export interface INodeHeaderProps {
  onHandleCompleteLinkClick: () => void
  onHandleStartLinkClick: () => void
  currentNode: INode
  isLinking: boolean
  onDeleteButtonClick: (node: INode) => void
  onMoveButtonClick: (node: INode) => void
  setSelectedNode: (node: INode | null) => void
  setAlertIsOpen: (open: boolean) => void
  setAlertMessage: (message: string) => void
  setAlertTitle: (title: string) => void
  refresh: boolean
  setRefresh: (refresh: boolean) => void
}

export const NodeHeader = (props: INodeHeaderProps) => {
  const {
    currentNode,
    onDeleteButtonClick,
    onMoveButtonClick,
    isLinking,
    onHandleStartLinkClick,
    onHandleCompleteLinkClick,
    setSelectedNode,
    setAlertIsOpen,
    setAlertMessage,
    setAlertTitle,
    setRefresh,
    refresh,
  } = props

  // State variable for current node title
  const [title, setTitle] = useState(currentNode.title)
  // State variable for whether the title is being edited
  const [editingTitle, setEditingTitle] = useState<boolean>(false)

  /* Method to update the current folder view */
  const handleUpdateFolderView = async (e: React.ChangeEvent) => {
    const nodeProperty: INodeProperty = makeINodeProperty(
      'viewType',
      (e.currentTarget as any).value as any
    )
    const updateViewResp = await NodeGateway.updateNode(currentNode.nodeId, [
      nodeProperty,
    ])
    if (updateViewResp.success) {
      setSelectedNode(updateViewResp.payload)
    } else {
      setAlertIsOpen(true)
      setAlertTitle('View not updated')
      setAlertMessage(updateViewResp.message)
    }
  }

  /* Method to update the node title */
  const handleUpdateTitle = async (title: string) => {
    setTitle(title)
    const nodeProperty: INodeProperty = makeINodeProperty('title', title)
    const titleUpdateResp = await NodeGateway.updateNode(currentNode.nodeId, [
      nodeProperty,
    ])
    if (!titleUpdateResp.success) {
      setAlertIsOpen(true)
      setAlertTitle('Title update failed')
      setAlertMessage(titleUpdateResp.message)
    }
    setRefresh(!refresh)
  }

  /* Method called on title right click */
  const handleTitleRightClick = () => {
    // Open custom context menu
    ContextMenuItems.splice(0, ContextMenuItems.length)
    let os: string = ''
    if (navigator.userAgent.indexOf('Win') != -1) os = 'win'
    if (navigator.userAgent.indexOf('Mac') != -1) os = 'mac'
    if (navigator.userAgent.indexOf('X11') != -1) os = 'x11'
    if (navigator.userAgent.indexOf('Linux') != -1) os = 'linux'
    const menuItem: JSX.Element = (
      <div
        key={'titleRename'}
        className="contextMenuItem"
        onClick={(e) => {
          ContextMenuItems.splice(0, ContextMenuItems.length)
          setEditingTitle(true)
        }}
      >
        <div className="itemText">Rename</div>
        <div className="itemShortcut">{os == 'win' ? 'ctrl' : 'cmmd'} + shift + R</div>
      </div>
    )
    ContextMenuItems.push(menuItem)
  }

  /* useEffect which updates the title and editing state when the node is changed */
  useEffect(() => {
    setTitle(currentNode.title)
    setEditingTitle(false)
  }, [currentNode])

  /* Node key handlers*/
  const nodeKeyHandlers = (e: KeyboardEvent) => {
    // key handlers with no modifiers
    switch (e.key) {
      case 'Enter':
        if (editingTitle == true) {
          e.preventDefault()
          setEditingTitle(false)
        }
        break
      case 'Escape':
        if (editingTitle == true) {
          e.preventDefault()
          setEditingTitle(false)
        }
        break
    }

    // ctrl + shift key events
    if (e.shiftKey && e.ctrlKey) {
      switch (e.key) {
        case 'R':
          e.preventDefault()
          setEditingTitle(true)
          break
      }
    }
  }

  /* Trigger on node load or when editingTitle changes */
  useEffect(() => {
    // Setting up keyboard shortcuts
    document.addEventListener('keydown', nodeKeyHandlers)
  }, [editingTitle])

  const isFolder: boolean = currentNode.type === 'folder'
  const isRoot: boolean = currentNode.nodeId === 'root'
  return (
    <div className="nodeHeader">
      <div
        className="nodeHeader-title"
        onContextMenu={handleTitleRightClick}
        onDoubleClick={(e) => setEditingTitle(true)}
      >
        <EditableText
          text={title}
          editing={editingTitle}
          setEditing={setEditingTitle}
          onEdit={handleUpdateTitle}
        />
      </div>
      <div className="nodeHeader-buttonBar">
        {!isRoot && (
          <>
            <Button
              icon={<ri.RiDeleteBin6Line />}
              text="Delete"
              onClick={() => onDeleteButtonClick(currentNode)}
            />
            <Button
              icon={<ri.RiDragDropLine />}
              text="Move"
              onClick={() => onMoveButtonClick(currentNode)}
            />
            <Button
              icon={<ri.RiExternalLinkLine />}
              text="Start Link"
              onClick={onHandleStartLinkClick}
            />
            {isLinking && (
              <Button
                text="Complete Link"
                icon={<bi.BiLinkAlt />}
                onClick={onHandleCompleteLinkClick}
              />
            )}
            {isFolder && (
              <div className="select">
                <Select
                  bg="f1f1f1"
                  defaultValue={(currentNode as IFolderNode).viewType}
                  onChange={handleUpdateFolderView}
                  height={35}
                >
                  <option value="grid">Grid</option>
                  <option value="list">List</option>
                  <option value="graph">Graph</option>
                </Select>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
