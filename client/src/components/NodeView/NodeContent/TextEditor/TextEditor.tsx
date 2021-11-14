import { RemirrorEventListenerProps, prosemirrorNodeToHtml } from '@remirror/core'
import { EditorComponent, Remirror, useRemirror } from '@remirror/react'
import React from 'react'
import { useHistory } from 'react-router-dom'
import {
  LinkExtension,
  BoldExtension,
  ItalicExtension,
  UnderlineExtension,
  FontSizeExtension,
  FontFamilyExtension,
  HeadingExtension,
} from 'remirror/extensions'
import 'remirror/styles/all.css'
import { fetchAnchors, fetchLinks } from '.'
import {
  Extent,
  IAnchor,
  INode,
  INodeProperty,
  makeINodeProperty,
} from '../../../../types'
import './TextEditor.scss'
import { TextEditorTools } from './TextEditorTools'
import { NodeGateway } from '../../../../nodes'

interface ITextContentProps {
  // for folder node content
  currentNode: INode
  // useEffect dependency for refreshing link list
  refresh: boolean
  // list of currently highlighted anchors
  selectedAnchors: IAnchor[]
  // setter for selectedAnchors
  setSelectedAnchors: (anchor: IAnchor[]) => void
  // setter for selectedExtent
  setSelectedExtent: (extent: Extent | null | undefined) => void
  // setter for selectedNode
  setSelectedNode: (node: INode) => void
  // to indicate the anchor that we are linking from
  startAnchor: IAnchor | null
}

/** The content of an text node, including all its anchors */
export const TextEditor = (props: ITextContentProps) => {
  // destructuring props array
  const {
    currentNode,
    startAnchor,
    setSelectedExtent,
    refresh,
    selectedAnchors,
    setSelectedAnchors,
  } = props

  // Alert variables
  const [isAlertOpen, setAlertIsOpen] = React.useState<boolean>(false)
  const [alertMessage, setAlertMessage] = React.useState<string>('')
  const [alertTitle, setAlertTitle] = React.useState<string>('')

  const history = useHistory()
  /* Set up the Remirror link extension such that link clicks are
  controlled by changing the default handler */
  const linkExtension = new LinkExtension({ autoLink: true })
  linkExtension.addHandler('onClick', (_, data) => {
    const href: string = data.href
    const asyncOnClick = async () => {
      const links = await fetchLinks(href)
      const anchors = await fetchAnchors(links)
      if (links.length > 0) {
        if (links[0].anchor1Id !== href) {
          history.push(`/${links[0].anchor1NodeId}/`)
        } else if (links[0].anchor2Id !== href) {
          history.push(`/${links[0].anchor2NodeId}/`)
        }
      }
      setSelectedAnchors(anchors)
    }
    asyncOnClick()
    return true
  })

  /* Setting up the Remirror manager and state */
  const { manager, state } = useRemirror({
    content: currentNode.content,
    stringHandler: 'html',
    // different extensions I added (Bold, Italic, Underline + 3 others)
    extensions: () => [
      linkExtension,
      new BoldExtension(),
      new ItalicExtension(),
      new UnderlineExtension(),
      new FontSizeExtension(),
      new FontFamilyExtension(),
      new HeadingExtension(),
    ],
  })

  /**
   * TODO [Editable]
   * You will want to write a method to update the node content, it can either
   * go in `TextEditor.tsx` or `TextEditorTools.tsx` depending on your
   * how you decide to update the node. Decide where the best place would be to
   * update the node - look at the options outlined in the handout!
   *
   * You will want to make a call to NodeGateway at some point
   * to update the INode content.
   */

  /* Method that gets called whenever Text content is changed */
  const onTextChange = async (textParams: RemirrorEventListenerProps<any>) => {
    const from = textParams.state.selection.from
    const to = textParams.state.selection.to
    const text = textParams.state.doc.textBetween(from, to)

    if (from !== to) {
      const selectedExtent: Extent = {
        type: 'text',
        startCharacter: from,
        endCharacter: to,
        text: text,
      }
      setSelectedExtent(selectedExtent)
    } else {
      setSelectedExtent(null)
    }

    // convert to html string to store in the datatbase
    const htmlString = prosemirrorNodeToHtml(textParams.state.doc)
    const nodeContent: INodeProperty = makeINodeProperty('content', htmlString)
    const contentUpdateResp = await NodeGateway.updateNode(currentNode.nodeId, [
      nodeContent,
    ])

    // report to user if unsuccessful
    if (!contentUpdateResp.success) {
      setAlertIsOpen(true)
      setAlertTitle('Content update failed')
      setAlertMessage(contentUpdateResp.message)
    }
  }

  return (
    <div className="textEditor">
      <div className="remirror-theme">
        <Remirror manager={manager} initialContent={state} onChange={onTextChange}>
          <TextEditorTools
            currentNode={currentNode}
            selectedAnchors={selectedAnchors}
            startAnchor={startAnchor}
            refresh={refresh}
          />
          <EditorComponent />
        </Remirror>
      </div>
    </div>
  )
}
