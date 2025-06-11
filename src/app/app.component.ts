import { Component , OnInit } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { RouterModule } from '@angular/router';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [NzSpinComponent,NzCardModule,NzMenuModule,NzLayoutModule,NzIconModule,NzBreadCrumbModule,RouterModule ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'tank_level';
   isLoading = true;
  constructor(public Auth: AuthService) {}

  ngOnInit() {
    this.Auth.loading.subscribe(loading => {
      this.isLoading = loading;
    });
  }

}
