import { Component, HostListener, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavBarAdminComponent } from '../nav-bar-admin/nav-bar-admin.component';
import { ServiceAdService } from '../Service/service-ad.service';
import { AuthorSummary, errorMessage } from '../../core/models';
import { IconComponent } from '../../core/icon.component';

@Component({
  selector: 'app-list-all-users',
  imports: [NavBarAdminComponent, IconComponent, DatePipe, RouterLink],
  templateUrl: './list-all-users.component.html',
  styleUrl: './list-all-users.component.css'
})
export class ListAllUsersComponent {

  private admin = inject(ServiceAdService);

  data: AuthorSummary[] = [];
  isLoading = true;
  error = '';
  searchText = '';

  toDelete: AuthorSummary | null = null;
  deleting = false;

  toast: { text: string; error: boolean } | null = null;
  private toastTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    this.admin.getAuthors().subscribe({
      next: list => {
        this.data = list;
        this.isLoading = false;
      },
      error: err => {
        this.error = errorMessage(err);
        this.isLoading = false;
      }
    });
  }

  get visible(): AuthorSummary[] {
    const q = this.searchText.trim().toLowerCase();
    if (!q) {
      return this.data;
    }
    return this.data.filter(a =>
      `${a.name} ${a.lastName ?? ''}`.toLowerCase().includes(q) || a.email.toLowerCase().includes(q));
  }

  onSearch(event: Event) {
    this.searchText = (event.target as HTMLInputElement).value;
  }

  initials(a: AuthorSummary): string {
    return [a.name, a.lastName].filter(Boolean).map(p => p[0].toUpperCase()).join('').slice(0, 2) || '?';
  }

  askDelete(author: AuthorSummary) {
    this.toDelete = author;
  }

  confirmDelete() {
    const author = this.toDelete;
    if (!author) {
      return;
    }
    this.deleting = true;
    this.admin.deleteUser(author.id).subscribe({
      next: () => {
        this.data = this.data.filter(a => a.id !== author.id);
        this.deleting = false;
        this.toDelete = null;
        this.notify('Auteur supprimé');
      },
      error: err => {
        this.deleting = false;
        this.toDelete = null;
        this.notify(errorMessage(err), true);
      }
    });
  }

  @HostListener('document:keydown.escape')
  closeDialog() {
    if (!this.deleting) {
      this.toDelete = null;
    }
  }

  private notify(text: string, error = false) {
    clearTimeout(this.toastTimer);
    this.toast = { text, error };
    this.toastTimer = setTimeout(() => this.toast = null, 4000);
  }
}
