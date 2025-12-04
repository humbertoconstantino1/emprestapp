import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular';
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

@Component({
  selector: 'app-relatorio',
  templateUrl: './relatorio.component.html',
  styleUrls: ['./relatorio.component.scss'],
  imports: [CommonModule, NgApexchartsModule, IonIcon, IonSpinner],
})
export class RelatorioComponent implements OnInit, ViewWillEnter {
  isLoading = true;
  stats: LoanStats | null = null;

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
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ walletOutline, trendingUpOutline });

    // Inicializa gráficos com valores vazios
    this.gaugeOptions = this.createGaugeOptions(0, 0);
    this.initAreaChart();
  }

  ngOnInit() {
    this.loadData();
  }

  ionViewWillEnter() {
    // Recarrega os dados quando a página for visualizada
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.loadStats();
  }

  loadStats() {
    this.loanService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.updateCharts();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  updateCharts() {
    if (!this.stats) return;

    // Atualiza gauge - compara mês atual com mês anterior
    const valorRecebidoMesAtual = this.stats.currentMonthReceived || 0;
    const valorRecebidoMesAnterior = this.stats.previousMonthReceived || 0;
    
    this.gaugeOptions = this.createGaugeOptions(valorRecebidoMesAtual, valorRecebidoMesAnterior);

    // Atualiza gráfico de área
    if (this.stats.monthlyHistory && this.stats.monthlyHistory.length > 0) {
      
      // Cria novos objetos para forçar detecção de mudanças
      this.areaSeries = [
        {
          name: 'Receita',
          data: this.stats.monthlyHistory.map((h) => h.value || 0),
        },
      ];
      
      // Cria um novo objeto para o XAxis
      this.areaXAxis = {
        categories: this.stats.monthlyHistory.map((h) => h.month),
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
    } else {
      // Define valores padrão se não houver histórico
      this.areaSeries = [
        {
          name: 'Receita',
          data: [0, 0, 0, 0, 0, 0],
        },
      ];
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
    }
    
    // Força a detecção de mudanças para atualizar os gráficos
    this.cdr.detectChanges();
  }

  createGaugeOptions(valor: number, meta: number) {
    // Se mês anterior foi 0 e mês atual tem valor, mostra 100% (superou)
    // Se mês anterior > 0, calcula percentual normalmente
    let percentual: number;
    let color: string;
    
    if (meta === 0) {
      // Se não recebeu nada no mês anterior
      if (valor > 0) {
        // E recebeu este mês, mostra 100% verde (superou)
        percentual = 100;
        color = '#00c853'; // Verde
      } else {
        // Não recebeu em nenhum dos dois meses
        percentual = 0;
        color = '#e94560'; // Vermelho
      }
    } else {
      // Calcula percentual baseado no mês anterior
      percentual = (valor / meta) * 100;
      
      // Define a cor baseado no percentual
      if (percentual >= 100) {
        color = '#00c853'; // Verde (100% ou mais - superou)
      } else if (percentual >= 50) {
        color = '#ffa726'; // Laranja (50% a 99%)
      } else {
        color = '#e94560'; // Vermelho (menos de 50%)
      }
    }

    return {
      series: [Math.min(percentual, 100)], // Limita a 100% para o gauge
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
      colors: [color],
      labels: ['Este mês vs mês anterior'],
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

}

