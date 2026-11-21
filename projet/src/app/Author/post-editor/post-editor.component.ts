import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CATEGORIES, STATUS_DRAFT, STATUS_PUBLISHED, imageUrl } from '../../core/api.config';
import { IconComponent } from '../../core/icon.component';
import { ContentBlock, Post } from '../../core/models';

export interface EditorResult {
  title: string;
  category: string;
  status: string;
  contents: ContentBlock[];
  /** New image picked by the author, or null to keep the current one. */
  file: File | null;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

/** Form shared by "Nouvel article" and "Modifier l'article". The parent does the API calls. */
@Component({
  selector: 'app-post-editor',
  imports: [FormsModule, RouterLink, IconComponent],
  templateUrl: './post-editor.component.html',
  styleUrl: './post-editor.component.css'
})
export class PostEditorComponent implements OnDestroy {

  readonly categories = CATEGORIES;
  readonly maxTitle = 70;
  readonly maxParaTitle = 200;
  readonly maxContent = 20000;

  /** Shown to the user while a request is running. */
  @Input() saving = false;
  /** Error coming from the API. */
  @Input() error: string | null = null;
  @Input() submitLabel = 'Publier';

  @Input() set post(post: Post | null) {
    if (!post) {
      return;
    }
    this.title = post.title ?? '';
    this.category = this.categories.some(c => c.value === post.category) ? post.category : '';
    this.blocks = (post.contents ?? []).map((b, i) => ({
      id: b.id ?? i + 1,
      titlePara: b.titlePara ?? '',
      content: b.content ?? '',
    }));
    if (this.blocks.length === 0) {
      this.addBlock();
    }
    this.hasExistingImage = !!post.image;
    this.setPreview(post.image ? imageUrl(post.image) : null, false);
  }

  @Output() submitted = new EventEmitter<EditorResult>();

  title = '';
  category = '';
  blocks: ContentBlock[] = [{ id: 1, titlePara: '', content: '' }];
  file: File | null = null;
  preview: string | null = null;
  fileError: string | null = null;
  hasExistingImage = false;
  attempted = false;
  mode: 'edit' | 'preview' = 'edit';

  private objectUrl: string | null = null;

  // ------------------------------------------------------------ validation

  get titleError(): string | null {
    const t = this.title.trim();
    if (!t) return 'Le titre est obligatoire';
    if (t.length > this.maxTitle) return `${this.maxTitle} caractères maximum`;
    return null;
  }

  get categoryError(): string | null {
    return this.category ? null : 'Choisissez une catégorie';
  }

  get imageError(): string | null {
    if (this.fileError) return this.fileError;
    return this.file || this.hasExistingImage ? null : 'Une image de couverture est obligatoire';
  }

  blockError(block: ContentBlock): string | null {
    if (!block.titlePara.trim() || !block.content.trim()) return 'Le sous-titre et le texte sont obligatoires';
    if (block.titlePara.length > this.maxParaTitle) return `Sous-titre : ${this.maxParaTitle} caractères maximum`;
    if (block.content.length > this.maxContent) return `Texte : ${this.maxContent} caractères maximum`;
    return null;
  }

  get valid(): boolean {
    return !this.titleError && !this.categoryError && !this.imageError
      && this.blocks.length > 0 && this.blocks.every(b => !this.blockError(b));
  }

  // ------------------------------------------------------------------ image

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      this.fileError = 'Formats acceptés : PNG, JPEG, GIF, WEBP';
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      this.fileError = 'Image trop lourde (5 Mo maximum)';
      return;
    }
    this.fileError = null;
    this.file = file;
    this.setPreview(URL.createObjectURL(file), true);
  }

  private setPreview(url: string | null, isObjectUrl: boolean): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
    this.preview = url;
    if (isObjectUrl) this.objectUrl = url;
  }

  // ----------------------------------------------------------------- blocks

  addBlock(): void {
    const next = this.blocks.reduce((max, b) => Math.max(max, b.id ?? 0), 0) + 1;
    this.blocks = [...this.blocks, { id: next, titlePara: '', content: '' }];
  }

  removeBlock(index: number): void {
    if (this.blocks.length > 1) {
      this.blocks = this.blocks.filter((_, i) => i !== index);
    }
  }

  move(index: number, delta: -1 | 1): void {
    const target = index + delta;
    if (target < 0 || target >= this.blocks.length) return;
    const copy = [...this.blocks];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    this.blocks = copy;
  }

  // ----------------------------------------------------------------- submit

  submit(publish: boolean): void {
    this.attempted = true;
    if (!this.valid || this.saving) return;
    this.submitted.emit({
      title: this.title.trim(),
      category: this.category,
      status: publish ? STATUS_PUBLISHED : STATUS_DRAFT,
      contents: this.blocks.map((b, i) => ({ id: i + 1, titlePara: b.titlePara.trim(), content: b.content.trim() })),
      file: this.file,
    });
  }

  ngOnDestroy(): void {
    this.setPreview(null, false);
  }
}
