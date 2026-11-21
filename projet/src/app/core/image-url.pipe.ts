import { Pipe, PipeTransform } from '@angular/core';
import { imageUrl } from './api.config';

/** `[src]="post.image | imageUrl"` */
@Pipe({ name: 'imageUrl' })
export class ImageUrlPipe implements PipeTransform {
  transform(name: string | null | undefined): string {
    return imageUrl(name);
  }
}
