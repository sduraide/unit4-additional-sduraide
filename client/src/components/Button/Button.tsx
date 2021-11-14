import React from 'react'
import './Button.scss'

export interface IButtonProps {
  /** Optional button icon */
  icon?: JSX.Element
  isWhite?: boolean
  /** Optional nodeId prop for a button */
  nodeId?: string
  /** Optional function that gets called when button is clicked */
  onClick?: () => any
  /**  Optional button background color */
  style?: Object
  /** Optional button label */
  text?: string
  disabled?: boolean
  isActive?: boolean
}

/**
 * This is the button component. It responds to an onClick event.
 *
 * @param props: IButtonProps
 * @returns Button component
 */
export const Button = (props: IButtonProps): JSX.Element => {
  const { icon, text, onClick, style, isWhite, isActive } = props
  return (
    <div
      className={`button ${isActive ? 'active' : ''} ${isWhite ? 'whiteButton' : ''}`}
      onClick={onClick}
      style={style}
    >
      {icon && <div className="icon">{icon}</div>}
      {text && <span className="text">{text}</span>}
    </div>
  )
}
