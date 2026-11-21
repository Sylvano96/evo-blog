import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavComponent } from '../nav/nav.component';
import { CreateServiceService } from '../Services/create-service.service';
import { EditorResult, PostEditorComponent } from '../post-editor/post-editor.component';
import { errorMessage } from '../../core/models';
import { STATUS_PUBLISHED } from '../../core/api.config';

@Component({
  selector: 'app-create-post',
  imports: [NavComponent, PostEditorComponent],
  templateUrl: './create-post.component.html',
  styleUrl: './create-post.component.css'
})
export class CreatePostComponent {

  private posts = inject(CreateServiceService);
  private router = inject(Router);

  saving = false;
  error: string | null = null;

  save(result: EditorResult): void {
    if (!result.file) {
      this.error = 'Une image de couverture est obligatoire';
      return;
    }
    this.saving = true;
    this.error = null;
    const { file, ...data } = result;
    this.posts.addContent(data, file).subscribe({
      next: () => this.router.navigate(['/list'], {
        state: { toast: data.status === STATUS_PUBLISHED ? 'Article publié' : 'Brouillon enregistré' }
      }),
      error: err => {
        this.saving = false;
        this.error = errorMessage(err);
      }
    });
  }
}
