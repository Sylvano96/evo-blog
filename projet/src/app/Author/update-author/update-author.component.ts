import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NavComponent } from '../nav/nav.component';
import { CreateServiceService } from '../Services/create-service.service';
import { EditorResult, PostEditorComponent } from '../post-editor/post-editor.component';
import { IconComponent } from '../../core/icon.component';
import { Post, errorMessage } from '../../core/models';
import { STATUS_PUBLISHED } from '../../core/api.config';

@Component({
  selector: 'app-update-author',
  imports: [NavComponent, PostEditorComponent, RouterLink, IconComponent],
  templateUrl: './update-author.component.html',
  styleUrl: './update-author.component.css'
})
export class UpdateAuthorComponent implements OnInit {

  private posts = inject(CreateServiceService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  postId = 0;
  post: Post | null = null;
  loading = true;
  loadError: string | null = null;
  saving = false;
  error: string | null = null;

  ngOnInit(): void {
    this.postId = Number(this.route.snapshot.paramMap.get('id')) || 0;
    this.posts.getPost(this.postId).subscribe({
      next: post => {
        this.post = post;
        this.loading = false;
      },
      error: err => {
        this.loadError = errorMessage(err, 'Article introuvable');
        this.loading = false;
      }
    });
  }

  save(result: EditorResult): void {
    if (!this.post) return;
    this.saving = true;
    this.error = null;
    const { file, ...data } = result;
    this.posts.updatePost(this.postId, { ...data, image: this.post.image }, file).subscribe({
      next: () => this.router.navigate(['/list'], {
        state: { toast: data.status === STATUS_PUBLISHED ? 'Article mis à jour et publié' : 'Brouillon mis à jour' }
      }),
      error: err => {
        this.saving = false;
        this.error = errorMessage(err);
      }
    });
  }
}
