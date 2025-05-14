import { Component } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
    imports: [NzCardModule,NzMenuModule,NzLayoutModule,NzIconModule,NzBreadCrumbModule ,RouterModule],

  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
      isCollapsed = false;

       onBreakpoint(collapsed: boolean): void {
    this.isCollapsed = collapsed;
  }


}
