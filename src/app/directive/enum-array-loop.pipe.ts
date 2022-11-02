import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'enumArrayLoop'
})
export class EnumArrayLoopPipe implements PipeTransform {

  transform(data: Object): any {
    const keys = Object.keys(data);
    return keys.slice(keys.length / 2);;
  }

}
