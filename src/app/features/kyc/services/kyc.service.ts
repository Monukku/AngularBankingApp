import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { KycSubmitRequest, KycDocumentResponse, DocumentType } from '../models/kyc.model';

@Injectable({ providedIn: 'root' })
export class KycService {
  private api = inject(ApiService);

  submitKyc(request: KycSubmitRequest): Observable<{ message: string }> {
    return this.api.submitKyc(request as unknown as Record<string, unknown>);
  }

  uploadDocument(documentType: DocumentType, file: File): Observable<KycDocumentResponse> {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('file', file);
    return this.api.uploadKycDocument(formData) as Observable<KycDocumentResponse>;
  }
}
