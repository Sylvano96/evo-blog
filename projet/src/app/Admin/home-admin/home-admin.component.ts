import { AfterViewInit, Component, ElementRef, OnDestroy, PLATFORM_ID, ViewChild, inject } from '@angular/core';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { NavBarAdminComponent } from '../nav-bar-admin/nav-bar-admin.component';
import { ServiceAdService } from '../Service/service-ad.service';
import { CategoryCount, Post, Stats, errorMessage } from '../../core/models';
import { IconComponent } from '../../core/icon.component';
import { ImageUrlPipe } from '../../core/image-url.pipe';
import { STATUS_PUBLISHED } from '../../core/api.config';

@Component({
  selector: 'app-home-admin',
  imports: [NavBarAdminComponent, IconComponent, ImageUrlPipe, DatePipe, RouterLink],
  templateUrl: './home-admin.component.html',
  styleUrl: './home-admin.component.css'
})
export class HomeAdminComponent implements AfterViewInit, OnDestroy {

  @ViewChild('allCanvas') allCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('monthCanvas') monthCanvas?: ElementRef<HTMLCanvasElement>;

  private admin = inject(ServiceAdService);
  private browser = isPlatformBrowser(inject(PLATFORM_ID));
  private charts: Chart[] = [];
  private viewReady = false;

  readonly published = STATUS_PUBLISHED;
  stats: Stats | null = null;
  latest: Post[] = [];
  loading = true;
  error = '';

  constructor() {
    this.admin.getStats().subscribe({
      next: stats => {
        this.stats = stats;
        this.loading = false;
        // let the canvases render before drawing
        setTimeout(() => this.drawCharts());
      },
      error: err => {
        this.error = errorMessage(err);
        this.loading = false;
      }
    });
    this.admin.getAllPosts().subscribe({
      next: posts => this.latest = posts.slice(0, 5),
      error: () => this.latest = []
    });
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.drawCharts();
  }

  ngOnDestroy(): void {
    this.charts.forEach(c => c.destroy());
  }

  private drawCharts(): void {
    if (!this.browser || !this.viewReady || !this.stats || this.charts.length) {
      return;
    }
    const css = getComputedStyle(document.documentElement);
    const accent = css.getPropertyValue('--accent').trim() || '#3b5bdb';
    const text = css.getPropertyValue('--text-2').trim() || '#4a4f59';
    const border = css.getPropertyValue('--border').trim() || '#e2e2dc';

    const make = (canvas: ElementRef<HTMLCanvasElement> | undefined, data: CategoryCount[], label: string) => {
      if (!canvas || !data.length) {
        return;
      }
      this.charts.push(new Chart(canvas.nativeElement, {
        type: 'bar',
        data: {
          labels: data.map(d => d.category),
          datasets: [{ label, data: data.map(d => d.count), backgroundColor: accent, borderRadius: 6, maxBarThickness: 40 }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: text }, grid: { display: false }, border: { color: border } },
            y: { beginAtZero: true, ticks: { color: text, precision: 0 }, grid: { color: border }, border: { display: false } }
          }
        }
      }));
    };
    make(this.allCanvas, this.stats.publishedByCategory, 'Articles publiés');
    make(this.monthCanvas, this.stats.publishedLastMonth, 'Le mois dernier');
  }
}
