export const HEX = '0123456789abcdef';
/**
 * 字符串转code数组
 * @param {String} str 字符串
 */
export const STR2CODE = (str) => [...str].map(c => c.charCodeAt(0));
/**
 * 字节转字符串
 * @param {Array<Number>} bin 字节
 */
export const CODE2STR = (bin) => bin.map(c => String.fromCharCode(c)).join('');

/**
 * UTF8 -> BIN
 * @param {String} bin 字节
 */
export const UTF8_ENCODE = (bin) => {
    let o = [];
    for (let i = 0; i < bin.length; i++) {
        let c = bin[i];
        if (c < 128) {
            o.push(c);
        } else if(c < 2048) {
            o.push((c >> 6) | 192);
            o.push((c & 63) | 128);
        } else {
            o.push((c >> 12) | 224);
            o.push(((c >> 6) & 63) | 128);
            o.push((c & 63) | 128);
        }
    }
    return o;
};

/**
 * UTF8 <- BIN
 * @param {Array<Number>} bin 字节
 */
export const UTF8_DECODE = (bin) => {
    let s = [], i = 0, c = 0, c1 = 0, c2 = 0;
    while ( i < bin.length ) {
        c = bin[i++];
        if (c < 128) {
            s.push(c);
        } else if((c > 191) && (c < 224)) {
            c1 = bin[i++];
            s.push(((c & 31) << 6) | (c1 & 63));
        } else {
            c1 = bin[i++];
            c2 = bin[i++];
            s.push(((c & 15) << 12) | ((c1 & 63) << 6) | (c2 & 63));
        }
    }
    return s;
};

export const B64MAP_S = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
export const B64MAP = STR2CODE(B64MAP_S);
export const B64PAD_S = '=';
export const B64PAD = B64PAD_S.charCodeAt(0);

export const hex2b64 = (h) => {
    var i, c, r = '';
    for (i = 0; i + 3 <= h.length; i += 3) {
        c = parseInt(h.substr(i, 3), 16);
        r += B64MAP_S.charAt(c >> 6) + B64MAP_S.charAt(c & 63);
    }
    if (i + 1 == h.length) {
        c = parseInt(h.substr(i, 1), 16);
        r += B64MAP_S.charAt(c << 2);
    } else if (i + 2 == h.length) {
        c = parseInt(h.substr(i, 2), 16);
        r += B64MAP_S.charAt(c >> 2) + B64MAP_S.charAt((c & 3) << 4);
    }
    while ((r.length & 3) > 0) r += B64PAD_S;
    return r;
}

export const BIN2HEX = (bin) => {
    let output = [], x;
    for(let i = 0, len = bin.length; i < len; i++){
        x = bin[i];
        output.push(x >>> 4 & 0x0F);
        output.push(x & 0x0F);
    }
    return output;
};

export const HEX2B64 = (bin) => {
    let i, c, ret = [];
    for (i = 0; i + 3 <= bin.length; i += 3) {
        c = bin.slice(i, i + 3).reverse().reduce((a, b, i) => (a + Math.pow(0x10, i) * b));
        ret.push(B64MAP[c >> 6]);
        ret.push(B64MAP[c & 63])
    }
    if (i + 1 == bin.length) {
        c = bin.slice(i, i + 1).reverse().reduce((a, b, i) => (a + Math.pow(0x10, i) * b));
        ret.push(B64MAP[c << 2])
    } else if (i + 2 == bin.length) {
        c = bin.slice(i, i + 2).reverse().reduce((a, b, i) => (a + Math.pow(0x10, i) * b));
        ret.push(B64MAP[c >> 2]);
        ret.push(B64MAP[(c & 3) << 4]);
    }
    while ((ret.length & 3) > 0) ret.push(B64PAD);
    return ret;
};

function rstr2hex(input) {
    var hex_tab = '0123456789ABCDEF';
    var output = '';
    var x;
    for (var i = 0; i < input.length; i++) {
        x = input.charCodeAt(i);
        output += hex_tab.charAt(x >>> 4 & 0x0F) + hex_tab.charAt(x & 0x0F);
    }
    return output;
}

/**
 * BIN -> BASE64
 * @param {Array<Number>} bin 字节
 */
export const BASE64_ENCODE = (bin) => {
    let o = [], c1, c2, c3, e1, e2, e3, e4, i = 0;
    while (i < bin.length) {
        c1 = bin[i++];
        c2 = bin[i++];
        c3 = bin[i++];
        e1 = c1 >> 2;
        e2 = ((c1 & 3) << 4) | (c2 >> 4);
        e3 = ((c2 & 15) << 2) | (c3 >> 6);
        e4 = c3 & 63;
        if (isNaN(c2)) {
            e3 = e4 = 64;
        } else if (isNaN(c3)) {
            e4 = 64;
        }
        o.push(B64MAP[e1]);
        o.push(B64MAP[e2]);
        o.push(B64MAP[e3]);
        o.push(B64MAP[e4]);
    }
    return o;
};

/**
 * BIN <- BASE64
 * @param {Array<Number>} bin 字节
 */
export const BASE64_DECODE = (bin) => {
    let o = [], c1, c2, c3, e1, e2, e3, r4, i = 0;
    while (i < bin.length) {
        e1 = B64MAP.indexOf(bin[i++]);
        e2 = B64MAP.indexOf(bin[i++]);
        e3 = B64MAP.indexOf(bin[i++]);
        r4 = B64MAP.indexOf(bin[i++]);
        c1 = (e1 << 2) | (e2 >> 4);
        c2 = ((e2 & 15) << 4) | (e3 >> 2);
        c3 = ((e3 & 3) << 6) | r4;
        o.push(c1);
        if (e3 != 64) {
            o.push(c2);
        }
        if (r4 != 64) {
            o.push(c3);
        }
    }
    return o;
};

export const TO_BIN = arg => {
    if(Array.isArray(arg)){
        return arg;
    } else if(arg === null || typeof(arg) === 'undefined'){
        arg = [];
    } else if(arg instanceof ArrayBuffer){
        arg = new Uint8Array(arg);
    } else if(typeof(arg) === 'string'){
        arg = UTF8_ENCODE(STR2CODE(arg));
    } else if(typeof(arg) === 'number'){
        arg = isNaN(arg) ? [] : TO_BIN(arg.toString());
    } else {
        arg = TO_BIN(arg.toString());
    }
    return arg;
}