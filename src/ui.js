import buttonIcon from './svg/button-icon.svg';

/**
 * Class for working with UI:
 *  - rendering base structure
 *  - show/hide preview
 *  - apply tune view
 */
export default class Ui {
    /**
     * @param {object} api - Editor.js API
     * @param {ImageConfig} config - user config
     * @param {function} onSelectFile - callback for clicks on Select file buttor
     */
    constructor({api, config, onSelectFile}) {
        this.api = api;
        this.config = config;
        this.onSelectFile = onSelectFile;
        this.nodes = {
            container: make('div', ['uploader_container']),
            wrapper: make('div', [this.CSS.baseClass, this.CSS.wrapper]),
            imageContainer: make('div', [this.CSS.imageContainer]),
            fileButton: this.createFileButton(),
            imageEl: undefined,
            input: make('input', ['image-tool__input']),
            imagePreloader: make('div', this.CSS.imagePreloader),
            caption: make('div', [this.CSS.input, this.CSS.caption], {
                contentEditable: true
            })
        };

        /**
         * Create base structure
         *  <wrapper>
         *    <image-container>
         *      <image-preloader />
         *    </image-container>
         *    <caption />
         *    <select-file-button />
         *  </wrapper>
         */
        this.nodes.container.appendChild(this.nodes.wrapper);

        this.nodes.caption.dataset.placeholder = this.config.captionPlaceholder;
        this.nodes.imageContainer.appendChild(this.nodes.imagePreloader);

        this.nodes.wrapper.appendChild(this.nodes.imageContainer);
        // this.nodes.wrapper.appendChild(this.nodes.caption);
        this.nodes.wrapper.appendChild(this.nodes.fileButton);
        this.nodes.wrapper.appendChild(this.nodes.input);
    }

    /**
     * CSS classes
     * @constructor
     */
    get CSS() {
        return {
            baseClass: this.api.styles.block,
            loading: this.api.styles.loader,
            input: 'image-tool__input',
            button: this.api.styles.button,

            /**
             * Tool's classes
             */
            wrapper: 'image-tool',
            imageContainer: 'image-tool__image',
            imagePreloader: 'image-tool__image-preloader',
            imageEl: 'image-tool__image-picture',
            caption: 'image-tool__caption'
        };
    };

    /**
     * Ui statuses:
     * - empty
     * - uploading
     * - filled
     * @return {{EMPTY: string, UPLOADING: string, FILLED: string}}
     */
    static get status() {
        return {
            EMPTY: 'empty',
            UPLOADING: 'loading',
            FILLED: 'filled'
        };
    }

    /**
     * @param {ImageToolData} toolData
     * @return {HTMLDivElement}
     */
    render(toolData) {
        if (!toolData.file || Object.keys(toolData.file).length === 0) {
            this.toggleStatus(Ui.status.EMPTY);
        } else {
            this.toggleStatus(Ui.status.UPLOADING);
        }

        return this.nodes.container;
    }

    /**
     * Creates upload-file button
     * @return {Element}
     */
    createFileButton() {
        const button = make('div', [this.CSS.button]);

        button.innerHTML = this.config.buttonContent || `<div class="cdx-button__icon">${buttonIcon}</div> <div>Select an image</div>`;

        button.addEventListener('click', () => {
            this.onSelectFile();
        });

        return button;
    }

    /**
     * Shows uploading preloader
     * @param {string} src - preview source
     */
    showPreloader(src) {
        this.nodes.imagePreloader.innerHTML = `
        <div class="upload-tool__link upload-tool__link--loading">
        <div class="progressFill load"></div>
            <div class="upload-tool__fileName">
                ${buttonIcon}
                ${src.name}
            </div>
            <div class="upload-tool__fileSize">${this.formatBytes(src.size)}</div>
        </div>`;
        setTimeout(() => {
            this.nodes.imagePreloader.classList.add('stop')
        }, 2500)
        // this.nodes.imagePreloader.style.backgroundImage = `url(${src})`;

        this.toggleStatus(Ui.status.UPLOADING);
    }

    /**
     * Hide uploading preloader
     */
    hidePreloader() {
        this.nodes.imagePreloader.classList.remove('stop')
        this.toggleStatus(Ui.status.EMPTY);
    }

    /**
     * Shows an image
     * @param {string} url
     */
    fillImage(url) {
        /**
         * Check for a source extension to compose element correctly: video tag for mp4, img — for others
         */
        const tag = /\.mp4$/.test(url) ? 'VIDEO' : 'IMG';

        const attributes = {
            src: url
        };

        /**
         * We use eventName variable because IMG and VIDEO tags have different event to be called on source load
         * - IMG: load
         * - VIDEO: loadeddata
         * @type {string}
         */
        let eventName = 'load';

        /**
         * Update attributes and eventName if source is a mp4 video
         */
        if (tag === 'VIDEO') {
            /**
             * Add attributes for playing muted mp4 as a gif
             * @type {boolean}
             */
            attributes.autoplay = true;
            attributes.loop = true;
            attributes.muted = true;
            attributes.playsinline = true;

            /**
             * Change event to be listened
             * @type {string}
             */
            eventName = 'loadeddata';
        }

        /**
         * Compose tag with defined attributes
         * @type {Element}
         */
        this.nodes.imageEl = make(tag, this.CSS.imageEl, attributes);

        /**
         * Add load event listener
         */
        this.nodes.imageEl.addEventListener(eventName, () => {
            this.toggleStatus(Ui.status.FILLED);

            /**
             * Preloader does not exists on first rendering with presaved data
             */
            if (this.nodes.imagePreloader) {
                this.nodes.imagePreloader.style.backgroundImage = '';
            }
        });

        this.nodes.imageContainer.appendChild(this.nodes.imageEl);
        this.nodes.fileButton.remove();
        this.nodes.imagePreloader.remove();
    }

    /**
     * Shows caption input
     * @param {string} text - caption text
     */
    fillCaption(text) {
        if (this.nodes.caption) {
            this.nodes.caption.innerHTML = text;
        }
    }

    /**
     * Changes UI status
     * @param {string} status - see {@link Ui.status} constants
     */
    toggleStatus(status) {
        for (const statusType in Ui.status) {
            if (Ui.status.hasOwnProperty(statusType)) {
                this.nodes.wrapper.classList.toggle(`${this.CSS.wrapper}--${Ui.status[statusType]}`, status === Ui.status[statusType]);
            }
        }
    }

    /**
     * Apply visual representation of activated tune
     * @param {string} tuneName - one of available tunes {@link Tunes.tunes}
     * @param {boolean} status - true for enable, false for disable
     */
    applyTune(tuneName, status) {
        this.nodes.wrapper.classList.toggle(`${this.CSS.wrapper}--${tuneName}`, status);
    }
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
}

/**
 * Helper for making Elements with attributes
 *
 * @param  {string} tagName           - new Element tag name
 * @param  {array|string} classNames  - list or name of CSS class
 * @param  {Object} attributes        - any attributes
 * @return {Element}
 */
export const make = function make(tagName, classNames = null, attributes = {}) {
    const el = document.createElement(tagName);

    if (Array.isArray(classNames)) {
        el.classList.add(...classNames);
    } else if (classNames) {
        el.classList.add(classNames);
    }

    for (const attrName in attributes) {
        el[attrName] = attributes[attrName];
    }

    return el;
};
