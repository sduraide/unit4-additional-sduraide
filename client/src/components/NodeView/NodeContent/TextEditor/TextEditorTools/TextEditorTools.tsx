import {
  useActive,
  useChainedCommands,
  useCommands,
  useHelpers,
  useRemirrorContext,
} from '@remirror/react'
import React, { useCallback, useEffect } from 'react'
import { AnchorGateway } from '../../../../../anchors'
import { IAnchor, INode, makeITextExtent, IServiceResponse } from '../../../../../types'
import './TextEditorTools.scss'
import { Button } from '../../../../Button'
import {
  findChildrenByMark,
  NodeWithPosition,
  FromToProps,
  removeMark,
  RemoveMarkProps,
} from 'remirror'

interface ITextToolsProps {
  currentNode: INode
  startAnchor: IAnchor | null
  refresh: boolean
  selectedAnchors: IAnchor[]
}

export const TextEditorTools = (props: ITextToolsProps) => {
  // Deconstruct ITextToolsProps
  const { currentNode, refresh } = props

  /* NOTE THAT YOU DO NOT NEED TO USE ALL OF THESE IMPORTS
  Documentation for them is available here:
  https://remirror.io/docs/getting-started/commands-and-helpers/
  */
  // A core hook which provides the commands for usage in your editor.
  const commands = useCommands()
  // A core hook which provides the chainable commands for usage in your editor.
  const chain = useChainedCommands()
  // This is a shorthand method for retrieving the active available in the editor.
  const active = useActive()

  const { toggleBold, focus, toggleItalic, toggleUnderline } = useCommands()
  /**
   * This provides access to the remirror context when using the Remirror.
   *
   * The first argument which is optional can also be a change handler which
   * is called every time the state updates.
   */
  const context = useRemirrorContext()

  // For prosemirror functions
  const { doc, schema } = context.getState()

  // A core hook which provides the helpers for usage in your editor.
  const helpers = useHelpers()

  const addTextAnchorLinks = useCallback(async () => {
    const anchorsFromNodeResp = await AnchorGateway.getAnchorsByNodeId(currentNode.nodeId)
    if (!anchorsFromNodeResp || anchorsFromNodeResp.payload == null) {
      return
    }
    const anchors: IAnchor[] = anchorsFromNodeResp.payload
    anchors.forEach((anchor) => {
      if (anchor.extent && anchor.extent.type == 'text') {
        commands.applyMark(
          'link',
          {
            href: anchor.anchorId,
            auto: false,
          },
          { from: anchor.extent.startCharacter, to: anchor.extent.endCharacter }
        )
      }
    })
  }, [currentNode, refresh])

  useEffect(() => {
    addTextAnchorLinks()
  }, [currentNode])

  useEffect(() => {
    commands.setContent(currentNode.content)
  }, [currentNode])

  /**
   * Function to update or delete anchors in the database depending on how user
   * edits the text
   */
  const editAnchors = async () => {
    const anchorsFromNodeResp = await AnchorGateway.getAnchorsByNodeId(currentNode.nodeId)
    if (!anchorsFromNodeResp || anchorsFromNodeResp.payload == null) {
      return
    }
    // original anchors list before edit
    const initialAnchors: IAnchor[] = anchorsFromNodeResp.payload

    // list of anchors after edit
    const updatedLinks: NodeWithPosition[] = findChildrenByMark({
      node: doc,
      type: schema.marks.link,
    })

    // anchor IDs to compare with initialAnchors for deletion if any
    const visitedAnchorIDs: string[] = []

    const promiseArray: Promise<IServiceResponse<IAnchor>>[] = []
    updatedLinks.forEach((link) => {
      // for each anchor, add the updateExtent promise to db
      link.node.marks.forEach((mark) => {
        // check if ID starts with anchor
        const splitID = mark.attrs.href.split('.')
        if (splitID[0] === 'anchor') {
          visitedAnchorIDs.push(mark.attrs.href)
          if (link.node.text && link.pos && link.node.nodeSize) {
            const extent = makeITextExtent(
              link.node.text,
              link.pos,
              link.node.nodeSize + link.pos - 1
            )
            promiseArray.push(AnchorGateway.updateExtent(mark.attrs.href, extent))
          }
        }
      })
    })

    Promise.all(promiseArray).then((values) => {
      console.log(values)
      // once all promises are done, check to see if anchors have been deleted
      initialAnchors.forEach((anchor) => {
        if (!visitedAnchorIDs.includes(anchor.anchorId)) {
          AnchorGateway.deleteAnchor(anchor.anchorId).then((val) => {
            // create the necessary props needed to remove mark
            if (anchor.extent?.type === 'text') {
              const range: FromToProps = {
                from: anchor.extent?.startCharacter,
                to: anchor.extent.endCharacter,
              }
              const removeMarkProps: RemoveMarkProps = {
                type: schema.marks.link,
                range: range,
              }

              // finally remove the mark from the editor
              removeMark(removeMarkProps)
            }
          })
        }
      })
    })
  }

  return (
    <div>
      {/* Save Button to save the anchors*/}
      <Button
        onClick={() => editAnchors()}
        text={'Save Anchors'}
        style={{ marginBottom: '20px' }}
      />

      <div className="textButtons">
        <Button
          onClick={() => {
            toggleBold()
            focus()
          }}
          text={'B'}
          style={{ fontWeight: active.bold() ? 'bold' : undefined }}
        />
        <Button
          onClick={() => {
            toggleItalic()
            focus()
          }}
          text={'I'}
          style={{ fontStyle: active.italic() ? 'italic' : undefined }}
        />
        <Button
          onClick={() => {
            toggleUnderline()
            focus()
          }}
          text={'U'}
          style={{ fontStyle: active.underline() ? 'underline' : undefined }}
        />

        {/* Font Size Buttons */}
        <Button
          onClick={() => {
            commands.setFontSize(8)
          }}
          text={'Smaller Text'}
        />
        <Button
          onClick={() => {
            commands.setFontSize(24)
          }}
          text={'Larger Text'}
        />

        {/* Font Family Buttons */}
        <Button
          onClick={() => {
            commands.setFontFamily('serif')
          }}
          text={'Serif'}
        />
        <Button
          onClick={() => {
            commands.setFontFamily('sans-serif')
          }}
          text={'Sans-Serif'}
        />

        {/* Heading Buttons */}
        <>
          {[1, 2, 3, 4, 5, 6].map((level) => (
            <Button
              key={level}
              onClick={() => commands.toggleHeading({ level })}
              text={'H' + level}
            />
          ))}
        </>
      </div>
    </div>
  )
}
