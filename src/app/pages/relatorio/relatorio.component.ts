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
import { IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { walletOutline, trendingUpOutline } from 'ionicons/icons';
import { LoanService, LoanStats } from '../../services/loan.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-relatorio',
  templateUrl: './relatorio.component.html',
  styleUrls: ['./relatorio.component.scss'],
  imports: [CommonModule, NgApexchartsModule, IonIcon, IonSpinner],
})
export class RelatorioComponent implements OnInit {
  isLoading = true;
  stats: LoanStats | null = null;
  userMeta: number = 5000;

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
  public areaSeries: ApexAxisChartSeries = [];
  public areaChartOptions!: ApexChart;
  public areaXAxis!: ApexXAxis;
  public areaYAxis!: ApexYAxis;
  public areaDataLabels!: ApexDataLabels;
  public areaStroke!: ApexStroke;
  public areaFill!: ApexFill;
  public areaColors!: string[];
  public areaGrid!: ApexGrid;
  public areaTooltip!: ApexTooltip;

  constructor(
    private loanService: LoanService,
    private userService: UserService
  ) {
    addIcons({ walletOutline, trendingUpOutline });

    // Inicializa gráficos com valores vazios
    this.gaugeOptions = this.createGaugeOptions(0, 5000);
    this.initAreaChart();
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;

    // Carrega a meta do usuário
    this.userService.getMe().subscribe({
      next: (user) => {
        this.userMeta = user.meta || 5000;
        this.loadStats();
      },
      error: () => {
        this.loadStats();
      },
    });
  }

  loadStats() {
    this.loanService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.updateCharts();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar estatísticas:', err);
        this.isLoading = false;
      },
    });
  }

  updateCharts() {
    if (!this.stats) return;

    // Atualiza gauge
    const valorReceber = this.stats.totalToReceive;
    this.gaugeOptions = this.createGaugeOptions(valorReceber, this.userMeta);

    // Atualiza gráfico de área
    if (this.stats.monthlyHistory && this.stats.monthlyHistory.length > 0) {
      this.areaSeries = [
        {
          name: 'Receita',
          data: this.stats.monthlyHistory.map((h) => h.value),
        },
      ];
      this.areaXAxis = {
        ...this.areaXAxis,
        categories: this.stats.monthlyHistory.map((h) => h.month),
      };
    }
  }

  createGaugeOptions(valor: number, meta: number) {
    const percentual = Math.min((valor / meta) * 100, 100);

    return {
      series: [percentual],
      chart: {
        type: 'radialBar' as const,
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
              formatter: () => `R$ ${valor.toLocaleString('pt-BR')}`,
            },
          },
        },
      },
      colors: ['#00c853'],
      labels: ['À Receber'],
      stroke: {
        lineCap: 'round' as const,
      },
    };
  }

  initAreaChart() {
    this.areaSeries = [
      {
        name: 'Receita',
        data: [0, 0, 0, 0, 0, 0],
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
      categories: ['', '', '', '', '', ''],
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

  get pendingValue(): number {
    if (!this.stats) return 0;
    return Math.max(this.userMeta - this.stats.totalToReceive, 0);
  }
}
