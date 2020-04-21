// Libraries
import React, {SFC} from 'react'

// Components
import DataExplorer from 'src/dataExplorer/components/DataExplorer'
import {Page} from '@influxdata/clockface'
import SaveAsButton from 'src/dataExplorer/components/SaveAsButton'
import GetResources from 'src/resources/components/GetResources'
import TimeZoneDropdown from 'src/shared/components/TimeZoneDropdown'
import DeleteDataButton from 'src/dataExplorer/components/DeleteDataButton'
import CloudUpgradeButton from 'src/shared/components/CloudUpgradeButton'
import QueryTabs from 'src/timeMachine/components/QueryTabs'

// Types
import {ResourceType} from 'src/types'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

const DataExplorerPage: SFC = ({children}) => {
  return (
    <Page titleTag={pageTitleSuffixer(['Data Explorer'])}>
      {children}
      <GetResources resources={[ResourceType.Variables, ResourceType.Buckets]}>
        <Page.Header fullWidth={true}>
          <Page.Title title="Data Explorer" />
          <CloudUpgradeButton />
        </Page.Header>
        <Page.ControlBar fullWidth={true}>
          <Page.ControlBarLeft>
            <QueryTabs />
          </Page.ControlBarLeft>
          <Page.ControlBarRight>
            <DeleteDataButton />
            <TimeZoneDropdown />
            <SaveAsButton />
          </Page.ControlBarRight>
        </Page.ControlBar>
        <Page.Contents fullWidth={true} scrollable={true}>
          <DataExplorer />
        </Page.Contents>
      </GetResources>
    </Page>
  )
}

export default DataExplorerPage
