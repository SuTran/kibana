/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';
import { shallow, mount } from 'enzyme';

import { ChartOptions, ChartOptionsParams } from './chart_options';
import { SeriesParam, ChartMode, AxisMode } from '../../../../types';
import { LineOptions } from './line_options';
import { PointOptions } from './point_options';
import { valueAxis, seriesParam } from './mocks';
import { ChartType } from '../../../../../common';

describe('ChartOptions component', () => {
  let setParamByIndex: jest.Mock;
  let changeValueAxis: jest.Mock;
  let defaultProps: ChartOptionsParams;
  let chart: SeriesParam;

  beforeEach(() => {
    setParamByIndex = jest.fn();
    changeValueAxis = jest.fn();
    chart = { ...seriesParam };

    defaultProps = {
      index: 0,
      chart,
      valueAxes: [valueAxis],
      setParamByIndex,
      changeValueAxis,
    };
  });

  it('should init with the default set of props', () => {
    const comp = shallow(<ChartOptions {...defaultProps} />);

    expect(comp).toMatchSnapshot();
  });

  it('should hide the PointOptions when type is bar', () => {
    const comp = shallow(<ChartOptions {...defaultProps} />);

    expect(comp.find(PointOptions).exists()).toBeFalsy();
  });

  it('should show LineOptions when type is line', () => {
    chart.type = ChartType.Line;
    const comp = shallow(<ChartOptions {...defaultProps} />);

    expect(comp.find(LineOptions).exists()).toBeTruthy();
  });

  it('should show PointOptions when type is area', () => {
    chart.type = ChartType.Area;
    const comp = shallow(<ChartOptions {...defaultProps} />);

    expect(comp.find(PointOptions).exists()).toBeTruthy();
  });

  it('should show line mode when type is area', () => {
    chart.type = ChartType.Area;
    const comp = shallow(<ChartOptions {...defaultProps} />);

    expect(comp.find({ paramName: 'interpolate' }).exists()).toBeTruthy();
  });

  it('should call changeValueAxis when valueAxis is changed', () => {
    const comp = shallow(<ChartOptions {...defaultProps} />);
    const paramName = 'valueAxis';
    const value = 'new';
    comp.find({ paramName }).prop('setValue')(paramName, value);

    expect(changeValueAxis).toBeCalledWith(0, paramName, value);
  });

  it('should call setParamByIndex when mode is changed', () => {
    const comp = shallow(<ChartOptions {...defaultProps} />);
    const paramName = 'mode';
    comp.find({ paramName }).prop('setValue')(paramName, ChartMode.Normal);

    expect(setParamByIndex).toBeCalledWith('seriesParams', 0, paramName, ChartMode.Normal);
  });

  it('should set "stacked" mode and disabled control if the referenced axis is "percentage"', () => {
    defaultProps.valueAxes[0].scale.mode = AxisMode.Percentage;
    defaultProps.chart.mode = ChartMode.Normal;
    const paramName = 'mode';
    const comp = mount(<ChartOptions {...defaultProps} />);

    expect(setParamByIndex).toBeCalledWith('seriesParams', 0, paramName, ChartMode.Stacked);
    expect(comp.find({ paramName }).prop('disabled')).toBeTruthy();
  });
});
