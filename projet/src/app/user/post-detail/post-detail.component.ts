import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CreateServiceService } from '../../Author/Services/create-service.service';
import { ImageUrlPipe } from '../../core/image-url.pipe';
import { IconComponent } from '../../core/icon.component';
import { Comment, Post, errorMessage } from '../../core/models';
import { FooterComponent } from '../footer/footer.component';
import { NavBarComponent } from '../nav-bar/nav-bar.component';

@Component({
  selector: 'app-post-detail',
  imports: [FooterComponent, NavBarComponent, ReactiveFormsModule, DatePipe, RouterLink, ImageUrlPipe, IconComponent],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.css'
})
export class PostDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private service = inject(CreateServiceService);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);

  post: Post | null = null;
  loading = true;
  notFound = false;
  loadError: string | null = null;

  comments: Comment[] = [];
  related: Post[] = [];

  sending = false;
  commentError: string | null = null;

  commentForm = this.fb.nonNullable.group({
    pseudo: ['', [Validators.required, Validators.maxLength(50)]],
    comment: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const id = Number(params.get('id'));
      this.load(id);
    });
  }

  private load(id: number): void {
    this.loading = true;
    this.notFound = false;
    this.loadError = null;
    this.post = null;
    this.comments = [];
    this.related = [];
    this.commentError = null;

    if (!Number.isInteger(id) || id <= 0) {
      this.notFound = true;
      this.loading = false;
      return;
    }

    this.service.getPost(id).subscribe({
      next: post => {
        this.post = post;
        this.loading = false;
        this.loadComments(post.id);
        this.loadRelated(post);
      },
      error: err => {
        if (err?.status === 404) {
          this.notFound = true;
        } else {
          this.loadError = errorMessage(err, 'Impossible de charger cet article.');
        }
        this.loading = false;
      }
    });
  }

  private loadComments(postId: number): void {
    this.service.getComments(postId).subscribe({
      next: list => this.comments = list,
      error: () => this.comments = [],
    });
  }

  private loadRelated(post: Post): void {
    this.service.getPosts().subscribe({
      next: all => {
        const others = all.filter(p => p.id !== post.id);
        const same = others.filter(p => p.category === post.category);
        const rest = others.filter(p => p.category !== post.category);
        this.related = [...same, ...rest].slice(0, 4);
      },
      error: () => this.related = [],
    });
  }

  submit(): void {
    if (!this.post || this.sending) {
      return;
    }
    if (this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }
    this.sending = true;
    this.commentError = null;
    const { pseudo, comment } = this.commentForm.getRawValue();
    this.service.commentPost(this.post.id, { pseudo: pseudo.trim(), comment: comment.trim() }).subscribe({
      next: created => {
        this.comments = [...this.comments, created];
        this.commentForm.reset();
        this.sending = false;
      },
      error: err => {
        this.commentError = errorMessage(err, 'Votre commentaire n\'a pas pu être envoyé.');
        this.sending = false;
      }
    });
  }

  initial(name: string): string {
    return (name.trim()[0] ?? '?').toUpperCase();
  }
}
