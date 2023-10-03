import { CSSProperties, FC } from 'react'
import './Goldbox.css'

export interface GoldboxProps {
  classes?: string[]
  style?: CSSProperties | undefined
  children: JSX.Element | JSX.Element[]
}

export const Goldbox: FC<GoldboxProps> = (props) => {
  const classes = props.classes ? props.classes.join(' ') : ''
  return (
    <div style={props.style} className={'goldenbox ' + classes}>
      {props.children}
    </div>
  )
}
