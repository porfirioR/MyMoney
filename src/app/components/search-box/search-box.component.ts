import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NumberType } from '../../enums/number-type.enum';
import { SearchHelper } from '../../services/search.helper';

// The same search box on every screen: one field, results while typing and a summary below.
// The screen filters its own data; this only shows the field and the summary
@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss']
})
export class SearchBoxComponent {
  @Input() value = ''
  @Output() valueChange = new EventEmitter<string>()
  // Translation key of the field label
  @Input() label = 'search-messages.movements-label'
  // How many results there are; the summary is only shown while searching
  @Input() count = 0
  // Translation key of the count, with {{count}}
  @Input() countKey = 'search-messages.movements-count'
  // Sum of the results; null when it makes no sense (results of different types, categories)
  @Input() total: number | null = null
  @Input() numberType = NumberType.English
  @Input() hideAmounts = false
  // The bar is outlined with the main color while typing
  protected focused = false

  protected get active(): boolean {
    return SearchHelper.parse(this.value).active
  }

  protected onInput = (value: string): void => {
    this.value = value
    this.valueChange.emit(value)
  }

  protected clear = (): void => this.onInput('')
}
