import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexFill,
  ApexPlotOptions,
  ApexStroke,
  ApexGrid,
  ApexTooltip,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { walletOutline, trendingUpOutline } from 'ionicons/icons';

@Component({
  selector: 'app-relatorio',
  templateUrl: './relatorio.component.html',
  styleUrls: ['./relatorio.component.scss'],
  imports: [CommonModule, NgApexchartsModule, IonIcon],
})
export class RelatorioComponent implements OnInit {
  // Gauge options
  public gaugeOptions: {
    series: number[];
    chart: ApexChart;
    plotOptions: ApexPlotOptions;
    colors: string[];
    labels: string[];
    stroke: ApexStroke;
  };

  // Area chart options
  public areaSeries: ApexAxisChartSeries;
  public areaChartOptions: ApexChart;
  public areaXAxis: ApexXAxis;
  public areaYAxis: ApexYAxis;
  public areaDataLabels: ApexDataLabels;
  public areaStroke: ApexStroke;
  public areaFill: ApexFill;
  public areaColors: string[];
  public areaGrid: ApexGrid;
  public areaTooltip: ApexTooltip;

  constructor() {
    addIcons({ walletOutline, trendingUpOutline });

    // Valor a receber
    const valorReceber = 3200;
    const meta = 5000;
    const percentual = (valorReceber / meta) * 100;

    // --- Configuração do Gauge Moderno ---
    this.gaugeOptions = {
      series: [percentual],
      chart: {
        type: 'radialBar',
        height: 220,
        sparkline: {
          enabled: true,
        },
      },
      plotOptions: {
        radialBar: {
          startAngle: -135,
          endAngle: 135,
          hollow: {
            size: '70%',
          },
          track: {
            background: '#f0f0f0',
            strokeWidth: '100%',
          },
          dataLabels: {
            name: {
              show: true,
              fontSize: '14px',
              color: '#6c757d',
              offsetY: -10,
            },
            value: {
              show: true,
              fontSize: '32px',
              fontWeight: 700,
              color: '#1a1a2e',
              offsetY: 10,
              formatter: () => `R$ ${valorReceber.toLocaleString('pt-BR')}`,
            },
          },
        },
      },
      colors: ['#00c853'],
      labels: ['Recebido'],
      stroke: {
        lineCap: 'round',
      },
    };

    // --- Configuração do Gráfico de Área ---
    this.areaSeries = [
      {
        name: 'Receita',
        data: [1900, 2200, 2100, 2500, 2300, 3000],
      },
    ];

    this.areaChartOptions = {
      type: 'area',
      height: 260,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      sparkline: {
        enabled: false,
      },
    };

    this.areaXAxis = {
      categories: ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      labels: {
        style: {
          colors: '#6c757d',
          fontSize: '12px',
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    };

    this.areaYAxis = {
      labels: {
        style: {
          colors: '#6c757d',
          fontSize: '12px',
        },
        formatter: (val: number) => `R$ ${(val / 1000).toFixed(1)}k`,
      },
    };

    this.areaDataLabels = {
      enabled: false,
    };

    this.areaStroke = {
      curve: 'smooth',
      width: 3,
    };

    this.areaFill = {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    };

    this.areaColors = ['#e94560'];

    this.areaGrid = {
      borderColor: '#f0f0f0',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    };

    this.areaTooltip = {
      enabled: true,
      y: {
        formatter: (val: number) => `R$ ${val.toLocaleString('pt-BR')}`,
      },
    };
  }

  ngOnInit() {}
}
