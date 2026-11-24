import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CounterDirective } from '../../../classes/counter.directive';

interface StatCard {
  label: string;
  value: number;
  icon: string;
  bgClass: string;
  link: string;
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
    { label: 'Total Records', value: 100, icon: 'fa-solid fa-copy', bgClass: 'total_records_bg', link: '/data' },
    { label: 'Draft', value: 10, icon: 'fa-regular fa-pen-to-square', bgClass: 'draft_bg', link: '/data' },
    { label: 'Pending For Approval', value: 10, icon: 'fa-solid fa-clock-rotate-left', bgClass: 'pen_app_bg', link: '/data' },
    { label: 'Approved', value: 80, icon: 'fa-solid fa-user-check', bgClass: 'approved_bg', link: '/data' },
  ];
}