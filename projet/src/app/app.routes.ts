import { Routes } from '@angular/router';
import { HomeComponent } from './user/home/home.component';
import { AuthGuard } from './AuthGuard/authGuard';

const author = { roles: ['redacteur', 'admin'] };
const admin = { roles: ['admin'] };

export const routes: Routes = [
    // public
    { path: '', component: HomeComponent, title: 'EvoBlog' },
    { path: 'login', loadComponent: () => import('./user/login/login.component').then(m => m.LoginComponent), title: 'Connexion · EvoBlog' },
    { path: 'signUp', loadComponent: () => import('./user/sign-up-user/sign-up-user.component').then(m => m.SignUpUserComponent), title: 'Inscription · EvoBlog' },
    { path: 'user/validate', loadComponent: () => import('./user/validate/validate.component').then(m => m.ValidateComponent), title: 'Activation · EvoBlog' },
    { path: 'post/:id/detail', loadComponent: () => import('./user/post-detail/post-detail.component').then(m => m.PostDetailComponent), title: 'Article · EvoBlog' },

    // authors
    { path: 'author', loadComponent: () => import('./Author/home-author/home-author.component').then(m => m.HomeAuthorComponent), canActivate: [AuthGuard], data: author, title: 'Espace auteur · EvoBlog' },
    { path: 'create', loadComponent: () => import('./Author/create-post/create-post.component').then(m => m.CreatePostComponent), canActivate: [AuthGuard], data: author, title: 'Nouvel article · EvoBlog' },
    { path: 'list', loadComponent: () => import('./Author/list/list.component').then(m => m.ListComponent), canActivate: [AuthGuard], data: author, title: 'Mes articles · EvoBlog' },
    { path: 'update/:id/post', loadComponent: () => import('./Author/update-author/update-author.component').then(m => m.UpdateAuthorComponent), canActivate: [AuthGuard], data: author, title: 'Modifier · EvoBlog' },

    // administration
    { path: 'admin', loadComponent: () => import('./Admin/home-admin/home-admin.component').then(m => m.HomeAdminComponent), canActivate: [AuthGuard], data: admin, title: 'Administration · EvoBlog' },
    { path: 'listAllPost', loadComponent: () => import('./Admin/list-all-post/list-all-post.component').then(m => m.ListAllPostComponent), canActivate: [AuthGuard], data: admin, title: 'Articles · Administration' },
    { path: 'listAllUsers', loadComponent: () => import('./Admin/list-all-users/list-all-users.component').then(m => m.ListAllUsersComponent), canActivate: [AuthGuard], data: admin, title: 'Auteurs · Administration' },
    { path: 'user/:id/posts', loadComponent: () => import('./Admin/details-posts-user/details-posts-user.component').then(m => m.DetailsPostsUserComponent), canActivate: [AuthGuard], data: admin, title: 'Articles de l\'auteur · Administration' },

    { path: '**', redirectTo: '', pathMatch: 'full' },
];
