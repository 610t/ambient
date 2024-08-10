import BlockType from '../../extension-support/block-type';
import ArgumentType from '../../extension-support/argument-type';
import Cast from '../../util/cast';
import log from '../../util/log';
import translations from './translations.json';
import blockIcon from './block-icon.png';

import Ambient from 'ambient-lib'

let ambient = new Ambient('dummy', 'dummy')
let ambientData = {}

/**
 * Formatter which is used for translation.
 * This will be replaced which is used in the runtime.
 * @param {object} messageData - format-message object
 * @returns {string} - message for the locale
 */
let formatMessage = messageData => messageData.default;

/**
 * Setup format-message for this extension.
 */
const setupTranslations = () => {
    const localeSetup = formatMessage.setup();
    if (localeSetup && localeSetup.translations[localeSetup.locale]) {
        Object.assign(
            localeSetup.translations[localeSetup.locale],
            translations[localeSetup.locale]
        );
    }
};

const EXTENSION_ID = 'ambient';

/**
 * URL to get this extension as a module.
 * When it was loaded as a module, 'extensionURL' will be replaced a URL which is retrieved from.
 * @type {string}
 */
let extensionURL = 'https://610t.github.io/ambient/dist/ambient.mjs';

/**
 * Scratch 3.0 blocks for example of Xcratch.
 */
class ExtensionBlocks {
    /**
     * A translation object which is used in this class.
     * @param {FormatObject} formatter - translation object
     */
    static set formatMessage (formatter) {
        formatMessage = formatter;
        if (formatMessage) setupTranslations();
    }

    /**
     * @return {string} - the name of this extension.
     */
    static get EXTENSION_NAME () {
        return formatMessage({
            id: 'ambient.name',
            default: 'Ambient',
            description: 'name of the extension'
        });
    }

    /**
     * @return {string} - the ID of this extension.
     */
    static get EXTENSION_ID () {
        return EXTENSION_ID;
    }

    /**
     * URL to get this extension.
     * @type {string}
     */
    static get extensionURL () {
        return extensionURL;
    }

    /**
     * Set URL to get this extension.
     * The extensionURL will be changed to the URL of the loading server.
     * @param {string} url - URL
     */
    static set extensionURL (url) {
        extensionURL = url;
    }

    /**
     * Construct a set of blocks for Ambient.
     * @param {Runtime} runtime - the Scratch 3.0 runtime.
     */
    constructor (runtime) {
        /**
         * The Scratch 3.0 runtime.
         * @type {Runtime}
         */
        this.runtime = runtime;

        if (runtime.formatMessage) {
            // Replace 'formatMessage' to a formatter which is used in the runtime.
            formatMessage = runtime.formatMessage;
        }
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        setupTranslations();
        return {
            id: ExtensionBlocks.EXTENSION_ID,
            name: ExtensionBlocks.EXTENSION_NAME,
            extensionURL: ExtensionBlocks.extensionURL,
            blockIconURI: blockIcon,
            showStatusButton: false,
            blocks: [
                {
                    opcode: 'ambientInit',
                    blockType: BlockType.COMMAND,
                    blockAllThreads: false,
                    text: formatMessage({
                        id: 'ambient.init',
                        default: 'Init Channel ID: [CHANNELID] Write Key: [WRITEKEY]',
                        description: 'Initialize Ambient'
                    }),
                    func: 'ambientInit',
                    arguments: {
                        CHANNELID: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Channel ID'
                        },
                        WRITEKEY: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Write Key'
                        }
                    }
                },
                {
                    opcode: 'ambientSetData',
                    blockType: BlockType.COMMAND,
                    blockAllThreads: false,
                    text: formatMessage({
                        id: 'ambient.setData',
                        default: 'Set [DATA] at [DATANUM]',
                        description: 'Set data for ambient'
                    }),
                    func: 'ambientSetData',
                    arguments: {
                        DATANUM: {
                            type: ArgumentType.STRING,
                            menu: 'ambientDataNumMenu'
                        },
                        DATA: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'ambientSend',
                    blockType: BlockType.COMMAND,
                    blockAllThreads: false,
                    text: formatMessage({
                        id: 'ambient.send',
                        default: 'Send data',
                        description: 'Send data for ambient'
                    }),
                    func: 'ambientSend'
                },
                {
                    opcode: 'ambientClear',
                    blockAllThreads: false,
                    text: formatMessage({
                        id: 'ambient.clear',
                        default: 'Clear data',
                        description: 'Clear data for ambient'
                    }),
                    func: 'ambientClear'
                }
            ],
            menus: {
                ambientDataNumMenu: {
                    acceptReporters: false,
                    items: ['d1','d2','d3','d4','d5','d6','d7','d8']
                }
            }
        };
    }

    ambientInit (args) {
        ambient = new Ambient(args.CHANNELID, args.WRITEKEY)
    }

    ambientSetData (args) {
        let dataNum = args.DATANUM
        let data = args.DATA
        ambientData[dataNum] = data
    }

    ambientSend (args) {
        ambient.send(ambientData, function(err, res, body) {
            if (err) {
                console.log(err);
            }
            console.log(res.statusCode);
        })
        ambientData={}
    }

    ambientClear (args) {
        ambientData={}
    }
}

export {ExtensionBlocks as default, ExtensionBlocks as blockClass};
