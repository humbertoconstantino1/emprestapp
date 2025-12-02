import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexDataLabels,
  ApexFill,
  ApexPlotOptions,
  NgApexchartsModule,
  ChartComponent,
} from 'ng-apexcharts';
import { IonItemDivider } from '@ionic/angular/standalone';
@Component({
  selector: 'app-relatorio',
  templateUrl: './relatorio.component.html',
  styleUrls: ['./relatorio.component.scss'],
  imports: [CommonModule, NgApexchartsModule, IonItemDivider],
})
export class RelatorioComponent implements OnInit {
  constructor() {
    // Valor mensal mock
    const valorMes = 400;

    // --- Configuração do Gauge ---
    this.gaugeOptions = {
      series: [(valorMes / 5000) * 100], // percentual em relação a um máximo (ex: 5000)
      chart: {
        type: 'radialBar',
        height: 200,
      },
      plotOptions: {
        radialBar: {
          startAngle: -90,
          endAngle: 90,
          hollow: { size: '60%' },
          dataLabels: {
            name: { show: false },
            value: {
              fontSize: '32px',
              formatter: () => `R$ ${valorMes}`,
            },
          },
        },
      },
      labels: ['À Receber'],
      fill: { colors: ['#36A2EB'] },
      dataLabels: { value: { show: true } },
    };

    // --- Configuração do gráfico de colunas ---
    this.columnSeries = [
      {
        name: 'Receita (R$)',
        data: [
          1200, 1500, 1800, 2000, 1700, 1900, 2200, 2100, 2500, 2300, 2600,
          3000,
        ],
      },
    ];
    this.columnChartOptions = { type: 'bar', height: 400 };
    this.columnXAxis = {
      categories: [
        'Janeiro',
        'Fevereiro',
        'Março',
        'Abril',
        'Maio',
        'Junho',
        'Julho',
        'Agosto',
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro',
      ],
      title: { text: 'Meses' },
    };
    this.columnYAxis = { title: { text: 'Receita (R$)' } };
    this.columnTitle = { text: 'Receita Mensal', align: 'center' };
    this.columnDataLabels = { enabled: true };
    this.columnFill = { colors: ['#36A2EB'] };
  }
  @ViewChild('gaugeChart') gaugeChartRef!: ChartComponent;
  // --- Gauge (À Receber) ---
  public gaugeOptions: GaugeChartOptions;

  // --- Gráfico de Colunas ---
  public columnSeries: ApexAxisChartSeries;
  public columnChartOptions: ApexChart;
  public columnXAxis: ApexXAxis;
  public columnYAxis: ApexYAxis;
  public columnTitle: ApexTitleSubtitle;
  public columnDataLabels: ApexDataLabels;
  public columnFill: ApexFill;
  ngOnInit() {}
}
// Tipo para Gauge (velocímetro)
export type GaugeChartOptions = {
  series: number[];
  chart: ApexChart;
  plotOptions: ApexPlotOptions;
  labels: string[];
  fill: ApexFill;
  dataLabels: any;
};
