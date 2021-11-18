import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { HttpOptionsService } from '../services/http-options.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {

  constructor(
    private _http: HttpClient,
    private _httpOptionsService: HttpOptionsService,
    private _config: ConfigService
  ) { }

  getTemplates(siteId) {
    return this._http.get(this._config.getApiUrl() + `/api/template/${siteId}`, this._httpOptionsService.getHeader())
  }

  addTemplate(siteId, name, description, html, templateFields) {
    return this._http.post(this._config.getApiUrl() + '/api/template', {    
      site_id: siteId,  
      name: name,
      description: description,
      html: html,
      fields: templateFields
    }, this._httpOptionsService.getHeader())
  }

  updateTemplate(siteId, id, name, description, html, templateFields) {
    return this._http.put(this._config.getApiUrl() + '/api/template/' + siteId + '/' + id, {    
      name: name,
      description: description,
      html: html,
      fields: templateFields
    }, this._httpOptionsService.getHeader())
  }

  getTemplate(siteId, id) {
    return this._http.get(this._config.getApiUrl() + '/api/template/' + siteId + '/' + id, this._httpOptionsService.getHeader())
  }

  deleteTemplate(id, templateId) {
    return this._http.delete(this._config.getApiUrl() + '/api/template/' + id + '/' + templateId, this._httpOptionsService.getHeader())
  }
  
}
