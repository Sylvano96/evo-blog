import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NavComponent } from '../nav/nav.component';
import { CreateServiceService } from '../Services/create-service.service';
import { IconComponent } from '../../core/icon.component';
import { ImageUrlPipe } from '../../core/image-url.pipe';
import { Comment, Post, errorMessage } from '../../core/models';
import { STATUS_DRAFT, STATUS_PUBLISHED } from '../../core/api.config';

type StatusFilter = 'all' | 'published' | 'draft';

@Component({
  selector: 'app-list',
  imports: [NavComponent, FormsModule, RouterLink, DatePipe, IconComponent, ImageUrlPipe],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent implements OnInit, OnDestroy {

  private posts = inject(CreateServiceService);
  private router = inject(Router);

  readonly PUBLISHED = STATUS_PUBLISHED;

  data: Post[] = [];
  isLoading = true;
  loadError: string | null = null;

  searchText = '';
  filter: StatusFilter = 'all';

  // delete confirmation
  toDelete: Post | null = null;
  deleting = false;

  // comments dialog
  commentsPost: Post | null = null;
  comments: Comment[] = [];
  commentsLoading = false;
  commentsError: string | null = null;

  toast: { text: string; error?: boolean } | null = null;
  private toastTimer: ReturnType<typeof setTimeout> | undefined;

  ngOnInit(): void {
    const message = this.router.getCurrentNavigation()?.extras.state?.['toast']
      ?? (typeof history !== 'undefined' ? history.state?.toast : undefined);
    if (typeof message === 'string') {
      this.showToast(message);
      if (typeof history !== 'undefined' && history.state?.toast) {
        // do not show it again after a page reload
        history.replaceState({ ...history.state, toast: undefined }, '');
      }
    }
    this.load();
  }

  ngOnDestroy(): void {
    clearTimeout(this.toastTimer);
  }

  load(): void {
    this.isLoading = true;
    this.loadError = null;
    this.posts.getMyPosts().subscribe({
      next: posts => {
        this.data = posts;
        this.isLoading = false;
      },
      error: err => {
        this.loadError = errorMessage(err);
        this.isLoading = false;
      }
    });
  }

  get filtered(): Post[] {
    const q = this.searchText.trim().toLowerCase();
    return this.data.filter(p =>
      (this.filter === 'all'
        || (this.filter === 'published' && p.status === STATUS_PUBLISHED)
        || (this.filter === 'draft' && p.status === STATUS_DRAFT))
      && (!q || p.title.toLowerCase().includes(q)));
  }

  count(filter: StatusFilter): number {
    if (filter === 'all') return this.data.length;
    const status = filter === 'published' ? STATUS_PUBLISHED : STATUS_DRAFT;
    return this.data.filter(p => p.status === status).length;
  }

  // ------------------------------------------------------------------ delete

  askDelete(post: Post): void {
    this.toDelete = post;
  }

  confirmDelete(): void {
    const post = this.toDelete;
    if (!post || this.deleting) return;
    this.deleting = true;
    this.posts.deletePost(post.id).subscribe({
      next: () => {
        this.data = this.data.filter(p => p.id !== post.id);
        this.deleting = false;
        this.toDelete = null;
        this.showToast('Article supprimé');
      },
      error: err => {
        this.deleting = false;
        this.toDelete = null;
        this.showToast(errorMessage(err), true);
      }
    });
  }

  // ---------------------------------------------------------------- comments

  openComments(post: Post): void {
    this.commentsPost = post;
    this.comments = [];
    this.commentsError = null;
    this.commentsLoading = true;
    this.posts.getComments(post.id).subscribe({
      next: comments => {
        this.comments = comments;
        this.commentsLoading = false;
      },
      error: err => {
        this.commentsError = errorMessage(err);
        this.commentsLoading = false;
      }
    });
  }

  deleteComment(comment: Comment): void {
    this.posts.deleteComment(comment.id).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c.id !== comment.id);
        this.showToast('Commentaire supprimé');
      },
      error: err => this.showToast(errorMessage(err), true)
    });
  }

  // ------------------------------------------------------------------ dialogs

  closeDialogs(): void {
    if (!this.deleting) this.toDelete = null;
    this.commentsPost = null;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeDialogs();
  }

  private showToast(text: string, error = false): void {
    this.toast = { text, error };
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => (this.toast = null), 4000);
  }
}
