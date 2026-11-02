import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date'
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons'
import { faDollarSign, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BaseEmoji } from 'emoji-mart'
import 'date-fns'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { updateGoal as updateGoalApi } from '../../../api/lib'
import { Goal } from '../../../api/types'
import { selectGoalsMap, updateGoal as updateGoalRedux } from '../../../store/goalsSlice'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import DatePicker from '../../components/DatePicker'
import EmojiPicker from '../../components/EmojiPicker'
import { Theme } from '../../components/Theme'
import AddIconButton from './AddIconButton'
import GoalIcon from './GoalIcon'

type Props = { goal: Goal }

export function GoalManager(props: Props) {
  const dispatch = useAppDispatch()
  const goalFromStore = useAppSelector(selectGoalsMap)[props.goal.id]
  const goal = goalFromStore ?? props.goal

  const [emojiPickerIsOpen, setEmojiPickerIsOpen] = useState(false)

  const [name, setName] = useState<string | null>(null)
  const [targetDate, setTargetDate] = useState<Date | null>(null)
  const [targetAmount, setTargetAmount] = useState<number | null>(null)
  const [icon, setIcon] = useState<string | null>(null)

  useEffect(() => {
    setName(props.goal.name)
    setTargetDate(props.goal.targetDate)
    setTargetAmount(props.goal.targetAmount)
    setIcon(props.goal.icon)
    setEmojiPickerIsOpen(false)
  }, [props.goal.id])

  const hasIcon = () => icon != null

  const buildUpdatedGoal = (patch: Partial<Goal>): Goal => {
    return {
      ...goal,
      name: name ?? goal.name,
      targetDate: targetDate ?? goal.targetDate,
      targetAmount: targetAmount ?? goal.targetAmount,
      icon: icon ?? goal.icon,
      ...patch,
    }
  }

  const addIconOnClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    setEmojiPickerIsOpen(true)
  }

  const pickEmojiOnClick = (emoji: BaseEmoji, event: React.MouseEvent) => {
    event.stopPropagation()

    const nextIcon = emoji.native ?? null
    setIcon(nextIcon)
    setEmojiPickerIsOpen(false)

    const updatedGoal = buildUpdatedGoal({ icon: nextIcon })
    dispatch(updateGoalRedux(updatedGoal))
    updateGoalApi(props.goal.id, updatedGoal)
  }

  const updateNameOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextName = event.target.value
    setName(nextName)

    const updatedGoal = buildUpdatedGoal({ name: nextName })
    dispatch(updateGoalRedux(updatedGoal))
    updateGoalApi(props.goal.id, updatedGoal)
  }

  const updateTargetAmountOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextTargetAmount = parseFloat(event.target.value)
    if (Number.isNaN(nextTargetAmount)) return

    setTargetAmount(nextTargetAmount)

    const updatedGoal = buildUpdatedGoal({ targetAmount: nextTargetAmount })
    dispatch(updateGoalRedux(updatedGoal))
    updateGoalApi(props.goal.id, updatedGoal)
  }

  const pickDateOnChange = (date: MaterialUiPickersDate) => {
    if (date == null) return

    setTargetDate(date)

    const updatedGoal = buildUpdatedGoal({ targetDate: date })
    dispatch(updateGoalRedux(updatedGoal))
    updateGoalApi(props.goal.id, updatedGoal)
  }

  return (
    <GoalManagerContainer>
      <NameInput value={name ?? ''} onChange={updateNameOnChange} />
      <EmojiPickerContainer
        isOpen={emojiPickerIsOpen}
        hasIcon={hasIcon()}
        onClick={(event) => event.stopPropagation()}
      >
        <EmojiPicker onClick={pickEmojiOnClick} />
      </EmojiPickerContainer>
      <AddIconButton hasIcon={hasIcon()} onClick={addIconOnClick} />
      <GoalIconContainer shouldShow={hasIcon()}>
        <GoalIcon icon={icon ?? goal.icon} onClick={addIconOnClick} />
      </GoalIconContainer>
      <Group>
        <Field name={'Target Date'} icon={faCalendarAlt} />
        <Value>
          <DatePicker value={targetDate} onChange={pickDateOnChange} />
        </Value>
      </Group>
      <Group>
        <Field name={'Target Amount'} icon={faDollarSign} />
        <Value>
          <StringInput value={targetAmount ?? ''} onChange={updateTargetAmountOnChange} />
        </Value>
      </Group>
      <Group>
        <Field name={'Balance'} icon={faDollarSign} />
        <Value>
          <StringValue>{goal.balance}</StringValue>
        </Value>
      </Group>
      <Group>
        <Field name={'Date Created'} icon={faCalendarAlt} />
        <Value>
          <StringValue>{new Date(goal.created).toLocaleDateString()}</StringValue>
        </Value>
      </Group>
    </GoalManagerContainer>
  )
}

const GoalManagerContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  height: 100%;
  width: 100%;
  position: relative;
`

type FieldProps = { name: string; icon: IconDefinition }

const Field = (props: FieldProps) => (
  <FieldContainer>
    <FontAwesomeIcon icon={props.icon} size={'2x'} />
    <FieldName>{props.name}</FieldName>
  </FieldContainer>
)

type GoalIconContainerProps = { shouldShow: boolean }

const GoalIconContainer = styled.div<GoalIconContainerProps>`
  display: ${(props) => (props.shouldShow ? 'flex' : 'none')};
`

type EmojiPickerContainerProps = { isOpen: boolean; hasIcon: boolean }

const EmojiPickerContainer = styled.div<EmojiPickerContainerProps>`
  display: ${(props) => (props.isOpen ? 'flex' : 'none')};
  position: absolute;
  top: ${(props) => (props.hasIcon ? '10rem' : '2rem')};
  left: 0;
`

const Group = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-top: 1.25rem;
  margin-bottom: 1.25rem;
`

const NameInput = styled.input`
  display: flex;
  background-color: transparent;
  outline: none;
  border: none;
  font-size: 4rem;
  font-weight: bold;
  color: ${({ theme }: { theme: Theme }) => theme.text};
`

const FieldName = styled.h1`
  font-size: 1.8rem;
  margin-left: 1rem;
  color: rgba(174, 174, 174, 1);
  font-weight: normal;
`

const FieldContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 20rem;

  svg {
    color: rgba(174, 174, 174, 1);
  }
`

const StringValue = styled.h1`
  font-size: 1.8rem;
  font-weight: bold;
`

const StringInput = styled.input`
  display: flex;
  background-color: transparent;
  outline: none;
  border: none;
  font-size: 1.8rem;
  font-weight: bold;
  color: ${({ theme }: { theme: Theme }) => theme.text};
`

const Value = styled.div`
  margin-left: 2rem;
`
