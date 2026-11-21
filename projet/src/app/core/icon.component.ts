import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type IconName =
  | 'arrow-right' | 'arrow-left' | 'home' | 'plus' | 'file' | 'users' | 'chart' | 'logout' | 'edit'
  | 'trash' | 'message' | 'search' | 'calendar' | 'user' | 'menu' | 'x' | 'image' | 'eye' | 'check'
  | 'mail' | 'send' | 'alert' | 'inbox' | 'chevron-up' | 'chevron-down' | 'external';

/** Inline SVG icons (stroke style). Usage: `<app-icon name="trash" />` */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', style: 'display:inline-flex;line-height:0' },
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      @switch (name) {
        @case ('arrow-right') { <path d="M5 12h14M12 5l7 7-7 7"/> }
        @case ('arrow-left') { <path d="M19 12H5M12 19l-7-7 7-7"/> }
        @case ('home') { <path d="M3 10.5 12 3l9 7.5V21H3z"/><path d="M9 21v-6h6v6"/> }
        @case ('plus') { <path d="M12 5v14M5 12h14"/> }
        @case ('file') { <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h6"/> }
        @case ('users') { <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/> }
        @case ('chart') { <path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/> }
        @case ('logout') { <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/> }
        @case ('edit') { <path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/> }
        @case ('trash') { <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/> }
        @case ('message') { <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/> }
        @case ('search') { <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/> }
        @case ('calendar') { <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/> }
        @case ('user') { <circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/> }
        @case ('menu') { <path d="M4 6h16M4 12h16M4 18h16"/> }
        @case ('x') { <path d="M18 6 6 18M6 6l12 12"/> }
        @case ('image') { <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/> }
        @case ('eye') { <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/> }
        @case ('check') { <path d="M20 6 9 17l-5-5"/> }
        @case ('mail') { <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/> }
        @case ('send') { <path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/> }
        @case ('alert') { <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/> }
        @case ('inbox') { <path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/> }
        @case ('chevron-up') { <path d="m18 15-6-6-6 6"/> }
        @case ('chevron-down') { <path d="m6 9 6 6 6-6"/> }
        @case ('external') { <path d="M15 3h6v6M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/> }
      }
    </svg>
  `,
})
export class IconComponent {
  @Input({ required: true }) name!: IconName;
  @Input() size = 18;
}
