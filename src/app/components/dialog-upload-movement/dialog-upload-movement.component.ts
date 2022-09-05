import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MovementService } from '../../services/movement.service';
import { MovementModel } from '../../models/movement.model';
import { DocumentData, DocumentReference } from '@angular/fire/firestore';

@Component({
  selector: 'app-dialog-upload-movement',
  templateUrl: './dialog-upload-movement.component.html',
  styleUrls: ['./dialog-upload-movement.component.scss']
})
export class DialogUploadMovementComponent implements OnInit {
  protected loading = false
  constructor(private readonly dialogRef: MatDialogRef<DialogUploadMovementComponent>,
              @Inject(MAT_DIALOG_DATA) protected data: MovementModel[],
              private readonly movementService: MovementService) { }

  ngOnInit() { }

  protected upload = () => {
    this.loading = true
    let batch = this.movementService.openBranch()
    let commits: Promise<void>[] = []
    const types = this.data.map(x => x.type).filter((value, index, self) => self.indexOf(value) === index)
    const references = types.map(type => ({type: type, reference: this.movementService.batchReference(type)}))
    this.data.forEach((request, i) => {
      request.amount = Math.abs(request.amount)
      batch.set(references.find(x => x.type === request.type)?.reference as DocumentReference<DocumentData>, Object.assign({}, request))
      let index = i + 1
      if (index % 500 === 0 || index === this.data.length) {
        commits.push(batch.commit())
        if (index % 500 === 0) {
          batch = this.movementService.openBranch()
        }
      }
    })
    Promise.all(commits)
    .then(() => this.dialogRef.close(true))
    .catch((e) => console.error(e))
  }
}
