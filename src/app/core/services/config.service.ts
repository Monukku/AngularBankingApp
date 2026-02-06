// config.service.ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  constructor() {}

  getConfig(): any {
    // Return configuration settings
  }
}
