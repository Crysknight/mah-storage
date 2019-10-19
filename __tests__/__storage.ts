import Storage from '$storage/storage';
import { CollectionType } from '$storage/collection';

import { stringRandom, pause } from '$utils';

declare namespace chrome.runtime {
    export let lastError: any;
}

// Redeclaring namespace because assigning my own mock implementation
// of chrome.storage.sync.get causes type error
declare namespace chrome.storage {
    export interface StorageArea {
        get: any;
        set: any;
    }

    export const sync: StorageArea;
    export const local: StorageArea;
}

const COLLECTION_STATE_1 = [
    { id: stringRandom(), name: 'John' },
    { id: stringRandom(), name: 'Carl' },
    { id: stringRandom(), name: 'Heather', busy: true }
];
const COLLECTION_STATE_2 = [
    { id: stringRandom(), hi: true }
];
const ERROR_1 = {
    message: 'mocked error 1'
};
const ERROR_2 = {
    message: 'mocked error 2'
};


const createCollection = async (name, initialState: CollectionType): Promise<any> => {
    await Storage.register(
        name,
        initialState
    );
    const objectWithCollection = await new Promise(
        resolve => chrome.storage.sync.get(name, resolve)
    );
    return objectWithCollection;
};

describe('Storage', () => {
    test(
        'registers collection',
        async () => {
            const objectWithCollection = await createCollection('files', COLLECTION_STATE_1);
            expect(objectWithCollection).toEqual({ files: COLLECTION_STATE_1 });
        }
    );
    test(
        'does not rewrite existing collection when calling register with the same name',
        async () => {
            const objectWithCollection = await createCollection('files', COLLECTION_STATE_2);
            expect(objectWithCollection).toEqual({ files: COLLECTION_STATE_1 });
        }
    );
    test(
        'gets collection',
        async () => {
            const collection = await Storage.get('files');
            expect(collection).toEqual(COLLECTION_STATE_1);
        }
    );
    test(
        'sets collection',
        async () => {
            await Storage.set('files', COLLECTION_STATE_2);
            const collection = await Storage.get('files');
            expect(collection).toEqual(COLLECTION_STATE_2);
        }
    );
    test(
        'rejects any call with an error if smth is wrong with chrome.storage',
        async () => {
            const normalSet = chrome.storage.sync.set;
            const normalGet = chrome.storage.sync.get;
            
            chrome.storage.sync.set = jest.fn(async (_state, callback) => {
                chrome.runtime.lastError = ERROR_1;
                await pause();
                callback();
            });
            chrome.storage.sync.get = jest.fn(async (_name, callback) => {
                chrome.runtime.lastError = ERROR_2;
                await pause();
                callback();
            });
            try {
                await Storage.set('files', COLLECTION_STATE_2);
            } catch (error) {
                expect(error).toEqual(ERROR_1);
            }
            try {
                await Storage.get('files');
            } catch (error) {
                expect(error).toEqual(ERROR_2);
            }
            chrome.storage.sync.set = normalSet;
            chrome.storage.sync.get = normalGet;
        }
    );
});
