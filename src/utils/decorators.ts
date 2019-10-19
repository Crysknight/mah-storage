import Dispatcher from './dispatcher';

export const asyncDispatch = (
    _target: Dispatcher,
    property: string,
    descriptor: PropertyDescriptor
) => {
    const oldFunc: Function = descriptor.value;

    descriptor.value = async function(this: Dispatcher, ...args: Array<any>) {
        this.$dispatch(`before_${property}`, ...args);

        let result: any;
        try {
            result = await oldFunc.apply(this, args);
        } catch (error) {
            this.$dispatch(`errored_${property}`, ...args);
            return Promise.reject(error);
        }

        this.$dispatch(property, ...args);

        return result;
    };

    return descriptor;
};

export const asyncProxifiedBy = (funcName: string) => {
    return (_target: any, _property: string, descriptor: PropertyDescriptor) => {
        const oldFunc: Function = descriptor.value;

        descriptor.value = async function(this: any, ...args: Array<any>) {
            await this[funcName]();

            return await oldFunc.apply(this, args);
        };
    }
};
