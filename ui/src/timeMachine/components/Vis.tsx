// Libraries
import React, {FC, useState} from 'react'
import {connect} from 'react-redux'
import {FromFluxResult} from '@influxdata/giraffe'
import classnames from 'classnames'

// Components
import EmptyQueryView, {ErrorFormat} from 'src/shared/components/EmptyQueryView'
import ViewSwitcher from 'src/shared/components/ViewSwitcher'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import {Icon, IconFont, Button, ComponentColor, SquareButton} from '@influxdata/clockface'
import VisOptionsButton from 'src/timeMachine/components/VisOptionsButton'
import ViewTypeDropdown from 'src/timeMachine/components/view_options/ViewTypeDropdown'

// Utils
import {getActiveTimeMachine} from 'src/timeMachine/selectors'
import {checkResultsLength} from 'src/shared/utils/vis'
import {
  getVisTable,
  getXColumnSelection,
  getYColumnSelection,
  getFillColumnsSelection,
  getSymbolColumnsSelection,
} from 'src/timeMachine/selectors'
import {getTimeRange} from 'src/dashboards/selectors'

// Types
import {
  RemoteDataState,
  AppState,
  QueryViewProperties,
  TimeZone,
  TimeRange,
  StatusRow,
  CheckType,
  Threshold,
} from 'src/types'

// Actions
import {setIsViewingRawData} from 'src/timeMachine/actions'

// Selectors
import {getActiveTimeRange} from 'src/timeMachine/selectors/index'

interface DispatchProps {
  onSetIsViewingRawData: typeof setIsViewingRawData
}

interface StateProps {
  timeRange: TimeRange | null
  loading: RemoteDataState
  errorMessage: string
  files: string[]
  viewProperties: QueryViewProperties
  isInitialFetch: boolean
  isViewingRawData: boolean
  giraffeResult: FromFluxResult
  xColumn: string
  yColumn: string
  checkType: CheckType
  checkThresholds: Threshold[]
  fillColumns: string[]
  symbolColumns: string[]
  timeZone: TimeZone
  statuses: StatusRow[][]
}

type Props = StateProps & DispatchProps

const TimeMachineVis: FC<Props> = ({
  loading,
  errorMessage,
  timeRange,
  isInitialFetch,
  isViewingRawData,
  files,
  checkType,
  checkThresholds,
  viewProperties,
  giraffeResult,
  xColumn,
  yColumn,
  fillColumns,
  symbolColumns,
  timeZone,
  statuses,
  onSetIsViewingRawData,
}) => {
  // If the current selections for `xColumn`/`yColumn`/ etc. are invalid given
  // the current Flux response, attempt to make a valid selection instead. This
  // fallback logic is contained within the selectors that supply each of these
  // props. Note that in a dashboard context, we display an error instead of
  // attempting to fall back to an valid selection.
  const resolvedViewProperties = {
    ...viewProperties,
    xColumn,
    yColumn,
    fillColumns,
    symbolColumns,
  }

  const [blockMode, setBlockMode] = useState<'expanded' | 'collapsed'>('expanded')

  const timeMachineBlockClass = classnames('tm-block', {[`tm-block__${blockMode}`]: blockMode})

  const handleToggleClick = (): void => {
    const newBlockMode = blockMode === 'expanded' ? 'collapsed' : 'expanded'
    setBlockMode(newBlockMode)
  }

  const handleAddVisualization = (): void => {
    onSetIsViewingRawData(false)
  }

  const handleRemoveVisualization = (): void => {
    onSetIsViewingRawData(true)
  }

  if (isViewingRawData) {
    return (
      <Button text="Add Visualization" color={ComponentColor.Primary} icon={IconFont.BarChart} onClick={handleAddVisualization} />
    )
  }

  return (
    <div className={timeMachineBlockClass}>
      <div className="tm-block--header">
        <div className="tm-block--header-left">
          <button className="tm-block--toggle" onClick={handleToggleClick}>
            <Icon glyph={IconFont.CaretRight} className="tm-block--toggle-icon" />
          </button>
          <div className="tm-block--title">Visualization</div>
          <ViewTypeDropdown />
        </div>
        <div className="tm-block--header-right">
          <VisOptionsButton />
          <SquareButton icon={IconFont.Remove} color={ComponentColor.Danger} onClick={handleRemoveVisualization} />
        </div>
      </div>
      <div className="tm-block--contents">
        <ErrorBoundary>
          <EmptyQueryView
            loading={loading}
            errorFormat={ErrorFormat.Scroll}
            errorMessage={errorMessage}
            isInitialFetch={isInitialFetch}
            queries={viewProperties.queries}
            hasResults={checkResultsLength(giraffeResult)}
          >
            <ViewSwitcher
              giraffeResult={giraffeResult}
              timeRange={timeRange}
              files={files}
              loading={loading}
              properties={resolvedViewProperties}
              checkType={checkType}
              checkThresholds={checkThresholds}
              timeZone={timeZone}
              statuses={statuses}
              theme="dark"
            />
          </EmptyQueryView>
        </ErrorBoundary>
      </div>
    </div>
  )
}

const mstp = (state: AppState): StateProps => {
  const activeTimeMachine = getActiveTimeMachine(state)
  const {
    isViewingRawData,
    view: {properties: viewProperties},
    queryResults: {
      status: loading,
      errorMessage,
      isInitialFetch,
      files,
      statuses,
    },
  } = activeTimeMachine
  const timeRange = getTimeRange(state)
  const {
    alertBuilder: {type: checkType, thresholds: checkThresholds},
  } = state

  const giraffeResult = getVisTable(state)
  const xColumn = getXColumnSelection(state)
  const yColumn = getYColumnSelection(state)
  const fillColumns = getFillColumnsSelection(state)
  const symbolColumns = getSymbolColumnsSelection(state)

  const timeZone = state.app.persisted.timeZone

  return {
    loading,
    checkType,
    checkThresholds,
    errorMessage,
    isInitialFetch,
    files,
    viewProperties,
    isViewingRawData,
    giraffeResult,
    xColumn,
    yColumn,
    fillColumns,
    symbolColumns,
    timeZone,
    timeRange: getActiveTimeRange(timeRange, viewProperties.queries),
    statuses,
  }
}

const mdtp = {
  onSetIsViewingRawData: setIsViewingRawData,
}

export default connect<StateProps, DispatchProps>(mstp, mdtp)(TimeMachineVis)
