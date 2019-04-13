import { HEX, TO_BIN } from './utils';

const
N = [
	0xd76aa478,0xe8c7b756,0x242070db,0xc1bdceee,0xf57c0faf,0x4787c62a,0xa8304613,0xfd469501,
	0x698098d8,0x8b44f7af,0xffff5bb1,0x895cd7be,0x6b901122,0xfd987193,0xa679438e,0x49b40821,
	0xf61e2562,0xc040b340,0x265e5a51,0xe9b6c7aa,0xd62f105d,0x02441453,0xd8a1e681,0xe7d3fbc8,
	0x21e1cde6,0xc33707d6,0xf4d50d87,0x455a14ed,0xa9e3e905,0xfcefa3f8,0x676f02d9,0x8d2a4c8a,
	0xfffa3942,0x8771f681,0x6d9d6122,0xfde5380c,0xa4beea44,0x4bdecfa9,0xf6bb4b60,0xbebfbc70,
	0x289b7ec6,0xeaa127fa,0xd4ef3085,0x04881d05,0xd9d4d039,0xe6db99e5,0x1fa27cf8,0xc4ac5665,
	0xf4292244,0x432aff97,0xab9423a7,0xfc93a039,0x655b59c3,0x8f0ccc92,0xffeff47d,0x85845dd1,
	0x6fa87e4f,0xfe2ce6e0,0xa3014314,0x4e0811a1,0xf7537e82,0xbd3af235,0x2ad7d2bb,0xeb86d391,
	//MD5:A,B,C,D
	0x67452301,0xefcdab89,0x98badcfe,0x10325476,
	//SHA1:A,B,C,D,E
	0x67452301,0xEFCDAB89,0x98BADCFE,0x10325476,0xC3D2E1F0
]
, MD5C = {
	F: [7,12,17,22],
	G: [5, 9,14,20],
	H: [4,11,16,23],
	I: [6,10,15,21],
	f: function(A,x,s,t){return CMN((A[1]&A[2])|((~A[1])&A[3]),A[0],A[1],x,s,t);},
	g: function(A,x,s,t){return CMN((A[1]&A[3])|(A[2]&(~A[3])),A[0],A[1],x,s,t);},
	h: function(A,x,s,t){return CMN(A[1]^A[2]^A[3],A[0],A[1],x,s,t);},
	i: function(A,x,s,t){return CMN(A[2]^(A[1]|(~A[3])),A[0],A[1],x,s,t);},
	x: function(o,O){
		O[0]=o[0]=ADD(o[0],O[0]);
		O[1]=o[1]=ADD(o[1],O[1]);
		O[2]=o[2]=ADD(o[2],O[2]);
		O[3]=o[3]=ADD(o[3],O[3]);
	},
	$: function(A,M,f,p,x,s,m,n){
		var i=0,j=f;
		for(;i<16;i++){
			A[0]=M(A,x[n+j],s[i%4],N[i+m]);
			A.unshift(A.pop());
			j=(j+p)%16;
		}
		i=j=null;
	}
}
;

function ADD(x,y){
	var l=(x&0xFFFF)+(y&0xFFFF),m=(x>>16)+(y>>16)+(l>>16),r=(m<<16)|(l&0xFFFF);
	l=m=null;
	return r;
}
function ROL(num,cnt){return (num<<cnt)|(num>>>(32-cnt));}
function CMN(q,a,b,x,s,t){return ADD(ROL(ADD(ADD(a, q), ADD(x, t)), s),b);}
function CORE_MD5(x,o){
	var i=0,o=o||N.slice(64,68),O=o.slice(0);
	for(;i<x.length;i+=16){
 		MD5C.$(o,MD5C.f,0,1,x,MD5C.F,0,i);
 		MD5C.$(o,MD5C.g,1,5,x,MD5C.G,16,i);
 		MD5C.$(o,MD5C.h,5,3,x,MD5C.H,32,i);
 		MD5C.$(o,MD5C.i,0,7,x,MD5C.I,48,i);
 		MD5C.x(o, O);
	}
	O=i=x=null;
	return o;
}
function BINL2HEX(bin){
	var str='',i=0;
	for(;i<bin.length*4;i++)
		str+=HEX.charAt((bin[i>>2]>>((i%4)*8+4))&15)
			+HEX.charAt((bin[i>>2]>>((i%4)*8))&15)
			;
	return str;
}
function ARR2BINL(a){
	var r=[],i=0,l=a.length*8;
	for(;i<l;i+=8)r[i>>5]|=(a[i>>3]&255)<<(i%32);
	i=l=null;
	return r;
}
function ARR2BINL_FIN(binl,l,L){
	l*=8;
	L*=8;
	binl[l>>5]|=0x80<<((L)%32);
	binl[(((l+64)>>>9)<<4)+14]=L;
}
const MD5 = (s) => {
	s = TO_BIN(s)
	var r = ARR2BINL(s);
	ARR2BINL_FIN(r, s.length, s.length);
	r = CORE_MD5(r);
	s = null;
	return r;
};

export default (s) => {
	s = MD5(s);
	s = BINL2HEX(s);
	return s;
}

