import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CounterDirective } from '../../../classes/counter.directive';
import { DataProviderService } from '../../../service/data-provider.service';

interface StatCard {
  label: string;
  value: number;
  icon: string;
  bgClass: string;
  link: string;
  status: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgClass, RouterLink, CounterDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  stats: StatCard[] = [
    {
      label: 'Total Records',
      value: 0,
      icon: 'fa-solid fa-copy',
      bgClass: 'total_records_bg',
      link: '/data',
      status: 0,
    },
    {
      label: 'Draft',
      value: 0,
      icon: 'fa-regular fa-pen-to-square',
      bgClass: 'draft_bg',
      link: '/data',
      status: 1,
    },
    {
      label: 'Pending For Approval',
      value: 0,
      icon: 'fa-solid fa-clock-rotate-left',
      bgClass: 'pen_app_bg',
      link: '/data',
      status: 2,
    },
    {
      label: 'Approved',
      value: 0,
      icon: 'fa-solid fa-user-check',
      bgClass: 'approved_bg',
      link: '/data',
      status: 3,
    },
  ];

  constructor(private dataProvider: DataProviderService) {}

  ngOnInit(): void {
    this.getDashboardStatusCount();
  }

  getDashboardStatusCount(): void {
    const bankId = Number(sessionStorage.getItem('bankId')) || 0;

    this.dataProvider.getDashboardStatusCount(bankId).subscribe({
      next: (response: any) => {
        console.log('Dashboard Status Count:', response);

        const statusCounts = response.data || [];

        const draft =
          statusCounts.find((item: any) => item.status === 1)?.count ?? 0;
        const pending =
          statusCounts.find((item: any) => item.status === 2)?.count ?? 0;
        const approved =
          statusCounts.find((item: any) => item.status === 3)?.count ?? 0;

        const total = statusCounts.reduce(
          (sum: number, item: any) => sum + Number(item.count || 0),
          0,
        );

        this.stats[0].value = total;
        this.stats[1].value = draft;
        this.stats[2].value = pending;
        this.stats[3].value = approved;
      },
      error: (error) => {
        console.error('Error fetching dashboard status count:', error);
      },
    });
  }
}
