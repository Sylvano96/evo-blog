import { Component, DestroyRef, HostListener, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, debounceTime, distinctUntilChanged, of, startWith, switchMap, tap } from 'rxjs';
import { NavBarAdminComponent } from '../nav-bar-admin/nav-bar-admin.component';
import { ServiceAdService } from '../Service/service-ad.service';
import { CreateServiceService } from '../../Author/Services/create-service.service';
import { Comment, Post, errorMessage } from '../../core/models';
import { IconComponent } from '../../core/icon.component';
import { ImageUrlPipe } from '../../core/image-url.pipe';
import { STATUS_PUBLISHED } from '../../core/api.config';

type StatusFilter = 'all' | 'published' | 'draft';

@Component({
  selector: 'app-list-all-post',
  imports: [NavBarAdminComponent, IconComponent, ImageUrlPipe, DatePipe, RouterLink],
  templateUrl: './list-all-post.component.html',
  styleUrl: './list-all-post.component.css'
})
export class ListAllPostComponent {

  private admin = inject(ServiceAdService);
  private posts = inject(CreateServiceService);
  private destroyRef = inject(DestroyRef);
  private search$ = new Subject<string>();

  readonly published = STATUS_PUBLISHED;

  data: Post[] = [];
  isLoading = true;
  error = '';
  searchText = '';
  filter: StatusFilter = 'all';

  // dialogs
  toDelete: Post | null = null;
  deleting = false;
  commentsPost: Post | null = null;
  comments: Comment[] = [];
  commentsLoading = false;

  toast: { text: string; error: boolean } | null = null;
  private toastTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    this.search$.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => { this.isLoading = true; this.error = ''; }),
      switchMap(q => this.admin.getAllPosts(q).pipe(
        catchError(err => {
          this.error = errorMessage(err);
          return of([] as Post[]);
        })
      )),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(posts => {
      this.data = posts;
      this.isLoading = false;
    });
  }

  get visible(): Post[] {
    if (this.filter === 'published') {
      return this.data.filter(p => p.status === STATUS_PUBLISHED);
    }
    if (this.filter === 'draft') {
      return this.data.filter(p => p.status !== STATUS_PUBLISHED);
    }
    return this.data;
  }

  onSearch(event: Event) {
    this.searchText = (event.target as HTMLInputElement).value;
    this.search$.next(this.searchText);
  }

  onFilter(event: Event) {
    this.filter = (event.target as HTMLSelectElement).value as StatusFilter;
  }

  // ------------------------------------------------------------ delete post

  askDelete(post: Post) {
    this.toDelete = post;
  }

  confirmDelete() {
    const post = this.toDelete;
    if (!post) {
      return;
    }
    this.deleting = true;
    this.posts.deletePost(post.id).subscribe({
      next: () => {
        this.data = this.data.filter(p => p.id !== post.id);
        this.deleting = false;
        this.toDelete = null;
        this.notify('Article supprimé');
      },
      error: err => {
        this.deleting = false;
        this.toDelete = null;
        this.notify(errorMessage(err), true);
      }
    });
  }

  // --------------------------------------------------------------- comments

  openComments(post: Post) {
    this.commentsPost = post;
    this.comments = [];
    this.commentsLoading = true;
    this.posts.getComments(post.id).subscribe({
      next: list => {
        this.comments = list;
        this.commentsLoading = false;
      },
      error: err => {
        this.commentsLoading = false;
        this.notify(errorMessage(err), true);
      }
    });
  }

  deleteComment(comment: Comment) {
    this.posts.deleteComment(comment.id).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c.id !== comment.id);
        this.notify('Commentaire supprimé');
      },
      error: err => this.notify(errorMessage(err), true)
    });
  }

  // ---------------------------------------------------------------- helpers

  closeDialogs() {
    if (!this.deleting) {
      this.toDelete = null;
    }
    this.commentsPost = null;
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeDialogs();
  }

  private notify(text: string, error = false) {
    clearTimeout(this.toastTimer);
    this.toast = { text, error };
    this.toastTimer = setTimeout(() => this.toast = null, 4000);
  }
}
