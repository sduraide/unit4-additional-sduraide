import { Remirror, useRemirror } from '@remirror/react'
import React from 'react'
import './TextPreviewContent.scss'

interface ITextPreviewProps {
  content: any
}

/** The content of an text node, including all its anchors */
export const TextPreviewContent = ({ content }: ITextPreviewProps) => {
  const { manager, state } = useRemirror({
    content: content,
    stringHandler: 'html',
    extensions: () => [],
  })

  return (
    <div className="textContent-preview">
      <Remirror editable={false} manager={manager} initialContent={state} />
    </div>
  )
}
