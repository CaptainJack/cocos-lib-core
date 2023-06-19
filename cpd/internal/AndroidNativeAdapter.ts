import {AbstractNativeAdapter} from "db://assets/core/lib-core/cpd/internal/AbstractNativeAdapter";
import {CpdAccount} from "db://assets/core/lib-core/cpd/CpdAccount";
import {_random} from "db://assets/core/lib-core/tools/_random";
import {EMPTY_FUNCTION} from "db://assets/core/lib-core/capjack/tool/lang/_utils";
import {native} from "cc";

export class AndroidNativeAdapter extends AbstractNativeAdapter {
    protected getDeviceId(): Promise<string> {
        const deviceId = native.reflection.callStaticMethod('ru/capjack/cpd/Cpd', 'getDeviceId', '()Ljava/lang/String;')
        return Promise.resolve(deviceId);
    }

    public getAppFriends(): Promise<Array<string>> {
        return Promise.resolve([])
    }

    public login(): Promise<CpdAccount> {
        return this.getDeviceId().then(deviceId => {
            return new CpdAccount(this.makeCsiAuthKeyPrefix() + deviceId, deviceId)
        })
    }

    public loadShop(ids: string[], receiver: (currency: string, products: Array<{
        id: string;
        price: number
    }>) => void, purchaseConsumer: (productId: string, orderId: string, receipt: string, successConsumer: () => void) => void): void {
        receiver(null, [])
    }

    public purchase(product: {
        id: string;
        name: string;
        price: number
    }, onSuccess: (orderId: string, receipt: string, successConsumer: () => void) => void, onFail: (reason: string) => void): void {
        if (app.debug) {
            onSuccess(`TEST-${Date.now()}-${_random.intOfRange(0, 2000000000)}`, 'TEST', EMPTY_FUNCTION)
        }
        else {
            onFail('NOT_AVAILABLE')
        }
    }

    protected makeCsiAuthKeyPrefix(): string {
        return 'guna'
    }
}