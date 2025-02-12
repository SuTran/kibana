/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { Fragment, Component } from 'react';

import { getDataViewNotFoundMessage } from '../../../../common/i18n_getters';
import { GRID_RESOLUTION, LAYER_TYPE } from '../../../../common/constants';
import { MetricsEditor } from '../../../components/metrics_editor';
import { getIndexPatternService } from '../../../kibana_services';
import { ResolutionEditor } from './resolution_editor';
import { FormattedMessage } from '@kbn/i18n/react';
import { EuiPanel, EuiSpacer, EuiTitle } from '@elastic/eui';
import { isMetricCountable } from '../../util/is_metric_countable';
import { indexPatterns } from '../../../../../../../src/plugins/data/public';
import { RenderAsSelect } from './render_as_select';

export class UpdateSourceEditor extends Component {
  state = {
    fields: null,
  };

  componentDidMount() {
    this._isMounted = true;
    this._loadFields();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  async _loadFields() {
    let indexPattern;
    try {
      indexPattern = await getIndexPatternService().get(this.props.indexPatternId);
    } catch (err) {
      if (this._isMounted) {
        this.setState({
          loadError: getDataViewNotFoundMessage(this.props.indexPatternId),
        });
      }
      return;
    }

    if (!this._isMounted) {
      return;
    }

    this.setState({
      fields: indexPattern.fields.filter((field) => !indexPatterns.isNestedField(field)),
    });
  }

  _onMetricsChange = (metrics) => {
    this.props.onChange({ propName: 'metrics', value: metrics });
  };

  _onResolutionChange = (resolution) => {
    let newLayerType;
    if (
      this.props.currentLayerType === LAYER_TYPE.VECTOR ||
      this.props.currentLayerType === LAYER_TYPE.TILED_VECTOR
    ) {
      newLayerType =
        resolution === GRID_RESOLUTION.SUPER_FINE ? LAYER_TYPE.TILED_VECTOR : LAYER_TYPE.VECTOR;
    } else if (this.props.currentLayerType === LAYER_TYPE.HEATMAP) {
      if (resolution === GRID_RESOLUTION.SUPER_FINE) {
        throw new Error('Heatmap does not support SUPER_FINE resolution');
      } else {
        newLayerType = LAYER_TYPE.HEATMAP;
      }
    } else {
      throw new Error('Unexpected layer-type');
    }

    this.props.onChange({ propName: 'resolution', value: resolution, newLayerType });
  };

  _onRequestTypeSelect = (requestType) => {
    this.props.onChange({ propName: 'requestType', value: requestType });
  };

  _renderMetricsPanel() {
    const metricsFilter =
      this.props.currentLayerType === LAYER_TYPE.HEATMAP
        ? (metric) => {
            //these are countable metrics, where blending heatmap color blobs make sense
            return isMetricCountable(metric.value);
          }
        : null;
    const allowMultipleMetrics = this.props.currentLayerType !== LAYER_TYPE.HEATMAP;
    return (
      <EuiPanel>
        <EuiTitle size="xs">
          <h6>
            <FormattedMessage id="xpack.maps.source.esGrid.metricsLabel" defaultMessage="Metrics" />
          </h6>
        </EuiTitle>
        <EuiSpacer size="m" />
        <MetricsEditor
          allowMultipleMetrics={allowMultipleMetrics}
          metricsFilter={metricsFilter}
          fields={this.state.fields}
          metrics={this.props.metrics}
          onChange={this._onMetricsChange}
        />
      </EuiPanel>
    );
  }

  render() {
    return (
      <Fragment>
        {this._renderMetricsPanel()}
        <EuiSpacer size="s" />

        <EuiPanel>
          <EuiTitle size="xs">
            <h6>
              <FormattedMessage
                id="xpack.maps.source.esGrid.geoTileGridLabel"
                defaultMessage="Grid parameters"
              />
            </h6>
          </EuiTitle>
          <EuiSpacer size="m" />
          <ResolutionEditor
            includeSuperFine={this.props.currentLayerType !== LAYER_TYPE.HEATMAP}
            resolution={this.props.resolution}
            onChange={this._onResolutionChange}
          />
          <RenderAsSelect
            isColumnCompressed
            renderAs={this.props.renderAs}
            onChange={this._onRequestTypeSelect}
          />
        </EuiPanel>
        <EuiSpacer size="s" />
      </Fragment>
    );
  }
}
