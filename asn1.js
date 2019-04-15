module.exports = (function(){
    function Stream(enc, pos) {
        if (enc instanceof Stream) {
            this.enc = enc.enc;
            this.pos = enc.pos;
        } else {
            this.enc = enc;
            this.pos = pos;
        }
    }
    Stream.prototype.get = function (pos) {
        if (pos === undefined)
            pos = this.pos++;
        if (pos >= this.enc.length)
            throw 'Requesting byte offset ' + pos + ' on a stream of length ' + this.enc.length;
        return this.enc[pos];
    };
    Stream.prototype.hexDigits = "0123456789ABCDEF";
    Stream.prototype.hexByte = function (b) {
        return this.hexDigits.charAt((b >> 4) & 0xF) + this.hexDigits.charAt(b & 0xF);
    };
    Stream.prototype.hexDump = function (start, end, raw) {
        var s = "";
        for (var i = start; i < end; ++i) {
            s += this.hexByte(this.get(i));
            if (raw !== true)
                switch (i & 0xF) {
                    case 0x7:
                        s += "  ";
                        break;
                    case 0xF:
                        s += "\n";
                        break;
                    default:
                        s += " ";
                }
        }
        return s;
    };


    function ASN1(stream, header, length, tag, sub) {
        this.stream = stream;
        this.header = header;
        this.length = length;
        this.tag = tag;
        this.sub = sub;
    }

    ASN1.prototype.posStart = function () {
        return this.stream.pos;
    };
    ASN1.prototype.posContent = function () {
        return this.stream.pos + this.header;
    };
    ASN1.prototype.posEnd = function () {
        return this.stream.pos + this.header + Math.abs(this.length);
    };
    ASN1.prototype.toHexString = function (root) {
        return this.stream.hexDump(this.posStart(), this.posEnd(), true);
    };
    ASN1.decodeLength = function (stream) {
        var buf = stream.get(),
            len = buf & 0x7F;
        if (len == buf)
            return len;
        if (len > 3)
            throw "Length over 24 bits not supported at position " + (stream.pos - 1);
        if (len === 0)
            return -1; // undefined
        buf = 0;
        for (var i = 0; i < len; ++i)
            buf = (buf << 8) | stream.get();
        return buf;
    };
    ASN1.hasContent = function (tag, len, stream) {
        if (tag & 0x20) // constructed
            return true;
        if ((tag < 0x03) || (tag > 0x04))
            return false;
        var p = new Stream(stream);
        if (tag == 0x03) p.get(); // BitString unused bits, must be in [0, 7]
        var subTag = p.get();
        if ((subTag >> 6) & 0x01) // not (universal or context)
            return false;
        try {
            var subLength = ASN1.decodeLength(p);
            return ((p.pos - stream.pos) + subLength == len);
        } catch (exception) {
            return false;
        }
    };
    ASN1.decode = function (stream) {
        if (!(stream instanceof Stream))
            stream = new Stream(stream, 0);
        var streamStart = new Stream(stream),
            tag = stream.get(),
            len = ASN1.decodeLength(stream),
            header = stream.pos - streamStart.pos,
            sub = null;
        if (ASN1.hasContent(tag, len, stream)) {
            // it has content, so we decode it
            var start = stream.pos;
            if (tag == 0x03) stream.get(); // skip BitString unused bits, must be in [0, 7]
            sub = [];
            if (len >= 0) {
                // definite length
                var end = start + len;
                while (stream.pos < end)
                    sub[sub.length] = ASN1.decode(stream);
                if (stream.pos != end)
                    throw "Content size is not correct for container starting at offset " + start;
            } else {
                // undefined length
                try {
                    for (;;) {
                        var s = ASN1.decode(stream);
                        if (s.tag === 0)
                            break;
                        sub[sub.length] = s;
                    }
                    len = start - stream.pos;
                } catch (e) {
                    throw "Exception while decoding undefined length content: " + e;
                }
            }
        } else
            stream.pos += len; // skip content
        return new ASN1(streamStart, header, len, tag, sub);
    };
    ASN1.test = function () {
        var test = [{
                value: [0x27],
                expected: 0x27
            },
            {
                value: [0x81, 0xC9],
                expected: 0xC9
            },
            {
                value: [0x83, 0xFE, 0xDC, 0xBA],
                expected: 0xFEDCBA
            }
        ];
        for (var i = 0, max = test.length; i < max; ++i) {
            var pos = 0,
                stream = new Stream(test[i].value, 0),
                res = ASN1.decodeLength(stream);
            if (res != test[i].expected)
                document.write("In test[" + i + "] expected " + test[i].expected + " got " + res + "\n");
        }
    };
    /**
     * Retrieve the hexadecimal value (as a string) of the current ASN.1 element
     * @returns {string}
     * @public
     */
    ASN1.prototype.getHexStringValue = function () {
        var hexString = this.toHexString();
        var offset = this.header * 2;
        var length = this.length * 2;
        return hexString.substr(offset, length);
    };
    
    return ASN1;
})()