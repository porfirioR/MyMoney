import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CollectionReference, doc, DocumentData } from '@angular/fire/firestore';
import { MovementService } from '../../services/movement.service';
import { MovementModel } from '../../models/movement.model';

@Component({
  selector: 'app-dialog-upload-movement',
  templateUrl: './dialog-upload-movement.component.html',
  styleUrls: ['./dialog-upload-movement.component.scss']
})
export class DialogUploadMovementComponent implements OnInit {
  protected loading = false
  constructor(
    private readonly dialogRef: MatDialogRef<DialogUploadMovementComponent>,
    @Inject(MAT_DIALOG_DATA) protected data: MovementModel[],
    private readonly movementService: MovementService
  ) {
      dialogRef.disableClose = true;
    }

  ngOnInit() { }

  protected upload = () => {
    this.loading = true
    let batch = this.movementService.openBatch()
    let commits: Promise<void>[] = []
    const types = this.data.map(x => x.type).filter((value, index, self) => self.indexOf(value) === index)
    const references = types.map(type => ({type: type, reference: this.movementService.getReference(type)}))
    this.data.forEach((request, i) => {
      request.amount = Math.abs(request.amount)
      const docReference = doc(references.find(x => x.type === request.type)?.reference as CollectionReference<DocumentData>)
      batch.set(docReference, Object.assign({}, request))
      let index = i + 1
      if (index % 500 === 0 || index === this.data.length) {
        commits.push(batch.commit())
        if (index % 500 === 0) {
          batch = this.movementService.openBatch()
        }
      }
    })
    Promise.all(commits)
    .then(() => this.dialogRef.close(true))
    .catch((e) => console.error(e))
  }
}
