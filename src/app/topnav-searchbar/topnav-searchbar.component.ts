import {Component, OnInit} from '@angular/core';
import {UntypedFormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-topnav-searchbar',
  templateUrl: './topnav-searchbar.component.html',
  styleUrls: ['./topnav-searchbar.component.less']
})
export class TopnavSearchbarComponent implements OnInit {

  
  myControl = new UntypedFormControl();
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: Observable<string[]>;

  ngOnInit() {
    this.filteredOptions = this.myControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }


  // constructor() { }


}
