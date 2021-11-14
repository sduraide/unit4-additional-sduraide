import {
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
} from '@chakra-ui/react'
import React, { useState } from 'react'
import { BiLinkAlt } from 'react-icons/bi'
import { AnchorGateway } from '../../../anchors'
import { generateObjectId } from '../../../global'
import { LinkGateway } from '../../../links'
import { IAnchor, ILink, NodeIdsToNodesMap } from '../../../types'
import { Button } from '../../Button'
import './CompleteLinkModal.scss'

export interface ICompleteLinkModalProps {
  isOpen: boolean
  startAnchor: IAnchor | null
  endAnchor: IAnchor | null
  nodeIdsToNodes: NodeIdsToNodesMap
  onClose: () => void
  refresh: boolean
  setIsLinking: (isLinking: boolean) => void
  setRefresh: (refresh: boolean) => void
  setSelectedAnchors: (anchors: IAnchor[]) => void
  setStartAnchor: (startAnchor: IAnchor | null) => void
}

/**
 * Modal for adding a new node; lets the user choose a title, type,
 * and parent node
 */
export const CompleteLinkModal = (props: ICompleteLinkModalProps) => {
  const {
    isOpen,
    onClose,
    startAnchor,
    endAnchor,
    setSelectedAnchors,
    setIsLinking,
    setStartAnchor,
    refresh,
    setRefresh,
    nodeIdsToNodes,
  } = props
  // State variables
  const [title, setTitle] = useState('')
  const [explainer, setExplainer] = useState('')
  const [error, setError] = useState<string>('')

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value)
  }

  const handleExplainerChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setExplainer(event.target.value)
  }

  // Called when the "Submit" button is clicked
  const handleSubmit = async () => {
    // create link from modal
    if (startAnchor && endAnchor) {
      let link: ILink | null = null

      let anchor1 = await AnchorGateway.getAnchor(startAnchor.anchorId)
      let anchor2 = await AnchorGateway.getAnchor(endAnchor.anchorId)
      if (!anchor1.success) {
        anchor1 = await AnchorGateway.createAnchor(startAnchor)
      }
      if (!anchor2.success) {
        anchor2 = await AnchorGateway.createAnchor(endAnchor)
      }
      if (anchor1.success && anchor2.success) {
        const anchor1Id = startAnchor.anchorId
        const anchor2Id = endAnchor.anchorId
        const anchor1NodeId = startAnchor.nodeId
        const anchor2NodeId = endAnchor.nodeId

        const linkId = generateObjectId('link')

        const newLink: ILink = {
          anchor1Id: anchor1Id,
          anchor2Id: anchor2Id,
          anchor1NodeId: anchor1NodeId,
          anchor2NodeId: anchor2NodeId,
          dateCreated: new Date(),
          explainer: explainer,
          linkId: linkId,
          title: title,
        }
        const linkResponse = await LinkGateway.createLink(newLink)
        if (!linkResponse.success) {
          setError('Error: Failed to create link')
          return
        }
        link = linkResponse.payload

        anchor2.payload && setSelectedAnchors([anchor2.payload])
      } else {
        setError('Error: Failed to create anchors')
        return
      }
      if (link !== null) {
        handleClose()
        setIsLinking(false)
        setStartAnchor(null)
        setRefresh(!refresh)
      } else {
        setError('Error: Failed to create link')
      }
    } else {
      setError('Error: Anchor 1 or 2 is missing')
    }
  }

  /** Reset all our state variables and close the modal */
  const handleClose = () => {
    onClose()
    setTitle('')
    setExplainer('')
    setError('')
  }

  const fromNodeId = startAnchor?.nodeId
  const toNodeId = endAnchor?.nodeId
  const nodeFromTitle = fromNodeId ? nodeIdsToNodes[fromNodeId].title : 'node'
  const nodeToTitle =
    toNodeId && nodeIdsToNodes[toNodeId] ? nodeIdsToNodes[toNodeId].title : 'node'

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="modal-font">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Complete link</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div>
              Creating a bidirectional link from <b>{nodeFromTitle}</b> to
              <b> {nodeToTitle}</b>
            </div>
            <FormControl mt={4}>
              <FormLabel>Link Title</FormLabel>
              <Input value={title} onChange={handleTitleChange} placeholder="Title..." />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Link Explainer</FormLabel>
              <Textarea
                value={explainer}
                onChange={handleExplainerChange}
                placeholder="Explainer..."
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            {error.length > 0 && <div className="modal-error">{error}</div>}
            <div className="modal-footer-buttons">
              <Button text="Create" icon={<BiLinkAlt />} onClick={handleSubmit} />
            </div>
          </ModalFooter>
        </ModalContent>
      </div>
    </Modal>
  )
}
