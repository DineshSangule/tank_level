import { Component } from '@angular/core';

import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { FormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconModule, NZ_ICONS } from 'ng-zorro-antd/icon';
@Component({
  selector: 'app-add-tank',
  imports: [NzDatePickerModule,  FormsModule,  NzFormModule,NzIconModule, 
    NzButtonModule,
    NzInputModule,NzCardModule],
  templateUrl: './add-tank.component.html',
  styleUrl: './add-tank.component.css'
})
export class AddTankComponent {

}
