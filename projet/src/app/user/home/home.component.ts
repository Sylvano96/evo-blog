import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PostsComponent } from '../posts/posts.component';
import { FooterComponent } from '../footer/footer.component';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { IconComponent, IconName } from '../../core/icon.component';

@Component({
  selector: 'app-home',
  imports: [PostsComponent, FooterComponent, NavBarComponent, RouterLink, IconComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  features: { icon: IconName; title: string; text: string }[] = [
    { icon: 'eye', title: 'Apprendre', text: 'Des articles sur l\'IA, le mobile, la sécurité et les innovations qui façonnent demain.' },
    { icon: 'edit', title: 'Publier', text: 'Un éditeur simple pour structurer vos idées en sections et les partager en un clic.' },
    { icon: 'message', title: 'Échanger', text: 'Les lecteurs commentent, les auteurs répondent : la discussion fait avancer les idées.' },
  ];
}
