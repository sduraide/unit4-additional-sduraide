import React from 'react'
import * as ri from 'react-icons/ri'
import { useHistory } from 'react-router-dom'
import { fetchNodeFromLink, getImagePreview } from '../..'
import { AnchorGateway } from '../../../../../anchors'
import { LinkGateway } from '../../../../../links'
import { Extent, IAnchor, ILink, INode, NodeIdsToNodesMap } from '../../../../../types'
import { ContextMenuItems } from '../../../../ContextMenu'
import './LinkItem.scss'

export interface ILinkItemProps {
  currentNode: INode
  link: ILink
  anchorLink: {
    link: ILink
    oppNode: INode
    oppAnchor: IAnchor
  }
  nodeIdsToNodesMap: NodeIdsToNodesMap
  refresh: boolean
  selectedAnchors: IAnchor[]
  setRefresh: (refresh: boolean) => void
  setSelectedAnchors: (anchor: IAnchor[]) => void
  setSelectedNode: (node: INode | null) => void
  setAlertIsOpen: (open: boolean) => void
  setAlertMessage: (message: string) => void
  setAlertTitle: (title: string) => void
}

export const LinkItem = (props: ILinkItemProps) => {
  const {
    anchorLink,
    refresh,
    setRefresh,
    setSelectedAnchors,
    setAlertIsOpen,
    setAlertMessage,
    setAlertTitle,
  } = props

  const history = useHistory()

  const handleLinkDelete = async (link: ILink) => {
    const deleteLinkResponse = await LinkGateway.deleteLink(link.linkId)
    if (deleteLinkResponse.success) {
      setRefresh(!refresh)
      const getAnchor1LinksResp = await LinkGateway.getLinksByAnchorId(link.anchor1Id)
      const getAnchor2LinksResp = await LinkGateway.getLinksByAnchorId(link.anchor2Id)
      if (
        getAnchor1LinksResp.success &&
        getAnchor1LinksResp.payload &&
        getAnchor1LinksResp.payload.length > 0
      ) {
        const deleteAnchor1Response = await AnchorGateway.deleteAnchor(link.anchor1Id)
        if (!deleteAnchor1Response.success) {
          setAlertIsOpen(true)
          setAlertTitle('Delete anchor1 failed')
          setAlertMessage(deleteAnchor1Response.message)
        }
      }
      if (
        getAnchor2LinksResp.success &&
        getAnchor2LinksResp.payload &&
        getAnchor2LinksResp.payload.length > 0
      ) {
        const deleteAnchor2Response = await AnchorGateway.deleteAnchor(link.anchor2Id)
        if (!deleteAnchor2Response.success) {
          setAlertIsOpen(true)
          setAlertTitle('Delete anchor2 failed')
          setAlertMessage(deleteAnchor2Response.message)
        }
      }
      setSelectedAnchors([])
    }
  }

  const handleLinkSelect = async (e: React.MouseEvent, link: ILink) => {
    e.stopPropagation()
    e.preventDefault()
    const anchors: IAnchor[] = []
    const firstAnchorResp = await AnchorGateway.getAnchor(link.anchor1Id)
    const secondAnchorResp = await AnchorGateway.getAnchor(link.anchor2Id)
    if (
      firstAnchorResp.success &&
      firstAnchorResp.payload &&
      secondAnchorResp.success &&
      secondAnchorResp.payload
    ) {
      const firstAnchor: IAnchor = firstAnchorResp.payload
      const secondAnchor: IAnchor = secondAnchorResp.payload
      anchors.push(firstAnchor)
      anchors.push(secondAnchor)
    }
    const nodeId = await fetchNodeFromLink({ ...props })
    history.push(`/${nodeId}`)
    setSelectedAnchors(anchors)
  }

  /* Method called on link right click */
  const handleLinkRightClick = (e: React.MouseEvent) => {
    // Open custom context menu
    ContextMenuItems.splice(0, ContextMenuItems.length)
    const menuItem: JSX.Element = (
      <div
        key={'linkDelete'}
        className="contextMenuItem"
        onClick={(e) => {
          ContextMenuItems.splice(0, ContextMenuItems.length)
          handleLinkDelete(link)
        }}
      >
        <div className="itemText">
          <ri.RiDeleteBin6Line />
          Delete link
        </div>
      </div>
    )
    ContextMenuItems.push(menuItem)
  }

  const link: ILink = anchorLink.link
  const oppNode: INode = anchorLink.oppNode
  const oppAnchor: IAnchor = anchorLink.oppAnchor
  const oppAnchorType: string | undefined = oppAnchor.extent?.type
  const oppExtent: Extent | null = oppAnchor.extent
  const oppWholeNodeAnchor: boolean = oppExtent === null
  return (
    <div
      className={`linkItem-${oppAnchorType}`}
      key={link.linkId}
      onContextMenu={handleLinkRightClick}
      onClick={(e) => {
        handleLinkSelect(e, link)
      }}
    >
      <div className="linkContent">
        {oppWholeNodeAnchor ? (
          <div className="linkInfo">
            Link to <b>{oppNode.title}</b>
          </div>
        ) : (
          <div className="linkInfo">
            Link to {oppAnchorType} selection in <b>{oppNode.title}</b>
          </div>
        )}
        <div className="linkTitle">{link.title}</div>
        <div className="linkExplainer">{link.explainer}</div>
      </div>
      {oppAnchor.extent?.type == 'image' && (
        <div className="linkPreview">
          {getImagePreview(oppNode.content, oppAnchor.extent, 40, 40)}
        </div>
      )}
    </div>
  )
}
