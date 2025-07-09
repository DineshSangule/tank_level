import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'istTime',
   pure: false
})
export class IstTimePipe implements PipeTransform {

  transform(value: string | Date): string {
    if(!value) return '';

    const utcDate = new Date(value);
    const istoffset = 5.5 * 60;
    const localTime = new Date(utcDate.getTime() + istoffset * 60* 1000);

    const day = localTime.getDate().toString().padStart(2, '0');
    const month = (localTime.getMonth() + 1).toString().padStart(2, '0');
    const year = localTime.getFullYear();

    const hours = localTime.getHours().toString().padStart(2,'0');
    const minutes = localTime.getMinutes().toString().padStart(2,'0');

        return `${day}-${month}-${year} ${hours}:${minutes}`;

  }

}
