import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavBarAdminComponent } from '../nav-bar-admin/nav-bar-admin.component';
import { ServiceAdService } from '../Service/service-ad.service';
import { Post, errorMessage } from '../../core/models';
import { IconComponent } from '../../core/icon.component';
import { ImageUrlPipe } from '../../core/image-url.pipe';
import { STATUS_PUBLISHED } from '../../core/api.config';

@Component({
  selector: 'app-details-posts-user',
  imports: [NavBarAdminComponent, IconComponent, ImageUrlPipe, DatePipe, RouterLink],
  templateUrl: './details-posts-user.component.html',
  styleUrl: './details-posts-user.component.css'
})
export class DetailsPostsUserComponent {

  private admin = inject(ServiceAdService);
  private route = inject(ActivatedRoute);

  readonly published = STATUS_PUBLISHED;

  data: Post[] = [];
  isLoading = true;
  error = '';

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.error = 'Auteur introuvable';
      this.isLoading = false;
      return;
    }
    this.admin.getUserAllPosts(id).subscribe({
      next: posts => {
        this.data = posts;
        this.isLoading = false;
      },
      error: err => {
        this.error = errorMessage(err);
        this.isLoading = false;
      }
    });
  }

  get authorName(): string {
    return this.data[0]?.authorName ?? 'Auteur';
  }

  get publishedCount(): number {
    return this.data.filter(p => p.status === STATUS_PUBLISHED).length;
  }
}
