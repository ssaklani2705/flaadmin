import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { SafeUrlPipe } from '../../classes/SafeUrlPipe';

@Component({
  selector: 'app-media-preview-dialog',
    standalone: true, 
  imports: [CommonModule, MatDialogModule, MatButtonModule,SafeUrlPipe],
  templateUrl: './media-preview-dialog.component.html',
  styleUrl: './media-preview-dialog.component.scss'
})
export class MediaPreviewDialogComponent {

   constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

}
