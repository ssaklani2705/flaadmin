import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-add-data',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatButtonModule, MatDatepickerModule, MatNativeDateModule
  ],
  templateUrl: './add-data.component.html',
  styleUrls: ['./add-data.component.scss']
})
export class AddDataComponent {
  dataForm: FormGroup;
  isSubmitting = false; 

  entities = [
    { id: 1, name: 'Test 1' },
    { id: 2, name: 'Test 2' }
  ]; // replace with your API call

  constructor(private fb: FormBuilder, private router: Router) {
    this.dataForm = this.fb.group({
      entityCode: ['', [Validators.required, Validators.maxLength(50)]],
      entityId: [null, Validators.required],
      dataDate: [null, Validators.required]
    });
  }

  isInvalid(name: string): boolean {
    const c = this.dataForm.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  onSubmit(): void {
    if (this.dataForm.invalid) {
      this.dataForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const v = this.dataForm.value;
    const d: Date = v.dataDate;
    // send date as yyyy-MM-dd without timezone shifting
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const payload = { ...v, dataDate: dateStr };
    // this.service.save(payload).subscribe(...)
    console.log(payload);
    this.isSubmitting = false;
  }

  onReset(): void {
    this.dataForm.reset({ entityCode: '', entityId: null, dataDate: null });
  }

  backToIndexPage(): void {
    this.router.navigate(['/data-index']); // change to your index route
  }
}