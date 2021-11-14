import React from 'react'
import * as ri from 'react-icons/ri'
import { AnchorGateway } from '../../../../anchors'
import { LinkGateway } from '../../../../links'
import { Extent, IAnchor, ILink, INode } from '../../../../types'
import { ContextMenuItems } from '../../../ContextMenu'
import { getImagePreview } from '../nodeLinkMenuUtils'
import './AnchorItem.scss'

export interface IAnchorItemProps {
  currentNode: INode
  linkItems: any
  anchorsMap: {
    [anchorId: string]: {
      anchor: IAnchor
      links: { link: ILink; oppNode: INode; oppAnchor: IAnchor }[]
    }
  }
  anchorId: string
  extent: Extent | null
  isAnchorSelected: boolean
  setSelectedAnchors: (anchor: IAnchor[]) => void
  refresh: boolean
  setRefresh: (refresh: boolean) => void
  setAlertIsOpen: (open: boolean) => void
  setAlertMessage: (message: string) => void
  setAlertTitle: (title: string) => void
}

export const AnchorItem = (props: IAnchorItemProps) => {
  const {
    currentNode,
    extent,
    isAnchorSelected,
    linkItems,
    anchorsMap,
    anchorId,
    setSelectedAnchors,
    refresh,
    setRefresh,
    setAlertIsOpen,
    setAlertMessage,
    setAlertTitle,
  } = props

  const handleAnchorDelete = async (anchorId: string) => {
    const anchorLinks = anchorsMap[anchorId].links
    const linkIds: string[] = []
    anchorLinks.forEach((anchorLink) => {
      linkIds.push(anchorLink.link.linkId)
    })
    const deleteLinksResp = await LinkGateway.deleteLinks(linkIds)
    if (!deleteLinksResp.success) {
      setAlertIsOpen(true)
      setAlertTitle('Delete links failed')
      setAlertMessage(deleteLinksResp.message)
    }

    const deleteAnchorResp = await AnchorGateway.deleteAnchor(anchorId)
    if (!deleteAnchorResp.success) {
      setAlertIsOpen(true)
      setAlertTitle('Delete anchors failed')
      setAlertMessage(deleteAnchorResp.message)
    }
    setRefresh(!refresh)
  }

  /* Method called on link right click */
  const handleAnchorRightClick = () => {
    // Open custom context menu
    ContextMenuItems.splice(1, ContextMenuItems.length)
    const menuItem: JSX.Element = (
      <div
        key={'linkDelete'}
        className="contextMenuItem"
        onClick={(e) => {
          ContextMenuItems.splice(0, ContextMenuItems.length)
          handleAnchorDelete(anchorId)
        }}
      >
        <div className="itemText">
          <ri.RiDeleteBin6Line />
          Delete anchor
        </div>
      </div>
    )
    ContextMenuItems.push(menuItem)
  }

  return (
    <div
      className={`anchorItem ${isAnchorSelected ? 'selected' : ''}`}
      key={anchorId}
      onContextMenu={handleAnchorRightClick}
      onClick={() => {
        setSelectedAnchors([anchorsMap[anchorId].anchor])
      }}
    >
      <div className="anchorPreview">
        {extent !== null ? (
          extent.type == 'text' && (
            <div className="anchorPreview-text">{'"' + extent.text + '"'}</div>
          )
        ) : (
          <div className="anchorPreview-text">{currentNode.title}</div>
        )}
        {extent?.type == 'image' && (
          <div className="anchorPreview-image">
            {getImagePreview(currentNode.content, extent, 40, 40)}
          </div>
        )}
      </div>
      {linkItems}
    </div>
  )
}
