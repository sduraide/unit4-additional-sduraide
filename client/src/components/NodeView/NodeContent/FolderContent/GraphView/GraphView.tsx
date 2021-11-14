import React, { useEffect, useState } from 'react'
import { INode, IAnchor, ILink } from '../../../../../types'
import { AnchorGateway } from '../../../../../anchors/AnchorGateway'
import { LinkGateway } from '../../../../../links/LinkGateway'
import { Graph } from './Graph'
import {
  SigmaContainer,
  ControlsContainer,
  ZoomControl,
  FullScreenControl,
} from 'react-sigma-v2'
import 'react-sigma-v2/lib/react-sigma-v2.css'

export interface IGraphViewProps {
  childNodes: INode[]
}

/** Graph view focused on childNodes and their links */
export const GraphView = (props: IGraphViewProps) => {
  const { childNodes } = props

  // state variable to keep track of links
  const [linkSet, setLinkSet] = useState(new Set<ILink>())

  // function to get all the anchors in childNodes
  const getAnchors = async (childNodes: INode[]) => {
    const anchors = new Set<IAnchor>()

    await Promise.all(
      childNodes.map(async (node) => {
        const anc = await AnchorGateway.getAnchorsByNodeId(node.nodeId)
        if (anc.success) {
          anc.payload?.forEach((an) => {
            anchors.add(an)
          })
        }
      })
    )

    return anchors
  }

  // function to get all links from childNodes
  const getLinks = async (anchors: IAnchor[]) => {
    const links = new Set<ILink>()

    await Promise.all(
      anchors.map(async (anchor) => {
        const link = await LinkGateway.getLinksByAnchorId(anchor.anchorId)

        if (link.success) {
          link.payload?.forEach((l) => links.add(l))
        }
      })
    )

    return links
  }

  // map that maps from node ID to node title for labels in the graph
  const nodeIDToTitleMap: Map<string, string> = new Map()
  childNodes.forEach((node) => {
    nodeIDToTitleMap.set(node.nodeId, node.title)
  })

  // function to load the dataset passed to Graph
  const getLinkSet = () => {
    const linkSet = new Set<ILink>()
    const linkIds: string[] = []

    getAnchors(childNodes).then((anchors) => {
      getLinks(Array.from(anchors.values())).then((links) => {
        {
          links.forEach((link) => {
            // if nodetitle is undefined from map, ignore link
            if (
              nodeIDToTitleMap.get(link.anchor1NodeId) !== undefined &&
              nodeIDToTitleMap.get(link.anchor2NodeId)
            ) {
              // avoid duplicate links
              if (
                !linkIds.includes(link.anchor1NodeId + ' ' + link.anchor2NodeId) &&
                !linkIds.includes(link.anchor2NodeId + ' ' + link.anchor1NodeId)
              ) {
                linkSet.add(link)
                linkIds.push(link.anchor1NodeId + ' ' + link.anchor2NodeId)
                linkIds.push(link.anchor2NodeId + ' ' + link.anchor1NodeId)
              }
            }
          })
          setLinkSet(linkSet)
        }
      })
    })
  }

  useEffect(() => {
    getLinkSet()
  }, [])

  return (
    <div style={{ width: 1000, height: 600 }}>
      <SigmaContainer>
        <Graph childNodes={childNodes} links={linkSet} />
        <ControlsContainer position={'bottom-right'}>
          <ZoomControl />
          <FullScreenControl />
        </ControlsContainer>
      </SigmaContainer>
    </div>
  )
}
