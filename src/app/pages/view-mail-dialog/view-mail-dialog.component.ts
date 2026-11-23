import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';


@Component({
  selector: 'app-view-mail-dialog',
  imports: [MatDialogModule,
    MatButtonModule,
    MatIconModule,],
  templateUrl: './view-mail-dialog.component.html',
  styleUrl: './view-mail-dialog.component.scss'
})
export class ViewMailDialogComponent {

  safeHtml: SafeHtml;

  constructor(
    public dialogRef: MatDialogRef<ViewMailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { htmlContent: string },
    private sanitizer: DomSanitizer
  ) {
    // sanitize HTML to prevent Angular stripping it
    this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(this.data.htmlContent);
  }

  close() {
    this.dialogRef.close();
  }
}