import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderByOnline'
})
export class OrderByOnlinePipe implements PipeTransform {

  transform(devices: any[], data: any): any[] {
    if (!devices || !data) return devices;
    return devices.slice().sort((a, b) => {
      const aOnline = !!data[a.id]?.do;
      const bOnline = !!data[b.id]?.do;
      return Number(bOnline) - Number(aOnline); 
    });
  }
  

}
