import { TextFieldProps } from '@mui/material'
import { FC, MouseEventHandler } from 'react'
import { InputField } from '../../styles'
import './InputBox.css'

export interface InputBoxProps {
  textLeft?: string
  textRight?: string
  icon?: string
  iconPosition?: { top: string; left: string }
  maxButton?: MouseEventHandler<HTMLDivElement>
}

export const InputBox: FC<InputBoxProps & TextFieldProps> = (props) => {
  return (
    <>
      <div className={'inputbox-flex'}>
        {props.textLeft && (
          <div className={'col-label-white'}>{props.textLeft}</div>
        )}
        <div className={'inputbox-flex-grow'} />
        {props.textRight && (
          <div className={'col-label-white'}>{props.textRight}</div>
        )}
      </div>

      <div className={'inputbox'}>
        <div className={'inputbox-flex'}>
          {props.icon && (
            <div style={{ width: '35px', position: 'relative' }}>
              <img
                style={{ position: 'absolute', ...props.iconPosition }}
                src={props.icon}
                alt="solana"
              />
            </div>
          )}

          <div className={'inputbox-flex-grow'}>
            <InputField
              variant="standard"
              fullWidth={true}
              type={'text'}
              autoComplete={'off'}
              value={props.value}
              onChange={props.onChange}
            />
          </div>
          {props.maxButton && (
            <div onClick={props.maxButton} className={'inputbox-max'}>
              MAX
            </div>
          )}
        </div>
      </div>
    </>
  )
}
