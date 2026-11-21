import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { CreateServiceService } from '../../Author/Services/create-service.service';
import { ImageUrlPipe } from '../../core/image-url.pipe';
import { IconComponent } from '../../core/icon.component';
import { Post, errorMessage } from '../../core/models';

@Component({
  selector: 'app-posts',
  imports: [DatePipe, RouterLink, NgxPaginationModule, ImageUrlPipe, IconComponent],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.css'
})
export class PostsComponent implements OnInit {

  readonly sideCategory = 'Technologie et Société';
  readonly itemsPerPage = 6;
  readonly skeletons = [1, 2, 3];

  currentPage = 1;
  loading = true;
  error: string | null = null;

  featured: Post | null = null;
  recent: Post[] = [];
  rest: Post[] = [];
  side: Post[] = [];

  constructor(private posts: CreateServiceService) { }

  ngOnInit(): void {
    this.posts.getPosts().subscribe({
      next: data => {
        this.featured = data[0] ?? null;
        this.recent = data.slice(1, 4);
        this.rest = data.slice(4);
        this.side = data.filter(p => p.category === this.sideCategory).slice(0, 5);
        this.loading = false;
      },
      error: err => {
        this.error = errorMessage(err, 'Impossible de charger les articles.');
        this.loading = false;
      }
    });
  }
}
