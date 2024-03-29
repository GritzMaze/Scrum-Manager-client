import { Component, Inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { Board } from 'src/app/server/models/board';

interface DialogData {
  board?: Board;
}

@Component({
  selector: 'app-create-board-dialog',
  templateUrl: './create-board-dialog.component.html',
  styleUrls: ['./create-board-dialog.component.scss'],
})
export class CreateBoardDialogComponent implements OnInit {
  public formGroup: FormGroup;

  private numberOfColumnsSubject$ = new BehaviorSubject<string[]>([]);
  public numberOfColumns$: Observable<string[]> =
    this.numberOfColumnsSubject$.asObservable();

  constructor(
    private dialogRef: MatDialogRef<CreateBoardDialogComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) private dialogData: DialogData,
  ) {
    this.formGroup = this.formBuilder.group({
      name: new FormControl('', [Validators.required]),
      columns: this.formBuilder.array([])
    });
  }

  ngOnInit() {
    if (this.dialogData.board) {
      const columns = this.dialogData.board.columns.map((column) => ({
          name: column.name,
          color: column.color
        }));
      columns.forEach((column) => {
        this.addColumn(column.name, column.color);
      });
      this.formGroup.patchValue({
        name: this.dialogData.board.name,
      });
    }
  
  }

  addColumn(name?: string, color?: string) {
    const numberOfColumns = this.numberOfColumnsSubject$.getValue();
    const columnNumber = numberOfColumns.length + 1;
    this.numberOfColumnsSubject$.next(
      numberOfColumns.concat(`column${columnNumber}`)
    );
    const columns = this.formGroup.get('columns') as FormArray;
    columns.push(
      new FormControl({
        name: name ?? '',
        color: color ?? '',
      }, [Validators.required])
    );

  }

  removeColumn(index: number) {
    const numberOfColumns = this.numberOfColumnsSubject$.getValue();
    numberOfColumns.splice(index, 1);
    this.numberOfColumnsSubject$.next(numberOfColumns);
    const columns = this.formGroup.get('columns') as FormArray;
    columns.removeAt(index);
  }

  submit() {
    const formValue = this.formGroup.value;
    const columns = formValue.columns.map((column: any) => {
      return {
        name: column.name,
        color: column.color,
      };
    });
    const board = {
      name: this.formGroup.get('name')?.value,
      columns: columns,
    }

    this.dialogRef.close(board);
  }

  close() {
    this.dialogRef.close();
  }
}
