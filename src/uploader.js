import ajax from '@codexteam/ajax';

/**
 * Module for file uploading. Handle 3 scenarios:
 *  1. Select file from device and upload
 *  2. Upload by pasting URL
 *  3. Upload by pasting file from Clipboard or by Drag'n'Drop
 */
export default class Uploader {
  /**
   * @param {ImageConfig} config
   * @param {function} onUpload - one callback for all uploading (file, url, d-n-d, pasting)
   * @param {function} onError - callback for uploading errors
   */
  constructor({ config, onUpload, onError }) {
    this.config = config;
    this.onUpload = onUpload;
    this.onError = onError;
  }

  /**
   * Handle clicks on the upload file button
   * @fires ajax.transport()
   * @param {function} onPreview - callback fired when preview is ready
   */
  uploadSelectedFile({ onPreview }) {

    console.log('привет');
    const preparePreview = function (file) {
      const reader = new FileReader();

      reader.readAsDataURL(file);
      reader.onload = (e) => {
        onPreview(e.target.result);
      };
    };

    /**
     * Custom uploading
     * or default uploading
     */
    let upload;
    let preupload;

    // custom uploading
    preupload = ajax.post({
      url: this.config.endpoints.byFile,
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        skill: this.config.skill,
        key: name
      })
    }).then(response => response.body);

    console.log(preupload);

    preupload.then((res) => {
      console.log('123')
      const formData2 = new FormData();
      formData2.append('acl', res['fields']['acl']);
      formData2.append('key', name);
      formData2.append('bucket', res['fields']['bucket']);
      formData2.append('policy', res['fields']['policy']);
      formData2.append('x-amz-algorithm', res['fields']['x-amz-algorithm']);
      formData2.append('x-amz-credential', res['fields']['x-amz-credential']);
      formData2.append('x-amz-date', res['fields']['x-amz-date']);
      formData2.append('x-amz-meta-tag', res['fields']['x-amz-meta-tag']);
      formData2.append('x-amz-meta-uuid', res['fields']['x-amz-meta-uuid']);
      formData2.append('x-amz-signature', res['fields']['x-amz-signature']);
      formData2.append('file', file);
      upload = ajax.post({
        url: `${res['host']}`,
        data: formData2
      }).then(response => response.body);
    });


    upload.then((response) => {
      this.onUpload(response);
    }).catch((error) => {
      this.onError(error);
    });
  }

  /**
   * Handle clicks on the upload file button
   * @fires ajax.post()
   * @param {string} url - image source url
   */
  uploadByUrl(url) {
    let upload;

    /**
     * Custom uploading
     */
    if (this.config.uploader && typeof this.config.uploader.uploadByUrl === 'function') {
      upload = this.config.uploader.uploadByUrl(url);

      if (!isPromise(upload)) {
        console.warn('Custom uploader method uploadByUrl should return a Promise');
      }
    } else {
      /**
       * Default uploading
       */
      upload = ajax.post({
        url: this.config.endpoints.byUrl,
        data: Object.assign({
          url: url
        }, this.config.additionalRequestData),
        type: ajax.contentType.JSON,
        headers: this.config.additionalRequestHeaders
      }).then(response => response.body);
    }

    upload.then((response) => {
      this.onUpload(response);
    }).catch((error) => {
      this.onError(error);
    });
  }

  /**
   * Handle clicks on the upload file button
   * @fires ajax.post()
   * @param {File} file - file pasted by drag-n-drop
   * @param {function} onPreview - file pasted by drag-n-drop
   */
  uploadByFile(file, { onPreview }) {

    console.log(file);

    /**
     * Load file for preview
     * @type {FileReader}
     */
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = (e) => {
      onPreview(e.target.result);
    };

    let upload;

    let preupload;

    /**
     * Custom uploading
     */
      /**
       * Default uploading
       */

      if (this.config.additionalRequestData && Object.keys(this.config.additionalRequestData).length) {
        Object.entries(this.config.additionalRequestData).forEach(([name, value]) => {
          formData.append(name, value);
        });
      }
      const name = `${new Date().getTime()}${file.name}`;

      сconsole.log(name);
      preupload = ajax.post({
        url: this.config.endpoints.byFile,
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        },
        data: JSON.stringify({
          skill: this.config.skill,
          key: name
        })
      }).then(response => response.body);

      preupload.then((res) => {
        console.log('123')
        const formData2 = new FormData();
        formData2.append('acl', res['fields']['acl']);
        formData2.append('key', name);
        formData2.append('bucket', res['fields']['bucket']);
        formData2.append('policy', res['fields']['policy']);
        formData2.append('x-amz-algorithm', res['fields']['x-amz-algorithm']);
        formData2.append('x-amz-credential', res['fields']['x-amz-credential']);
        formData2.append('x-amz-date', res['fields']['x-amz-date']);
        formData2.append('x-amz-meta-tag', res['fields']['x-amz-meta-tag']);
        formData2.append('x-amz-meta-uuid', res['fields']['x-amz-meta-uuid']);
        formData2.append('x-amz-signature', res['fields']['x-amz-signature']);
        formData2.append('file', file);
        upload = ajax.post({
          url: `${res['host']}`,
          data: formData2
        }).then(response => response.body);
      });

    upload.then((response) => {
      this.onUpload(response);
    }).catch((error) => {
      this.onError(error);
    });
  }
}

/**
 * Check if passed object is a Promise
 * @param  {*}  object - object to check
 * @return {Boolean}
 */
function isPromise(object) {
  return Promise.resolve(object) === object;
}
