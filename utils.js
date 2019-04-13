export const HEX = '0123456789abcdef';
// export const STR2ARR = (input) => {
// 	let o = [], i = -1, x, y;
//     while (++i < input.length) {
// 		/* Decode utf-16 surrogate pairs */
// 		x = input.charCodeAt(i);
// 		y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
// 		if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
// 			x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
// 			i++;
// 		}

//       	/* Encode output as utf-8 */
// 		if (x <= 0x7F) o.push(x);
// 		else if (x <= 0x7FF) o.push(0xC0 | x >>> 6 & 0x1F, 0x80 | x & 0x3F)
// 		else if (x <= 0xFFFF) o.push(0xE0 | x >>> 12 & 0x0F, 0x80 | x >>> 6 & 0x3F, 0x80 | x & 0x3F);
// 		else if (x <= 0x1FFFFF) o.push(0xF0 | x >>> 18 & 0x07, 0x80 | x >>> 12 & 0x3F, 0x80 | x >>> 6 & 0x3F, 0x80 | x & 0x3F);
//     }
//     return o;
// }

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


export const B64KEYS = STR2CODE('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=');

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
        o.push(B64KEYS[e1]);
        o.push(B64KEYS[e2]);
        o.push(B64KEYS[e3]);
        o.push(B64KEYS[e4]);
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
        e1 = B64KEYS.indexOf(bin[i++]);
        e2 = B64KEYS.indexOf(bin[i++]);
        e3 = B64KEYS.indexOf(bin[i++]);
        r4 = B64KEYS.indexOf(bin[i++]);
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

export const base64 = {
    encode: s => [
        TO_BIN, BASE64_ENCODE, CODE2STR
    ].reduce((a, b) => b(a), s),
    decode: s => [
        TO_BIN, BASE64_DECODE, UTF8_DECODE, CODE2STR
    ].reduce((a, b) => b(a), s),
};

export const utf8 = {
    encode: s => UTF8_ENCODE(TO_BIN(s)),
    decode: b => CODE2STR(UTF8_DECODE(TO_BIN(b)))
}

// console.log(base64.decode(base64.encode('中文abc')))