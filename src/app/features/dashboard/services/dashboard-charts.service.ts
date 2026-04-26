import { Injectable, inject } from '@angular/core';
import type { EChartsOption } from 'echarts';
import * as echarts from 'echarts';
import { IncomeData, SpendingData } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardChartsService {
  // ─── Shared palette ────────────────────────────────────────────
  private readonly palette = {
    violet:  '#7c3aed',
    vLight:  '#a78bfa',
    cyan:    '#06b6d4',
    emerald: '#10b981',
    grid:    'rgba(255,255,255,0.07)',
    text:    '#5a5e78',
    tooltip: '#1c1f35',
  };

  private baseStyle = {
    backgroundColor: 'transparent',
    textStyle: { color: this.palette.text, fontFamily: 'DM Sans, sans-serif' },
  };

  // ─── Chart Options ─────────────────────────────────────────────
  getIncomeChartOption(data: IncomeData | null): EChartsOption {
    if (!data) return {};

    return {
      ...this.baseStyle,
      tooltip: this.createTooltip(this.palette.emerald),
      grid: { top: 10, right: 10, bottom: 20, left: 45 },
      xAxis: this.createCategoryAxis(data.chartData.map(c => c.month)),
      yAxis: this.createValueAxis(),
      series: [{
        type: 'line',
        data: data.chartData.map(c => c.value),
        smooth: true,
        symbol: 'none',
        lineStyle: { color: this.palette.emerald, width: 2.5 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16,185,129,0.35)' },
            { offset: 1, color: 'rgba(16,185,129,0.02)' },
          ]),
        },
      }],
    };
  }

  getSpendingChartOption(data: SpendingData | null): EChartsOption {
    if (!data) return {};

    return {
      ...this.baseStyle,
      tooltip: this.createTooltip(this.palette.cyan),
      grid: { top: 10, right: 10, bottom: 20, left: 45 },
      xAxis: this.createCategoryAxis(data.chartData.map(c => c.month)),
      yAxis: this.createValueAxis(),
      series: [{
        type: 'line',
        data: data.chartData.map(c => c.value),
        smooth: true,
        symbol: 'none',
        lineStyle: { color: this.palette.cyan, width: 2.5 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(6,182,212,0.35)' },
            { offset: 1, color: 'rgba(6,182,212,0.02)' },
          ]),
        },
      }],
    };
  }

  getCashflowChartOption(rawData: any[]): EChartsOption {
    if (!rawData.length) return {};

    const series = rawData[0]?.series ?? [];
    return {
      ...this.baseStyle,
      tooltip: this.createTooltip(this.palette.violet),
      grid: { top: 10, right: 10, bottom: 30, left: 55 },
      xAxis: this.createCategoryAxis(
        series.map((s: any) => s.name),
        { interval: 4 }
      ),
      yAxis: this.createValueAxis(),
      series: [{
        type: 'line',
        data: series.map((s: any) => s.value),
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
            { offset: 0, color: this.palette.violet },
            { offset: 1, color: this.palette.cyan },
          ]),
          width: 2.5,
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(124,58,237,0.30)' },
            { offset: 1, color: 'rgba(6,182,212,0.02)' },
          ]),
        },
      }],
    };
  }

  // ─── Helper Methods ────────────────────────────────────────────
  private createTooltip(borderColor: string) {
    return {
      trigger: 'axis' as const,
      backgroundColor: this.palette.tooltip,
      borderColor,
      borderWidth: 1,
      textStyle: { color: '#f0f2ff', fontSize: 12 },
      formatter: (params: any) =>
        `${params[0].name}<br/><b>$${(params[0].value as number).toLocaleString()}</b>`,
    };
  }

  private createCategoryAxis(data: string[], extra: Record<string, any> = {}) {
    return {
      type: 'category' as const,
      data,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: this.palette.text, fontSize: 11, ...extra },
      splitLine: { show: false },
    };
  }

  private createValueAxis() {
    return {
      type: 'value' as const,
      axisLabel: {
        color: this.palette.text,
        fontSize: 11,
        formatter: (v: number) => `$${v / 1000}k`,
      },
      splitLine: { lineStyle: { color: this.palette.grid } },
      axisLine: { show: false },
      axisTick: { show: false },
    };
  }
}