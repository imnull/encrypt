import { CODE2STR, STR2CODE, UTF8_ENCODE, BASE64_ENCODE, BASE64_DECODE } from './utils';
import { base64 } from './utils';
// import { encode as base64encode } from './base64';

class JSEncrypt {
    constructor(pubKey){
        this.setPublicKey(pubKey);
    }
    setPublicKey(key){
        if(typeof(key) === 'string' && key.length > 0){
            try {
                let bin = STR2CODE(key);
                bin = BASE64_DECODE(bin);
                this.publicKeyData = Uint8Array.from(bin);
            } catch(ex) {
                this.publicKeyData = null;
            }
        } else {
            this.publicKeyData = null;
        }
    }

    importPublicKey(){
        return new Promise((resolve, reject) => {
            if(!this.publicKeyData){
                reject(new Error('尚未设置公钥'))
            }
            crypto.subtle.importKey(
                'spki',
                this.publicKeyData,
                {
                  name: 'RSA-OAEP',
                  hash: 'SHA-256'
                },
                true,
                ['encrypt'],
            ).then(resolve, reject);
        })
    }

    encrypt(content){
        return new Promise((resolve, reject) => {
            this.importPublicKey().then(publicKey => {
                let data = Uint8Array.from(UTF8_ENCODE(content))
                crypto.subtle.encrypt(
                    {
                        name: 'RSA-OAEP'
                    },
                    publicKey,
                    data
                ).then(buf => {
                    let arr = new Uint8Array(buf);
                    let bin = BASE64_ENCODE(arr);
                    let b64str = CODE2STR(bin);
                    resolve(b64str);
                }, reject)
            }, reject)
        })
    }

}

module.exports = JSEncrypt;