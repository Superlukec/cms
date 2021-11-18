import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor() { }

  getImageSrc(size: string, image: any): String {

    if(image && image.file_dimensions) {

      for(let i = 0; i < image.file_dimensions.length; i++) {

        if(image.file_dimensions[i].name == size && image.url) {

          let url = image.url.replace(image.filename, '');
          url += image.file_dimensions[i].filename;
          
          return url;

        }

      }

      return (image.url) ? image.url : null;

    }

    return null;

  }
}
