import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { HttpOptionsService } from '../services/http-options.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class ServerLogsService {

  constructor(
    private _http: HttpClient,
    private _httpOptionsService: HttpOptionsService,
    private _config: ConfigService
  ) { 
   
  }

  // Get server logs
  getServerLogs(data?) {
    if(!data) {
      data = {};
    }

    return this._http.put(this._config.getApiUrl() + '/api/logs', data, this._httpOptionsService.getHeader())
  }
}
