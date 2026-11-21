import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavComponent } from '../nav/nav.component';
import { CreateServiceService } from '../Services/create-service.service';
import { AuthService } from '../../AuthGuard/authService';
import { IconComponent } from '../../core/icon.component';
import { ImageUrlPipe } from '../../core/image-url.pipe';
import { Post, errorMessage } from '../../core/models';
import { STATUS_DRAFT, STATUS_PUBLISHED } from '../../core/api.config';

interface CategoryBar {
  category: string;
  count: number;
  percent: number;
}

@Component({
  selector: 'app-home-author',
  imports: [NavComponent, RouterLink, DatePipe, IconComponent, ImageUrlPipe],
  templateUrl: './home-author.component.html',
  styleUrl: './home-author.component.css'
})
export class HomeAuthorComponent implements OnInit {

  private posts = inject(CreateServiceService);
  private auth = inject(AuthService);

  readonly PUBLISHED = STATUS_PUBLISHED;

  firstName = (this.auth.getName() ?? '').split(' ')[0] || 'auteur';
  isLoading = true;
  error: string | null = null;

  total = 0;
  published = 0;
  drafts = 0;
  latest: Post[] = [];
  categories: CategoryBar[] = [];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.error = null;
    this.posts.getMyPosts().subscribe({
      next: posts => {
        this.total = posts.length;
        this.published = posts.filter(p => p.status === STATUS_PUBLISHED).length;
        this.drafts = posts.filter(p => p.status === STATUS_DRAFT).length;
        this.latest = posts.slice(0, 5);
        this.categories = this.byCategory(posts);
        this.isLoading = false;
      },
      error: err => {
        this.error = errorMessage(err);
        this.isLoading = false;
      }
    });
  }

  private byCategory(posts: Post[]): CategoryBar[] {
    const counts = new Map<string, number>();
    posts.forEach(p => counts.set(p.category, (counts.get(p.category) ?? 0) + 1));
    const max = Math.max(1, ...counts.values());
    return [...counts.entries()]
      .map(([category, count]) => ({ category, count, percent: Math.round((count / max) * 100) }))
      .sort((a, b) => b.count - a.count);
  }
}
