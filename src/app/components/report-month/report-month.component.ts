import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-report-month',
  templateUrl: './report-month.component.html',
  styleUrls: ['./report-month.component.scss']
})
export class ReportMonthComponent implements OnInit {
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July'
    ],
    datasets: [
      {
        data: [ 65, 59, 80, 81, 56, 55, 40 ],
        label: 'Series A',
        fill: true,
        tension: 0.5,
        borderColor: 'black',
        backgroundColor: 'rgba(255,0,0,0.3)'
      }
    ]
  }
  public lineChartLabels: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  public lineChartOptions: ChartOptions = {
    responsive: true,
  };
  public lineChartLegend = true;
  public lineChartType: ChartType = 'line';
  public lineChartPlugins = [];

  constructor(private readonly activatedRoute: ActivatedRoute) { }
  
  ngOnInit(): void {
    this.activatedRoute.params.subscribe({
      next: (params) => {
        const x = params['type']
        console.log(x)
      }, error: (e) => {
        
        throw e;
      }
    })
  }
}
