import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { CalculatorDialogData } from '../../models/calculator-dialog-data';

@Component({
  selector: 'app-dialog-calculator',
  templateUrl: './dialog-calculator.component.html',
  styleUrls: ['./dialog-calculator.component.scss']
})
export class DialogCalculatorComponent implements OnInit {
  private static readonly operatorSymbols: Record<string, string> = { '+': '+', '-': '−', '*': '×', '/': '÷' }
  protected currentValue = '0'
  private previousValue: number | null = null
  private operator: string | null = null
  private startNewValue = false
  private thousandSeparator = ','

  constructor(
    private readonly dialogRef: MatDialogRef<DialogCalculatorComponent>,
    @Inject(MAT_DIALOG_DATA) protected data: CalculatorDialogData
  ) { }

  ngOnInit(): void {
    this.thousandSeparator = this.data?.thousandSeparator ?? this.thousandSeparator
    if (this.data?.initialValue) {
      this.currentValue = `${this.data.initialValue}`
    }
  }

  protected get display(): string {
    const currentFormatted = this.formatNumber(this.currentValue)
    if (this.operator && this.previousValue !== null) {
      const previousFormatted = this.formatNumber(this.previousValue)
      const operatorSymbol = DialogCalculatorComponent.operatorSymbols[this.operator]
      return this.startNewValue ? `${previousFormatted}${operatorSymbol}` : `${previousFormatted}${operatorSymbol}${currentFormatted}`
    }
    return currentFormatted
  }

  protected inputDigit = (digit: string): void => {
    if (this.startNewValue || this.currentValue === '0') {
      this.currentValue = digit
      this.startNewValue = false
    } else {
      this.currentValue = `${this.currentValue}${digit}`
    }
  }

  protected inputOperator = (operator: string): void => {
    const currentValue = Number(this.currentValue)
    this.previousValue = this.operator && !this.startNewValue ? this.operate(this.previousValue!, currentValue, this.operator) : currentValue
    this.operator = operator
    this.startNewValue = true
  }

  protected calculatePercent = (): void => {
    const currentValue = Number(this.currentValue)
    this.currentValue = this.operator && this.previousValue !== null
      ? `${this.previousValue * (currentValue / 100)}`
      : `${currentValue / 100}`
    this.startNewValue = true
  }

  protected backspace = (): void => {
    this.currentValue = this.currentValue.length > 1 ? this.currentValue.slice(0, -1) : '0'
  }

  protected clear = (): void => {
    this.currentValue = '0'
    this.previousValue = null
    this.operator = null
    this.startNewValue = false
  }

  protected equals = (): void => {
    if (this.operator && this.previousValue !== null) {
      const currentValue = Number(this.currentValue)
      this.currentValue = `${this.operate(this.previousValue, currentValue, this.operator)}`
      this.previousValue = null
      this.operator = null
      this.startNewValue = true
    }
  }

  protected cancel = (): void => this.dialogRef.close()

  protected save = (): void => {
    this.equals()
    this.dialogRef.close(Math.round(Number(this.currentValue)))
  }

  private operate = (previous: number, current: number, operator: string): number => {
    switch (operator) {
      case '+': return Math.abs(previous + current)
      case '-': return Math.abs(previous - current)
      case '*': return Math.abs(previous * current)
      case '/': return current === 0 ? previous : Math.abs(previous / current)
      default: return current
    }
  }

  private formatNumber = (value: number | string): string => {
    const numberValue = Number(value)
    if (Number.isNaN(numberValue)) {
      return '0'
    }
    const isNegative = numberValue < 0
    const [integerPart, decimalPart] = Math.abs(numberValue).toString().split('.')
    const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandSeparator)
    const formatted = decimalPart ? `${groupedInteger}.${decimalPart}` : groupedInteger
    return isNegative ? `-${formatted}` : formatted
  }
}
