import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { HttpOptionsService } from '../services/http-options.service';
import { ConfigService } from './config.service';

//import config from '../config';

@Injectable({
  providedIn: 'root'
})
export class SiteService {

  constructor(
    private _http: HttpClient,
    private _httpOptionsService: HttpOptionsService,
    private _config: ConfigService
  ) { 
   
  }

  //#region post and pages
  addPost(siteId, slug, type, title, lang, blocks, featuredImage, meta?) {
    return this._http.post(this._config.getApiUrl() + '/api/site/post', {    
      site_id: siteId,  
      slug: slug,
      type: type,
      title: title,
      lang: lang,
      blocks: blocks,
      featured_image: featuredImage,
      meta: meta
    }, this._httpOptionsService.getHeader())
  }

  /**
   * Updating content
   * @param id id of the post
   * @param slug of the post
   * @param title of the post
   * @param content content (blocks)
   * @param meta 
   */
  updatePostContent(siteId, id, slug, title, homepage, lang, blocks, featuredImage, meta?) {
    return this._http.put(this._config.getApiUrl() + '/api/site/update/post', {
      site_id: siteId,
      id: id,
      slug: slug,
      title: title,
      homepage: homepage,
      lang: lang,
      blocks: blocks,    
      featured_image: featuredImage,  
      meta: meta
    }, this._httpOptionsService.getHeader())
  }

  getPages(siteId, lang, offset, index, size, sort, direction) {
    return this._http.get(this._config.getApiUrl() + `/api/site/pages/${siteId}/${lang}/${offset}/${index}/${size}/${sort}/${direction}`, this._httpOptionsService.getHeader())
  }

  getPage(siteId, id) {
    return this._http.get(this._config.getApiUrl() + '/api/site/page/' + siteId + '/' + id, this._httpOptionsService.getHeader())
  }

  getPosts(siteId, lang, offset, index, size, sort, direction) {
    return this._http.get(this._config.getApiUrl() + `/api/site/posts/${siteId}/${lang}/${offset}/${index}/${size}/${sort}/${direction}`, this._httpOptionsService.getHeader())
  }

  getPost(siteId, id) {
    return this._http.get(this._config.getApiUrl() + '/api/site/post/' + siteId + '/' + id, this._httpOptionsService.getHeader())
  }

  /**
   * Resolve page content
   * @param slug
   */
  resolvePage(siteId, slug) {
    return this._http.put(this._config.getApiUrl() + '/api/site/resolve', {
      site_id: siteId,
      slug: slug
    })
  }
  
  deletePost(siteId, id) {
    return this._http.delete(this._config.getApiUrl() + '/api/site/post/delete/' + siteId + '/' + id, this._httpOptionsService.getHeader())
  }  
  
  getPostChildren(siteId, postId) {
    return this._http.get(this._config.getApiUrl() + '/api/site/get/post/children/' + siteId + '/' + postId, this._httpOptionsService.getHeader())    
  }
  //#endregion

  //#region tras can - archive
  archivePost(siteId, id) {
    return this._http.delete(this._config.getApiUrl() + '/api/site/archive/' + siteId + '/' + id, this._httpOptionsService.getHeader())
  }

  permDeletePost(siteId, id) {
    return this._http.delete(this._config.getApiUrl() + '/api/site/archive/perm/' + siteId + '/' + id, this._httpOptionsService.getHeader())
  }

  restorePost(siteId, id) {
    return this._http.delete(this._config.getApiUrl() + '/api/site/archive/restore/' + siteId + '/' + id, this._httpOptionsService.getHeader())
  }

  getArchivePages(siteId) {
    return this._http.get(this._config.getApiUrl() + '/api/site/archive/pages/' + siteId, this._httpOptionsService.getHeader())
  }

  getArchivePosts(siteId) {
    return this._http.get(this._config.getApiUrl() + '/api/site/archive/posts/' + siteId, this._httpOptionsService.getHeader())
  }

  emptyTrashCan(siteId, type) {
    return this._http.delete(this._config.getApiUrl() + '/api/site/archive/empty/' + type + '/' + siteId, this._httpOptionsService.getHeader())
  }
  //#endregion
  
  /**
   * Get all pages list for menu
   * @param id 
   */
  getAllPagesList(siteId, lang) {

    let url = this._config.getApiUrl() + '/api/site/pages/list/' + siteId;

    if(lang) {
      url = url + '/' + lang;
    }

    return this._http.get(url, this._httpOptionsService.getHeader())
  }

  //#region menu
  addNewMenu(id, name, slug) {
    return this._http.post(this._config.getApiUrl() + '/api/site/menu', {      
      id: id,
      name: name,
      slug: slug
    }, this._httpOptionsService.getHeader())
  }

  getAllMenus(id) {
    return this._http.get(this._config.getApiUrl() + '/api/site/menu/' + id, this._httpOptionsService.getHeader());
  }

  addPagesToTheMenus(id: string, menus: []) {
    return this._http.post(this._config.getApiUrl() + '/api/site/menu/pages', {      
      id: id,
      menus: menus
    }, this._httpOptionsService.getHeader())
  }

  deleteMenu(id, menuId) {
    return this._http.delete(this._config.getApiUrl() + '/api/site/menu/delete/' + id + '/' + menuId, this._httpOptionsService.getHeader())
  }

  showLinksChild(site_id: string, id: string) {
    return this._http.post(this._config.getApiUrl() + '/api/site/show/links', {      
      site_id: site_id,
      id: id,
    }, this._httpOptionsService.getHeader())
  }
  //#endregion

  //#region themes
  addTheme(siteId, name, description, header, footer, css, jsfile) {
    return this._http.post(this._config.getApiUrl() + '/api/site/add/theme', {      
      id: siteId,
      name: name,
      description: description,
      header: header,
      footer: footer,
      css: css,
      jsfile: jsfile
    }, this._httpOptionsService.getHeader())
  }

  updateTheme(themeId, siteId, name, description, header, footer, css, jsfile) {
    return this._http.put(this._config.getApiUrl() + '/api/site/update/theme/' + themeId, {      
      site_id: siteId,
      name: name,
      description: description,
      header: header,
      footer: footer,
      css: css,
      jsfile: jsfile
    }, this._httpOptionsService.getHeader())
  }

  getInstalledThemes(siteId) {
    return this._http.get(this._config.getApiUrl() + '/api/site/themes/installed/' + siteId, this._httpOptionsService.getHeader());
  }

  getThemesOnMarket() {

  }

  getSpecificTheme(themeId) {
    return this._http.get(this._config.getApiUrl() + '/api/site/themes/specific/' + themeId, this._httpOptionsService.getHeader());
  }

  selectTheme(siteId, themeId) {
    return this._http.put(this._config.getApiUrl() + '/api/site/themes/select/' + siteId + '/' + themeId, {}, this._httpOptionsService.getHeader());
  }

  deleteTheme(siteId, themeId) {
    return this._http.delete(this._config.getApiUrl() + '/api/site/themes/' + siteId + '/' + themeId, this._httpOptionsService.getHeader());
  }
  //#endregion

  getIdAndTitleFromHost(host: string) {
    return this._http.post(this._config.getApiUrl() + '/api/site/host', {      
      host: host
    }, this._httpOptionsService.getHeader())
  }

  //#region users
  getUsers(siteId) {
    return this._http.get(this._config.getApiUrl() + '/api/site/get/users/' + siteId, this._httpOptionsService.getHeader());
  }

  getShareableUsers(siteId) {
    return this._http.get(this._config.getApiUrl() + '/api/site/get/users/shareable/' + siteId, this._httpOptionsService.getHeader());
  }

  getUser(siteId, userId) {
    return this._http.get(this._config.getApiUrl() + '/api/site/get/user/' + siteId + '/' + userId, this._httpOptionsService.getHeader());
  }

  getUserProfile() {
    return this._http.get(this._config.getApiUrl() + '/api/site/get/profile', this._httpOptionsService.getHeader());
  }

  updateUserProfile(email, firstName, lastName, color, password?) {

    let fullName = firstName + ' ' + lastName;

    return this._http.post(this._config.getApiUrl() + '/api/site/update/profile', {
      email: email,
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      color: color,
      password: password      
    }, this._httpOptionsService.getHeader());
  }

  addUser(siteId, registrationType, email, role, firstName, lastName, password, company, invitationMessage, noEmail) {

    let fullName = firstName + ' ' + lastName;
    
    return this._http.post(this._config.getApiUrl() + '/api/site/add/user', {      
      site_id: siteId,
      registrationType: registrationType,
      email: email,
      role: role,
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      password: password,
      company: company,
      message: invitationMessage,
      no_email: noEmail
    }, this._httpOptionsService.getHeader())
  }

  updateUser(siteId, id, email, role, firstName, lastName, password, company) {
    
    let fullName = firstName + ' ' + lastName;
    
    return this._http.put(this._config.getApiUrl() + '/api/site/update/user/' + id, {      
      site_id: siteId,
      email: email,
      role: role,
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      password: password,
      company: company
    }, this._httpOptionsService.getHeader())
  }

  deleteUser(siteId, userId) {
    return this._http.delete(this._config.getApiUrl() + '/api/site/delete/user/' + siteId + '/' + userId, this._httpOptionsService.getHeader())
  }
  //#endregion
  
  //#region product manipulation
  getProducts(siteId, lang, brandId, offset, index, size, sort, direction) {
    //return this._http.get(this._config.getApiUrl() + '/api/site/get/products/' + siteId + '/' + lang + '/' + brandId, this._httpOptionsService.getHeader());
    return this._http.get(this._config.getApiUrl() + `/api/site/get/products/${siteId}/${lang}/${brandId}/${offset}/${index}/${size}/${sort}/${direction}`, this._httpOptionsService.getHeader());
  }

  saveProductSortOrder(siteId, productId, sortNumber) {
    return this._http.post(this._config.getApiUrl() + '/api/site/product/order', {      
      site_id: siteId,
      product_id: productId,
      sort_number: sortNumber
    }, this._httpOptionsService.getHeader());
  }

  getBrandProducts(siteId, brands, limit?:number) {
    return this._http.post(this._config.getApiUrl() + '/api/site/get/p/products/brand/' + siteId, {
      brands: brands,
      limit: limit
    });
  }

  getBrandProductsFilter(siteId, brands, filter) {
    return this._http.post(this._config.getApiUrl() + '/api/site/filter/products/', {      
      site_id: siteId,
      brands: brands,
      filter: filter
    }, this._httpOptionsService.getHeader());
  }

  getProductsHierchy(siteId, brandId, productId) {
    return this._http.get(this._config.getApiUrl() + '/api/site/get/products/hierarchy/' + siteId + '/' + brandId + '/' + productId, this._httpOptionsService.getHeader());
  }

  getProduct(siteId, productId) {
    return this._http.get(this._config.getApiUrl() + '/api/site/get/product/' + siteId  + '/' + productId, this._httpOptionsService.getHeader())
  }

  getBrands(siteId, lang?) {
    return this._http.get(this._config.getApiUrl() + '/api/site/get/brand/' + siteId + '/' + lang, this._httpOptionsService.getHeader());
  }

  addBrand(siteId, name, description, logo, lang?) {
    return this._http.post(this._config.getApiUrl() + '/api/site/add/brand/', {      
      site_id: siteId,
      name: name,
      description: description,
      logo: logo,
      lang: lang
    }, this._httpOptionsService.getHeader())
  }

  saveBrandSortOrder(siteId, brandId, sortNumber) {
    return this._http.post(this._config.getApiUrl() + '/api/site/brand/order', {      
      site_id: siteId,
      brand_id: brandId,
      sort_number: sortNumber
    }, this._httpOptionsService.getHeader());
  }

  updateBrand(siteId, id, name, description, logo, lang?) {
    return this._http.put(this._config.getApiUrl() + '/api/site/update/brand/' + id, {      
      site_id: siteId,
      name: name,
      description: description,
      logo: logo,
      lang: lang
    }, this._httpOptionsService.getHeader())
  }

  deleteBrand(id, brandId) {
    return this._http.delete(this._config.getApiUrl() + '/api/site/delete/brand/' + id + '/' + brandId, this._httpOptionsService.getHeader())
  }
  
  getProperties(siteId, lang?) {
    return this._http.get(this._config.getApiUrl() + '/api/site/get/properties/' + siteId + '/' + lang);
  }

  addProperty(siteId, name, lang, category?) {
    return this._http.post(this._config.getApiUrl() + '/api/site/add/properties/', {      
      site_id: siteId,
      name: name,
      lang: lang,
      category: category
    }, this._httpOptionsService.getHeader())
  }

  updateProperty(siteId, id, name, lang, category?) {
    return this._http.put(this._config.getApiUrl() + '/api/site/update/properties/' + id, {      
      site_id: siteId,
      name: name,
      lang: lang,
      category: category
    }, this._httpOptionsService.getHeader())
  }

  deleteProperty(id, propertyId) {
    return this._http.delete(this._config.getApiUrl() + '/api/site/delete/properties/' + id + '/' + propertyId, this._httpOptionsService.getHeader())
  }

  getCategoryProperties(siteId, lang?) {
    return this._http.get(this._config.getApiUrl() + '/api/site/get/category/properties/' + siteId + '/' + lang);
  }

  addCategoryProperty(siteId, name, lang?) {
    return this._http.post(this._config.getApiUrl() + '/api/site/add/category/properties/', {      
      site_id: siteId,
      name: name,
      lang: lang
    }, this._httpOptionsService.getHeader())
  }

  updateCategoryProperty(siteId, id, name, lang?) {
    return this._http.put(this._config.getApiUrl() + '/api/site/update/category/properties/' + id, {      
      site_id: siteId,
      name: name,
      lang: lang
    }, this._httpOptionsService.getHeader())
  }

  deleteCategoryProperty(id, propertyId) {
    return this._http.delete(this._config.getApiUrl() + '/api/site/delete/category/properties/' + id + '/' + propertyId, this._httpOptionsService.getHeader())
  }

  addProduct(siteId, name, brandId, slug, description, excerpt, parentId, features?, images?, attachments?, properties?, meta_keywords?, meta_description?, lang?) {
    return this._http.post(this._config.getApiUrl() + '/api/site/add/product', {      
      site_id: siteId,
      name: name,
      slug: slug,
      description: description,
      excerpt: excerpt,
      parent_id: parentId,
      brand_id: brandId,
      features: features,
      images: images,
      attachments: attachments,
      properties: properties,
      meta_keywords: meta_keywords,
      meta_description: meta_description,
      lang: lang
    }, this._httpOptionsService.getHeader())
  }

  updateProduct(siteId, id, name, brandId, slug, description, excerpt, parentId, features?, images?, attachments?, properties?, meta_keywords?, meta_description?, lang?) {
    return this._http.put(this._config.getApiUrl() + '/api/site/update/product/' + id, {      
      site_id: siteId,
      name: name,
      slug: slug,
      description: description,
      excerpt: excerpt,
      parent_id: parentId,
      brand_id: brandId,
      features: features,
      images: images,
      attachments: attachments,
      properties: properties,
      meta_keywords: meta_keywords,
      meta_description: meta_description,
      lang: lang
    }, this._httpOptionsService.getHeader())
  }

  deleteProduct(id, productId) {
    return this._http.delete(this._config.getApiUrl() + '/api/site/delete/product/' + id + '/' + productId, this._httpOptionsService.getHeader())
  }
  //#endregion

  deleteAttachment(id, productId, attachmentId) {
    return this._http.delete(this._config.getApiUrl() + '/api/site/delete/attachment/' + id + '/' + productId + '/' + attachmentId, this._httpOptionsService.getHeader())
  }

  //#region categories
  getCategories(siteId, lang?) {

    return this._http.get(this._config.getApiUrl() + '/api/site/categories/' + siteId + '/' + lang, this._httpOptionsService.getHeader())
    
  }

  getCategory(siteId, categoryId) {

    return this._http.get(this._config.getApiUrl() + '/api/site/category/' + siteId + '/' + categoryId, this._httpOptionsService.getHeader())
    
  }

  addCategory(siteId, name, slug, lang) {

    return this._http.post(this._config.getApiUrl() + '/api/site/category', {    
      site_id: siteId,  
      name: name,
      slug: slug,
      lang: lang      
    }, this._httpOptionsService.getHeader())

  }

  updateCategory(siteId, categoryId, name, slug, lang) {

    return this._http.put(this._config.getApiUrl() + '/api/site/update/category/' + categoryId, {      
      site_id: siteId,
      name: name,
      slug: slug,
      lang: lang
    }, this._httpOptionsService.getHeader())

  }

  deleteCategory(siteId, id) {
    return this._http.delete(this._config.getApiUrl() + '/api/site/category/delete/' + siteId + '/' + id, this._httpOptionsService.getHeader())
  }

  getCategoryPostsPublic(siteId, catId, limit: number = 5) {
    return this._http.get(this._config.getApiUrl() + '/api/site/post/p/' + siteId  + '/' + catId + '/' + limit)
  }
  //#endregion  

  /**
   * Get site template layout
   * @param id 
   */
  getSiteTemplate(id: string, url: string, themeId?: string, themeVersion?: string) {
    return this._http.put(this._config.getApiUrl() + '/api/site/template/' + id, {
      slug: url,
      themeId: themeId,
      themeVersion: themeVersion
    });
  }

  /**
   * Add site language
   * @param siteId 
   * @param name 
   * @param prefix 
   */
  addSiteLanguage(siteId: String, name: String, prefix: String) {

    return this._http.post(this._config.getApiUrl() + '/api/site/add/language/', {      
      site_id: siteId,
      name: name,
      prefix: prefix
    }, this._httpOptionsService.getHeader())

  }

  //#region image size
  /**
   * Add image size
   * @param siteId 
   * @param name 
   * @param prefix 
   */
  addImageSize(siteId: String, name: String, width: Number, height: Number, algorithm: String) {

    return this._http.post(this._config.getApiUrl() + '/api/site/add/image/size/', {      
      site_id: siteId,
      name: name,
      width: width,
      height: height,
      algorithm: algorithm
    }, this._httpOptionsService.getHeader())

  }

  regenerateImageSizes(siteId: String)  {
    return this._http.post(this._config.getApiUrl() + '/api/site/generate/image/size/', {      
      site_id: siteId
    }, this._httpOptionsService.getHeader())
  }

  deleteImageSize(siteId, position) {
    return this._http.delete(this._config.getApiUrl() + '/api/site/image/size/delete/' + siteId + '/' + position, this._httpOptionsService.getHeader())
  }
  //#endregion

  /**
   * Get all information of the site - for showing post - multinguage
   * @param siteId 
   */
  getPostSiteInfo(siteId) {
    return this._http.get(this._config.getApiUrl() + '/api/site/post/info/' + siteId, this._httpOptionsService.getHeader())
  }

  //#region site settings
  /**
   * Get information for the site settings
   * @param siteId 
   */
  getSettingsSiteInfo(siteId) {
    return this._http.get(this._config.getApiUrl() + '/api/site/setting/info/' + siteId, this._httpOptionsService.getHeader())
  }  

  /**
   * Update site settings
   * @param siteId 
   * @param title 
   * @param domain 
   * @param isPublic 
   * @param seo 
   * @param multilanguage 
   * @param languages 
   */
  updateSiteSettings(
    siteId: string, 
    title: string, 
    domain: string, 
    isPublic: boolean, 
    seo: boolean, 
    multilanguage: boolean, 
    sitemapEnabled: boolean,
    languages: any
  ) {
    return this._http.put(this._config.getApiUrl() + '/api/site/update/settings/' + siteId, {      
      title: title,
      domain: domain,
      public: isPublic,
      seo: seo,
      multilanguage: multilanguage,
      sitemap_enabled: sitemapEnabled,
      languages: languages
    }, this._httpOptionsService.getHeader())
  }


  /**
   * Get information for the site settings
   * @param siteId 
   */
  getProductSiteSettings(siteId) {
    return this._http.get(this._config.getApiUrl() + '/api/site/product/setting/info/' + siteId)
  }

  
  /**
   * Update product settings - show forms and which form
   * @param siteId 
   * @param showForm 
   * @param formId 
   */
  updateProductSiteSettings(
    siteId: string, 
    showForm: string, 
    formId: boolean    
  ) {
    return this._http.put(this._config.getApiUrl() + '/api/site/product/update/settings/' + siteId, {      
      show_form: showForm,
      form_id: formId
    }, this._httpOptionsService.getHeader())
  }
  //#endregion

  //#region forms
  addForm(siteId, name, elements, recipients, email, submit_btn, html) {

    return this._http.post(this._config.getApiUrl() + '/api/site/form', {      
      site_id: siteId,
      name: name,
      elements: elements,
      recipients: recipients,
      email: email,
      submit_btn: submit_btn,
      html: html
    }, this._httpOptionsService.getHeader())

  }

  updateForm(formId, siteId, name, elements, recipients, email, submit_btn, html) {

    return this._http.put(this._config.getApiUrl() + '/api/site/form/' + formId, {      
      site_id: siteId,
      name: name,
      elements: elements,
      recipients: recipients,
      email: email,
      submit_btn: submit_btn,
      html: html
    }, this._httpOptionsService.getHeader())

  }

  getForm(siteId, formId) {
    return this._http.get(this._config.getApiUrl() + '/api/site/form/' + siteId  + '/' + formId, this._httpOptionsService.getHeader())
  }

  getFormPublic(siteId, formId) {
    return this._http.get(this._config.getApiUrl() + '/api/site/form/p/' + siteId  + '/' + formId)
  }

  postFormPublic(siteId, formId, data, location) {
    return this._http.post(this._config.getApiUrl() + '/api/site/form/p/', {
        site_id: siteId,
        form_id: formId,
        data: data,
        location: location
    })
  }

  getForms(siteId, lang?) {
    return this._http.get(this._config.getApiUrl() + '/api/site/forms/' + siteId + ((lang) ? ('/' + lang) : ''), this._httpOptionsService.getHeader())    
  }

  getFormsSubmissions(siteId, formId) {
    return this._http.get(this._config.getApiUrl() + '/api/site/forms/submissions/' + siteId + '/' + formId, this._httpOptionsService.getHeader())    
  }

  deleteFormsSubmissions(siteId, formId) {
    return this._http.delete(this._config.getApiUrl() + '/api/site/forms/submissions/' + siteId + '/' + formId, this._httpOptionsService.getHeader())    
  }

  deleteForm(siteId, id) {
    return this._http.delete(this._config.getApiUrl() + '/api/site/form/delete/' + siteId + '/' + id, this._httpOptionsService.getHeader())
  }
  //#endregion

  getFiles(siteId, publicFiles, image, transfer, offset, index, size, sort, direction) {
    return this._http.put(this._config.getApiUrl() + '/api/site/file/' + siteId, { 
      public: publicFiles,
      image: image,
      transfer: transfer,
      offset: offset, 
      index: index, 
      size: size, 
      sort: sort, 
      direction: direction
    }, this._httpOptionsService.getHeader())
  }

  /*
  deleteFiles(siteId, id) {
    return this._http.delete(this._config.getApiUrl() + '/api/site/file/delete/' + siteId + '/' + id, this._httpOptionsService.getHeader())
  }*/

  //#region file manipulation and analytics

  deleteFile(siteId, id) {
    return this._http.delete(this._config.getApiUrl() + '/api/site/file/delete/' + siteId + '/' + id, this._httpOptionsService.getHeader())
  }

  // don't delete if asset is used
  safeDeleteFile(siteId, id) {
    return this._http.delete(this._config.getApiUrl() + '/api/site/file/safe/delete/' + siteId + '/' + id, this._httpOptionsService.getHeader())
  }

  deleteFileByName(siteId, filename) {
    return this._http.delete(this._config.getApiUrl() + '/api/site/file/delete/n/' + siteId + '/' + filename, this._httpOptionsService.getHeader())
  }

  adminTotalFiles(siteId) {
    return this._http.get(this._config.getApiUrl() + '/api/site/file/total/' + siteId, this._httpOptionsService.getHeader())    
  }

  adminDeleteBrokenLinks(siteId) {
    return this._http.delete(this._config.getApiUrl() + '/api/site/file/broken/' + siteId, this._httpOptionsService.getHeader())    
  }

  adminTotalShareables(siteId) {
    return this._http.get(this._config.getApiUrl() + '/api/site/file/total/shareable/' + siteId, this._httpOptionsService.getHeader())    
  }

  adminShowUnusedFiles(siteId) {
    return this._http.get(this._config.getApiUrl() + '/api/site/file/show/unused/' + siteId, this._httpOptionsService.getHeader())    
  }

  /*
  adminDeleteUnusedFiles(siteId) {
    return this._http.delete(this._config.getApiUrl() + '/api/site/file/delete/unused/' + siteId, this._httpOptionsService.getHeader())    
  }*/

  //#endregion

  
  //#region shareables
  addShareable(siteId, name, duration, durationTime, limitDownload, downloadNumber, limitAccess, access: [], files: [], sendEmail) {
    return this._http.post(this._config.getApiUrl() + '/api/site/add/shareable', {      
      site_id: siteId,
      name: name,     
      duration: duration,
      durationTime: durationTime,
      limitDownload: limitDownload,
      downloadNumber: downloadNumber,
      limitAccess: limitAccess,
      //password: password,
      access: access,
      files: files,
      sendEmail: sendEmail
    }, this._httpOptionsService.getHeader())
  }

  updateShareable(siteId, id, name, duration, durationTime, limitDownload, downloadNumber, limitAccess, access: [], files: [], sendEmail) {
   
    return this._http.put(this._config.getApiUrl() + '/api/site/update/shareable', {      
      site_id: siteId,
      id: id,
      name: name,     
      duration: duration,
      durationTime: durationTime,
      limitDownload: limitDownload,
      downloadNumber: downloadNumber,
      limitAccess: limitAccess,
      //password: password,
      access: access,
      files: files,
      sendEmail: sendEmail
    }, this._httpOptionsService.getHeader())

  }

  getShareables(siteId, lang) {
    return this._http.get(this._config.getApiUrl() + '/api/site/get/shareables/' + siteId + '/' + lang, this._httpOptionsService.getHeader());
  }

  getShareable(siteId, shareableId) {
    return this._http.get(this._config.getApiUrl() + '/api/site/get/shareable/' + siteId  + '/' + shareableId, this._httpOptionsService.getHeader())
  }

  deleteShareable(siteId, id) {
    return this._http.delete(this._config.getApiUrl() + '/api/site/delete/shareable/' + siteId + '/' + id, this._httpOptionsService.getHeader())
  } 
  //#endregion

  saveCookieSettings(siteId, cookiesEnabled: boolean, cookiesData: any []) {
    return this._http.put(this._config.getApiUrl() + '/api/site/cookie/settings', { 
      site_id: siteId,
      cookies_enabled: cookiesEnabled,
      cookies: cookiesData
    }, this._httpOptionsService.getHeader())
  }

  getSystemVersion() {
    return this._http.get(this._config.getApiUrl() + '/api/site/get/version/', this._httpOptionsService.getHeader());
  }

  getSystemFaIcons() {
    return this._http.get(this._config.getApiUrl() + '/api/site/get/fa/icons/', this._httpOptionsService.getHeader());
  }

  getGoogleMapsAPI(siteId) {
    return this._http.get(this._config.getApiUrl() + '/api/site/get/google-maps/' + siteId, this._httpOptionsService.getHeader());
  }

  updateGoogleMapsAPI(
    siteId: string, 
    api: string
  ) {
    return this._http.put(this._config.getApiUrl() + '/api/site/update/google-maps/', {   
      site_id: siteId,   
      api: api     
    }, this._httpOptionsService.getHeader())
  }

  getGoogleAnalyticsAPI(siteId) {
    return this._http.get(this._config.getApiUrl() + '/api/site/get/google-analytics/' + siteId, this._httpOptionsService.getHeader());
  }

  updateGoogleAnalyticsAPI(
    siteId: string, 
    api: string
  ) {
    return this._http.put(this._config.getApiUrl() + '/api/site/update/google-analytics/', {     
      site_id: siteId,   
      api: api     
    }, this._httpOptionsService.getHeader())
  }

  getChatbotSettings(siteId) {
    return this._http.get(this._config.getApiUrl() + '/api/site/get/chatbot-settings/' + siteId, this._httpOptionsService.getHeader());
  }

  updateChatbotSettings(
    siteId: string,     
    chatEnabled: boolean,
    textData: [],
    workingHoursEnabled: boolean,
    workingHoursType?: string,
    workingHours?: any[]
  ) {    
    return this._http.put(this._config.getApiUrl() + '/api/site/update/chatbot-settings/', {    
      site_id: siteId,         
      chat_enabled: chatEnabled,
      text_data: textData,
      working_hours_enabled: workingHoursEnabled,
      working_hours_type: workingHoursType,
      working_hours: workingHours    
    }, this._httpOptionsService.getHeader())
  }

  downloadFile(siteId, fileId) {
    return this._http.get(this._config.getApiUrl() + '/api/site/prepare/' + siteId + '/' + fileId, this._httpOptionsService.getHeader())
  }

  /*
  generateSitemap(siteId) {
    return this._http.get(this._config.getApiUrl() + '/api/site/sitemap/' + siteId)
  }*/

  getStats(siteId) {
    return this._http.get(this._config.getApiUrl() + '/api/site/get/stats/' + siteId, this._httpOptionsService.getHeader())
  }

  getActiveUsers(siteId) {
    return this._http.get(this._config.getApiUrl() + '/api/site/get/active/users/' + siteId, this._httpOptionsService.getHeader())
  }
  
  //#region chat
  /**
   * Chat
   * @param siteId 
   */
  getChats(siteId) {
    return this._http.get(this._config.getApiUrl() + '/api/site/get/chat/' + siteId, this._httpOptionsService.getHeader());
  }

  getChat(siteId, id) {
    return this._http.get(this._config.getApiUrl() + '/api/site/get/chat/' + siteId + '/' + id);
  }

  deleteChat(siteId, chatId) {
    return this._http.delete(this._config.getApiUrl() + '/api/site/delete/chat/' + siteId + '/' + chatId, this._httpOptionsService.getHeader())
  }
  //#endregion 

  //#region search and ckeditor  
  getLastTenPosts(siteId) {
    return this._http.get(this._config.getApiUrl() + '/api/site/search/link/' + siteId, this._httpOptionsService.getHeader());
  }
  findPost(siteId, search) {
    return this._http.get(this._config.getApiUrl() + '/api/site/search/link/' + siteId + '/' + search, this._httpOptionsService.getHeader());
  }
  //#endregion

  getBlockInfo(siteId, postId, blockId, childId?) {

    if(childId) {
      return this._http.get(this._config.getApiUrl() + '/api/site/get/block/data/' + siteId + '/' + postId + '/' + blockId + '/' + childId);
    }
    else {
      return this._http.get(this._config.getApiUrl() + '/api/site/get/block/data/' + siteId + '/' + postId + '/' + blockId);
    }

  }

  

}
