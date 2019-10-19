import { asyncProxifiedBy } from '$utils';
import { AnyObject, isAnyObject } from '$types';
import { MESSAGES } from '$constants';

import StorageEntity from './storage_entity';

export type RecordTypeRaw = AnyObject;
export type RecordType = RecordTypeRaw;

interface WriteOptions {
    whole?: boolean;
}
export default class Record extends StorageEntity<
    RecordTypeRaw,
    RecordType
> {

    constructor(
        nameSpace: string,
        name: string,
        initialState?: RecordTypeRaw
    ) {
        super(
            nameSpace,
            name,
            initialState || {}
        );
    }

    @asyncProxifiedBy('initializeProxy')
    public async read(property?: string): Promise<RecordType | any> {
        const state = await Record.Storage.get(this.fullName);

        if (!isAnyObject(state)) {
            return Promise.reject(MESSAGES.STORAGE_WRONG_FORMAT);
        }

        return property ? state[property] : state;
    }

    @asyncProxifiedBy('initializeProxy')
    public async write(
        param1: string | RecordType,
        param2: any | WriteOptions,
        param3?: WriteOptions
    ): Promise<RecordType> {
        let stateAddition: RecordType;
        let property: string | undefined;
        let value: any | undefined;
        let options: WriteOptions;

        if (typeof param1 === 'string') {
            property = param1;
            value = param2;
            stateAddition = { [property]: value };
            options = param3 || { whole: false };
        } else if (isAnyObject(param1)) {
            stateAddition = param1;
            options = param2 || { whole: false };
        } else {
            return Promise.reject(MESSAGES.RECORD_WRONG_WRITE_ARGS);
        }

        const state = await this.read();

        let newState: RecordType;
        if (options.whole) {
            newState = stateAddition;
        } else {
            newState = { ...state, ...stateAddition };
        }

        await this.save(newState);

        return newState;
    }
}
