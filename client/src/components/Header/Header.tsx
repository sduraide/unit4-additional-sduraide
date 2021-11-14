import React from 'react'
import { Button } from '../Button'
import * as ri from 'react-icons/ri'
import * as ai from 'react-icons/ai'

import { Extent, IAnchor, NodeIdsToNodesMap } from '../../types'
import { Link } from 'react-router-dom'
import './Header.scss'

interface IHeaderProps {
  isLinking: boolean
  startAnchor: IAnchor | null
  nodeIdsToNodesMap: NodeIdsToNodesMap
  onCreateNodeButtonClick: () => void
  onHomeClick: () => void
  setIsLinking: (isLinking: boolean) => void
  setStartAnchor: (anchor: IAnchor | null) => void
  setSelectedExtent: (extent: Extent | null) => void
}

export const Header = ({
  onCreateNodeButtonClick,
  onHomeClick,
  isLinking = false,
  startAnchor,
  setStartAnchor,
  setIsLinking,
  setSelectedExtent,
  nodeIdsToNodesMap,
}: IHeaderProps) => {
  const customButtonStyle = { height: 30, marginLeft: 10, width: 30 }

  const handleCancelLink = () => {
    setStartAnchor(null)
    setSelectedExtent(null)
    setIsLinking(false)
  }

  return (
    <div className={isLinking ? 'header-linking' : 'header'}>
      <div className="left-bar">
        <Link to={'/'}>
          <div className="name" onClick={onHomeClick}>
            My<b>Hypermedia</b>
          </div>
        </Link>
        <Link to={'/'}>
          <Button
            isWhite={isLinking}
            style={customButtonStyle}
            icon={<ri.RiHome2Line />}
            onClick={onHomeClick}
          />
        </Link>
        <Button
          isWhite={isLinking}
          style={customButtonStyle}
          icon={<ai.AiOutlinePlus />}
          onClick={onCreateNodeButtonClick}
        />
      </div>
      {isLinking && startAnchor && (
        <div className="right-bar">
          <div>
            Linking from <b>{nodeIdsToNodesMap[startAnchor.nodeId].title}</b>
          </div>
          <Button
            onClick={handleCancelLink}
            isWhite
            text="Cancel"
            style={{ fontWeight: 600, height: 30, marginLeft: 20 }}
            icon={<ri.RiCloseLine />}
          />
        </div>
      )}
    </div>
  )
}
