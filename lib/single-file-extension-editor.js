(function () {
	'use strict';

	const { Array: Array$1, Object: Object$1, String, BigInt, Math: Math$1, Date, Map, URL: URL$1, Error, Uint8Array: Uint8Array$1, Uint16Array, Uint32Array, DataView, Blob: Blob$1, Promise: Promise$1, TextEncoder, TextDecoder, document: document$1, crypto, btoa, TransformStream, ReadableStream, WritableStream, CompressionStream, DecompressionStream, navigator } = globalThis;

	/*
	 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */

	const MAX_32_BITS = 0xffffffff;
	const MAX_16_BITS = 0xffff;
	const COMPRESSION_METHOD_DEFLATE = 0x08;
	const COMPRESSION_METHOD_STORE = 0x00;
	const COMPRESSION_METHOD_AES = 0x63;

	const LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;
	const SPLIT_ZIP_FILE_SIGNATURE = 0x08074b50;
	const DATA_DESCRIPTOR_RECORD_SIGNATURE = SPLIT_ZIP_FILE_SIGNATURE;
	const CENTRAL_FILE_HEADER_SIGNATURE = 0x02014b50;
	const END_OF_CENTRAL_DIR_SIGNATURE = 0x06054b50;
	const ZIP64_END_OF_CENTRAL_DIR_SIGNATURE = 0x06064b50;
	const ZIP64_END_OF_CENTRAL_DIR_LOCATOR_SIGNATURE = 0x07064b50;
	const END_OF_CENTRAL_DIR_LENGTH = 22;
	const ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH = 20;
	const ZIP64_END_OF_CENTRAL_DIR_LENGTH = 56;
	const ZIP64_END_OF_CENTRAL_DIR_TOTAL_LENGTH = END_OF_CENTRAL_DIR_LENGTH + ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH + ZIP64_END_OF_CENTRAL_DIR_LENGTH;

	const EXTRAFIELD_TYPE_ZIP64 = 0x0001;
	const EXTRAFIELD_TYPE_AES = 0x9901;
	const EXTRAFIELD_TYPE_NTFS = 0x000a;
	const EXTRAFIELD_TYPE_NTFS_TAG1 = 0x0001;
	const EXTRAFIELD_TYPE_EXTENDED_TIMESTAMP = 0x5455;
	const EXTRAFIELD_TYPE_UNICODE_PATH = 0x7075;
	const EXTRAFIELD_TYPE_UNICODE_COMMENT = 0x6375;

	const BITFLAG_ENCRYPTED = 0x01;
	const BITFLAG_LEVEL = 0x06;
	const BITFLAG_DATA_DESCRIPTOR = 0x0008;
	const BITFLAG_LANG_ENCODING_FLAG = 0x0800;
	const FILE_ATTR_MSDOS_DIR_MASK = 0x10;

	const VERSION_DEFLATE = 0x14;
	const VERSION_ZIP64 = 0x2D;
	const VERSION_AES = 0x33;

	const DIRECTORY_SIGNATURE = "/";

	const MAX_DATE = new Date(2107, 11, 31);
	const MIN_DATE = new Date(1980, 0, 1);

	const UNDEFINED_VALUE = undefined;
	const UNDEFINED_TYPE$1 = "undefined";
	const FUNCTION_TYPE$1 = "function";

	/*
	 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */

	class StreamAdapter {

		constructor(Codec) {
			return class extends TransformStream {
				constructor(_format, options) {
					const codec = new Codec(options);
					super({
						transform(chunk, controller) {
							controller.enqueue(codec.append(chunk));
						},
						flush(controller) {
							const chunk = codec.flush();
							if (chunk) {
								controller.enqueue(chunk);
							}
						}
					});
				}
			};
		}
	}

	/*
	 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */

	const MINIMUM_CHUNK_SIZE = 64;
	let maxWorkers = 2;
	try {
		if (typeof navigator != UNDEFINED_TYPE$1 && navigator.hardwareConcurrency) {
			maxWorkers = navigator.hardwareConcurrency;
		}
	} catch (_error) {
		// ignored
	}
	const DEFAULT_CONFIGURATION = {
		chunkSize: 512 * 1024,
		maxWorkers,
		terminateWorkerTimeout: 5000,
		useWebWorkers: true,
		useCompressionStream: true,
		workerScripts: UNDEFINED_VALUE,
		CompressionStreamNative: typeof CompressionStream != UNDEFINED_TYPE$1 && CompressionStream,
		DecompressionStreamNative: typeof DecompressionStream != UNDEFINED_TYPE$1 && DecompressionStream
	};

	const config = Object$1.assign({}, DEFAULT_CONFIGURATION);

	function getConfiguration() {
		return config;
	}

	function getChunkSize(config) {
		return Math$1.max(config.chunkSize, MINIMUM_CHUNK_SIZE);
	}

	function configure(configuration) {
		const {
			baseURL,
			chunkSize,
			maxWorkers,
			terminateWorkerTimeout,
			useCompressionStream,
			useWebWorkers,
			Deflate,
			Inflate,
			CompressionStream,
			DecompressionStream,
			workerScripts
		} = configuration;
		setIfDefined("baseURL", baseURL);
		setIfDefined("chunkSize", chunkSize);
		setIfDefined("maxWorkers", maxWorkers);
		setIfDefined("terminateWorkerTimeout", terminateWorkerTimeout);
		setIfDefined("useCompressionStream", useCompressionStream);
		setIfDefined("useWebWorkers", useWebWorkers);
		if (Deflate) {
			config.CompressionStream = new StreamAdapter(Deflate);
		}
		if (Inflate) {
			config.DecompressionStream = new StreamAdapter(Inflate);
		}
		setIfDefined("CompressionStream", CompressionStream);
		setIfDefined("DecompressionStream", DecompressionStream);
		if (workerScripts !== UNDEFINED_VALUE) {
			const { deflate, inflate } = workerScripts;
			if (deflate || inflate) {
				if (!config.workerScripts) {
					config.workerScripts = {};
				}
			}
			if (deflate) {
				if (!Array$1.isArray(deflate)) {
					throw new Error("workerScripts.deflate must be an array");
				}
				config.workerScripts.deflate = deflate;
			}
			if (inflate) {
				if (!Array$1.isArray(inflate)) {
					throw new Error("workerScripts.inflate must be an array");
				}
				config.workerScripts.inflate = inflate;
			}
		}
	}

	function setIfDefined(propertyName, propertyValue) {
		if (propertyValue !== UNDEFINED_VALUE) {
			config[propertyName] = propertyValue;
		}
	}

	function e(e){const t=()=>URL$1.createObjectURL(new Blob$1(['const{Array:e,Object:t,Math:n,Error:r,Uint8Array:s,Uint16Array:a,Uint32Array:i,Int32Array:o,DataView:l,Promise:c,TextEncoder:f,crypto:h,postMessage:u,TransformStream:p,ReadableStream:d,WritableStream:g,CompressionStream:w,DecompressionStream:v}=globalThis;class y{constructor(e){return class extends p{constructor(t,n){const r=new e(n);super({transform(e,t){t.enqueue(r.append(e))},flush(e){const t=r.flush();t&&e.enqueue(t)}})}}}}const m=[];for(let e=0;256>e;e++){let t=e;for(let e=0;8>e;e++)1&t?t=t>>>1^3988292384:t>>>=1;m[e]=t}class b{constructor(e){this.crc=e||-1}append(e){let t=0|this.crc;for(let n=0,r=0|e.length;r>n;n++)t=t>>>8^m[255&(t^e[n])];this.crc=t}get(){return~this.crc}}class _ extends p{constructor(){const e=new b;super({transform(t){e.append(t)},flush(t){const n=new s(4);new l(n.buffer).setUint32(0,e.get()),t.enqueue(n)}})}}const S={concat(e,t){if(0===e.length||0===t.length)return e.concat(t);const n=e[e.length-1],r=S.getPartial(n);return 32===r?e.concat(t):S._shiftRight(t,r,0|n,e.slice(0,e.length-1))},bitLength(e){const t=e.length;if(0===t)return 0;const n=e[t-1];return 32*(t-1)+S.getPartial(n)},clamp(e,t){if(32*e.length<t)return e;const r=(e=e.slice(0,n.ceil(t/32))).length;return t&=31,r>0&&t&&(e[r-1]=S.partial(t,e[r-1]&2147483648>>t-1,1)),e},partial:(e,t,n)=>32===e?t:(n?0|t:t<<32-e)+1099511627776*e,getPartial:e=>n.round(e/1099511627776)||32,_shiftRight(e,t,n,r){for(void 0===r&&(r=[]);t>=32;t-=32)r.push(n),n=0;if(0===t)return r.concat(e);for(let s=0;s<e.length;s++)r.push(n|e[s]>>>t),n=e[s]<<32-t;const s=e.length?e[e.length-1]:0,a=S.getPartial(s);return r.push(S.partial(t+a&31,t+a>32?n:r.pop(),1)),r}},k={bytes:{fromBits(e){const t=S.bitLength(e)/8,n=new s(t);let r;for(let s=0;t>s;s++)0==(3&s)&&(r=e[s/4]),n[s]=r>>>24,r<<=8;return n},toBits(e){const t=[];let n,r=0;for(n=0;n<e.length;n++)r=r<<8|e[n],3==(3&n)&&(t.push(r),r=0);return 3&n&&t.push(S.partial(8*(3&n),r)),t}}},D={getRandomValues(e){const t=new i(e.buffer),r=e=>{let t=987654321;const r=4294967295;return()=>(t=36969*(65535&t)+(t>>16)&r,(((t<<16)+(e=18e3*(65535&e)+(e>>16)&r)&r)/4294967296+.5)*(n.random()>.5?1:-1))};for(let s,a=0;a<e.length;a+=4){const e=r(4294967296*(s||n.random()));s=987654071*e(),t[a/4]=4294967296*e()|0}return e}},z={importKey:e=>new z.hmacSha1(k.bytes.toBits(e)),pbkdf2(e,t,n,s){if(n=n||1e4,0>s||0>n)throw new r("invalid params to pbkdf2");const a=1+(s>>5)<<2;let i,o,c,f,h;const u=new ArrayBuffer(a),p=new l(u);let d=0;const g=S;for(t=k.bytes.toBits(t),h=1;(a||1)>d;h++){for(i=o=e.encrypt(g.concat(t,[h])),c=1;n>c;c++)for(o=e.encrypt(o),f=0;f<o.length;f++)i[f]^=o[f];for(c=0;(a||1)>d&&c<i.length;c++)p.setInt32(d,i[c]),d+=4}return u.slice(0,s/8)},hmacSha1:class{constructor(t){const s=this,a=s._hash=class{constructor(e){const t=this;t.blockSize=512,t._init=[1732584193,4023233417,2562383102,271733878,3285377520],t._key=[1518500249,1859775393,2400959708,3395469782],e?(t._h=e._h.slice(0),t._buffer=e._buffer.slice(0),t._length=e._length):t.reset()}reset(){const e=this;return e._h=e._init.slice(0),e._buffer=[],e._length=0,e}update(e){const t=this;"string"==typeof e&&(e=k.utf8String.toBits(e));const n=t._buffer=S.concat(t._buffer,e),s=t._length,a=t._length=s+S.bitLength(e);if(a>9007199254740991)throw new r("Cannot hash more than 2^53 - 1 bits");const o=new i(n);let l=0;for(let e=t.blockSize+s-(t.blockSize+s&t.blockSize-1);a>=e;e+=t.blockSize)t._block(o.subarray(16*l,16*(l+1))),l+=1;return n.splice(0,16*l),t}finalize(){const e=this;let t=e._buffer;const r=e._h;t=S.concat(t,[S.partial(1,1)]);for(let e=t.length+2;15&e;e++)t.push(0);for(t.push(n.floor(e._length/4294967296)),t.push(0|e._length);t.length;)e._block(t.splice(0,16));return e.reset(),r}_f(e,t,n,r){return e>19?e>39?e>59?e>79?void 0:t^n^r:t&n|t&r|n&r:t^n^r:t&n|~t&r}_S(e,t){return t<<e|t>>>32-e}_block(t){const r=this,s=r._h,a=e(80);for(let e=0;16>e;e++)a[e]=t[e];let i=s[0],o=s[1],l=s[2],c=s[3],f=s[4];for(let e=0;79>=e;e++){16>e||(a[e]=r._S(1,a[e-3]^a[e-8]^a[e-14]^a[e-16]));const t=r._S(5,i)+r._f(e,o,l,c)+f+a[e]+r._key[n.floor(e/20)]|0;f=c,c=l,l=r._S(30,o),o=i,i=t}s[0]=s[0]+i|0,s[1]=s[1]+o|0,s[2]=s[2]+l|0,s[3]=s[3]+c|0,s[4]=s[4]+f|0}},o=[[],[]];s._baseHash=[new a,new a];const l=s._baseHash[0].blockSize/32;t.length>l&&(t=a.hash(t));for(let e=0;l>e;e++)o[0][e]=909522486^t[e],o[1][e]=1549556828^t[e];s._baseHash[0].update(o[0]),s._baseHash[1].update(o[1]),s._resultHash=new a(s._baseHash[0])}reset(){const e=this;e._resultHash=new e._hash(e._baseHash[0]),e._updated=!1}update(e){this._updated=!0,this._resultHash.update(e)}digest(){const e=this,t=e._resultHash.finalize(),n=new e._hash(e._baseHash[1]).update(t).finalize();return e.reset(),n}encrypt(e){if(this._updated)throw new r("encrypt on already updated hmac called!");return this.update(e),this.digest(e)}}},I=void 0!==h&&"function"==typeof h.getRandomValues;function C(e){return I?h.getRandomValues(e):D.getRandomValues(e)}const E={name:"PBKDF2"},T=t.assign({hash:{name:"HMAC"}},E),R=t.assign({iterations:1e3,hash:{name:"SHA-1"}},E),x=["deriveBits"],A=[8,12,16],B=[16,24,32],H=[0,0,0,0],q=void 0!==h,K=q&&h.subtle,V=q&&void 0!==K,M=k.bytes,N=class{constructor(e){const t=this;t._tables=[[[],[],[],[],[]],[[],[],[],[],[]]],t._tables[0][0][0]||t._precompute();const n=t._tables[0][4],s=t._tables[1],a=e.length;let i,o,l,c=1;if(4!==a&&6!==a&&8!==a)throw new r("invalid aes key size");for(t._key=[o=e.slice(0),l=[]],i=a;4*a+28>i;i++){let e=o[i-1];(i%a==0||8===a&&i%a==4)&&(e=n[e>>>24]<<24^n[e>>16&255]<<16^n[e>>8&255]<<8^n[255&e],i%a==0&&(e=e<<8^e>>>24^c<<24,c=c<<1^283*(c>>7))),o[i]=o[i-a]^e}for(let e=0;i;e++,i--){const t=o[3&e?i:i-4];l[e]=4>=i||4>e?t:s[0][n[t>>>24]]^s[1][n[t>>16&255]]^s[2][n[t>>8&255]]^s[3][n[255&t]]}}encrypt(e){return this._crypt(e,0)}decrypt(e){return this._crypt(e,1)}_precompute(){const e=this._tables[0],t=this._tables[1],n=e[4],r=t[4],s=[],a=[];let i,o,l,c;for(let e=0;256>e;e++)a[(s[e]=e<<1^283*(e>>7))^e]=e;for(let f=i=0;!n[f];f^=o||1,i=a[i]||1){let a=i^i<<1^i<<2^i<<3^i<<4;a=a>>8^255&a^99,n[f]=a,r[a]=f,c=s[l=s[o=s[f]]];let h=16843009*c^65537*l^257*o^16843008*f,u=257*s[a]^16843008*a;for(let n=0;4>n;n++)e[n][f]=u=u<<24^u>>>8,t[n][a]=h=h<<24^h>>>8}for(let n=0;5>n;n++)e[n]=e[n].slice(0),t[n]=t[n].slice(0)}_crypt(e,t){if(4!==e.length)throw new r("invalid aes block size");const n=this._key[t],s=n.length/4-2,a=[0,0,0,0],i=this._tables[t],o=i[0],l=i[1],c=i[2],f=i[3],h=i[4];let u,p,d,g=e[0]^n[0],w=e[t?3:1]^n[1],v=e[2]^n[2],y=e[t?1:3]^n[3],m=4;for(let e=0;s>e;e++)u=o[g>>>24]^l[w>>16&255]^c[v>>8&255]^f[255&y]^n[m],p=o[w>>>24]^l[v>>16&255]^c[y>>8&255]^f[255&g]^n[m+1],d=o[v>>>24]^l[y>>16&255]^c[g>>8&255]^f[255&w]^n[m+2],y=o[y>>>24]^l[g>>16&255]^c[w>>8&255]^f[255&v]^n[m+3],m+=4,g=u,w=p,v=d;for(let e=0;4>e;e++)a[t?3&-e:e]=h[g>>>24]<<24^h[w>>16&255]<<16^h[v>>8&255]<<8^h[255&y]^n[m++],u=g,g=w,w=v,v=y,y=u;return a}},P=class{constructor(e,t){this._prf=e,this._initIv=t,this._iv=t}reset(){this._iv=this._initIv}update(e){return this.calculate(this._prf,e,this._iv)}incWord(e){if(255==(e>>24&255)){let t=e>>16&255,n=e>>8&255,r=255&e;255===t?(t=0,255===n?(n=0,255===r?r=0:++r):++n):++t,e=0,e+=t<<16,e+=n<<8,e+=r}else e+=1<<24;return e}incCounter(e){0===(e[0]=this.incWord(e[0]))&&(e[1]=this.incWord(e[1]))}calculate(e,t,n){let r;if(!(r=t.length))return[];const s=S.bitLength(t);for(let s=0;r>s;s+=4){this.incCounter(n);const r=e.encrypt(n);t[s]^=r[0],t[s+1]^=r[1],t[s+2]^=r[2],t[s+3]^=r[3]}return S.clamp(t,s)}},U=z.hmacSha1;let L=q&&V&&"function"==typeof K.importKey,W=q&&V&&"function"==typeof K.deriveBits;class F extends p{constructor({password:e,signed:n,encryptionStrength:a}){super({start(){t.assign(this,{ready:new c((e=>this.resolveReady=e)),password:e,signed:n,strength:a-1,pending:new s})},async transform(e,t){const n=this,{password:a,strength:i,resolveReady:o,ready:l}=n;a?(await(async(e,t,n,s)=>{const a=await X(e,t,n,j(s,0,A[t])),i=j(s,A[t]);if(a[0]!=i[0]||a[1]!=i[1])throw new r("Invalid password")})(n,i,a,j(e,0,A[i]+2)),e=j(e,A[i]+2),o()):await l;const c=new s(e.length-10-(e.length-10)%16);t.enqueue(G(n,e,c,0,10,!0))},async flush(e){const{signed:t,ctr:n,hmac:a,pending:i,ready:o}=this;await o;const l=j(i,0,i.length-10),c=j(i,i.length-10);let f=new s;if(l.length){const e=Q(M,l);a.update(e);const t=n.update(e);f=J(M,t)}if(t){const e=j(J(M,a.digest()),0,10);for(let t=0;10>t;t++)if(e[t]!=c[t])throw new r("Invalid signature")}e.enqueue(f)}})}}class O extends p{constructor({password:e,encryptionStrength:n}){let r;super({start(){t.assign(this,{ready:new c((e=>this.resolveReady=e)),password:e,strength:n-1,pending:new s})},async transform(e,t){const n=this,{password:r,strength:a,resolveReady:i,ready:o}=n;let l=new s;r?(l=await(async(e,t,n)=>{const r=C(new s(A[t]));return Y(r,await X(e,t,n,r))})(n,a,r),i()):await o;const c=new s(l.length+e.length-e.length%16);c.set(l,0),t.enqueue(G(n,e,c,l.length,0))},async flush(e){const{ctr:t,hmac:n,pending:a,ready:i}=this;await i;let o=new s;if(a.length){const e=t.update(Q(M,a));n.update(e),o=J(M,e)}r.signature=J(M,n.digest()).slice(0,10),e.enqueue(Y(o,r.signature))}}),r=this}}function G(e,t,n,r,a,i){const{ctr:o,hmac:l,pending:c}=e,f=t.length-a;let h;for(c.length&&(t=Y(c,t),n=((e,t)=>{if(t&&t>e.length){const n=e;(e=new s(t)).set(n,0)}return e})(n,f-f%16)),h=0;f-16>=h;h+=16){const e=Q(M,j(t,h,h+16));i&&l.update(e);const s=o.update(e);i||l.update(s),n.set(J(M,s),h+r)}return e.pending=j(t,h),n}async function X(n,r,a,i){n.password=null;const o=(e=>{if(void 0===f){const t=new s((e=unescape(encodeURIComponent(e))).length);for(let n=0;n<t.length;n++)t[n]=e.charCodeAt(n);return t}return(new f).encode(e)})(a),l=await(async(e,t,n,r,s)=>{if(!L)return z.importKey(t);try{return await K.importKey("raw",t,n,!1,s)}catch(e){return L=!1,z.importKey(t)}})(0,o,T,0,x),c=await(async(e,t,n)=>{if(!W)return z.pbkdf2(t,e.salt,R.iterations,n);try{return await K.deriveBits(e,t,n)}catch(r){return W=!1,z.pbkdf2(t,e.salt,R.iterations,n)}})(t.assign({salt:i},R),l,8*(2*B[r]+2)),h=new s(c),u=Q(M,j(h,0,B[r])),p=Q(M,j(h,B[r],2*B[r])),d=j(h,2*B[r]);return t.assign(n,{keys:{key:u,authentication:p,passwordVerification:d},ctr:new P(new N(u),e.from(H)),hmac:new U(p)}),d}function Y(e,t){let n=e;return e.length+t.length&&(n=new s(e.length+t.length),n.set(e,0),n.set(t,e.length)),n}function j(e,t,n){return e.subarray(t,n)}function J(e,t){return e.fromBits(t)}function Q(e,t){return e.toBits(t)}class Z extends p{constructor({password:e,passwordVerification:n}){super({start(){t.assign(this,{password:e,passwordVerification:n}),ne(this,e)},transform(e,t){const n=this;if(n.password){const t=ee(n,e.subarray(0,12));if(n.password=null,t[11]!=n.passwordVerification)throw new r("Invalid password");e=e.subarray(12)}t.enqueue(ee(n,e))}})}}class $ extends p{constructor({password:e,passwordVerification:n}){super({start(){t.assign(this,{password:e,passwordVerification:n}),ne(this,e)},transform(e,t){const n=this;let r,a;if(n.password){n.password=null;const t=C(new s(12));t[11]=n.passwordVerification,r=new s(e.length+t.length),r.set(te(n,t),0),a=12}else r=new s(e.length),a=0;r.set(te(n,e),a),t.enqueue(r)}})}}function ee(e,t){const n=new s(t.length);for(let r=0;r<t.length;r++)n[r]=se(e)^t[r],re(e,n[r]);return n}function te(e,t){const n=new s(t.length);for(let r=0;r<t.length;r++)n[r]=se(e)^t[r],re(e,t[r]);return n}function ne(e,n){const r=[305419896,591751049,878082192];t.assign(e,{keys:r,crcKey0:new b(r[0]),crcKey2:new b(r[2])});for(let t=0;t<n.length;t++)re(e,n.charCodeAt(t))}function re(e,t){let[r,s,a]=e.keys;e.crcKey0.append([t]),r=~e.crcKey0.get(),s=ie(n.imul(ie(s+ae(r)),134775813)+1),e.crcKey2.append([s>>>24]),a=~e.crcKey2.get(),e.keys=[r,s,a]}function se(e){const t=2|e.keys[2];return ae(n.imul(t,1^t)>>>8)}function ae(e){return 255&e}function ie(e){return 4294967295&e}class oe extends p{constructor(e,{chunkSize:t,CompressionStream:n,CompressionStreamNative:r}){super({});const{compressed:s,encrypted:a,useCompressionStream:i,zipCrypto:o,signed:c,level:f}=e,h=this;let u,p,d=ce(super.readable);a&&!o||!c||([d,u]=d.tee(),u=ue(u,new _)),s&&(d=he(d,i,{level:f,chunkSize:t},r,n)),a&&(o?d=ue(d,new $(e)):(p=new O(e),d=ue(d,p))),fe(h,d,(async()=>{let e;a&&!o&&(e=p.signature),a&&!o||!c||(e=await u.getReader().read(),e=new l(e.value.buffer).getUint32(0)),h.signature=e}))}}class le extends p{constructor(e,{chunkSize:t,DecompressionStream:n,DecompressionStreamNative:s}){super({});const{zipCrypto:a,encrypted:i,signed:o,signature:c,compressed:f,useCompressionStream:h}=e;let u,p,d=ce(super.readable);i&&(a?d=ue(d,new Z(e)):(p=new F(e),d=ue(d,p))),f&&(d=he(d,h,{chunkSize:t},s,n)),i&&!a||!o||([d,u]=d.tee(),u=ue(u,new _)),fe(this,d,(async()=>{if((!i||a)&&o){const e=await u.getReader().read(),t=new l(e.value.buffer);if(c!=t.getUint32(0,!1))throw new r("Invalid signature")}}))}}function ce(e){return ue(e,new p({transform(e,t){e&&e.length&&t.enqueue(e)}}))}function fe(e,n,r){n=ue(n,new p({flush:r})),t.defineProperty(e,"readable",{get:()=>n})}function he(e,t,n,r,s){try{e=ue(e,new(t&&r?r:s)("deflate-raw",n))}catch(r){if(!t)throw r;e=ue(e,new s("deflate-raw",n))}return e}function ue(e,t){return e.pipeThrough(t)}class pe extends p{constructor(e,n){super({});const r=this,{codecType:s}=e;let a;s.startsWith("deflate")?a=oe:s.startsWith("inflate")&&(a=le);let i=0;const o=new a(e,n),l=super.readable,c=new p({transform(e,t){e&&e.length&&(i+=e.length,t.enqueue(e))},flush(){const{signature:e}=o;t.assign(r,{signature:e,size:i})}});t.defineProperty(r,"readable",{get:()=>l.pipeThrough(o).pipeThrough(c)})}}const de=new Map,ge=new Map;let we=0;async function ve(e){try{const{options:t,scripts:n,config:r}=e;n&&n.length&&importScripts.apply(void 0,n),self.initCodec&&self.initCodec(),r.CompressionStreamNative=self.CompressionStream,r.DecompressionStreamNative=self.DecompressionStream,self.Deflate&&(r.CompressionStream=new y(self.Deflate)),self.Inflate&&(r.DecompressionStream=new y(self.Inflate));const s={highWaterMark:1,size:()=>r.chunkSize},a=e.readable||new d({async pull(e){const t=new c((e=>de.set(we,e)));ye({type:"pull",messageId:we}),we=(we+1)%Number.MAX_SAFE_INTEGER;const{value:n,done:r}=await t;e.enqueue(n),r&&e.close()}},s),i=e.writable||new g({async write(e){let t;const n=new c((e=>t=e));ge.set(we,t),ye({type:"data",value:e,messageId:we}),we=(we+1)%Number.MAX_SAFE_INTEGER,await n}},s),o=new pe(t,r);await a.pipeThrough(o).pipeTo(i,{preventAbort:!0});try{await i.close()}catch(e){}const{signature:l,size:f}=o;ye({type:"close",result:{signature:l,size:f}})}catch(e){me(e)}}function ye(e){let{value:t}=e;if(t)if(t.length)try{t=new s(t),e.value=t.buffer,u(e,[e.value])}catch(t){u(e)}else u(e);else u(e)}function me(e){const{message:t,stack:n,code:r,name:s}=e;u({error:{message:t,stack:n,code:r,name:s}})}addEventListener("message",(({data:e})=>{const{type:t,messageId:n,value:r,done:a}=e;try{if("start"==t&&ve(e),"data"==t){const e=de.get(n);de.delete(n),e({value:new s(r),done:a})}if("ack"==t){const e=ge.get(n);ge.delete(n),e()}}catch(e){me(e)}}));var be=s,_e=a,Se=i,ke=new be([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),De=new be([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),ze=new be([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),Ie=(e,t)=>{for(var n=new _e(31),r=0;31>r;++r)n[r]=t+=1<<e[r-1];var s=new Se(n[30]);for(r=1;30>r;++r)for(var a=n[r];a<n[r+1];++a)s[a]=a-n[r]<<5|r;return[n,s]},Ce=Ie(ke,2),Ee=Ce[0],Te=Ce[1];Ee[28]=258,Te[258]=28;for(var Re=Ie(De,0),xe=Re[0],Ae=Re[1],Be=new _e(32768),He=0;32768>He;++He){var qe=(43690&He)>>>1|(21845&He)<<1;qe=(61680&(qe=(52428&qe)>>>2|(13107&qe)<<2))>>>4|(3855&qe)<<4,Be[He]=((65280&qe)>>>8|(255&qe)<<8)>>>1}var Ke=(e,t,n)=>{for(var r=e.length,s=0,a=new _e(t);r>s;++s)e[s]&&++a[e[s]-1];var i,o=new _e(t);for(s=0;t>s;++s)o[s]=o[s-1]+a[s-1]<<1;if(n){i=new _e(1<<t);var l=15-t;for(s=0;r>s;++s)if(e[s])for(var c=s<<4|e[s],f=t-e[s],h=o[e[s]-1]++<<f,u=h|(1<<f)-1;u>=h;++h)i[Be[h]>>>l]=c}else for(i=new _e(r),s=0;r>s;++s)e[s]&&(i[s]=Be[o[e[s]-1]++]>>>15-e[s]);return i},Ve=new be(288);for(He=0;144>He;++He)Ve[He]=8;for(He=144;256>He;++He)Ve[He]=9;for(He=256;280>He;++He)Ve[He]=7;for(He=280;288>He;++He)Ve[He]=8;var Me=new be(32);for(He=0;32>He;++He)Me[He]=5;var Ne=Ke(Ve,9,0),Pe=Ke(Ve,9,1),Ue=Ke(Me,5,0),Le=Ke(Me,5,1),We=e=>{for(var t=e[0],n=1;n<e.length;++n)e[n]>t&&(t=e[n]);return t},Fe=(e,t,n)=>{var r=t/8|0;return(e[r]|e[r+1]<<8)>>(7&t)&n},Oe=(e,t)=>{var n=t/8|0;return(e[n]|e[n+1]<<8|e[n+2]<<16)>>(7&t)},Ge=e=>(e+7)/8|0,Xe=(e,t,n)=>{(null==t||0>t)&&(t=0),(null==n||n>e.length)&&(n=e.length);var r=new(2==e.BYTES_PER_ELEMENT?_e:4==e.BYTES_PER_ELEMENT?Se:be)(n-t);return r.set(e.subarray(t,n)),r},Ye=["unexpected EOF","invalid block type","invalid length/literal","invalid distance","stream finished","no stream handler",,"no callback","invalid UTF-8 data","extra field too long","date not in range 1980-2099","filename too long","stream finishing","invalid zip data"],je=(e,t,n)=>{var s=new r(t||Ye[e]);if(s.code=e,r.captureStackTrace&&r.captureStackTrace(s,je),!n)throw s;return s},Je=(e,t,n)=>{n<<=7&t;var r=t/8|0;e[r]|=n,e[r+1]|=n>>>8},Qe=(e,t,n)=>{n<<=7&t;var r=t/8|0;e[r]|=n,e[r+1]|=n>>>8,e[r+2]|=n>>>16},Ze=(e,t)=>{for(var n=[],r=0;r<e.length;++r)e[r]&&n.push({s:r,f:e[r]});var s=n.length,a=n.slice();if(!s)return[at,0];if(1==s){var i=new be(n[0].s+1);return i[n[0].s]=1,[i,1]}n.sort(((e,t)=>e.f-t.f)),n.push({s:-1,f:25001});var o=n[0],l=n[1],c=0,f=1,h=2;for(n[0]={s:-1,f:o.f+l.f,l:o,r:l};f!=s-1;)o=n[n[c].f<n[h].f?c++:h++],l=n[c!=f&&n[c].f<n[h].f?c++:h++],n[f++]={s:-1,f:o.f+l.f,l:o,r:l};var u=a[0].s;for(r=1;s>r;++r)a[r].s>u&&(u=a[r].s);var p=new _e(u+1),d=$e(n[f-1],p,0);if(d>t){r=0;var g=0,w=d-t,v=1<<w;for(a.sort(((e,t)=>p[t.s]-p[e.s]||e.f-t.f));s>r;++r){var y=a[r].s;if(p[y]<=t)break;g+=v-(1<<d-p[y]),p[y]=t}for(g>>>=w;g>0;){var m=a[r].s;p[m]<t?g-=1<<t-p[m]++-1:++r}for(;r>=0&&g;--r){var b=a[r].s;p[b]==t&&(--p[b],++g)}d=t}return[new be(p),d]},$e=(e,t,r)=>-1==e.s?n.max($e(e.l,t,r+1),$e(e.r,t,r+1)):t[e.s]=r,et=e=>{for(var t=e.length;t&&!e[--t];);for(var n=new _e(++t),r=0,s=e[0],a=1,i=e=>{n[r++]=e},o=1;t>=o;++o)if(e[o]==s&&o!=t)++a;else{if(!s&&a>2){for(;a>138;a-=138)i(32754);a>2&&(i(a>10?a-11<<5|28690:a-3<<5|12305),a=0)}else if(a>3){for(i(s),--a;a>6;a-=6)i(8304);a>2&&(i(a-3<<5|8208),a=0)}for(;a--;)i(s);a=1,s=e[o]}return[n.subarray(0,r),t]},tt=(e,t)=>{for(var n=0,r=0;r<t.length;++r)n+=e[r]*t[r];return n},nt=(e,t,n)=>{var r=n.length,s=Ge(t+2);e[s]=255&r,e[s+1]=r>>>8,e[s+2]=255^e[s],e[s+3]=255^e[s+1];for(var a=0;r>a;++a)e[s+a+4]=n[a];return 8*(s+4+r)},rt=(e,t,n,r,s,a,i,o,l,c,f)=>{Je(t,f++,n),++s[256];for(var h=Ze(s,15),u=h[0],p=h[1],d=Ze(a,15),g=d[0],w=d[1],v=et(u),y=v[0],m=v[1],b=et(g),_=b[0],S=b[1],k=new _e(19),D=0;D<y.length;++D)k[31&y[D]]++;for(D=0;D<_.length;++D)k[31&_[D]]++;for(var z=Ze(k,7),I=z[0],C=z[1],E=19;E>4&&!I[ze[E-1]];--E);var T,R,x,A,B=c+5<<3,H=tt(s,Ve)+tt(a,Me)+i,q=tt(s,u)+tt(a,g)+i+14+3*E+tt(k,I)+(2*k[16]+3*k[17]+7*k[18]);if(H>=B&&q>=B)return nt(t,f,e.subarray(l,l+c));if(Je(t,f,1+(H>q)),f+=2,H>q){T=Ke(u,p,0),R=u,x=Ke(g,w,0),A=g;var K=Ke(I,C,0);for(Je(t,f,m-257),Je(t,f+5,S-1),Je(t,f+10,E-4),f+=14,D=0;E>D;++D)Je(t,f+3*D,I[ze[D]]);f+=3*E;for(var V=[y,_],M=0;2>M;++M){var N=V[M];for(D=0;D<N.length;++D){var P=31&N[D];Je(t,f,K[P]),f+=I[P],P>15&&(Je(t,f,N[D]>>>5&127),f+=N[D]>>>12)}}}else T=Ne,R=Ve,x=Ue,A=Me;for(D=0;o>D;++D)if(r[D]>255){P=r[D]>>>18&31,Qe(t,f,T[P+257]),f+=R[P+257],P>7&&(Je(t,f,r[D]>>>23&31),f+=ke[P]);var U=31&r[D];Qe(t,f,x[U]),f+=A[U],U>3&&(Qe(t,f,r[D]>>>5&8191),f+=De[U])}else Qe(t,f,T[r[D]]),f+=R[r[D]];return Qe(t,f,T[256]),f+R[256]},st=new Se([65540,131080,131088,131104,262176,1048704,1048832,2114560,2117632]),at=new be(0),it=function(){function e(e,t){t||"function"!=typeof e||(t=e,e={}),this.ondata=t,this.o=e||{}}return e.prototype.p=function(e,t){var r,s,a;this.ondata((a=!t,((e,t,r,s,a,i)=>{var o=e.length,l=new be(0+o+5*(1+n.ceil(o/7e3))+0),c=l.subarray(0,l.length-0),f=0;if(!t||8>o)for(var h=0;o>=h;h+=65535){var u=h+65535;o>u||(c[f>>3]=i),f=nt(c,f+1,e.subarray(h,u))}else{for(var p=st[t-1],d=p>>>13,g=8191&p,w=(1<<r)-1,v=new _e(32768),y=new _e(w+1),m=n.ceil(r/3),b=2*m,_=t=>(e[t]^e[t+1]<<m^e[t+2]<<b)&w,S=new Se(25e3),k=new _e(288),D=new _e(32),z=0,I=0,C=(h=0,0),E=0,T=0;o>h;++h){var R=_(h),x=32767&h,A=y[R];if(v[x]=A,y[R]=x,h>=E){var B=o-h;if((z>7e3||C>24576)&&B>423){f=rt(e,c,0,S,k,D,I,C,T,h-T,f),C=z=I=0,T=h;for(var H=0;286>H;++H)k[H]=0;for(H=0;30>H;++H)D[H]=0}var q=2,K=0,V=g,M=x-A&32767;if(B>2&&R==_(h-M))for(var N=n.min(d,B)-1,P=n.min(32767,h),U=n.min(258,B);P>=M&&--V&&x!=A;){if(e[h+q]==e[h+q-M]){for(var L=0;U>L&&e[h+L]==e[h+L-M];++L);if(L>q){if(q=L,K=M,L>N)break;var W=n.min(M,L-2),F=0;for(H=0;W>H;++H){var O=h-M+H+32768&32767,G=O-v[O]+32768&32767;G>F&&(F=G,A=O)}}}M+=(x=A)-(A=v[x])+32768&32767}if(K){S[C++]=268435456|Te[q]<<18|Ae[K];var X=31&Te[q],Y=31&Ae[K];I+=ke[X]+De[Y],++k[257+X],++D[Y],E=h+q,++z}else S[C++]=e[h],++k[e[h]]}}f=rt(e,c,i,S,k,D,I,C,T,h-T,f),!i&&7&f&&(f=nt(c,f+1,at))}return Xe(l,0,0+Ge(f)+0)})(r=e,null==(s=this.o).level?6:s.level,null==s.mem?n.ceil(1.5*n.max(8,n.min(13,n.log(r.length)))):12+s.mem,0,0,!a)),t)},e.prototype.push=function(e,t){this.ondata||je(5),this.d&&je(4),this.d=t,this.p(e,t||!1)},e}(),ot=function(){function e(e){this.s={},this.p=new be(0),this.ondata=e}return e.prototype.e=function(e){this.ondata||je(5),this.d&&je(4);var t=this.p.length,n=new be(t+e.length);n.set(this.p),n.set(e,t),this.p=n},e.prototype.c=function(e){this.d=this.s.i=e||!1;var t=this.s.b,r=((e,t,r)=>{var s=e.length;if(!s||r&&r.f&&!r.l)return t||new be(0);var a=!t||r,i=!r||r.i;r||(r={}),t||(t=new be(3*s));var o=e=>{var r=t.length;if(e>r){var s=new be(n.max(2*r,e));s.set(t),t=s}},l=r.f||0,c=r.p||0,f=r.b||0,h=r.l,u=r.d,p=r.m,d=r.n,g=8*s;do{if(!h){l=Fe(e,c,1);var w=Fe(e,c+1,3);if(c+=3,!w){var v=e[(E=Ge(c)+4)-4]|e[E-3]<<8,y=E+v;if(y>s){i&&je(0);break}a&&o(f+v),t.set(e.subarray(E,y),f),r.b=f+=v,r.p=c=8*y,r.f=l;continue}if(1==w)h=Pe,u=Le,p=9,d=5;else if(2==w){var m=Fe(e,c,31)+257,b=Fe(e,c+10,15)+4,_=m+Fe(e,c+5,31)+1;c+=14;for(var S=new be(_),k=new be(19),D=0;b>D;++D)k[ze[D]]=Fe(e,c+3*D,7);c+=3*b;var z=We(k),I=(1<<z)-1,C=Ke(k,z,1);for(D=0;_>D;){var E,T=C[Fe(e,c,I)];if(c+=15&T,16>(E=T>>>4))S[D++]=E;else{var R=0,x=0;for(16==E?(x=3+Fe(e,c,3),c+=2,R=S[D-1]):17==E?(x=3+Fe(e,c,7),c+=3):18==E&&(x=11+Fe(e,c,127),c+=7);x--;)S[D++]=R}}var A=S.subarray(0,m),B=S.subarray(m);p=We(A),d=We(B),h=Ke(A,p,1),u=Ke(B,d,1)}else je(1);if(c>g){i&&je(0);break}}a&&o(f+131072);for(var H=(1<<p)-1,q=(1<<d)-1,K=c;;K=c){var V=(R=h[Oe(e,c)&H])>>>4;if((c+=15&R)>g){i&&je(0);break}if(R||je(2),256>V)t[f++]=V;else{if(256==V){K=c,h=null;break}var M=V-254;if(V>264){var N=ke[D=V-257];M=Fe(e,c,(1<<N)-1)+Ee[D],c+=N}var P=u[Oe(e,c)&q],U=P>>>4;if(P||je(3),c+=15&P,B=xe[U],U>3&&(N=De[U],B+=Oe(e,c)&(1<<N)-1,c+=N),c>g){i&&je(0);break}a&&o(f+131072);for(var L=f+M;L>f;f+=4)t[f]=t[f-B],t[f+1]=t[f+1-B],t[f+2]=t[f+2-B],t[f+3]=t[f+3-B];f=L}}r.l=h,r.p=K,r.b=f,r.f=l,h&&(l=1,r.m=p,r.d=u,r.n=d)}while(!l);return f==t.length?t:Xe(t,0,f)})(this.p,this.o,this.s);this.ondata(Xe(r,t,this.s.b),this.d),this.o=Xe(r,this.s.b-32768),this.s.b=this.o.length,this.p=Xe(this.p,this.s.p/8|0),this.s.p&=7},e.prototype.push=function(e,t){this.e(e),this.c(t)},e}(),lt="undefined"!=typeof TextDecoder&&new TextDecoder;try{lt.decode(at,{stream:!0})}catch(e){}function ct(e,n,r){return class{constructor(a){const i=this;t.hasOwn(a,"level")&&void 0===a.level&&delete a.level,i.codec=new e(t.assign({},n,a)),r(i.codec,(e=>{if(i.pendingData){const t=i.pendingData;i.pendingData=new s(t.length+e.length);const{pendingData:n}=i;n.set(t,0),n.set(e,t.length)}else i.pendingData=new s(e)}))}append(e){return this.codec.push(e),a(this)}flush(){return this.codec.push(new s,!0),a(this)}};function a(e){if(e.pendingData){const t=e.pendingData;return e.pendingData=null,t}return new s}}const{Deflate:ft,Inflate:ht}=((e,t={},n)=>({Deflate:ct(e.Deflate,t.deflate,n),Inflate:ct(e.Inflate,t.inflate,n)}))({Deflate:it,Inflate:ot},void 0,((e,t)=>e.ondata=t));self.initCodec=()=>{self.Deflate=ft,self.Inflate=ht};\n'],{type:"text/javascript"}));e({workerScripts:{inflate:[t],deflate:[t]}});}

	/*
	 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */

	function getMimeType() {
		return "application/octet-stream";
	}

	function initShimAsyncCodec(library, options = {}, registerDataHandler) {
		return {
			Deflate: createCodecClass(library.Deflate, options.deflate, registerDataHandler),
			Inflate: createCodecClass(library.Inflate, options.inflate, registerDataHandler)
		};
	}

	function createCodecClass(constructor, constructorOptions, registerDataHandler) {
		return class {

			constructor(options) {
				const codecAdapter = this;
				const onData = data => {
					if (codecAdapter.pendingData) {
						const previousPendingData = codecAdapter.pendingData;
						codecAdapter.pendingData = new Uint8Array$1(previousPendingData.length + data.length);
						const { pendingData } = codecAdapter;
						pendingData.set(previousPendingData, 0);
						pendingData.set(data, previousPendingData.length);
					} else {
						codecAdapter.pendingData = new Uint8Array$1(data);
					}
				};
				if (Object$1.hasOwn(options, "level") && options.level === undefined) {
					delete options.level;
				}
				codecAdapter.codec = new constructor(Object$1.assign({}, constructorOptions, options));
				registerDataHandler(codecAdapter.codec, onData);
			}
			append(data) {
				this.codec.push(data);
				return getResponse(this);
			}
			flush() {
				this.codec.push(new Uint8Array$1(), true);
				return getResponse(this);
			}
		};

		function getResponse(codec) {
			if (codec.pendingData) {
				const output = codec.pendingData;
				codec.pendingData = null;
				return output;
			} else {
				return new Uint8Array$1();
			}
		}
	}

	/*
	 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */

	const table = [];
	for (let i = 0; i < 256; i++) {
		let t = i;
		for (let j = 0; j < 8; j++) {
			if (t & 1) {
				t = (t >>> 1) ^ 0xEDB88320;
			} else {
				t = t >>> 1;
			}
		}
		table[i] = t;
	}

	class Crc32 {

		constructor(crc) {
			this.crc = crc || -1;
		}

		append(data) {
			let crc = this.crc | 0;
			for (let offset = 0, length = data.length | 0; offset < length; offset++) {
				crc = (crc >>> 8) ^ table[(crc ^ data[offset]) & 0xFF];
			}
			this.crc = crc;
		}

		get() {
			return ~this.crc;
		}
	}

	/*
	 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */

	class Crc32Stream extends TransformStream {

		constructor() {
			const crc32 = new Crc32();
			super({
				transform(chunk) {
					crc32.append(chunk);
				},
				flush(controller) {
					const value = new Uint8Array$1(4);
					const dataView = new DataView(value.buffer);
					dataView.setUint32(0, crc32.get());
					controller.enqueue(value);
				}
			});
		}
	}

	/*
	 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */

	function encodeText(value) {
		if (typeof TextEncoder == "undefined") {
			value = unescape(encodeURIComponent(value));
			const result = new Uint8Array$1(value.length);
			for (let i = 0; i < result.length; i++) {
				result[i] = value.charCodeAt(i);
			}
			return result;
		} else {
			return new TextEncoder().encode(value);
		}
	}

	// Derived from https://github.com/xqdoo00o/jszip/blob/master/lib/sjcl.js and https://github.com/bitwiseshiftleft/sjcl

	// deno-lint-ignore-file no-this-alias

	/*
	 * SJCL is open. You can use, modify and redistribute it under a BSD
	 * license or under the GNU GPL, version 2.0.
	 */

	/** @fileOverview Javascript cryptography implementation.
	 *
	 * Crush to remove comments, shorten variable names and
	 * generally reduce transmission size.
	 *
	 * @author Emily Stark
	 * @author Mike Hamburg
	 * @author Dan Boneh
	 */

	/*jslint indent: 2, bitwise: false, nomen: false, plusplus: false, white: false, regexp: false */

	/** @fileOverview Arrays of bits, encoded as arrays of Numbers.
	 *
	 * @author Emily Stark
	 * @author Mike Hamburg
	 * @author Dan Boneh
	 */

	/**
	 * Arrays of bits, encoded as arrays of Numbers.
	 * @namespace
	 * @description
	 * <p>
	 * These objects are the currency accepted by SJCL's crypto functions.
	 * </p>
	 *
	 * <p>
	 * Most of our crypto primitives operate on arrays of 4-byte words internally,
	 * but many of them can take arguments that are not a multiple of 4 bytes.
	 * This library encodes arrays of bits (whose size need not be a multiple of 8
	 * bits) as arrays of 32-bit words.  The bits are packed, big-endian, into an
	 * array of words, 32 bits at a time.  Since the words are double-precision
	 * floating point numbers, they fit some extra data.  We use this (in a private,
	 * possibly-changing manner) to encode the number of bits actually  present
	 * in the last word of the array.
	 * </p>
	 *
	 * <p>
	 * Because bitwise ops clear this out-of-band data, these arrays can be passed
	 * to ciphers like AES which want arrays of words.
	 * </p>
	 */
	const bitArray = {
		/**
		 * Concatenate two bit arrays.
		 * @param {bitArray} a1 The first array.
		 * @param {bitArray} a2 The second array.
		 * @return {bitArray} The concatenation of a1 and a2.
		 */
		concat(a1, a2) {
			if (a1.length === 0 || a2.length === 0) {
				return a1.concat(a2);
			}

			const last = a1[a1.length - 1], shift = bitArray.getPartial(last);
			if (shift === 32) {
				return a1.concat(a2);
			} else {
				return bitArray._shiftRight(a2, shift, last | 0, a1.slice(0, a1.length - 1));
			}
		},

		/**
		 * Find the length of an array of bits.
		 * @param {bitArray} a The array.
		 * @return {Number} The length of a, in bits.
		 */
		bitLength(a) {
			const l = a.length;
			if (l === 0) {
				return 0;
			}
			const x = a[l - 1];
			return (l - 1) * 32 + bitArray.getPartial(x);
		},

		/**
		 * Truncate an array.
		 * @param {bitArray} a The array.
		 * @param {Number} len The length to truncate to, in bits.
		 * @return {bitArray} A new array, truncated to len bits.
		 */
		clamp(a, len) {
			if (a.length * 32 < len) {
				return a;
			}
			a = a.slice(0, Math$1.ceil(len / 32));
			const l = a.length;
			len = len & 31;
			if (l > 0 && len) {
				a[l - 1] = bitArray.partial(len, a[l - 1] & 0x80000000 >> (len - 1), 1);
			}
			return a;
		},

		/**
		 * Make a partial word for a bit array.
		 * @param {Number} len The number of bits in the word.
		 * @param {Number} x The bits.
		 * @param {Number} [_end=0] Pass 1 if x has already been shifted to the high side.
		 * @return {Number} The partial word.
		 */
		partial(len, x, _end) {
			if (len === 32) {
				return x;
			}
			return (_end ? x | 0 : x << (32 - len)) + len * 0x10000000000;
		},

		/**
		 * Get the number of bits used by a partial word.
		 * @param {Number} x The partial word.
		 * @return {Number} The number of bits used by the partial word.
		 */
		getPartial(x) {
			return Math$1.round(x / 0x10000000000) || 32;
		},

		/** Shift an array right.
		 * @param {bitArray} a The array to shift.
		 * @param {Number} shift The number of bits to shift.
		 * @param {Number} [carry=0] A byte to carry in
		 * @param {bitArray} [out=[]] An array to prepend to the output.
		 * @private
		 */
		_shiftRight(a, shift, carry, out) {
			if (out === undefined) {
				out = [];
			}

			for (; shift >= 32; shift -= 32) {
				out.push(carry);
				carry = 0;
			}
			if (shift === 0) {
				return out.concat(a);
			}

			for (let i = 0; i < a.length; i++) {
				out.push(carry | a[i] >>> shift);
				carry = a[i] << (32 - shift);
			}
			const last2 = a.length ? a[a.length - 1] : 0;
			const shift2 = bitArray.getPartial(last2);
			out.push(bitArray.partial(shift + shift2 & 31, (shift + shift2 > 32) ? carry : out.pop(), 1));
			return out;
		}
	};

	/** @fileOverview Bit array codec implementations.
	 *
	 * @author Emily Stark
	 * @author Mike Hamburg
	 * @author Dan Boneh
	 */

	/**
	 * Arrays of bytes
	 * @namespace
	 */
	const codec = {
		bytes: {
			/** Convert from a bitArray to an array of bytes. */
			fromBits(arr) {
				const bl = bitArray.bitLength(arr);
				const byteLength = bl / 8;
				const out = new Uint8Array$1(byteLength);
				let tmp;
				for (let i = 0; i < byteLength; i++) {
					if ((i & 3) === 0) {
						tmp = arr[i / 4];
					}
					out[i] = tmp >>> 24;
					tmp <<= 8;
				}
				return out;
			},
			/** Convert from an array of bytes to a bitArray. */
			toBits(bytes) {
				const out = [];
				let i;
				let tmp = 0;
				for (i = 0; i < bytes.length; i++) {
					tmp = tmp << 8 | bytes[i];
					if ((i & 3) === 3) {
						out.push(tmp);
						tmp = 0;
					}
				}
				if (i & 3) {
					out.push(bitArray.partial(8 * (i & 3), tmp));
				}
				return out;
			}
		}
	};

	const hash = {};

	/**
	 * Context for a SHA-1 operation in progress.
	 * @constructor
	 */
	hash.sha1 = class {
		constructor(hash) {
			const sha1 = this;
			/**
			 * The hash's block size, in bits.
			 * @constant
			 */
			sha1.blockSize = 512;
			/**
			 * The SHA-1 initialization vector.
			 * @private
			 */
			sha1._init = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];
			/**
			 * The SHA-1 hash key.
			 * @private
			 */
			sha1._key = [0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xCA62C1D6];
			if (hash) {
				sha1._h = hash._h.slice(0);
				sha1._buffer = hash._buffer.slice(0);
				sha1._length = hash._length;
			} else {
				sha1.reset();
			}
		}

		/**
		 * Reset the hash state.
		 * @return this
		 */
		reset() {
			const sha1 = this;
			sha1._h = sha1._init.slice(0);
			sha1._buffer = [];
			sha1._length = 0;
			return sha1;
		}

		/**
		 * Input several words to the hash.
		 * @param {bitArray|String} data the data to hash.
		 * @return this
		 */
		update(data) {
			const sha1 = this;
			if (typeof data === "string") {
				data = codec.utf8String.toBits(data);
			}
			const b = sha1._buffer = bitArray.concat(sha1._buffer, data);
			const ol = sha1._length;
			const nl = sha1._length = ol + bitArray.bitLength(data);
			if (nl > 9007199254740991) {
				throw new Error("Cannot hash more than 2^53 - 1 bits");
			}
			const c = new Uint32Array(b);
			let j = 0;
			for (let i = sha1.blockSize + ol - ((sha1.blockSize + ol) & (sha1.blockSize - 1)); i <= nl;
				i += sha1.blockSize) {
				sha1._block(c.subarray(16 * j, 16 * (j + 1)));
				j += 1;
			}
			b.splice(0, 16 * j);
			return sha1;
		}

		/**
		 * Complete hashing and output the hash value.
		 * @return {bitArray} The hash value, an array of 5 big-endian words. TODO
		 */
		finalize() {
			const sha1 = this;
			let b = sha1._buffer;
			const h = sha1._h;

			// Round out and push the buffer
			b = bitArray.concat(b, [bitArray.partial(1, 1)]);
			// Round out the buffer to a multiple of 16 words, less the 2 length words.
			for (let i = b.length + 2; i & 15; i++) {
				b.push(0);
			}

			// append the length
			b.push(Math$1.floor(sha1._length / 0x100000000));
			b.push(sha1._length | 0);

			while (b.length) {
				sha1._block(b.splice(0, 16));
			}

			sha1.reset();
			return h;
		}

		/**
		 * The SHA-1 logical functions f(0), f(1), ..., f(79).
		 * @private
		 */
		_f(t, b, c, d) {
			if (t <= 19) {
				return (b & c) | (~b & d);
			} else if (t <= 39) {
				return b ^ c ^ d;
			} else if (t <= 59) {
				return (b & c) | (b & d) | (c & d);
			} else if (t <= 79) {
				return b ^ c ^ d;
			}
		}

		/**
		 * Circular left-shift operator.
		 * @private
		 */
		_S(n, x) {
			return (x << n) | (x >>> 32 - n);
		}

		/**
		 * Perform one cycle of SHA-1.
		 * @param {Uint32Array|bitArray} words one block of words.
		 * @private
		 */
		_block(words) {
			const sha1 = this;
			const h = sha1._h;
			// When words is passed to _block, it has 16 elements. SHA1 _block
			// function extends words with new elements (at the end there are 80 elements). 
			// The problem is that if we use Uint32Array instead of Array, 
			// the length of Uint32Array cannot be changed. Thus, we replace words with a 
			// normal Array here.
			const w = Array$1(80); // do not use Uint32Array here as the instantiation is slower
			for (let j = 0; j < 16; j++) {
				w[j] = words[j];
			}

			let a = h[0];
			let b = h[1];
			let c = h[2];
			let d = h[3];
			let e = h[4];

			for (let t = 0; t <= 79; t++) {
				if (t >= 16) {
					w[t] = sha1._S(1, w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16]);
				}
				const tmp = (sha1._S(5, a) + sha1._f(t, b, c, d) + e + w[t] +
					sha1._key[Math$1.floor(t / 20)]) | 0;
				e = d;
				d = c;
				c = sha1._S(30, b);
				b = a;
				a = tmp;
			}

			h[0] = (h[0] + a) | 0;
			h[1] = (h[1] + b) | 0;
			h[2] = (h[2] + c) | 0;
			h[3] = (h[3] + d) | 0;
			h[4] = (h[4] + e) | 0;
		}
	};

	/** @fileOverview Low-level AES implementation.
	 *
	 * This file contains a low-level implementation of AES, optimized for
	 * size and for efficiency on several browsers.  It is based on
	 * OpenSSL's aes_core.c, a public-domain implementation by Vincent
	 * Rijmen, Antoon Bosselaers and Paulo Barreto.
	 *
	 * An older version of this implementation is available in the public
	 * domain, but this one is (c) Emily Stark, Mike Hamburg, Dan Boneh,
	 * Stanford University 2008-2010 and BSD-licensed for liability
	 * reasons.
	 *
	 * @author Emily Stark
	 * @author Mike Hamburg
	 * @author Dan Boneh
	 */

	const cipher = {};

	/**
	 * Schedule out an AES key for both encryption and decryption.  This
	 * is a low-level class.  Use a cipher mode to do bulk encryption.
	 *
	 * @constructor
	 * @param {Array} key The key as an array of 4, 6 or 8 words.
	 */
	cipher.aes = class {
		constructor(key) {
			/**
			 * The expanded S-box and inverse S-box tables.  These will be computed
			 * on the client so that we don't have to send them down the wire.
			 *
			 * There are two tables, _tables[0] is for encryption and
			 * _tables[1] is for decryption.
			 *
			 * The first 4 sub-tables are the expanded S-box with MixColumns.  The
			 * last (_tables[01][4]) is the S-box itself.
			 *
			 * @private
			 */
			const aes = this;
			aes._tables = [[[], [], [], [], []], [[], [], [], [], []]];

			if (!aes._tables[0][0][0]) {
				aes._precompute();
			}

			const sbox = aes._tables[0][4];
			const decTable = aes._tables[1];
			const keyLen = key.length;

			let i, encKey, decKey, rcon = 1;

			if (keyLen !== 4 && keyLen !== 6 && keyLen !== 8) {
				throw new Error("invalid aes key size");
			}

			aes._key = [encKey = key.slice(0), decKey = []];

			// schedule encryption keys
			for (i = keyLen; i < 4 * keyLen + 28; i++) {
				let tmp = encKey[i - 1];

				// apply sbox
				if (i % keyLen === 0 || (keyLen === 8 && i % keyLen === 4)) {
					tmp = sbox[tmp >>> 24] << 24 ^ sbox[tmp >> 16 & 255] << 16 ^ sbox[tmp >> 8 & 255] << 8 ^ sbox[tmp & 255];

					// shift rows and add rcon
					if (i % keyLen === 0) {
						tmp = tmp << 8 ^ tmp >>> 24 ^ rcon << 24;
						rcon = rcon << 1 ^ (rcon >> 7) * 283;
					}
				}

				encKey[i] = encKey[i - keyLen] ^ tmp;
			}

			// schedule decryption keys
			for (let j = 0; i; j++, i--) {
				const tmp = encKey[j & 3 ? i : i - 4];
				if (i <= 4 || j < 4) {
					decKey[j] = tmp;
				} else {
					decKey[j] = decTable[0][sbox[tmp >>> 24]] ^
						decTable[1][sbox[tmp >> 16 & 255]] ^
						decTable[2][sbox[tmp >> 8 & 255]] ^
						decTable[3][sbox[tmp & 255]];
				}
			}
		}
		// public
		/* Something like this might appear here eventually
		name: "AES",
		blockSize: 4,
		keySizes: [4,6,8],
		*/

		/**
		 * Encrypt an array of 4 big-endian words.
		 * @param {Array} data The plaintext.
		 * @return {Array} The ciphertext.
		 */
		encrypt(data) {
			return this._crypt(data, 0);
		}

		/**
		 * Decrypt an array of 4 big-endian words.
		 * @param {Array} data The ciphertext.
		 * @return {Array} The plaintext.
		 */
		decrypt(data) {
			return this._crypt(data, 1);
		}

		/**
		 * Expand the S-box tables.
		 *
		 * @private
		 */
		_precompute() {
			const encTable = this._tables[0];
			const decTable = this._tables[1];
			const sbox = encTable[4];
			const sboxInv = decTable[4];
			const d = [];
			const th = [];
			let xInv, x2, x4, x8;

			// Compute double and third tables
			for (let i = 0; i < 256; i++) {
				th[(d[i] = i << 1 ^ (i >> 7) * 283) ^ i] = i;
			}

			for (let x = xInv = 0; !sbox[x]; x ^= x2 || 1, xInv = th[xInv] || 1) {
				// Compute sbox
				let s = xInv ^ xInv << 1 ^ xInv << 2 ^ xInv << 3 ^ xInv << 4;
				s = s >> 8 ^ s & 255 ^ 99;
				sbox[x] = s;
				sboxInv[s] = x;

				// Compute MixColumns
				x8 = d[x4 = d[x2 = d[x]]];
				let tDec = x8 * 0x1010101 ^ x4 * 0x10001 ^ x2 * 0x101 ^ x * 0x1010100;
				let tEnc = d[s] * 0x101 ^ s * 0x1010100;

				for (let i = 0; i < 4; i++) {
					encTable[i][x] = tEnc = tEnc << 24 ^ tEnc >>> 8;
					decTable[i][s] = tDec = tDec << 24 ^ tDec >>> 8;
				}
			}

			// Compactify.  Considerable speedup on Firefox.
			for (let i = 0; i < 5; i++) {
				encTable[i] = encTable[i].slice(0);
				decTable[i] = decTable[i].slice(0);
			}
		}

		/**
		 * Encryption and decryption core.
		 * @param {Array} input Four words to be encrypted or decrypted.
		 * @param dir The direction, 0 for encrypt and 1 for decrypt.
		 * @return {Array} The four encrypted or decrypted words.
		 * @private
		 */
		_crypt(input, dir) {
			if (input.length !== 4) {
				throw new Error("invalid aes block size");
			}

			const key = this._key[dir];

			const nInnerRounds = key.length / 4 - 2;
			const out = [0, 0, 0, 0];
			const table = this._tables[dir];

			// load up the tables
			const t0 = table[0];
			const t1 = table[1];
			const t2 = table[2];
			const t3 = table[3];
			const sbox = table[4];

			// state variables a,b,c,d are loaded with pre-whitened data
			let a = input[0] ^ key[0];
			let b = input[dir ? 3 : 1] ^ key[1];
			let c = input[2] ^ key[2];
			let d = input[dir ? 1 : 3] ^ key[3];
			let kIndex = 4;
			let a2, b2, c2;

			// Inner rounds.  Cribbed from OpenSSL.
			for (let i = 0; i < nInnerRounds; i++) {
				a2 = t0[a >>> 24] ^ t1[b >> 16 & 255] ^ t2[c >> 8 & 255] ^ t3[d & 255] ^ key[kIndex];
				b2 = t0[b >>> 24] ^ t1[c >> 16 & 255] ^ t2[d >> 8 & 255] ^ t3[a & 255] ^ key[kIndex + 1];
				c2 = t0[c >>> 24] ^ t1[d >> 16 & 255] ^ t2[a >> 8 & 255] ^ t3[b & 255] ^ key[kIndex + 2];
				d = t0[d >>> 24] ^ t1[a >> 16 & 255] ^ t2[b >> 8 & 255] ^ t3[c & 255] ^ key[kIndex + 3];
				kIndex += 4;
				a = a2; b = b2; c = c2;
			}

			// Last round.
			for (let i = 0; i < 4; i++) {
				out[dir ? 3 & -i : i] =
					sbox[a >>> 24] << 24 ^
					sbox[b >> 16 & 255] << 16 ^
					sbox[c >> 8 & 255] << 8 ^
					sbox[d & 255] ^
					key[kIndex++];
				a2 = a; a = b; b = c; c = d; d = a2;
			}

			return out;
		}
	};

	/**
	 * Random values
	 * @namespace
	 */
	const random = {
		/** 
		 * Generate random words with pure js, cryptographically not as strong & safe as native implementation.
		 * @param {TypedArray} typedArray The array to fill.
		 * @return {TypedArray} The random values.
		 */
		getRandomValues(typedArray) {
			const words = new Uint32Array(typedArray.buffer);
			const r = (m_w) => {
				let m_z = 0x3ade68b1;
				const mask = 0xffffffff;
				return function () {
					m_z = (0x9069 * (m_z & 0xFFFF) + (m_z >> 0x10)) & mask;
					m_w = (0x4650 * (m_w & 0xFFFF) + (m_w >> 0x10)) & mask;
					const result = ((((m_z << 0x10) + m_w) & mask) / 0x100000000) + .5;
					return result * (Math$1.random() > .5 ? 1 : -1);
				};
			};
			for (let i = 0, rcache; i < typedArray.length; i += 4) {
				const _r = r((rcache || Math$1.random()) * 0x100000000);
				rcache = _r() * 0x3ade67b7;
				words[i / 4] = (_r() * 0x100000000) | 0;
			}
			return typedArray;
		}
	};

	/** @fileOverview CTR mode implementation.
	 *
	 * Special thanks to Roy Nicholson for pointing out a bug in our
	 * implementation.
	 *
	 * @author Emily Stark
	 * @author Mike Hamburg
	 * @author Dan Boneh
	 */

	/** Brian Gladman's CTR Mode.
	* @constructor
	* @param {Object} _prf The aes instance to generate key.
	* @param {bitArray} _iv The iv for ctr mode, it must be 128 bits.
	*/

	const mode = {};

	/**
	 * Brian Gladman's CTR Mode.
	 * @namespace
	 */
	mode.ctrGladman = class {
		constructor(prf, iv) {
			this._prf = prf;
			this._initIv = iv;
			this._iv = iv;
		}

		reset() {
			this._iv = this._initIv;
		}

		/** Input some data to calculate.
		 * @param {bitArray} data the data to process, it must be intergral multiple of 128 bits unless it's the last.
		 */
		update(data) {
			return this.calculate(this._prf, data, this._iv);
		}

		incWord(word) {
			if (((word >> 24) & 0xff) === 0xff) { //overflow
				let b1 = (word >> 16) & 0xff;
				let b2 = (word >> 8) & 0xff;
				let b3 = word & 0xff;

				if (b1 === 0xff) { // overflow b1   
					b1 = 0;
					if (b2 === 0xff) {
						b2 = 0;
						if (b3 === 0xff) {
							b3 = 0;
						} else {
							++b3;
						}
					} else {
						++b2;
					}
				} else {
					++b1;
				}

				word = 0;
				word += (b1 << 16);
				word += (b2 << 8);
				word += b3;
			} else {
				word += (0x01 << 24);
			}
			return word;
		}

		incCounter(counter) {
			if ((counter[0] = this.incWord(counter[0])) === 0) {
				// encr_data in fileenc.c from  Dr Brian Gladman's counts only with DWORD j < 8
				counter[1] = this.incWord(counter[1]);
			}
		}

		calculate(prf, data, iv) {
			let l;
			if (!(l = data.length)) {
				return [];
			}
			const bl = bitArray.bitLength(data);
			for (let i = 0; i < l; i += 4) {
				this.incCounter(iv);
				const e = prf.encrypt(iv);
				data[i] ^= e[0];
				data[i + 1] ^= e[1];
				data[i + 2] ^= e[2];
				data[i + 3] ^= e[3];
			}
			return bitArray.clamp(data, bl);
		}
	};

	const misc = {
		importKey(password) {
			return new misc.hmacSha1(codec.bytes.toBits(password));
		},
		pbkdf2(prf, salt, count, length) {
			count = count || 10000;
			if (length < 0 || count < 0) {
				throw new Error("invalid params to pbkdf2");
			}
			const byteLength = ((length >> 5) + 1) << 2;
			let u, ui, i, j, k;
			const arrayBuffer = new ArrayBuffer(byteLength);
			const out = new DataView(arrayBuffer);
			let outLength = 0;
			const b = bitArray;
			salt = codec.bytes.toBits(salt);
			for (k = 1; outLength < (byteLength || 1); k++) {
				u = ui = prf.encrypt(b.concat(salt, [k]));
				for (i = 1; i < count; i++) {
					ui = prf.encrypt(ui);
					for (j = 0; j < ui.length; j++) {
						u[j] ^= ui[j];
					}
				}
				for (i = 0; outLength < (byteLength || 1) && i < u.length; i++) {
					out.setInt32(outLength, u[i]);
					outLength += 4;
				}
			}
			return arrayBuffer.slice(0, length / 8);
		}
	};

	/** @fileOverview HMAC implementation.
	 *
	 * @author Emily Stark
	 * @author Mike Hamburg
	 * @author Dan Boneh
	 */

	/** HMAC with the specified hash function.
	 * @constructor
	 * @param {bitArray} key the key for HMAC.
	 * @param {Object} [Hash=hash.sha1] The hash function to use.
	 */
	misc.hmacSha1 = class {

		constructor(key) {
			const hmac = this;
			const Hash = hmac._hash = hash.sha1;
			const exKey = [[], []];
			hmac._baseHash = [new Hash(), new Hash()];
			const bs = hmac._baseHash[0].blockSize / 32;

			if (key.length > bs) {
				key = Hash.hash(key);
			}

			for (let i = 0; i < bs; i++) {
				exKey[0][i] = key[i] ^ 0x36363636;
				exKey[1][i] = key[i] ^ 0x5C5C5C5C;
			}

			hmac._baseHash[0].update(exKey[0]);
			hmac._baseHash[1].update(exKey[1]);
			hmac._resultHash = new Hash(hmac._baseHash[0]);
		}
		reset() {
			const hmac = this;
			hmac._resultHash = new hmac._hash(hmac._baseHash[0]);
			hmac._updated = false;
		}

		update(data) {
			const hmac = this;
			hmac._updated = true;
			hmac._resultHash.update(data);
		}

		digest() {
			const hmac = this;
			const w = hmac._resultHash.finalize();
			const result = new (hmac._hash)(hmac._baseHash[1]).update(w).finalize();

			hmac.reset();

			return result;
		}

		encrypt(data) {
			if (!this._updated) {
				this.update(data);
				return this.digest(data);
			} else {
				throw new Error("encrypt on already updated hmac called!");
			}
		}
	};

	/*
	 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */

	/* global crypto */

	const GET_RANDOM_VALUES_SUPPORTED = typeof crypto != "undefined" && typeof crypto.getRandomValues == "function";

	const ERR_INVALID_PASSWORD = "Invalid password";
	const ERR_INVALID_SIGNATURE = "Invalid signature";

	function getRandomValues(array) {
		if (GET_RANDOM_VALUES_SUPPORTED) {
			return crypto.getRandomValues(array);
		} else {
			return random.getRandomValues(array);
		}
	}

	/*
	 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */

	const BLOCK_LENGTH = 16;
	const RAW_FORMAT = "raw";
	const PBKDF2_ALGORITHM = { name: "PBKDF2" };
	const HASH_ALGORITHM = { name: "HMAC" };
	const HASH_FUNCTION = "SHA-1";
	const BASE_KEY_ALGORITHM = Object$1.assign({ hash: HASH_ALGORITHM }, PBKDF2_ALGORITHM);
	const DERIVED_BITS_ALGORITHM = Object$1.assign({ iterations: 1000, hash: { name: HASH_FUNCTION } }, PBKDF2_ALGORITHM);
	const DERIVED_BITS_USAGE = ["deriveBits"];
	const SALT_LENGTH = [8, 12, 16];
	const KEY_LENGTH = [16, 24, 32];
	const SIGNATURE_LENGTH = 10;
	const COUNTER_DEFAULT_VALUE = [0, 0, 0, 0];
	const UNDEFINED_TYPE = "undefined";
	const FUNCTION_TYPE = "function";
	// deno-lint-ignore valid-typeof
	const CRYPTO_API_SUPPORTED = typeof crypto != UNDEFINED_TYPE;
	const subtle = CRYPTO_API_SUPPORTED && crypto.subtle;
	const SUBTLE_API_SUPPORTED = CRYPTO_API_SUPPORTED && typeof subtle != UNDEFINED_TYPE;
	const codecBytes = codec.bytes;
	const Aes = cipher.aes;
	const CtrGladman = mode.ctrGladman;
	const HmacSha1 = misc.hmacSha1;

	let IMPORT_KEY_SUPPORTED = CRYPTO_API_SUPPORTED && SUBTLE_API_SUPPORTED && typeof subtle.importKey == FUNCTION_TYPE;
	let DERIVE_BITS_SUPPORTED = CRYPTO_API_SUPPORTED && SUBTLE_API_SUPPORTED && typeof subtle.deriveBits == FUNCTION_TYPE;

	class AESDecryptionStream extends TransformStream {

		constructor({ password, signed, encryptionStrength }) {
			super({
				start() {
					Object$1.assign(this, {
						ready: new Promise$1(resolve => this.resolveReady = resolve),
						password,
						signed,
						strength: encryptionStrength - 1,
						pending: new Uint8Array$1()
					});
				},
				async transform(chunk, controller) {
					const aesCrypto = this;
					const {
						password,
						strength,
						resolveReady,
						ready
					} = aesCrypto;
					if (password) {
						await createDecryptionKeys(aesCrypto, strength, password, subarray(chunk, 0, SALT_LENGTH[strength] + 2));
						chunk = subarray(chunk, SALT_LENGTH[strength] + 2);
						resolveReady();
					} else {
						await ready;
					}
					const output = new Uint8Array$1(chunk.length - SIGNATURE_LENGTH - ((chunk.length - SIGNATURE_LENGTH) % BLOCK_LENGTH));
					controller.enqueue(append(aesCrypto, chunk, output, 0, SIGNATURE_LENGTH, true));
				},
				async flush(controller) {
					const {
						signed,
						ctr,
						hmac,
						pending,
						ready
					} = this;
					await ready;
					const chunkToDecrypt = subarray(pending, 0, pending.length - SIGNATURE_LENGTH);
					const originalSignature = subarray(pending, pending.length - SIGNATURE_LENGTH);
					let decryptedChunkArray = new Uint8Array$1();
					if (chunkToDecrypt.length) {
						const encryptedChunk = toBits(codecBytes, chunkToDecrypt);
						hmac.update(encryptedChunk);
						const decryptedChunk = ctr.update(encryptedChunk);
						decryptedChunkArray = fromBits(codecBytes, decryptedChunk);
					}
					if (signed) {
						const signature = subarray(fromBits(codecBytes, hmac.digest()), 0, SIGNATURE_LENGTH);
						for (let indexSignature = 0; indexSignature < SIGNATURE_LENGTH; indexSignature++) {
							if (signature[indexSignature] != originalSignature[indexSignature]) {
								throw new Error(ERR_INVALID_SIGNATURE);
							}
						}
					}
					controller.enqueue(decryptedChunkArray);
				}
			});
		}
	}

	class AESEncryptionStream extends TransformStream {

		constructor({ password, encryptionStrength }) {
			// deno-lint-ignore prefer-const
			let stream;
			super({
				start() {
					Object$1.assign(this, {
						ready: new Promise$1(resolve => this.resolveReady = resolve),
						password,
						strength: encryptionStrength - 1,
						pending: new Uint8Array$1()
					});
				},
				async transform(chunk, controller) {
					const aesCrypto = this;
					const {
						password,
						strength,
						resolveReady,
						ready
					} = aesCrypto;
					let preamble = new Uint8Array$1();
					if (password) {
						preamble = await createEncryptionKeys(aesCrypto, strength, password);
						resolveReady();
					} else {
						await ready;
					}
					const output = new Uint8Array$1(preamble.length + chunk.length - (chunk.length % BLOCK_LENGTH));
					output.set(preamble, 0);
					controller.enqueue(append(aesCrypto, chunk, output, preamble.length, 0));
				},
				async flush(controller) {
					const {
						ctr,
						hmac,
						pending,
						ready
					} = this;
					await ready;
					let encryptedChunkArray = new Uint8Array$1();
					if (pending.length) {
						const encryptedChunk = ctr.update(toBits(codecBytes, pending));
						hmac.update(encryptedChunk);
						encryptedChunkArray = fromBits(codecBytes, encryptedChunk);
					}
					stream.signature = fromBits(codecBytes, hmac.digest()).slice(0, SIGNATURE_LENGTH);
					controller.enqueue(concat(encryptedChunkArray, stream.signature));
				}
			});
			stream = this;
		}
	}

	function append(aesCrypto, input, output, paddingStart, paddingEnd, verifySignature) {
		const {
			ctr,
			hmac,
			pending
		} = aesCrypto;
		const inputLength = input.length - paddingEnd;
		if (pending.length) {
			input = concat(pending, input);
			output = expand(output, inputLength - (inputLength % BLOCK_LENGTH));
		}
		let offset;
		for (offset = 0; offset <= inputLength - BLOCK_LENGTH; offset += BLOCK_LENGTH) {
			const inputChunk = toBits(codecBytes, subarray(input, offset, offset + BLOCK_LENGTH));
			if (verifySignature) {
				hmac.update(inputChunk);
			}
			const outputChunk = ctr.update(inputChunk);
			if (!verifySignature) {
				hmac.update(outputChunk);
			}
			output.set(fromBits(codecBytes, outputChunk), offset + paddingStart);
		}
		aesCrypto.pending = subarray(input, offset);
		return output;
	}

	async function createDecryptionKeys(decrypt, strength, password, preamble) {
		const passwordVerificationKey = await createKeys$1(decrypt, strength, password, subarray(preamble, 0, SALT_LENGTH[strength]));
		const passwordVerification = subarray(preamble, SALT_LENGTH[strength]);
		if (passwordVerificationKey[0] != passwordVerification[0] || passwordVerificationKey[1] != passwordVerification[1]) {
			throw new Error(ERR_INVALID_PASSWORD);
		}
	}

	async function createEncryptionKeys(encrypt, strength, password) {
		const salt = getRandomValues(new Uint8Array$1(SALT_LENGTH[strength]));
		const passwordVerification = await createKeys$1(encrypt, strength, password, salt);
		return concat(salt, passwordVerification);
	}

	async function createKeys$1(aesCrypto, strength, password, salt) {
		aesCrypto.password = null;
		const encodedPassword = encodeText(password);
		const baseKey = await importKey(RAW_FORMAT, encodedPassword, BASE_KEY_ALGORITHM, false, DERIVED_BITS_USAGE);
		const derivedBits = await deriveBits(Object$1.assign({ salt }, DERIVED_BITS_ALGORITHM), baseKey, 8 * ((KEY_LENGTH[strength] * 2) + 2));
		const compositeKey = new Uint8Array$1(derivedBits);
		const key = toBits(codecBytes, subarray(compositeKey, 0, KEY_LENGTH[strength]));
		const authentication = toBits(codecBytes, subarray(compositeKey, KEY_LENGTH[strength], KEY_LENGTH[strength] * 2));
		const passwordVerification = subarray(compositeKey, KEY_LENGTH[strength] * 2);
		Object$1.assign(aesCrypto, {
			keys: {
				key,
				authentication,
				passwordVerification
			},
			ctr: new CtrGladman(new Aes(key), Array$1.from(COUNTER_DEFAULT_VALUE)),
			hmac: new HmacSha1(authentication)
		});
		return passwordVerification;
	}

	async function importKey(format, password, algorithm, extractable, keyUsages) {
		if (IMPORT_KEY_SUPPORTED) {
			try {
				return await subtle.importKey(format, password, algorithm, extractable, keyUsages);
			} catch (_error) {
				IMPORT_KEY_SUPPORTED = false;
				return misc.importKey(password);
			}
		} else {
			return misc.importKey(password);
		}
	}

	async function deriveBits(algorithm, baseKey, length) {
		if (DERIVE_BITS_SUPPORTED) {
			try {
				return await subtle.deriveBits(algorithm, baseKey, length);
			} catch (_error) {
				DERIVE_BITS_SUPPORTED = false;
				return misc.pbkdf2(baseKey, algorithm.salt, DERIVED_BITS_ALGORITHM.iterations, length);
			}
		} else {
			return misc.pbkdf2(baseKey, algorithm.salt, DERIVED_BITS_ALGORITHM.iterations, length);
		}
	}

	function concat(leftArray, rightArray) {
		let array = leftArray;
		if (leftArray.length + rightArray.length) {
			array = new Uint8Array$1(leftArray.length + rightArray.length);
			array.set(leftArray, 0);
			array.set(rightArray, leftArray.length);
		}
		return array;
	}

	function expand(inputArray, length) {
		if (length && length > inputArray.length) {
			const array = inputArray;
			inputArray = new Uint8Array$1(length);
			inputArray.set(array, 0);
		}
		return inputArray;
	}

	function subarray(array, begin, end) {
		return array.subarray(begin, end);
	}

	function fromBits(codecBytes, chunk) {
		return codecBytes.fromBits(chunk);
	}
	function toBits(codecBytes, chunk) {
		return codecBytes.toBits(chunk);
	}

	/*
	 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */

	const HEADER_LENGTH = 12;

	class ZipCryptoDecryptionStream extends TransformStream {

		constructor({ password, passwordVerification }) {
			super({
				start() {
					Object$1.assign(this, {
						password,
						passwordVerification
					});
					createKeys(this, password);
				},
				transform(chunk, controller) {
					const zipCrypto = this;
					if (zipCrypto.password) {
						const decryptedHeader = decrypt(zipCrypto, chunk.subarray(0, HEADER_LENGTH));
						zipCrypto.password = null;
						if (decryptedHeader[HEADER_LENGTH - 1] != zipCrypto.passwordVerification) {
							throw new Error(ERR_INVALID_PASSWORD);
						}
						chunk = chunk.subarray(HEADER_LENGTH);
					}
					controller.enqueue(decrypt(zipCrypto, chunk));
				}
			});
		}
	}

	class ZipCryptoEncryptionStream extends TransformStream {

		constructor({ password, passwordVerification }) {
			super({
				start() {
					Object$1.assign(this, {
						password,
						passwordVerification
					});
					createKeys(this, password);
				},
				transform(chunk, controller) {
					const zipCrypto = this;
					let output;
					let offset;
					if (zipCrypto.password) {
						zipCrypto.password = null;
						const header = getRandomValues(new Uint8Array$1(HEADER_LENGTH));
						header[HEADER_LENGTH - 1] = zipCrypto.passwordVerification;
						output = new Uint8Array$1(chunk.length + header.length);
						output.set(encrypt(zipCrypto, header), 0);
						offset = HEADER_LENGTH;
					} else {
						output = new Uint8Array$1(chunk.length);
						offset = 0;
					}
					output.set(encrypt(zipCrypto, chunk), offset);
					controller.enqueue(output);
				}
			});
		}
	}

	function decrypt(target, input) {
		const output = new Uint8Array$1(input.length);
		for (let index = 0; index < input.length; index++) {
			output[index] = getByte(target) ^ input[index];
			updateKeys(target, output[index]);
		}
		return output;
	}

	function encrypt(target, input) {
		const output = new Uint8Array$1(input.length);
		for (let index = 0; index < input.length; index++) {
			output[index] = getByte(target) ^ input[index];
			updateKeys(target, input[index]);
		}
		return output;
	}

	function createKeys(target, password) {
		const keys = [0x12345678, 0x23456789, 0x34567890];
		Object$1.assign(target, {
			keys,
			crcKey0: new Crc32(keys[0]),
			crcKey2: new Crc32(keys[2]),
		});
		for (let index = 0; index < password.length; index++) {
			updateKeys(target, password.charCodeAt(index));
		}
	}

	function updateKeys(target, byte) {
		let [key0, key1, key2] = target.keys;
		target.crcKey0.append([byte]);
		key0 = ~target.crcKey0.get();
		key1 = getInt32(Math$1.imul(getInt32(key1 + getInt8(key0)), 134775813) + 1);
		target.crcKey2.append([key1 >>> 24]);
		key2 = ~target.crcKey2.get();
		target.keys = [key0, key1, key2];
	}

	function getByte(target) {
		const temp = target.keys[2] | 2;
		return getInt8(Math$1.imul(temp, (temp ^ 1)) >>> 8);
	}

	function getInt8(number) {
		return number & 0xFF;
	}

	function getInt32(number) {
		return number & 0xFFFFFFFF;
	}

	/*
	 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */

	const COMPRESSION_FORMAT = "deflate-raw";

	class DeflateStream extends TransformStream {

		constructor(options, { chunkSize, CompressionStream, CompressionStreamNative }) {
			super({});
			const { compressed, encrypted, useCompressionStream, zipCrypto, signed, level } = options;
			const stream = this;
			let crc32Stream, encryptionStream;
			let readable = filterEmptyChunks(super.readable);
			if ((!encrypted || zipCrypto) && signed) {
				[readable, crc32Stream] = readable.tee();
				crc32Stream = pipeThrough(crc32Stream, new Crc32Stream());
			}
			if (compressed) {
				readable = pipeThroughCommpressionStream(readable, useCompressionStream, { level, chunkSize }, CompressionStreamNative, CompressionStream);
			}
			if (encrypted) {
				if (zipCrypto) {
					readable = pipeThrough(readable, new ZipCryptoEncryptionStream(options));
				} else {
					encryptionStream = new AESEncryptionStream(options);
					readable = pipeThrough(readable, encryptionStream);
				}
			}
			setReadable(stream, readable, async () => {
				let signature;
				if (encrypted && !zipCrypto) {
					signature = encryptionStream.signature;
				}
				if ((!encrypted || zipCrypto) && signed) {
					signature = await crc32Stream.getReader().read();
					signature = new DataView(signature.value.buffer).getUint32(0);
				}
				stream.signature = signature;
			});
		}
	}

	class InflateStream extends TransformStream {

		constructor(options, { chunkSize, DecompressionStream, DecompressionStreamNative }) {
			super({});
			const { zipCrypto, encrypted, signed, signature, compressed, useCompressionStream } = options;
			let crc32Stream, decryptionStream;
			let readable = filterEmptyChunks(super.readable);
			if (encrypted) {
				if (zipCrypto) {
					readable = pipeThrough(readable, new ZipCryptoDecryptionStream(options));
				} else {
					decryptionStream = new AESDecryptionStream(options);
					readable = pipeThrough(readable, decryptionStream);
				}
			}
			if (compressed) {
				readable = pipeThroughCommpressionStream(readable, useCompressionStream, { chunkSize }, DecompressionStreamNative, DecompressionStream);
			}
			if ((!encrypted || zipCrypto) && signed) {
				[readable, crc32Stream] = readable.tee();
				crc32Stream = pipeThrough(crc32Stream, new Crc32Stream());
			}
			setReadable(this, readable, async () => {
				if ((!encrypted || zipCrypto) && signed) {
					const streamSignature = await crc32Stream.getReader().read();
					const dataViewSignature = new DataView(streamSignature.value.buffer);
					if (signature != dataViewSignature.getUint32(0, false)) {
						throw new Error(ERR_INVALID_SIGNATURE);
					}
				}
			});
		}
	}

	function filterEmptyChunks(readable) {
		return pipeThrough(readable, new TransformStream({
			transform(chunk, controller) {
				if (chunk && chunk.length) {
					controller.enqueue(chunk);
				}
			}
		}));
	}

	function setReadable(stream, readable, flush) {
		readable = pipeThrough(readable, new TransformStream({ flush }));
		Object$1.defineProperty(stream, "readable", {
			get() {
				return readable;
			}
		});
	}

	function pipeThroughCommpressionStream(readable, useCompressionStream, options, CodecStreamNative, CodecStream) {
		try {
			const CompressionStream = useCompressionStream && CodecStreamNative ? CodecStreamNative : CodecStream;
			readable = pipeThrough(readable, new CompressionStream(COMPRESSION_FORMAT, options));
		} catch (error) {
			if (useCompressionStream) {
				readable = pipeThrough(readable, new CodecStream(COMPRESSION_FORMAT, options));
			} else {
				throw error;
			}
		}
		return readable;
	}

	function pipeThrough(readable, transformStream) {
		return readable.pipeThrough(transformStream);
	}

	/*
	 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */

	const MESSAGE_EVENT_TYPE = "message";
	const MESSAGE_START = "start";
	const MESSAGE_PULL = "pull";
	const MESSAGE_DATA = "data";
	const MESSAGE_ACK_DATA = "ack";
	const MESSAGE_CLOSE = "close";
	const CODEC_DEFLATE = "deflate";
	const CODEC_INFLATE = "inflate";

	class CodecStream extends TransformStream {

		constructor(options, config) {
			super({});
			const codec = this;
			const { codecType } = options;
			let Stream;
			if (codecType.startsWith(CODEC_DEFLATE)) {
				Stream = DeflateStream;
			} else if (codecType.startsWith(CODEC_INFLATE)) {
				Stream = InflateStream;
			}
			let size = 0;
			const stream = new Stream(options, config);
			const readable = super.readable;
			const transformStream = new TransformStream({
				transform(chunk, controller) {
					if (chunk && chunk.length) {
						size += chunk.length;
						controller.enqueue(chunk);
					}
				},
				flush() {
					const { signature } = stream;
					Object$1.assign(codec, {
						signature,
						size
					});
				}
			});
			Object$1.defineProperty(codec, "readable", {
				get() {
					return readable.pipeThrough(stream).pipeThrough(transformStream);
				}
			});
		}
	}

	/*
	 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */

	// deno-lint-ignore valid-typeof
	const WEB_WORKERS_SUPPORTED = typeof Worker != UNDEFINED_TYPE$1;

	class CodecWorker {

		constructor(workerData, { readable, writable }, { options, config, streamOptions, useWebWorkers, transferStreams, scripts }, onTaskFinished) {
			const { signal } = streamOptions;
			Object$1.assign(workerData, {
				busy: true,
				readable: readable.pipeThrough(new ProgressWatcherStream(readable, streamOptions, config), { signal }),
				writable,
				options: Object$1.assign({}, options),
				scripts,
				transferStreams,
				terminate() {
					const { worker, busy } = workerData;
					if (worker && !busy) {
						worker.terminate();
						workerData.interface = null;
					}
				},
				onTaskFinished() {
					workerData.busy = false;
					onTaskFinished(workerData);
				}
			});
			return (useWebWorkers && WEB_WORKERS_SUPPORTED ? createWebWorkerInterface : createWorkerInterface)(workerData, config);
		}
	}

	class ProgressWatcherStream extends TransformStream {

		constructor(readableSource, { onstart, onprogress, size, onend }, { chunkSize }) {
			let chunkOffset = 0;
			super({
				start() {
					if (onstart) {
						callHandler(onstart, size);
					}
				},
				async transform(chunk, controller) {
					chunkOffset += chunk.length;
					if (onprogress) {
						await callHandler(onprogress, chunkOffset, size);
					}
					controller.enqueue(chunk);
				},
				flush() {
					readableSource.size = chunkOffset;
					if (onend) {
						callHandler(onend, chunkOffset);
					}
				}
			}, { highWaterMark: 1, size: () => chunkSize });
		}
	}

	async function callHandler(handler, ...parameters) {
		try {
			await handler(...parameters);
		} catch (_error) {
			// ignored
		}
	}

	function createWorkerInterface(workerData, config) {
		return {
			run: () => runWorker$1(workerData, config)
		};
	}

	function createWebWorkerInterface(workerData, { baseURL, chunkSize }) {
		if (!workerData.interface) {
			Object$1.assign(workerData, {
				worker: getWebWorker(workerData.scripts[0], baseURL, workerData),
				interface: {
					run: () => runWebWorker(workerData, { chunkSize })
				}
			});
		}
		return workerData.interface;
	}

	async function runWorker$1({ options, readable, writable, onTaskFinished }, config) {
		const codecStream = new CodecStream(options, config);
		try {
			await readable.pipeThrough(codecStream).pipeTo(writable, { preventClose: true, preventAbort: true });
			const {
				signature,
				size
			} = codecStream;
			return {
				signature,
				size
			};
		} finally {
			onTaskFinished();
		}
	}

	async function runWebWorker(workerData, config) {
		let resolveResult, rejectResult;
		const result = new Promise$1((resolve, reject) => {
			resolveResult = resolve;
			rejectResult = reject;
		});
		Object$1.assign(workerData, {
			reader: null,
			writer: null,
			resolveResult,
			rejectResult,
			result
		});
		const { readable, options, scripts } = workerData;
		const { writable, closed } = watchClosedStream(workerData.writable);
		const streamsTransferred = sendMessage({
			type: MESSAGE_START,
			scripts: scripts.slice(1),
			options,
			config,
			readable,
			writable
		}, workerData);
		if (!streamsTransferred) {
			Object$1.assign(workerData, {
				reader: readable.getReader(),
				writer: writable.getWriter()
			});
		}
		const resultValue = await result;
		try {
			await writable.close();
		} catch (_error) {
			// ignored
		}
		await closed;
		return resultValue;
	}

	function watchClosedStream(writableSource) {
		const writer = writableSource.getWriter();
		let resolveStreamClosed;
		const closed = new Promise$1(resolve => resolveStreamClosed = resolve);
		const writable = new WritableStream({
			async write(chunk) {
				await writer.ready;
				await writer.write(chunk);
			},
			close() {
				writer.releaseLock();
				resolveStreamClosed();
			},
			abort(reason) {
				return writer.abort(reason);
			}
		});
		return { writable, closed };
	}

	let classicWorkersSupported = true;
	let transferStreamsSupported = true;

	function getWebWorker(url, baseURL, workerData) {
		const workerOptions = { type: "module" };
		let scriptUrl, worker;
		// deno-lint-ignore valid-typeof
		if (typeof url == FUNCTION_TYPE$1) {
			url = url();
		}
		try {
			scriptUrl = new URL$1(url, baseURL);
		} catch (_error) {
			scriptUrl = url;
		}
		if (classicWorkersSupported) {
			try {
				worker = new Worker(scriptUrl);
			} catch (_error) {
				classicWorkersSupported = false;
				worker = new Worker(scriptUrl, workerOptions);
			}
		} else {
			worker = new Worker(scriptUrl, workerOptions);
		}
		worker.addEventListener(MESSAGE_EVENT_TYPE, event => onMessage(event, workerData));
		return worker;
	}

	function sendMessage(message, { worker, writer, onTaskFinished, transferStreams }) {
		try {
			let { value, readable, writable } = message;
			const transferables = [];
			if (value) {
				const { buffer, length } = value;
				if (length != buffer.byteLength) {
					value = new Uint8Array$1(value);
				}
				message.value = value.buffer;
				transferables.push(message.value);
			}
			if (transferStreams && transferStreamsSupported) {
				if (readable) {
					transferables.push(readable);
				}
				if (writable) {
					transferables.push(writable);
				}
			} else {
				message.readable = message.writable = null;
			}
			if (transferables.length) {
				try {
					worker.postMessage(message, transferables);
					return true;
				} catch (_error) {
					transferStreamsSupported = false;
					message.readable = message.writable = null;
					worker.postMessage(message);
				}
			} else {
				worker.postMessage(message);
			}
		} catch (error) {
			if (writer) {
				writer.releaseLock();
			}
			onTaskFinished();
			throw error;
		}
	}

	async function onMessage({ data }, workerData) {
		const { type, value, messageId, result, error } = data;
		const { reader, writer, resolveResult, rejectResult, onTaskFinished } = workerData;
		try {
			if (error) {
				const { message, stack, code, name } = error;
				const responseError = new Error(message);
				Object$1.assign(responseError, { stack, code, name });
				close(responseError);
			} else {
				if (type == MESSAGE_PULL) {
					const { value, done } = await reader.read();
					sendMessage({ type: MESSAGE_DATA, value, done, messageId }, workerData);
				}
				if (type == MESSAGE_DATA) {
					await writer.ready;
					await writer.write(new Uint8Array$1(value));
					sendMessage({ type: MESSAGE_ACK_DATA, messageId }, workerData);
				}
				if (type == MESSAGE_CLOSE) {
					close(null, result);
				}
			}
		} catch (error) {
			close(error);
		}

		function close(error, result) {
			if (error) {
				rejectResult(error);
			} else {
				resolveResult(result);
			}
			if (writer) {
				writer.releaseLock();
			}
			onTaskFinished();
		}
	}

	/*
	 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */

	let pool = [];
	const pendingRequests = [];

	let indexWorker = 0;

	async function runWorker(stream, workerOptions) {
		const { options, config } = workerOptions;
		const { transferStreams, useWebWorkers, useCompressionStream, codecType, compressed, signed, encrypted } = options;
		const { workerScripts, maxWorkers, terminateWorkerTimeout } = config;
		workerOptions.transferStreams = transferStreams || transferStreams === UNDEFINED_VALUE;
		const streamCopy = !compressed && !signed && !encrypted && !workerOptions.transferStreams;
		workerOptions.useWebWorkers = !streamCopy && (useWebWorkers || (useWebWorkers === UNDEFINED_VALUE && config.useWebWorkers));
		workerOptions.scripts = workerOptions.useWebWorkers && workerScripts ? workerScripts[codecType] : [];
		options.useCompressionStream = useCompressionStream || (useCompressionStream === UNDEFINED_VALUE && config.useCompressionStream);
		let worker;
		const workerData = pool.find(workerData => !workerData.busy);
		if (workerData) {
			clearTerminateTimeout(workerData);
			worker = new CodecWorker(workerData, stream, workerOptions, onTaskFinished);
		} else if (pool.length < maxWorkers) {
			const workerData = { indexWorker };
			indexWorker++;
			pool.push(workerData);
			worker = new CodecWorker(workerData, stream, workerOptions, onTaskFinished);
		} else {
			worker = await new Promise$1(resolve => pendingRequests.push({ resolve, stream, workerOptions }));
		}
		return worker.run();

		function onTaskFinished(workerData) {
			if (pendingRequests.length) {
				const [{ resolve, stream, workerOptions }] = pendingRequests.splice(0, 1);
				resolve(new CodecWorker(workerData, stream, workerOptions, onTaskFinished));
			} else if (workerData.worker) {
				clearTerminateTimeout(workerData);
				if (Number.isFinite(terminateWorkerTimeout) && terminateWorkerTimeout >= 0) {
					workerData.terminateTimeout = setTimeout(() => {
						pool = pool.filter(data => data != workerData);
						workerData.terminate();
					}, terminateWorkerTimeout);
				}
			} else {
				pool = pool.filter(data => data != workerData);
			}
		}
	}

	function clearTerminateTimeout(workerData) {
		const { terminateTimeout } = workerData;
		if (terminateTimeout) {
			clearTimeout(terminateTimeout);
			workerData.terminateTimeout = null;
		}
	}

	function terminateWorkers() {
		pool.forEach(workerData => {
			clearTerminateTimeout(workerData);
			workerData.terminate();
		});
	}

	/*
	 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */

	/* global Blob, atob, btoa, XMLHttpRequest, URL, fetch, ReadableStream, WritableStream, FileReader, TransformStream, Response */
	// deno-lint-ignore-file no-this-alias

	const ERR_HTTP_STATUS = "HTTP error ";
	const ERR_HTTP_RANGE = "HTTP Range not supported";
	const ERR_ITERATOR_COMPLETED_TOO_SOON = "Writer iterator completed too soon";

	const CONTENT_TYPE_TEXT_PLAIN = "text/plain";
	const HTTP_HEADER_CONTENT_LENGTH = "Content-Length";
	const HTTP_HEADER_CONTENT_RANGE = "Content-Range";
	const HTTP_HEADER_ACCEPT_RANGES = "Accept-Ranges";
	const HTTP_HEADER_RANGE = "Range";
	const HTTP_HEADER_CONTENT_TYPE = "Content-Type";
	const HTTP_METHOD_HEAD = "HEAD";
	const HTTP_METHOD_GET = "GET";
	const HTTP_RANGE_UNIT = "bytes";
	const DEFAULT_CHUNK_SIZE = 64 * 1024;

	const PROPERTY_NAME_WRITABLE = "writable";

	class Stream {

		constructor() {
			this.size = 0;
		}

		init() {
			this.initialized = true;
		}
	}

	class Reader extends Stream {

		get readable() {
			const reader = this;
			const { chunkSize = DEFAULT_CHUNK_SIZE } = reader;
			const readable = new ReadableStream({
				start() {
					this.chunkOffset = 0;
				},
				async pull(controller) {
					const { offset = 0, size, diskNumberStart } = readable;
					const { chunkOffset } = this;
					controller.enqueue(await readUint8Array(reader, offset + chunkOffset, Math$1.min(chunkSize, size - chunkOffset), diskNumberStart));
					if (chunkOffset + chunkSize > size) {
						controller.close();
					} else {
						this.chunkOffset += chunkSize;
					}
				}
			});
			return readable;
		}
	}

	class Writer extends Stream {

		constructor() {
			super();
			const writer = this;
			const writable = new WritableStream({
				write(chunk) {
					return writer.writeUint8Array(chunk);
				}
			});
			Object$1.defineProperty(writer, PROPERTY_NAME_WRITABLE, {
				get() {
					return writable;
				}
			});
		}

		writeUint8Array() {
			// abstract
		}
	}

	class Data64URIReader extends Reader {

		constructor(dataURI) {
			super();
			let dataEnd = dataURI.length;
			while (dataURI.charAt(dataEnd - 1) == "=") {
				dataEnd--;
			}
			const dataStart = dataURI.indexOf(",") + 1;
			Object$1.assign(this, {
				dataURI,
				dataStart,
				size: Math$1.floor((dataEnd - dataStart) * 0.75)
			});
		}

		readUint8Array(offset, length) {
			const {
				dataStart,
				dataURI
			} = this;
			const dataArray = new Uint8Array$1(length);
			const start = Math$1.floor(offset / 3) * 4;
			const bytes = atob(dataURI.substring(start + dataStart, Math$1.ceil((offset + length) / 3) * 4 + dataStart));
			const delta = offset - Math$1.floor(start / 4) * 3;
			for (let indexByte = delta; indexByte < delta + length; indexByte++) {
				dataArray[indexByte - delta] = bytes.charCodeAt(indexByte);
			}
			return dataArray;
		}
	}

	class Data64URIWriter extends Writer {

		constructor(contentType) {
			super();
			Object$1.assign(this, {
				data: "data:" + (contentType || "") + ";base64,",
				pending: []
			});
		}

		writeUint8Array(array) {
			const writer = this;
			let indexArray = 0;
			let dataString = writer.pending;
			const delta = writer.pending.length;
			writer.pending = "";
			for (indexArray = 0; indexArray < (Math$1.floor((delta + array.length) / 3) * 3) - delta; indexArray++) {
				dataString += String.fromCharCode(array[indexArray]);
			}
			for (; indexArray < array.length; indexArray++) {
				writer.pending += String.fromCharCode(array[indexArray]);
			}
			if (dataString.length > 2) {
				writer.data += btoa(dataString);
			} else {
				writer.pending = dataString;
			}
		}

		getData() {
			return this.data + btoa(this.pending);
		}
	}

	class BlobReader extends Reader {

		constructor(blob) {
			super();
			Object$1.assign(this, {
				blob,
				size: blob.size
			});
		}

		async readUint8Array(offset, length) {
			const reader = this;
			const offsetEnd = offset + length;
			const blob = offset || offsetEnd < reader.size ? reader.blob.slice(offset, offsetEnd) : reader.blob;
			return new Uint8Array$1(await blob.arrayBuffer());
		}
	}

	class BlobWriter extends Stream {

		constructor(contentType) {
			super();
			const writer = this;
			const transformStream = new TransformStream();
			const headers = [];
			if (contentType) {
				headers.push([HTTP_HEADER_CONTENT_TYPE, contentType]);
			}
			Object$1.defineProperty(writer, PROPERTY_NAME_WRITABLE, {
				get() {
					return transformStream.writable;
				}
			});
			writer.blob = new Response(transformStream.readable, { headers }).blob();
		}

		getData() {
			return this.blob;
		}
	}

	class TextReader extends BlobReader {

		constructor(text) {
			super(new Blob$1([text], { type: CONTENT_TYPE_TEXT_PLAIN }));
		}
	}

	class TextWriter extends BlobWriter {

		constructor(encoding) {
			super(encoding);
			Object$1.assign(this, {
				encoding,
				utf8: !encoding || encoding.toLowerCase() == "utf-8"
			});
		}

		async getData() {
			const {
				encoding,
				utf8
			} = this;
			const blob = await super.getData();
			if (blob.text && utf8) {
				return blob.text();
			} else {
				const reader = new FileReader();
				return new Promise$1((resolve, reject) => {
					Object$1.assign(reader, {
						onload: ({ target }) => resolve(target.result),
						onerror: () => reject(reader.error)
					});
					reader.readAsText(blob, encoding);
				});
			}
		}
	}

	class FetchReader extends Reader {

		constructor(url, options) {
			super();
			createHtpReader(this, url, options);
		}

		async init() {
			super.init();
			await initHttpReader(this, sendFetchRequest, getFetchRequestData);
		}

		readUint8Array(index, length) {
			return readUint8ArrayHttpReader(this, index, length, sendFetchRequest, getFetchRequestData);
		}
	}

	class XHRReader extends Reader {

		constructor(url, options) {
			super();
			createHtpReader(this, url, options);
		}

		async init() {
			super.init();
			await initHttpReader(this, sendXMLHttpRequest, getXMLHttpRequestData);
		}

		readUint8Array(index, length) {
			return readUint8ArrayHttpReader(this, index, length, sendXMLHttpRequest, getXMLHttpRequestData);
		}
	}

	function createHtpReader(httpReader, url, options) {
		const {
			preventHeadRequest,
			useRangeHeader,
			forceRangeRequests
		} = options;
		options = Object$1.assign({}, options);
		delete options.preventHeadRequest;
		delete options.useRangeHeader;
		delete options.forceRangeRequests;
		delete options.useXHR;
		Object$1.assign(httpReader, {
			url,
			options,
			preventHeadRequest,
			useRangeHeader,
			forceRangeRequests
		});
	}

	async function initHttpReader(httpReader, sendRequest, getRequestData) {
		const {
			url,
			useRangeHeader,
			forceRangeRequests
		} = httpReader;
		if (isHttpFamily(url) && (useRangeHeader || forceRangeRequests)) {
			const { headers } = await sendRequest(HTTP_METHOD_GET, httpReader, getRangeHeaders(httpReader));
			if (!forceRangeRequests && headers.get(HTTP_HEADER_ACCEPT_RANGES) != HTTP_RANGE_UNIT) {
				throw new Error(ERR_HTTP_RANGE);
			} else {
				let contentSize;
				const contentRangeHeader = headers.get(HTTP_HEADER_CONTENT_RANGE);
				if (contentRangeHeader) {
					const splitHeader = contentRangeHeader.trim().split(/\s*\/\s*/);
					if (splitHeader.length) {
						const headerValue = splitHeader[1];
						if (headerValue && headerValue != "*") {
							contentSize = Number(headerValue);
						}
					}
				}
				if (contentSize === UNDEFINED_VALUE) {
					await getContentLength(httpReader, sendRequest, getRequestData);
				} else {
					httpReader.size = contentSize;
				}
			}
		} else {
			await getContentLength(httpReader, sendRequest, getRequestData);
		}
	}

	async function readUint8ArrayHttpReader(httpReader, index, length, sendRequest, getRequestData) {
		const {
			useRangeHeader,
			forceRangeRequests,
			options
		} = httpReader;
		if (useRangeHeader || forceRangeRequests) {
			const response = await sendRequest(HTTP_METHOD_GET, httpReader, getRangeHeaders(httpReader, index, length));
			if (response.status != 206) {
				throw new Error(ERR_HTTP_RANGE);
			}
			return new Uint8Array$1(await response.arrayBuffer());
		} else {
			const { data } = httpReader;
			if (!data) {
				await getRequestData(httpReader, options);
			}
			return new Uint8Array$1(httpReader.data.subarray(index, index + length));
		}
	}

	function getRangeHeaders(httpReader, index = 0, length = 1) {
		return Object$1.assign({}, getHeaders(httpReader), { [HTTP_HEADER_RANGE]: HTTP_RANGE_UNIT + "=" + index + "-" + (index + length - 1) });
	}

	function getHeaders({ options }) {
		const { headers } = options;
		if (headers) {
			if (Symbol.iterator in headers) {
				return Object$1.fromEntries(headers);
			} else {
				return headers;
			}
		}
	}

	async function getFetchRequestData(httpReader) {
		await getRequestData(httpReader, sendFetchRequest);
	}

	async function getXMLHttpRequestData(httpReader) {
		await getRequestData(httpReader, sendXMLHttpRequest);
	}

	async function getRequestData(httpReader, sendRequest) {
		const response = await sendRequest(HTTP_METHOD_GET, httpReader, getHeaders(httpReader));
		httpReader.data = new Uint8Array$1(await response.arrayBuffer());
		if (!httpReader.size) {
			httpReader.size = httpReader.data.length;
		}
	}

	async function getContentLength(httpReader, sendRequest, getRequestData) {
		if (httpReader.preventHeadRequest) {
			await getRequestData(httpReader, httpReader.options);
		} else {
			const response = await sendRequest(HTTP_METHOD_HEAD, httpReader, getHeaders(httpReader));
			const contentLength = response.headers.get(HTTP_HEADER_CONTENT_LENGTH);
			if (contentLength) {
				httpReader.size = Number(contentLength);
			} else {
				await getRequestData(httpReader, httpReader.options);
			}
		}
	}

	async function sendFetchRequest(method, { options, url }, headers) {
		const response = await fetch(url, Object$1.assign({}, options, { method, headers }));
		if (response.status < 400) {
			return response;
		} else {
			throw response.status == 416 ? new Error(ERR_HTTP_RANGE) : new Error(ERR_HTTP_STATUS + (response.statusText || response.status));
		}
	}

	function sendXMLHttpRequest(method, { url }, headers) {
		return new Promise$1((resolve, reject) => {
			const request = new XMLHttpRequest();
			request.addEventListener("load", () => {
				if (request.status < 400) {
					const headers = [];
					request.getAllResponseHeaders().trim().split(/[\r\n]+/).forEach(header => {
						const splitHeader = header.trim().split(/\s*:\s*/);
						splitHeader[0] = splitHeader[0].trim().replace(/^[a-z]|-[a-z]/g, value => value.toUpperCase());
						headers.push(splitHeader);
					});
					resolve({
						status: request.status,
						arrayBuffer: () => request.response,
						headers: new Map(headers)
					});
				} else {
					reject(request.status == 416 ? new Error(ERR_HTTP_RANGE) : new Error(ERR_HTTP_STATUS + (request.statusText || request.status)));
				}
			}, false);
			request.addEventListener("error", event => reject(event.detail.error), false);
			request.open(method, url);
			if (headers) {
				for (const entry of Object$1.entries(headers)) {
					request.setRequestHeader(entry[0], entry[1]);
				}
			}
			request.responseType = "arraybuffer";
			request.send();
		});
	}

	class HttpReader extends Reader {

		constructor(url, options = {}) {
			super();
			Object$1.assign(this, {
				url,
				reader: options.useXHR ? new XHRReader(url, options) : new FetchReader(url, options)
			});
		}

		set size(value) {
			// ignored
		}

		get size() {
			return this.reader.size;
		}

		async init() {
			super.init();
			await this.reader.init();
		}

		readUint8Array(index, length) {
			return this.reader.readUint8Array(index, length);
		}
	}

	class HttpRangeReader extends HttpReader {

		constructor(url, options = {}) {
			options.useRangeHeader = true;
			super(url, options);
		}
	}


	class Uint8ArrayReader extends Reader {

		constructor(array) {
			super();
			Object$1.assign(this, {
				array,
				size: array.length
			});
		}

		readUint8Array(index, length) {
			return this.array.slice(index, index + length);
		}
	}

	class Uint8ArrayWriter extends Writer {

		init(initSize = 0) {
			super.init();
			Object$1.assign(this, {
				offset: 0,
				array: new Uint8Array$1(initSize)
			});
		}

		writeUint8Array(array) {
			const writer = this;
			if (writer.offset + array.length > writer.array.length) {
				const previousArray = writer.array;
				writer.array = new Uint8Array$1(previousArray.length + array.length);
				writer.array.set(previousArray);
			}
			writer.array.set(array, writer.offset);
			writer.offset += array.length;
		}

		getData() {
			return this.array;
		}
	}

	class SplitDataReader extends Reader {

		constructor(readers) {
			super();
			this.readers = readers;
		}

		async init() {
			super.init();
			const reader = this;
			const { readers } = reader;
			reader.lastDiskNumber = 0;
			await Promise$1.all(readers.map(async diskReader => {
				await diskReader.init();
				reader.size += diskReader.size;
			}));
		}

		async readUint8Array(offset, length, diskNumber = 0) {
			const reader = this;
			const { readers } = this;
			let result;
			let currentDiskNumber = diskNumber;
			if (currentDiskNumber == -1) {
				currentDiskNumber = readers.length - 1;
			}
			let currentReaderOffset = offset;
			while (currentReaderOffset >= readers[currentDiskNumber].size) {
				currentReaderOffset -= readers[currentDiskNumber].size;
				currentDiskNumber++;
			}
			const currentReader = readers[currentDiskNumber];
			const currentReaderSize = currentReader.size;
			if (currentReaderOffset + length <= currentReaderSize) {
				result = await readUint8Array(currentReader, currentReaderOffset, length);
			} else {
				const chunkLength = currentReaderSize - currentReaderOffset;
				result = new Uint8Array$1(length);
				result.set(await readUint8Array(currentReader, currentReaderOffset, chunkLength));
				result.set(await reader.readUint8Array(offset + chunkLength, length - chunkLength, diskNumber), chunkLength);
			}
			reader.lastDiskNumber = Math$1.max(currentDiskNumber, reader.lastDiskNumber);
			return result;
		}
	}

	class SplitDataWriter extends Stream {

		constructor(writerGenerator, maxSize = 4294967295) {
			super();
			const zipWriter = this;
			Object$1.assign(zipWriter, {
				diskNumber: 0,
				diskOffset: 0,
				size: 0,
				maxSize,
				availableSize: maxSize
			});
			let diskSourceWriter, diskWritable, diskWriter;
			const writable = new WritableStream({
				async write(chunk) {
					const { availableSize } = zipWriter;
					if (!diskWriter) {
						const { value, done } = await writerGenerator.next();
						if (done && !value) {
							throw new Error(ERR_ITERATOR_COMPLETED_TOO_SOON);
						} else {
							diskSourceWriter = value;
							diskSourceWriter.size = 0;
							if (diskSourceWriter.maxSize) {
								zipWriter.maxSize = diskSourceWriter.maxSize;
							}
							zipWriter.availableSize = zipWriter.maxSize;
							await initStream(diskSourceWriter);
							diskWritable = value.writable;
							diskWriter = diskWritable.getWriter();
						}
						await this.write(chunk);
					} else if (chunk.length >= availableSize) {
						await writeChunk(chunk.slice(0, availableSize));
						await closeDisk();
						zipWriter.diskOffset += diskSourceWriter.size;
						zipWriter.diskNumber++;
						diskWriter = null;
						await this.write(chunk.slice(availableSize));
					} else {
						await writeChunk(chunk);
					}
				},
				async close() {
					await diskWriter.ready;
					await closeDisk();
				}
			});
			Object$1.defineProperty(zipWriter, PROPERTY_NAME_WRITABLE, {
				get() {
					return writable;
				}
			});

			async function writeChunk(chunk) {
				const chunkLength = chunk.length;
				if (chunkLength) {
					await diskWriter.ready;
					await diskWriter.write(chunk);
					diskSourceWriter.size += chunkLength;
					zipWriter.size += chunkLength;
					zipWriter.availableSize -= chunkLength;
				}
			}

			async function closeDisk() {
				diskWritable.size = diskSourceWriter.size;
				await diskWriter.close();
			}
		}
	}

	function isHttpFamily(url) {
		const { baseURL } = getConfiguration();
		const { protocol } = new URL$1(url, baseURL);
		return protocol == "http:" || protocol == "https:";
	}

	async function initStream(stream, initSize) {
		if (stream.init && !stream.initialized) {
			await stream.init(initSize);
		}
	}

	function initReader(reader) {
		if (Array$1.isArray(reader)) {
			reader = new SplitDataReader(reader);
		}
		if (reader instanceof ReadableStream) {
			reader = {
				readable: reader
			};
		}
		return reader;
	}

	function initWriter(writer) {
		if (writer.writable === UNDEFINED_VALUE && typeof writer.next == FUNCTION_TYPE$1) {
			writer = new SplitDataWriter(writer);
		}
		if (writer instanceof WritableStream) {
			writer = {
				writable: writer
			};
		}
		const { writable } = writer;
		if (writable.size === UNDEFINED_VALUE) {
			writable.size = 0;
		}
		const splitZipFile = writer instanceof SplitDataWriter;
		if (!splitZipFile) {
			Object$1.assign(writer, {
				diskNumber: 0,
				diskOffset: 0,
				availableSize: Infinity,
				maxSize: Infinity
			});
		}
		return writer;
	}

	function readUint8Array(reader, offset, size, diskNumber) {
		return reader.readUint8Array(offset, size, diskNumber);
	}

	const SplitZipReader = SplitDataReader;
	const SplitZipWriter = SplitDataWriter;

	/*
	 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */

	/* global TextDecoder */

	const CP437 = "\0☺☻♥♦♣♠•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼ !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~⌂ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ".split("");
	const VALID_CP437 = CP437.length == 256;

	function decodeCP437(stringValue) {
		if (VALID_CP437) {
			let result = "";
			for (let indexCharacter = 0; indexCharacter < stringValue.length; indexCharacter++) {
				result += CP437[stringValue[indexCharacter]];
			}
			return result;
		} else {
			return new TextDecoder().decode(stringValue);
		}
	}

	/*
	 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */

	function decodeText(value, encoding) {
		if (encoding && encoding.trim().toLowerCase() == "cp437") {
			return decodeCP437(value);
		} else {
			return new TextDecoder(encoding).decode(value);
		}
	}

	/*
	 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */

	const PROPERTY_NAME_FILENAME = "filename";
	const PROPERTY_NAME_RAW_FILENAME = "rawFilename";
	const PROPERTY_NAME_COMMENT = "comment";
	const PROPERTY_NAME_RAW_COMMENT = "rawComment";
	const PROPERTY_NAME_UNCOMPPRESSED_SIZE = "uncompressedSize";
	const PROPERTY_NAME_COMPPRESSED_SIZE = "compressedSize";
	const PROPERTY_NAME_OFFSET = "offset";
	const PROPERTY_NAME_DISK_NUMBER_START = "diskNumberStart";
	const PROPERTY_NAME_LAST_MODIFICATION_DATE = "lastModDate";
	const PROPERTY_NAME_RAW_LAST_MODIFICATION_DATE = "rawLastModDate";
	const PROPERTY_NAME_LAST_ACCESS_DATE = "lastAccessDate";
	const PROPERTY_NAME_RAW_LAST_ACCESS_DATE = "rawLastAccessDate";
	const PROPERTY_NAME_CREATION_DATE = "creationDate";
	const PROPERTY_NAME_RAW_CREATION_DATE = "rawCreationDate";
	const PROPERTY_NAME_INTERNAL_FILE_ATTRIBUTE = "internalFileAttribute";
	const PROPERTY_NAME_EXTERNAL_FILE_ATTRIBUTE = "externalFileAttribute";
	const PROPERTY_NAME_MS_DOS_COMPATIBLE = "msDosCompatible";
	const PROPERTY_NAME_ZIP64 = "zip64";

	const PROPERTY_NAMES = [
		PROPERTY_NAME_FILENAME, PROPERTY_NAME_RAW_FILENAME, PROPERTY_NAME_COMPPRESSED_SIZE, PROPERTY_NAME_UNCOMPPRESSED_SIZE,
		PROPERTY_NAME_LAST_MODIFICATION_DATE, PROPERTY_NAME_RAW_LAST_MODIFICATION_DATE, PROPERTY_NAME_COMMENT, PROPERTY_NAME_RAW_COMMENT,
		PROPERTY_NAME_LAST_ACCESS_DATE, PROPERTY_NAME_CREATION_DATE, PROPERTY_NAME_OFFSET, PROPERTY_NAME_DISK_NUMBER_START,
		PROPERTY_NAME_DISK_NUMBER_START, PROPERTY_NAME_INTERNAL_FILE_ATTRIBUTE, PROPERTY_NAME_EXTERNAL_FILE_ATTRIBUTE,
		PROPERTY_NAME_MS_DOS_COMPATIBLE, PROPERTY_NAME_ZIP64,
		"directory", "bitFlag", "encrypted", "signature", "filenameUTF8", "commentUTF8", "compressionMethod", "version", "versionMadeBy",
		"extraField", "rawExtraField", "extraFieldZip64", "extraFieldUnicodePath", "extraFieldUnicodeComment", "extraFieldAES", "extraFieldNTFS",
		"extraFieldExtendedTimestamp"];

	class Entry {

		constructor(data) {
			PROPERTY_NAMES.forEach(name => this[name] = data[name]);
		}

	}

	/*
	 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */

	const ERR_BAD_FORMAT = "File format is not recognized";
	const ERR_EOCDR_NOT_FOUND = "End of central directory not found";
	const ERR_EOCDR_ZIP64_NOT_FOUND = "End of Zip64 central directory not found";
	const ERR_EOCDR_LOCATOR_ZIP64_NOT_FOUND = "End of Zip64 central directory locator not found";
	const ERR_CENTRAL_DIRECTORY_NOT_FOUND = "Central directory header not found";
	const ERR_LOCAL_FILE_HEADER_NOT_FOUND = "Local file header not found";
	const ERR_EXTRAFIELD_ZIP64_NOT_FOUND = "Zip64 extra field not found";
	const ERR_ENCRYPTED = "File contains encrypted entry";
	const ERR_UNSUPPORTED_ENCRYPTION = "Encryption method not supported";
	const ERR_UNSUPPORTED_COMPRESSION = "Compression method not supported";
	const ERR_SPLIT_ZIP_FILE = "Split zip file";
	const CHARSET_UTF8 = "utf-8";
	const CHARSET_CP437 = "cp437";
	const ZIP64_PROPERTIES = [
		[PROPERTY_NAME_UNCOMPPRESSED_SIZE, MAX_32_BITS],
		[PROPERTY_NAME_COMPPRESSED_SIZE, MAX_32_BITS],
		[PROPERTY_NAME_OFFSET, MAX_32_BITS],
		[PROPERTY_NAME_DISK_NUMBER_START, MAX_16_BITS]
	];
	const ZIP64_EXTRACTION = {
		[MAX_16_BITS]: {
			getValue: getUint32,
			bytes: 4
		},
		[MAX_32_BITS]: {
			getValue: getBigUint64,
			bytes: 8
		}
	};

	class ZipReader {

		constructor(reader, options = {}) {
			Object$1.assign(this, {
				reader: initReader(reader),
				options,
				config: getConfiguration()
			});
		}

		async* getEntriesGenerator(options = {}) {
			const zipReader = this;
			let { reader } = zipReader;
			const { config } = zipReader;
			await initStream(reader);
			if (reader.size === UNDEFINED_VALUE || !reader.readUint8Array) {
				reader = new BlobReader(await new Response(reader.readable).blob());
				await initStream(reader);
			}
			if (reader.size < END_OF_CENTRAL_DIR_LENGTH) {
				throw new Error(ERR_BAD_FORMAT);
			}
			reader.chunkSize = getChunkSize(config);
			const endOfDirectoryInfo = await seekSignature(reader, END_OF_CENTRAL_DIR_SIGNATURE, reader.size, END_OF_CENTRAL_DIR_LENGTH, MAX_16_BITS * 16);
			if (!endOfDirectoryInfo) {
				const signatureArray = await readUint8Array(reader, 0, 4);
				const signatureView = getDataView$1(signatureArray);
				if (getUint32(signatureView) == SPLIT_ZIP_FILE_SIGNATURE) {
					throw new Error(ERR_SPLIT_ZIP_FILE);
				} else {
					throw new Error(ERR_EOCDR_NOT_FOUND);
				}
			}
			const endOfDirectoryView = getDataView$1(endOfDirectoryInfo);
			let directoryDataLength = getUint32(endOfDirectoryView, 12);
			let directoryDataOffset = getUint32(endOfDirectoryView, 16);
			const commentOffset = endOfDirectoryInfo.offset;
			const commentLength = getUint16(endOfDirectoryView, 20);
			const appendedDataOffset = commentOffset + END_OF_CENTRAL_DIR_LENGTH + commentLength;
			const lastDiskNumber = getUint16(endOfDirectoryView, 4);
			const expectedLastDiskNumber = reader.lastDiskNumber || 0;
			let diskNumber = getUint16(endOfDirectoryView, 6);
			if (expectedLastDiskNumber != lastDiskNumber) {
				throw new Error(ERR_SPLIT_ZIP_FILE);
			}
			let filesLength = getUint16(endOfDirectoryView, 8);
			let prependedDataLength = 0;
			let startOffset = 0;
			if (directoryDataOffset == MAX_32_BITS || directoryDataLength == MAX_32_BITS || filesLength == MAX_16_BITS || diskNumber == MAX_16_BITS) {
				const endOfDirectoryLocatorArray = await readUint8Array(reader, endOfDirectoryInfo.offset - ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH, ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH);
				const endOfDirectoryLocatorView = getDataView$1(endOfDirectoryLocatorArray);
				if (getUint32(endOfDirectoryLocatorView, 0) != ZIP64_END_OF_CENTRAL_DIR_LOCATOR_SIGNATURE) {
					throw new Error(ERR_EOCDR_ZIP64_NOT_FOUND);
				}
				directoryDataOffset = getBigUint64(endOfDirectoryLocatorView, 8);
				let endOfDirectoryArray = await readUint8Array(reader, directoryDataOffset, ZIP64_END_OF_CENTRAL_DIR_LENGTH, -1);
				let endOfDirectoryView = getDataView$1(endOfDirectoryArray);
				const expectedDirectoryDataOffset = endOfDirectoryInfo.offset - ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH - ZIP64_END_OF_CENTRAL_DIR_LENGTH;
				if (getUint32(endOfDirectoryView, 0) != ZIP64_END_OF_CENTRAL_DIR_SIGNATURE && directoryDataOffset != expectedDirectoryDataOffset) {
					const originalDirectoryDataOffset = directoryDataOffset;
					directoryDataOffset = expectedDirectoryDataOffset;
					prependedDataLength = directoryDataOffset - originalDirectoryDataOffset;
					endOfDirectoryArray = await readUint8Array(reader, directoryDataOffset, ZIP64_END_OF_CENTRAL_DIR_LENGTH, -1);
					endOfDirectoryView = getDataView$1(endOfDirectoryArray);
				}
				if (getUint32(endOfDirectoryView, 0) != ZIP64_END_OF_CENTRAL_DIR_SIGNATURE) {
					throw new Error(ERR_EOCDR_LOCATOR_ZIP64_NOT_FOUND);
				}
				if (diskNumber == MAX_16_BITS) {
					diskNumber = getUint32(endOfDirectoryView, 16);
				}
				if (filesLength == MAX_16_BITS) {
					filesLength = getBigUint64(endOfDirectoryView, 32);
				}
				if (directoryDataLength == MAX_32_BITS) {
					directoryDataLength = getBigUint64(endOfDirectoryView, 40);
				}
				directoryDataOffset -= directoryDataLength;
			}
			if (directoryDataOffset < 0 || directoryDataOffset >= reader.size) {
				throw new Error(ERR_BAD_FORMAT);
			}
			let offset = 0;
			let directoryArray = await readUint8Array(reader, directoryDataOffset, directoryDataLength, diskNumber);
			let directoryView = getDataView$1(directoryArray);
			if (directoryDataLength) {
				const expectedDirectoryDataOffset = endOfDirectoryInfo.offset - directoryDataLength;
				if (getUint32(directoryView, offset) != CENTRAL_FILE_HEADER_SIGNATURE && directoryDataOffset != expectedDirectoryDataOffset) {
					const originalDirectoryDataOffset = directoryDataOffset;
					directoryDataOffset = expectedDirectoryDataOffset;
					prependedDataLength = directoryDataOffset - originalDirectoryDataOffset;
					directoryArray = await readUint8Array(reader, directoryDataOffset, directoryDataLength, diskNumber);
					directoryView = getDataView$1(directoryArray);
				}
			}
			if (directoryDataOffset < 0 || directoryDataOffset >= reader.size) {
				throw new Error(ERR_BAD_FORMAT);
			}
			const filenameEncoding = getOptionValue$1(zipReader, options, "filenameEncoding");
			const commentEncoding = getOptionValue$1(zipReader, options, "commentEncoding");
			for (let indexFile = 0; indexFile < filesLength; indexFile++) {
				const fileEntry = new ZipEntry(reader, config, zipReader.options);
				if (getUint32(directoryView, offset) != CENTRAL_FILE_HEADER_SIGNATURE) {
					throw new Error(ERR_CENTRAL_DIRECTORY_NOT_FOUND);
				}
				readCommonHeader(fileEntry, directoryView, offset + 6);
				const languageEncodingFlag = Boolean(fileEntry.bitFlag.languageEncodingFlag);
				const filenameOffset = offset + 46;
				const extraFieldOffset = filenameOffset + fileEntry.filenameLength;
				const commentOffset = extraFieldOffset + fileEntry.extraFieldLength;
				const versionMadeBy = getUint16(directoryView, offset + 4);
				const msDosCompatible = (versionMadeBy & 0) == 0;
				const rawFilename = directoryArray.subarray(filenameOffset, extraFieldOffset);
				const commentLength = getUint16(directoryView, offset + 32);
				const endOffset = commentOffset + commentLength;
				const rawComment = directoryArray.subarray(commentOffset, endOffset);
				const filenameUTF8 = languageEncodingFlag;
				const commentUTF8 = languageEncodingFlag;
				const directory = msDosCompatible && ((getUint8(directoryView, offset + 38) & FILE_ATTR_MSDOS_DIR_MASK) == FILE_ATTR_MSDOS_DIR_MASK);
				const offsetFileEntry = getUint32(directoryView, offset + 42) + prependedDataLength;
				Object$1.assign(fileEntry, {
					versionMadeBy,
					msDosCompatible,
					compressedSize: 0,
					uncompressedSize: 0,
					commentLength,
					directory,
					offset: offsetFileEntry,
					diskNumberStart: getUint16(directoryView, offset + 34),
					internalFileAttribute: getUint16(directoryView, offset + 36),
					externalFileAttribute: getUint32(directoryView, offset + 38),
					rawFilename,
					filenameUTF8,
					commentUTF8,
					rawExtraField: directoryArray.subarray(extraFieldOffset, commentOffset)
				});
				const [filename, comment] = await Promise$1.all([
					decodeText(rawFilename, filenameUTF8 ? CHARSET_UTF8 : filenameEncoding || CHARSET_CP437),
					decodeText(rawComment, commentUTF8 ? CHARSET_UTF8 : commentEncoding || CHARSET_CP437)
				]);
				Object$1.assign(fileEntry, {
					rawComment,
					filename,
					comment,
					directory: directory || filename.endsWith(DIRECTORY_SIGNATURE)
				});
				startOffset = Math$1.max(offsetFileEntry, startOffset);
				await readCommonFooter(fileEntry, fileEntry, directoryView, offset + 6);
				const entry = new Entry(fileEntry);
				entry.getData = (writer, options) => fileEntry.getData(writer, entry, options);
				offset = endOffset;
				const { onprogress } = options;
				if (onprogress) {
					try {
						await onprogress(indexFile + 1, filesLength, new Entry(fileEntry));
					} catch (_error) {
						// ignored
					}
				}
				yield entry;
			}
			const extractPrependedData = getOptionValue$1(zipReader, options, "extractPrependedData");
			const extractAppendedData = getOptionValue$1(zipReader, options, "extractAppendedData");
			if (extractPrependedData) {
				zipReader.prependedData = startOffset > 0 ? await readUint8Array(reader, 0, startOffset) : new Uint8Array$1();
			}
			zipReader.comment = commentLength ? await readUint8Array(reader, commentOffset + END_OF_CENTRAL_DIR_LENGTH, commentLength) : new Uint8Array$1();
			if (extractAppendedData) {
				zipReader.appendedData = appendedDataOffset < reader.size ? await readUint8Array(reader, appendedDataOffset, reader.size - appendedDataOffset) : new Uint8Array$1();
			}
			return true;
		}

		async getEntries(options = {}) {
			const entries = [];
			for await (const entry of this.getEntriesGenerator(options)) {
				entries.push(entry);
			}
			return entries;
		}

		async close() {
		}
	}

	class ZipEntry {

		constructor(reader, config, options) {
			Object$1.assign(this, {
				reader,
				config,
				options
			});
		}

		async getData(writer, fileEntry, options = {}) {
			const zipEntry = this;
			const {
				reader,
				offset,
				diskNumberStart,
				extraFieldAES,
				compressionMethod,
				config,
				bitFlag,
				signature,
				rawLastModDate,
				uncompressedSize,
				compressedSize
			} = zipEntry;
			const localDirectory = zipEntry.localDirectory = {};
			const dataArray = await readUint8Array(reader, offset, 30, diskNumberStart);
			const dataView = getDataView$1(dataArray);
			let password = getOptionValue$1(zipEntry, options, "password");
			password = password && password.length && password;
			if (extraFieldAES) {
				if (extraFieldAES.originalCompressionMethod != COMPRESSION_METHOD_AES) {
					throw new Error(ERR_UNSUPPORTED_COMPRESSION);
				}
			}
			if (compressionMethod != COMPRESSION_METHOD_STORE && compressionMethod != COMPRESSION_METHOD_DEFLATE) {
				throw new Error(ERR_UNSUPPORTED_COMPRESSION);
			}
			if (getUint32(dataView, 0) != LOCAL_FILE_HEADER_SIGNATURE) {
				throw new Error(ERR_LOCAL_FILE_HEADER_NOT_FOUND);
			}
			readCommonHeader(localDirectory, dataView, 4);
			localDirectory.rawExtraField = localDirectory.extraFieldLength ?
				await readUint8Array(reader, offset + 30 + localDirectory.filenameLength, localDirectory.extraFieldLength, diskNumberStart) :
				new Uint8Array$1();
			await readCommonFooter(zipEntry, localDirectory, dataView, 4);
			Object$1.assign(fileEntry, {
				lastAccessDate: localDirectory.lastAccessDate,
				creationDate: localDirectory.creationDate
			});
			const encrypted = zipEntry.encrypted && localDirectory.encrypted;
			const zipCrypto = encrypted && !extraFieldAES;
			if (encrypted) {
				if (!zipCrypto && extraFieldAES.strength === UNDEFINED_VALUE) {
					throw new Error(ERR_UNSUPPORTED_ENCRYPTION);
				} else if (!password) {
					throw new Error(ERR_ENCRYPTED);
				}
			}
			const dataOffset = offset + 30 + localDirectory.filenameLength + localDirectory.extraFieldLength;
			const readable = reader.readable;
			readable.diskNumberStart = diskNumberStart;
			readable.offset = dataOffset;
			const size = readable.size = compressedSize;
			const signal = getOptionValue$1(zipEntry, options, "signal");
			writer = initWriter(writer);
			await initStream(writer, uncompressedSize);
			const { writable } = writer;
			const { onstart, onprogress, onend } = options;
			const workerOptions = {
				options: {
					codecType: CODEC_INFLATE,
					password,
					zipCrypto,
					encryptionStrength: extraFieldAES && extraFieldAES.strength,
					signed: getOptionValue$1(zipEntry, options, "checkSignature"),
					passwordVerification: zipCrypto && (bitFlag.dataDescriptor ? ((rawLastModDate >>> 8) & 0xFF) : ((signature >>> 24) & 0xFF)),
					signature,
					compressed: compressionMethod != 0,
					encrypted,
					useWebWorkers: getOptionValue$1(zipEntry, options, "useWebWorkers"),
					useCompressionStream: getOptionValue$1(zipEntry, options, "useCompressionStream"),
					transferStreams: getOptionValue$1(zipEntry, options, "transferStreams")
				},
				config,
				streamOptions: { signal, size, onstart, onprogress, onend }
			};
			writable.size += (await runWorker({ readable, writable }, workerOptions)).size;
			const preventClose = getOptionValue$1(zipEntry, options, "preventClose");
			if (!preventClose) {
				await writable.close();
			}
			return writer.getData ? writer.getData() : writable;
		}
	}

	function readCommonHeader(directory, dataView, offset) {
		const rawBitFlag = directory.rawBitFlag = getUint16(dataView, offset + 2);
		const encrypted = (rawBitFlag & BITFLAG_ENCRYPTED) == BITFLAG_ENCRYPTED;
		const rawLastModDate = getUint32(dataView, offset + 6);
		Object$1.assign(directory, {
			encrypted,
			version: getUint16(dataView, offset),
			bitFlag: {
				level: (rawBitFlag & BITFLAG_LEVEL) >> 1,
				dataDescriptor: (rawBitFlag & BITFLAG_DATA_DESCRIPTOR) == BITFLAG_DATA_DESCRIPTOR,
				languageEncodingFlag: (rawBitFlag & BITFLAG_LANG_ENCODING_FLAG) == BITFLAG_LANG_ENCODING_FLAG
			},
			rawLastModDate,
			lastModDate: getDate(rawLastModDate),
			filenameLength: getUint16(dataView, offset + 22),
			extraFieldLength: getUint16(dataView, offset + 24)
		});
	}

	async function readCommonFooter(fileEntry, directory, dataView, offset) {
		const { rawExtraField } = directory;
		const extraField = directory.extraField = new Map();
		const rawExtraFieldView = getDataView$1(new Uint8Array$1(rawExtraField));
		let offsetExtraField = 0;
		try {
			while (offsetExtraField < rawExtraField.length) {
				const type = getUint16(rawExtraFieldView, offsetExtraField);
				const size = getUint16(rawExtraFieldView, offsetExtraField + 2);
				extraField.set(type, {
					type,
					data: rawExtraField.slice(offsetExtraField + 4, offsetExtraField + 4 + size)
				});
				offsetExtraField += 4 + size;
			}
		} catch (_error) {
			// ignored
		}
		const compressionMethod = getUint16(dataView, offset + 4);
		Object$1.assign(directory, {
			signature: getUint32(dataView, offset + 10),
			uncompressedSize: getUint32(dataView, offset + 18),
			compressedSize: getUint32(dataView, offset + 14)
		});
		const extraFieldZip64 = extraField.get(EXTRAFIELD_TYPE_ZIP64);
		if (extraFieldZip64) {
			readExtraFieldZip64(extraFieldZip64, directory);
			directory.extraFieldZip64 = extraFieldZip64;
		}
		const extraFieldUnicodePath = extraField.get(EXTRAFIELD_TYPE_UNICODE_PATH);
		if (extraFieldUnicodePath) {
			await readExtraFieldUnicode(extraFieldUnicodePath, PROPERTY_NAME_FILENAME, PROPERTY_NAME_RAW_FILENAME, directory, fileEntry);
			directory.extraFieldUnicodePath = extraFieldUnicodePath;
		}
		const extraFieldUnicodeComment = extraField.get(EXTRAFIELD_TYPE_UNICODE_COMMENT);
		if (extraFieldUnicodeComment) {
			await readExtraFieldUnicode(extraFieldUnicodeComment, PROPERTY_NAME_COMMENT, PROPERTY_NAME_RAW_COMMENT, directory, fileEntry);
			directory.extraFieldUnicodeComment = extraFieldUnicodeComment;
		}
		const extraFieldAES = extraField.get(EXTRAFIELD_TYPE_AES);
		if (extraFieldAES) {
			readExtraFieldAES(extraFieldAES, directory, compressionMethod);
			directory.extraFieldAES = extraFieldAES;
		} else {
			directory.compressionMethod = compressionMethod;
		}
		const extraFieldNTFS = extraField.get(EXTRAFIELD_TYPE_NTFS);
		if (extraFieldNTFS) {
			readExtraFieldNTFS(extraFieldNTFS, directory);
			directory.extraFieldNTFS = extraFieldNTFS;
		}
		const extraFieldExtendedTimestamp = extraField.get(EXTRAFIELD_TYPE_EXTENDED_TIMESTAMP);
		if (extraFieldExtendedTimestamp) {
			readExtraFieldExtendedTimestamp(extraFieldExtendedTimestamp, directory);
			directory.extraFieldExtendedTimestamp = extraFieldExtendedTimestamp;
		}
	}

	function readExtraFieldZip64(extraFieldZip64, directory) {
		directory.zip64 = true;
		const extraFieldView = getDataView$1(extraFieldZip64.data);
		const missingProperties = ZIP64_PROPERTIES.filter(([propertyName, max]) => directory[propertyName] == max);
		for (let indexMissingProperty = 0, offset = 0; indexMissingProperty < missingProperties.length; indexMissingProperty++) {
			const [propertyName, max] = missingProperties[indexMissingProperty];
			if (directory[propertyName] == max) {
				const extraction = ZIP64_EXTRACTION[max];
				directory[propertyName] = extraFieldZip64[propertyName] = extraction.getValue(extraFieldView, offset);
				offset += extraction.bytes;
			} else if (extraFieldZip64[propertyName]) {
				throw new Error(ERR_EXTRAFIELD_ZIP64_NOT_FOUND);
			}
		}
	}

	async function readExtraFieldUnicode(extraFieldUnicode, propertyName, rawPropertyName, directory, fileEntry) {
		const extraFieldView = getDataView$1(extraFieldUnicode.data);
		const crc32 = new Crc32();
		crc32.append(fileEntry[rawPropertyName]);
		const dataViewSignature = getDataView$1(new Uint8Array$1(4));
		dataViewSignature.setUint32(0, crc32.get(), true);
		Object$1.assign(extraFieldUnicode, {
			version: getUint8(extraFieldView, 0),
			signature: getUint32(extraFieldView, 1),
			[propertyName]: await decodeText(extraFieldUnicode.data.subarray(5)),
			valid: !fileEntry.bitFlag.languageEncodingFlag && extraFieldUnicode.signature == getUint32(dataViewSignature, 0)
		});
		if (extraFieldUnicode.valid) {
			directory[propertyName] = extraFieldUnicode[propertyName];
			directory[propertyName + "UTF8"] = true;
		}
	}

	function readExtraFieldAES(extraFieldAES, directory, compressionMethod) {
		const extraFieldView = getDataView$1(extraFieldAES.data);
		const strength = getUint8(extraFieldView, 4);
		Object$1.assign(extraFieldAES, {
			vendorVersion: getUint8(extraFieldView, 0),
			vendorId: getUint8(extraFieldView, 2),
			strength,
			originalCompressionMethod: compressionMethod,
			compressionMethod: getUint16(extraFieldView, 5)
		});
		directory.compressionMethod = extraFieldAES.compressionMethod;
	}

	function readExtraFieldNTFS(extraFieldNTFS, directory) {
		const extraFieldView = getDataView$1(extraFieldNTFS.data);
		let offsetExtraField = 4;
		let tag1Data;
		try {
			while (offsetExtraField < extraFieldNTFS.data.length && !tag1Data) {
				const tagValue = getUint16(extraFieldView, offsetExtraField);
				const attributeSize = getUint16(extraFieldView, offsetExtraField + 2);
				if (tagValue == EXTRAFIELD_TYPE_NTFS_TAG1) {
					tag1Data = extraFieldNTFS.data.slice(offsetExtraField + 4, offsetExtraField + 4 + attributeSize);
				}
				offsetExtraField += 4 + attributeSize;
			}
		} catch (_error) {
			// ignored
		}
		try {
			if (tag1Data && tag1Data.length == 24) {
				const tag1View = getDataView$1(tag1Data);
				const rawLastModDate = tag1View.getBigUint64(0, true);
				const rawLastAccessDate = tag1View.getBigUint64(8, true);
				const rawCreationDate = tag1View.getBigUint64(16, true);
				Object$1.assign(extraFieldNTFS, {
					rawLastModDate,
					rawLastAccessDate,
					rawCreationDate
				});
				const lastModDate = getDateNTFS(rawLastModDate);
				const lastAccessDate = getDateNTFS(rawLastAccessDate);
				const creationDate = getDateNTFS(rawCreationDate);
				const extraFieldData = { lastModDate, lastAccessDate, creationDate };
				Object$1.assign(extraFieldNTFS, extraFieldData);
				Object$1.assign(directory, extraFieldData);
			}
		} catch (_error) {
			// ignored
		}
	}

	function readExtraFieldExtendedTimestamp(extraFieldExtendedTimestamp, directory) {
		const extraFieldView = getDataView$1(extraFieldExtendedTimestamp.data);
		const flags = getUint8(extraFieldView, 0);
		const timeProperties = [];
		const timeRawProperties = [];
		if ((flags & 0x1) == 0x1) {
			timeProperties.push(PROPERTY_NAME_LAST_MODIFICATION_DATE);
			timeRawProperties.push(PROPERTY_NAME_RAW_LAST_MODIFICATION_DATE);
		}
		if ((flags & 0x2) == 0x2) {
			timeProperties.push(PROPERTY_NAME_LAST_ACCESS_DATE);
			timeRawProperties.push(PROPERTY_NAME_RAW_LAST_ACCESS_DATE);
		}
		if ((flags & 0x4) == 0x4) {
			timeProperties.push(PROPERTY_NAME_CREATION_DATE);
			timeRawProperties.push(PROPERTY_NAME_RAW_CREATION_DATE);
		}
		let offset = 1;
		timeProperties.forEach((propertyName, indexProperty) => {
			if (extraFieldExtendedTimestamp.data.length >= offset + 4) {
				const time = getUint32(extraFieldView, offset);
				directory[propertyName] = extraFieldExtendedTimestamp[propertyName] = new Date(time * 1000);
				const rawPropertyName = timeRawProperties[indexProperty];
				extraFieldExtendedTimestamp[rawPropertyName] = time;
			}
			offset += 4;
		});
	}

	async function seekSignature(reader, signature, startOffset, minimumBytes, maximumLength) {
		const signatureArray = new Uint8Array$1(4);
		const signatureView = getDataView$1(signatureArray);
		setUint32$1(signatureView, 0, signature);
		const maximumBytes = minimumBytes + maximumLength;
		return (await seek(minimumBytes)) || await seek(Math$1.min(maximumBytes, startOffset));

		async function seek(length) {
			const offset = startOffset - length;
			const bytes = await readUint8Array(reader, offset, length);
			for (let indexByte = bytes.length - minimumBytes; indexByte >= 0; indexByte--) {
				if (bytes[indexByte] == signatureArray[0] && bytes[indexByte + 1] == signatureArray[1] &&
					bytes[indexByte + 2] == signatureArray[2] && bytes[indexByte + 3] == signatureArray[3]) {
					return {
						offset: offset + indexByte,
						buffer: bytes.slice(indexByte, indexByte + minimumBytes).buffer
					};
				}
			}
		}
	}

	function getOptionValue$1(zipReader, options, name) {
		return options[name] === UNDEFINED_VALUE ? zipReader.options[name] : options[name];
	}

	function getDate(timeRaw) {
		const date = (timeRaw & 0xffff0000) >> 16, time = timeRaw & 0x0000ffff;
		try {
			return new Date(1980 + ((date & 0xFE00) >> 9), ((date & 0x01E0) >> 5) - 1, date & 0x001F, (time & 0xF800) >> 11, (time & 0x07E0) >> 5, (time & 0x001F) * 2, 0);
		} catch (_error) {
			// ignored
		}
	}

	function getDateNTFS(timeRaw) {
		return new Date((Number((timeRaw / BigInt(10000)) - BigInt(11644473600000))));
	}

	function getUint8(view, offset) {
		return view.getUint8(offset);
	}

	function getUint16(view, offset) {
		return view.getUint16(offset, true);
	}

	function getUint32(view, offset) {
		return view.getUint32(offset, true);
	}

	function getBigUint64(view, offset) {
		return Number(view.getBigUint64(offset, true));
	}

	function setUint32$1(view, offset, value) {
		view.setUint32(offset, value, true);
	}

	function getDataView$1(array) {
		return new DataView(array.buffer);
	}

	/*
	 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */

	const ERR_DUPLICATED_NAME = "File already exists";
	const ERR_INVALID_COMMENT = "Zip file comment exceeds 64KB";
	const ERR_INVALID_ENTRY_COMMENT = "File entry comment exceeds 64KB";
	const ERR_INVALID_ENTRY_NAME = "File entry name exceeds 64KB";
	const ERR_INVALID_VERSION = "Version exceeds 65535";
	const ERR_INVALID_ENCRYPTION_STRENGTH = "The strength must equal 1, 2, or 3";
	const ERR_INVALID_EXTRAFIELD_TYPE = "Extra field type exceeds 65535";
	const ERR_INVALID_EXTRAFIELD_DATA = "Extra field data exceeds 64KB";
	const ERR_UNSUPPORTED_FORMAT = "Zip64 is not supported (make sure 'keepOrder' is set to 'true')";

	const EXTRAFIELD_DATA_AES = new Uint8Array$1([0x07, 0x00, 0x02, 0x00, 0x41, 0x45, 0x03, 0x00, 0x00]);
	const EXTRAFIELD_LENGTH_ZIP64 = 28;

	let workers = 0;
	const pendingEntries = [];

	class ZipWriter {

		constructor(writer, options = {}) {
			writer = initWriter(writer);
			Object$1.assign(this, {
				writer,
				addSplitZipSignature: writer instanceof SplitDataWriter,
				options,
				config: getConfiguration(),
				files: new Map(),
				filenames: new Set(),
				offset: writer.writable.size,
				pendingEntriesSize: 0,
				pendingAddFileCalls: new Set(),
				bufferedWrites: 0
			});
		}

		async add(name = "", reader, options = {}) {
			const zipWriter = this;
			const {
				pendingAddFileCalls,
				config
			} = zipWriter;
			if (workers < config.maxWorkers) {
				workers++;
			} else {
				await new Promise$1(resolve => pendingEntries.push(resolve));
			}
			let promiseAddFile;
			try {
				name = name.trim();
				if (zipWriter.filenames.has(name)) {
					throw new Error(ERR_DUPLICATED_NAME);
				}
				zipWriter.filenames.add(name);
				promiseAddFile = addFile(zipWriter, name, reader, options);
				pendingAddFileCalls.add(promiseAddFile);
				return await promiseAddFile;
			} catch (error) {
				zipWriter.filenames.delete(name);
				throw error;
			} finally {
				pendingAddFileCalls.delete(promiseAddFile);
				const pendingEntry = pendingEntries.shift();
				if (pendingEntry) {
					pendingEntry();
				} else {
					workers--;
				}
			}
		}

		async close(comment = new Uint8Array$1(), options = {}) {
			const zipWriter = this;
			const { pendingAddFileCalls, writer } = this;
			const { writable } = writer;
			while (pendingAddFileCalls.size) {
				await Promise$1.all(Array$1.from(pendingAddFileCalls));
			}
			await closeFile(this, comment, options);
			const preventClose = getOptionValue(zipWriter, options, "preventClose");
			if (!preventClose) {
				await writable.close();
			}
			return writer.getData ? writer.getData() : writable;
		}
	}

	async function addFile(zipWriter, name, reader, options) {
		name = name.trim();
		if (options.directory && (!name.endsWith(DIRECTORY_SIGNATURE))) {
			name += DIRECTORY_SIGNATURE;
		} else {
			options.directory = name.endsWith(DIRECTORY_SIGNATURE);
		}
		const rawFilename = encodeText(name);
		if (getLength(rawFilename) > MAX_16_BITS) {
			throw new Error(ERR_INVALID_ENTRY_NAME);
		}
		const comment = options.comment || "";
		const rawComment = encodeText(comment);
		if (getLength(rawComment) > MAX_16_BITS) {
			throw new Error(ERR_INVALID_ENTRY_COMMENT);
		}
		const version = getOptionValue(zipWriter, options, "version", VERSION_DEFLATE);
		if (version > MAX_16_BITS) {
			throw new Error(ERR_INVALID_VERSION);
		}
		const versionMadeBy = getOptionValue(zipWriter, options, "versionMadeBy", 20);
		if (versionMadeBy > MAX_16_BITS) {
			throw new Error(ERR_INVALID_VERSION);
		}
		const lastModDate = getOptionValue(zipWriter, options, PROPERTY_NAME_LAST_MODIFICATION_DATE, new Date());
		const lastAccessDate = getOptionValue(zipWriter, options, PROPERTY_NAME_LAST_ACCESS_DATE);
		const creationDate = getOptionValue(zipWriter, options, PROPERTY_NAME_CREATION_DATE);
		const msDosCompatible = getOptionValue(zipWriter, options, PROPERTY_NAME_MS_DOS_COMPATIBLE, true);
		const internalFileAttribute = getOptionValue(zipWriter, options, PROPERTY_NAME_INTERNAL_FILE_ATTRIBUTE, 0);
		const externalFileAttribute = getOptionValue(zipWriter, options, PROPERTY_NAME_EXTERNAL_FILE_ATTRIBUTE, 0);
		const password = getOptionValue(zipWriter, options, "password");
		const encryptionStrength = getOptionValue(zipWriter, options, "encryptionStrength", 3);
		const zipCrypto = getOptionValue(zipWriter, options, "zipCrypto");
		const extendedTimestamp = getOptionValue(zipWriter, options, "extendedTimestamp", true);
		const keepOrder = getOptionValue(zipWriter, options, "keepOrder", true);
		const level = getOptionValue(zipWriter, options, "level");
		const useWebWorkers = getOptionValue(zipWriter, options, "useWebWorkers");
		const bufferedWrite = getOptionValue(zipWriter, options, "bufferedWrite");
		const dataDescriptorSignature = getOptionValue(zipWriter, options, "dataDescriptorSignature", false);
		const signal = getOptionValue(zipWriter, options, "signal");
		const useCompressionStream = getOptionValue(zipWriter, options, "useCompressionStream");
		let dataDescriptor = getOptionValue(zipWriter, options, "dataDescriptor", true);
		let zip64 = getOptionValue(zipWriter, options, PROPERTY_NAME_ZIP64);
		if (password !== UNDEFINED_VALUE && encryptionStrength !== UNDEFINED_VALUE && (encryptionStrength < 1 || encryptionStrength > 3)) {
			throw new Error(ERR_INVALID_ENCRYPTION_STRENGTH);
		}
		let rawExtraField = new Uint8Array$1();
		const { extraField } = options;
		if (extraField) {
			let extraFieldSize = 0;
			let offset = 0;
			extraField.forEach(data => extraFieldSize += 4 + getLength(data));
			rawExtraField = new Uint8Array$1(extraFieldSize);
			extraField.forEach((data, type) => {
				if (type > MAX_16_BITS) {
					throw new Error(ERR_INVALID_EXTRAFIELD_TYPE);
				}
				if (getLength(data) > MAX_16_BITS) {
					throw new Error(ERR_INVALID_EXTRAFIELD_DATA);
				}
				arraySet(rawExtraField, new Uint16Array([type]), offset);
				arraySet(rawExtraField, new Uint16Array([getLength(data)]), offset + 2);
				arraySet(rawExtraField, data, offset + 4);
				offset += 4 + getLength(data);
			});
		}
		let maximumCompressedSize = 0;
		let maximumEntrySize = 0;
		let uncompressedSize = 0;
		if (reader) {
			reader = initReader(reader);
			await initStream(reader);
			if (reader.size === UNDEFINED_VALUE) {
				dataDescriptor = true;
				if (zip64 || zip64 === UNDEFINED_VALUE) {
					zip64 = true;
					maximumCompressedSize = MAX_32_BITS;
				}
			} else {
				uncompressedSize = reader.size;
				maximumCompressedSize = getMaximumCompressedSize(uncompressedSize);
			}
		}
		const { diskOffset, diskNumber, maxSize } = zipWriter.writer;
		if (zipWriter.offset + zipWriter.pendingEntriesSize - diskOffset >= MAX_32_BITS ||
			uncompressedSize >= MAX_32_BITS ||
			maximumCompressedSize >= MAX_32_BITS ||
			diskNumber + Math$1.ceil(zipWriter.pendingEntriesSize / maxSize) >= MAX_16_BITS) {
			if (zip64 === false || !keepOrder) {
				throw new Error(ERR_UNSUPPORTED_FORMAT);
			} else {
				zip64 = true;
			}
		}
		zip64 = zip64 || false;
		options = Object$1.assign({}, options, {
			rawFilename,
			rawComment,
			version,
			versionMadeBy,
			lastModDate,
			lastAccessDate,
			creationDate,
			rawExtraField,
			zip64,
			password,
			level,
			useWebWorkers,
			encryptionStrength,
			extendedTimestamp,
			zipCrypto,
			bufferedWrite,
			keepOrder,
			dataDescriptor,
			dataDescriptorSignature,
			signal,
			msDosCompatible,
			internalFileAttribute,
			externalFileAttribute,
			useCompressionStream
		});
		const headerInfo = getHeaderInfo(options);
		const dataDescriptorInfo = getDataDescriptorInfo(options);
		maximumEntrySize = getLength(headerInfo.localHeaderArray, dataDescriptorInfo.dataDescriptorArray) + maximumCompressedSize;
		zipWriter.pendingEntriesSize += maximumEntrySize;
		let fileEntry;
		try {
			fileEntry = await getFileEntry(zipWriter, name, reader, { headerInfo, dataDescriptorInfo }, options);
		} finally {
			zipWriter.pendingEntriesSize -= maximumEntrySize;
		}
		Object$1.assign(fileEntry, { name, comment, extraField });
		return new Entry(fileEntry);
	}

	async function getFileEntry(zipWriter, name, reader, entryInfo, options) {
		const {
			files,
			writer
		} = zipWriter;
		const {
			keepOrder,
			dataDescriptor,
			signal
		} = options;
		const {
			headerInfo
		} = entryInfo;
		const previousFileEntry = Array$1.from(files.values()).pop();
		let fileEntry = {};
		let bufferedWrite;
		let releaseLockWriter;
		let releaseLockCurrentFileEntry;
		let writingBufferedEntryData;
		let writingEntryData;
		let fileWriter;
		files.set(name, fileEntry);
		try {
			let lockPreviousFileEntry;
			if (keepOrder) {
				lockPreviousFileEntry = previousFileEntry && previousFileEntry.lock;
				requestLockCurrentFileEntry();
			}
			if (options.bufferedWrite || zipWriter.writerLocked || (zipWriter.bufferedWrites && keepOrder) || !dataDescriptor) {
				fileWriter = new BlobWriter();
				fileWriter.writable.size = 0;
				bufferedWrite = true;
				zipWriter.bufferedWrites++;
				await initStream(writer);
			} else {
				fileWriter = writer;
				await requestLockWriter();
			}
			await initStream(fileWriter);
			const { writable } = writer;
			let { diskOffset } = writer;
			if (zipWriter.addSplitZipSignature) {
				delete zipWriter.addSplitZipSignature;
				const signatureArray = new Uint8Array$1(4);
				const signatureArrayView = getDataView(signatureArray);
				setUint32(signatureArrayView, 0, SPLIT_ZIP_FILE_SIGNATURE);
				await writeData(writable, signatureArray);
				zipWriter.offset += 4;
			}
			if (!bufferedWrite) {
				await lockPreviousFileEntry;
				await skipDiskIfNeeded(writable);
			}
			const { diskNumber } = writer;
			writingEntryData = true;
			fileEntry.diskNumberStart = diskNumber;
			fileEntry = await createFileEntry(reader, fileWriter, fileEntry, entryInfo, zipWriter.config, options);
			writingEntryData = false;
			files.set(name, fileEntry);
			fileEntry.filename = name;
			if (bufferedWrite) {
				await fileWriter.writable.close();
				let blob = await fileWriter.getData();
				await lockPreviousFileEntry;
				await requestLockWriter();
				writingBufferedEntryData = true;
				if (!dataDescriptor) {
					blob = await writeMissingHeaderInfo(fileEntry, blob, writable, options);
				}
				await skipDiskIfNeeded(writable);
				fileEntry.diskNumberStart = writer.diskNumber;
				diskOffset = writer.diskOffset;
				await blob.stream().pipeTo(writable, { preventClose: true, signal });
				writable.size += blob.size;
				writingBufferedEntryData = false;
			}
			fileEntry.offset = zipWriter.offset - diskOffset;
			if (fileEntry.zip64) {
				setZip64OffsetInfo(fileEntry);
			} else if (fileEntry.offset >= MAX_32_BITS) {
				throw new Error(ERR_UNSUPPORTED_FORMAT);
			}
			zipWriter.offset += fileEntry.length;
			return fileEntry;
		} catch (error) {
			if ((bufferedWrite && writingBufferedEntryData) || (!bufferedWrite && writingEntryData)) {
				zipWriter.hasCorruptedEntries = true;
				if (error) {
					error.corruptedEntry = true;
				}
				if (bufferedWrite) {
					zipWriter.offset += fileWriter.writable.size;
				} else {
					zipWriter.offset = fileWriter.writable.size;
				}
			}
			files.delete(name);
			throw error;
		} finally {
			if (bufferedWrite) {
				zipWriter.bufferedWrites--;
			}
			if (releaseLockCurrentFileEntry) {
				releaseLockCurrentFileEntry();
			}
			if (releaseLockWriter) {
				releaseLockWriter();
			}
		}

		function requestLockCurrentFileEntry() {
			fileEntry.lock = new Promise$1(resolve => releaseLockCurrentFileEntry = resolve);
		}

		async function requestLockWriter() {
			zipWriter.writerLocked = true;
			const { lockWriter } = zipWriter; 
			zipWriter.lockWriter = new Promise$1(resolve => releaseLockWriter = () => {
				zipWriter.writerLocked = false;
				resolve();
			});
			await lockWriter;
		}

		async function skipDiskIfNeeded(writable) {
			if (headerInfo.localHeaderArray.length > writer.availableSize) {
				writer.availableSize = 0;
				await writeData(writable, new Uint8Array$1());
			}
		}
	}

	async function createFileEntry(reader, writer, { diskNumberStart, lock }, entryInfo, config, options) {
		const {
			headerInfo,
			dataDescriptorInfo
		} = entryInfo;
		const {
			localHeaderArray,
			headerArray,
			lastModDate,
			rawLastModDate,
			encrypted,
			compressed,
			version,
			compressionMethod,
			rawExtraFieldExtendedTimestamp,
			rawExtraFieldNTFS,
			rawExtraFieldAES
		} = headerInfo;
		const { dataDescriptorArray } = dataDescriptorInfo;
		const {
			rawFilename,
			lastAccessDate,
			creationDate,
			password,
			level,
			zip64,
			zipCrypto,
			dataDescriptor,
			directory,
			versionMadeBy,
			rawComment,
			rawExtraField,
			useWebWorkers,
			onstart,
			onprogress,
			onend,
			signal,
			encryptionStrength,
			extendedTimestamp,
			msDosCompatible,
			internalFileAttribute,
			externalFileAttribute,
			useCompressionStream
		} = options;
		const fileEntry = {
			lock,
			versionMadeBy,
			zip64,
			directory: Boolean(directory),
			filenameUTF8: true,
			rawFilename,
			commentUTF8: true,
			rawComment,
			rawExtraFieldExtendedTimestamp,
			rawExtraFieldNTFS,
			rawExtraFieldAES,
			rawExtraField,
			extendedTimestamp,
			msDosCompatible,
			internalFileAttribute,
			externalFileAttribute,
			diskNumberStart
		};
		let compressedSize = 0;
		let uncompressedSize = 0;
		let signature;
		const { writable } = writer;
		if (reader) {
			reader.chunkSize = getChunkSize(config);
			await writeData(writable, localHeaderArray);
			const readable = reader.readable;
			const size = readable.size = reader.size;
			const workerOptions = {
				options: {
					codecType: CODEC_DEFLATE,
					level,
					password,
					encryptionStrength,
					zipCrypto: encrypted && zipCrypto,
					passwordVerification: encrypted && zipCrypto && (rawLastModDate >> 8) & 0xFF,
					signed: true,
					compressed,
					encrypted,
					useWebWorkers,
					useCompressionStream,
					transferStreams: false
				},
				config,
				streamOptions: { signal, size, onstart, onprogress, onend }
			};
			const result = await runWorker({ readable, writable }, workerOptions);
			writable.size += result.size;
			signature = result.signature;
			uncompressedSize = reader.size = readable.size;
			compressedSize = result.size;
		} else {
			await writeData(writable, localHeaderArray);
		}
		const rawExtraFieldZip64 = zip64 ? new Uint8Array$1(EXTRAFIELD_LENGTH_ZIP64 + 4) : new Uint8Array$1();
		if (reader) {
			setEntryInfo({
				signature,
				rawExtraFieldZip64,
				compressedSize,
				uncompressedSize,
				headerInfo,
				dataDescriptorInfo
			}, options);
		}
		if (dataDescriptor) {
			await writeData(writable, dataDescriptorArray);
		}
		Object$1.assign(fileEntry, {
			compressedSize,
			lastModDate,
			rawLastModDate,
			creationDate,
			lastAccessDate,
			encrypted,
			length: getLength(localHeaderArray, dataDescriptorArray) + compressedSize,
			compressionMethod,
			version,
			headerArray,
			signature,
			rawExtraFieldZip64
		});
		return fileEntry;
	}

	function getHeaderInfo(options) {
		const {
			rawFilename,
			lastModDate,
			lastAccessDate,
			creationDate,
			password,
			level,
			zip64,
			zipCrypto,
			dataDescriptor,
			directory,
			rawExtraField,
			encryptionStrength,
			extendedTimestamp,
		} = options;
		const compressed = level !== 0 && !directory;
		const encrypted = Boolean(password && getLength(password));
		let version = options.version;
		let rawExtraFieldAES;
		if (encrypted && !zipCrypto) {
			rawExtraFieldAES = new Uint8Array$1(getLength(EXTRAFIELD_DATA_AES) + 2);
			const extraFieldAESView = getDataView(rawExtraFieldAES);
			setUint16(extraFieldAESView, 0, EXTRAFIELD_TYPE_AES);
			arraySet(rawExtraFieldAES, EXTRAFIELD_DATA_AES, 2);
			setUint8(extraFieldAESView, 8, encryptionStrength);
		} else {
			rawExtraFieldAES = new Uint8Array$1();
		}
		let rawExtraFieldNTFS;
		let rawExtraFieldExtendedTimestamp;
		if (extendedTimestamp) {
			rawExtraFieldExtendedTimestamp = new Uint8Array$1(9 + (lastAccessDate ? 4 : 0) + (creationDate ? 4 : 0));
			const extraFieldExtendedTimestampView = getDataView(rawExtraFieldExtendedTimestamp);
			setUint16(extraFieldExtendedTimestampView, 0, EXTRAFIELD_TYPE_EXTENDED_TIMESTAMP);
			setUint16(extraFieldExtendedTimestampView, 2, getLength(rawExtraFieldExtendedTimestamp) - 4);
			const extraFieldExtendedTimestampFlag = 0x1 + (lastAccessDate ? 0x2 : 0) + (creationDate ? 0x4 : 0);
			setUint8(extraFieldExtendedTimestampView, 4, extraFieldExtendedTimestampFlag);
			setUint32(extraFieldExtendedTimestampView, 5, Math$1.floor(lastModDate.getTime() / 1000));
			if (lastAccessDate) {
				setUint32(extraFieldExtendedTimestampView, 9, Math$1.floor(lastAccessDate.getTime() / 1000));
			}
			if (creationDate) {
				setUint32(extraFieldExtendedTimestampView, 13, Math$1.floor(creationDate.getTime() / 1000));
			}
			try {
				rawExtraFieldNTFS = new Uint8Array$1(36);
				const extraFieldNTFSView = getDataView(rawExtraFieldNTFS);
				const lastModTimeNTFS = getTimeNTFS(lastModDate);
				setUint16(extraFieldNTFSView, 0, EXTRAFIELD_TYPE_NTFS);
				setUint16(extraFieldNTFSView, 2, 32);
				setUint16(extraFieldNTFSView, 8, EXTRAFIELD_TYPE_NTFS_TAG1);
				setUint16(extraFieldNTFSView, 10, 24);
				setBigUint64(extraFieldNTFSView, 12, lastModTimeNTFS);
				setBigUint64(extraFieldNTFSView, 20, getTimeNTFS(lastAccessDate) || lastModTimeNTFS);
				setBigUint64(extraFieldNTFSView, 28, getTimeNTFS(creationDate) || lastModTimeNTFS);
			} catch (_error) {
				rawExtraFieldNTFS = new Uint8Array$1();
			}
		} else {
			rawExtraFieldNTFS = rawExtraFieldExtendedTimestamp = new Uint8Array$1();
		}
		let bitFlag = BITFLAG_LANG_ENCODING_FLAG;
		if (dataDescriptor) {
			bitFlag = bitFlag | BITFLAG_DATA_DESCRIPTOR;
		}
		let compressionMethod = COMPRESSION_METHOD_STORE;
		if (compressed) {
			compressionMethod = COMPRESSION_METHOD_DEFLATE;
		}
		if (zip64) {
			version = version > VERSION_ZIP64 ? version : VERSION_ZIP64;
		}
		if (encrypted) {
			bitFlag = bitFlag | BITFLAG_ENCRYPTED;
			if (!zipCrypto) {
				version = version > VERSION_AES ? version : VERSION_AES;
				compressionMethod = COMPRESSION_METHOD_AES;
				if (compressed) {
					rawExtraFieldAES[9] = COMPRESSION_METHOD_DEFLATE;
				}
			}
		}
		const headerArray = new Uint8Array$1(26);
		const headerView = getDataView(headerArray);
		setUint16(headerView, 0, version);
		setUint16(headerView, 2, bitFlag);
		setUint16(headerView, 4, compressionMethod);
		const dateArray = new Uint32Array(1);
		const dateView = getDataView(dateArray);
		let lastModDateMsDos;
		if (lastModDate < MIN_DATE) {
			lastModDateMsDos = MIN_DATE;
		} else if (lastModDate > MAX_DATE) {
			lastModDateMsDos = MAX_DATE;
		} else {
			lastModDateMsDos = lastModDate;
		}
		setUint16(dateView, 0, (((lastModDateMsDos.getHours() << 6) | lastModDateMsDos.getMinutes()) << 5) | lastModDateMsDos.getSeconds() / 2);
		setUint16(dateView, 2, ((((lastModDateMsDos.getFullYear() - 1980) << 4) | (lastModDateMsDos.getMonth() + 1)) << 5) | lastModDateMsDos.getDate());
		const rawLastModDate = dateArray[0];
		setUint32(headerView, 6, rawLastModDate);
		setUint16(headerView, 22, getLength(rawFilename));
		const extraFieldLength = getLength(rawExtraFieldAES, rawExtraFieldExtendedTimestamp, rawExtraFieldNTFS, rawExtraField);
		setUint16(headerView, 24, extraFieldLength);
		const localHeaderArray = new Uint8Array$1(30 + getLength(rawFilename) + extraFieldLength);
		const localHeaderView = getDataView(localHeaderArray);
		setUint32(localHeaderView, 0, LOCAL_FILE_HEADER_SIGNATURE);
		arraySet(localHeaderArray, headerArray, 4);
		arraySet(localHeaderArray, rawFilename, 30);
		arraySet(localHeaderArray, rawExtraFieldAES, 30 + getLength(rawFilename));
		arraySet(localHeaderArray, rawExtraFieldExtendedTimestamp, 30 + getLength(rawFilename, rawExtraFieldAES));
		arraySet(localHeaderArray, rawExtraFieldNTFS, 30 + getLength(rawFilename, rawExtraFieldAES, rawExtraFieldExtendedTimestamp));
		arraySet(localHeaderArray, rawExtraField, 30 + getLength(rawFilename, rawExtraFieldAES, rawExtraFieldExtendedTimestamp, rawExtraFieldNTFS));
		return {
			localHeaderArray,
			headerArray,
			headerView,
			lastModDate,
			rawLastModDate,
			encrypted,
			compressed,
			version,
			compressionMethod,
			rawExtraFieldExtendedTimestamp,
			rawExtraFieldNTFS,
			rawExtraFieldAES
		};
	}

	function getDataDescriptorInfo(options) {
		const {
			zip64,
			dataDescriptor,
			dataDescriptorSignature
		} = options;
		let dataDescriptorArray = new Uint8Array$1();
		let dataDescriptorView, dataDescriptorOffset = 0;
		if (dataDescriptor) {
			dataDescriptorArray = new Uint8Array$1(zip64 ? (dataDescriptorSignature ? 24 : 20) : (dataDescriptorSignature ? 16 : 12));
			dataDescriptorView = getDataView(dataDescriptorArray);
			if (dataDescriptorSignature) {
				dataDescriptorOffset = 4;
				setUint32(dataDescriptorView, 0, DATA_DESCRIPTOR_RECORD_SIGNATURE);
			}
		}
		return {
			dataDescriptorArray,
			dataDescriptorView,
			dataDescriptorOffset
		};
	}

	function setEntryInfo(entryInfo, options) {
		const {
			signature,
			rawExtraFieldZip64,
			compressedSize,
			uncompressedSize,
			headerInfo,
			dataDescriptorInfo
		} = entryInfo;
		const {
			headerView,
			encrypted
		} = headerInfo;
		const {
			dataDescriptorView,
			dataDescriptorOffset
		} = dataDescriptorInfo;
		const {
			zip64,
			zipCrypto,
			dataDescriptor
		} = options;
		if ((!encrypted || zipCrypto) && signature !== UNDEFINED_VALUE) {
			setUint32(headerView, 10, signature);
			if (dataDescriptor) {
				setUint32(dataDescriptorView, dataDescriptorOffset, signature);
			}
		}
		if (zip64) {
			const rawExtraFieldZip64View = getDataView(rawExtraFieldZip64);
			setUint16(rawExtraFieldZip64View, 0, EXTRAFIELD_TYPE_ZIP64);
			setUint16(rawExtraFieldZip64View, 2, EXTRAFIELD_LENGTH_ZIP64);
			setUint32(headerView, 14, MAX_32_BITS);
			setBigUint64(rawExtraFieldZip64View, 12, BigInt(compressedSize));
			setUint32(headerView, 18, MAX_32_BITS);
			setBigUint64(rawExtraFieldZip64View, 4, BigInt(uncompressedSize));
			if (dataDescriptor) {
				setBigUint64(dataDescriptorView, dataDescriptorOffset + 4, BigInt(compressedSize));
				setBigUint64(dataDescriptorView, dataDescriptorOffset + 12, BigInt(uncompressedSize));
			}
		} else {
			setUint32(headerView, 14, compressedSize);
			setUint32(headerView, 18, uncompressedSize);
			if (dataDescriptor) {
				setUint32(dataDescriptorView, dataDescriptorOffset + 4, compressedSize);
				setUint32(dataDescriptorView, dataDescriptorOffset + 8, uncompressedSize);
			}
		}
	}

	async function writeMissingHeaderInfo(fileEntry, entryData, writable, { zipCrypto }) {
		const arrayBuffer = await sliceAsArrayBuffer(entryData, 0, 26);
		const arrayBufferView = new DataView(arrayBuffer);
		if (!fileEntry.encrypted || zipCrypto) {
			setUint32(arrayBufferView, 14, fileEntry.signature);
		}
		if (fileEntry.zip64) {
			setUint32(arrayBufferView, 18, MAX_32_BITS);
			setUint32(arrayBufferView, 22, MAX_32_BITS);
		} else {
			setUint32(arrayBufferView, 18, fileEntry.compressedSize);
			setUint32(arrayBufferView, 22, fileEntry.uncompressedSize);
		}
		await writeData(writable, new Uint8Array$1(arrayBuffer));
		return entryData.slice(arrayBuffer.byteLength);
	}

	function setZip64OffsetInfo(fileEntry) {
		const { rawExtraFieldZip64, offset, diskNumberStart } = fileEntry;
		const rawExtraFieldZip64View = getDataView(rawExtraFieldZip64);
		setBigUint64(rawExtraFieldZip64View, 20, BigInt(offset));
		setUint32(rawExtraFieldZip64View, 28, diskNumberStart);
	}

	async function closeFile(zipWriter, comment, options) {
		const { files, writer } = zipWriter;
		const { diskOffset, writable } = writer;
		let { diskNumber } = writer;
		let offset = 0;
		let directoryDataLength = 0;
		let directoryOffset = zipWriter.offset - diskOffset;
		let filesLength = files.size;
		for (const [, {
			rawFilename,
			rawExtraFieldZip64,
			rawExtraFieldAES,
			rawExtraField,
			rawComment,
			rawExtraFieldExtendedTimestamp,
			rawExtraFieldNTFS
		}] of files) {
			directoryDataLength += 46 +
				getLength(
					rawFilename,
					rawComment,
					rawExtraFieldZip64,
					rawExtraFieldAES,
					rawExtraFieldExtendedTimestamp,
					rawExtraFieldNTFS,
					rawExtraField);
		}
		const directoryArray = new Uint8Array$1(directoryDataLength);
		const directoryView = getDataView(directoryArray);
		await initStream(writer);
		let directoryDiskOffset = 0;
		for (const [indexFileEntry, fileEntry] of Array$1.from(files.values()).entries()) {
			const {
				offset: fileEntryOffset,
				rawFilename,
				rawExtraFieldZip64,
				rawExtraFieldAES,
				rawExtraFieldNTFS,
				rawExtraField,
				rawComment,
				versionMadeBy,
				headerArray,
				directory,
				zip64,
				msDosCompatible,
				internalFileAttribute,
				externalFileAttribute,
				extendedTimestamp,
				lastModDate,
				diskNumberStart
			} = fileEntry;
			let rawExtraFieldExtendedTimestamp;
			if (extendedTimestamp) {
				rawExtraFieldExtendedTimestamp = new Uint8Array$1(9);
				const extraFieldExtendedTimestampView = getDataView(rawExtraFieldExtendedTimestamp);
				setUint16(extraFieldExtendedTimestampView, 0, EXTRAFIELD_TYPE_EXTENDED_TIMESTAMP);
				setUint16(extraFieldExtendedTimestampView, 2, getLength(rawExtraFieldExtendedTimestamp) - 4);
				setUint8(extraFieldExtendedTimestampView, 4, 0x1);
				setUint32(extraFieldExtendedTimestampView, 5, Math$1.floor(lastModDate.getTime() / 1000));
			} else {
				rawExtraFieldExtendedTimestamp = new Uint8Array$1();
			}
			const extraFieldLength = getLength(rawExtraFieldZip64, rawExtraFieldAES, rawExtraFieldExtendedTimestamp, rawExtraFieldNTFS, rawExtraField);
			setUint32(directoryView, offset, CENTRAL_FILE_HEADER_SIGNATURE);
			setUint16(directoryView, offset + 4, versionMadeBy);
			arraySet(directoryArray, headerArray, offset + 6);
			setUint16(directoryView, offset + 30, extraFieldLength);
			setUint16(directoryView, offset + 32, getLength(rawComment));
			setUint16(directoryView, offset + 34, zip64 ? MAX_16_BITS : diskNumberStart);
			setUint16(directoryView, offset + 36, internalFileAttribute);
			if (externalFileAttribute) {
				setUint32(directoryView, offset + 38, externalFileAttribute);
			} else if (directory && msDosCompatible) {
				setUint8(directoryView, offset + 38, FILE_ATTR_MSDOS_DIR_MASK);
			}
			setUint32(directoryView, offset + 42, zip64 ? MAX_32_BITS : fileEntryOffset);
			arraySet(directoryArray, rawFilename, offset + 46);
			arraySet(directoryArray, rawExtraFieldZip64, offset + 46 + getLength(rawFilename));
			arraySet(directoryArray, rawExtraFieldAES, offset + 46 + getLength(rawFilename, rawExtraFieldZip64));
			arraySet(directoryArray, rawExtraFieldExtendedTimestamp, offset + 46 + getLength(rawFilename, rawExtraFieldZip64, rawExtraFieldAES));
			arraySet(directoryArray, rawExtraFieldNTFS, offset + 46 + getLength(rawFilename, rawExtraFieldZip64, rawExtraFieldAES, rawExtraFieldExtendedTimestamp));
			arraySet(directoryArray, rawExtraField, offset + 46 + getLength(rawFilename, rawExtraFieldZip64, rawExtraFieldAES, rawExtraFieldExtendedTimestamp, rawExtraFieldNTFS));
			arraySet(directoryArray, rawComment, offset + 46 + getLength(rawFilename) + extraFieldLength);
			const directoryEntryLength = 46 + getLength(rawFilename, rawComment) + extraFieldLength;
			if (offset - directoryDiskOffset > writer.availableSize) {
				writer.availableSize = 0;
				await writeData(writable, directoryArray.slice(directoryDiskOffset, offset));
				directoryDiskOffset = offset;
			}
			offset += directoryEntryLength;
			if (options.onprogress) {
				try {
					await options.onprogress(indexFileEntry + 1, files.size, new Entry(fileEntry));
				} catch (_error) {
					// ignored
				}
			}
		}
		await writeData(writable, directoryDiskOffset ? directoryArray.slice(directoryDiskOffset) : directoryArray);
		let lastDiskNumber = writer.diskNumber;
		const { availableSize } = writer;
		if (availableSize < END_OF_CENTRAL_DIR_LENGTH) {
			lastDiskNumber++;
		}
		let zip64 = getOptionValue(zipWriter, options, "zip64");
		if (directoryOffset >= MAX_32_BITS || directoryDataLength >= MAX_32_BITS || filesLength >= MAX_16_BITS || lastDiskNumber >= MAX_16_BITS) {
			if (zip64 === false) {
				throw new Error(ERR_UNSUPPORTED_FORMAT);
			} else {
				zip64 = true;
			}
		}
		const endOfdirectoryArray = new Uint8Array$1(zip64 ? ZIP64_END_OF_CENTRAL_DIR_TOTAL_LENGTH : END_OF_CENTRAL_DIR_LENGTH);
		const endOfdirectoryView = getDataView(endOfdirectoryArray);
		offset = 0;
		if (zip64) {
			setUint32(endOfdirectoryView, 0, ZIP64_END_OF_CENTRAL_DIR_SIGNATURE);
			setBigUint64(endOfdirectoryView, 4, BigInt(44));
			setUint16(endOfdirectoryView, 12, 45);
			setUint16(endOfdirectoryView, 14, 45);
			setUint32(endOfdirectoryView, 16, lastDiskNumber);
			setUint32(endOfdirectoryView, 20, diskNumber);
			setBigUint64(endOfdirectoryView, 24, BigInt(filesLength));
			setBigUint64(endOfdirectoryView, 32, BigInt(filesLength));
			setBigUint64(endOfdirectoryView, 40, BigInt(directoryDataLength));
			setBigUint64(endOfdirectoryView, 48, BigInt(directoryOffset));
			setUint32(endOfdirectoryView, 56, ZIP64_END_OF_CENTRAL_DIR_LOCATOR_SIGNATURE);
			setBigUint64(endOfdirectoryView, 64, BigInt(directoryOffset) + BigInt(directoryDataLength));
			setUint32(endOfdirectoryView, 72, lastDiskNumber + 1);
			diskNumber = MAX_16_BITS;
			filesLength = MAX_16_BITS;
			directoryOffset = MAX_32_BITS;
			directoryDataLength = MAX_32_BITS;
			offset += ZIP64_END_OF_CENTRAL_DIR_LENGTH + ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH;
		}
		setUint32(endOfdirectoryView, offset, END_OF_CENTRAL_DIR_SIGNATURE);
		setUint16(endOfdirectoryView, offset + 4, lastDiskNumber);
		setUint16(endOfdirectoryView, offset + 6, diskNumber);
		setUint16(endOfdirectoryView, offset + 8, filesLength);
		setUint16(endOfdirectoryView, offset + 10, filesLength);
		setUint32(endOfdirectoryView, offset + 12, directoryDataLength);
		setUint32(endOfdirectoryView, offset + 16, directoryOffset);
		const commentLength = getLength(comment);
		if (commentLength) {
			if (commentLength <= MAX_16_BITS) {
				setUint16(endOfdirectoryView, offset + 20, commentLength);
			} else {
				throw new Error(ERR_INVALID_COMMENT);
			}
		}
		await writeData(writable, endOfdirectoryArray);
		if (commentLength) {
			await writeData(writable, comment);
		}
	}

	function sliceAsArrayBuffer(blob, start, end) {
		if (start || end) {
			return blob.slice(start, end).arrayBuffer();
		} else {
			return blob.arrayBuffer();
		}
	}

	async function writeData(writable, array) {
		const streamWriter = writable.getWriter();
		await streamWriter.ready;
		writable.size += getLength(array);
		await streamWriter.write(array);
		streamWriter.releaseLock();
	}

	function getTimeNTFS(date) {
		if (date) {
			return ((BigInt(date.getTime()) + BigInt(11644473600000)) * BigInt(10000));
		}
	}

	function getOptionValue(zipWriter, options, name, defaultValue) {
		const result = options[name] === UNDEFINED_VALUE ? zipWriter.options[name] : options[name];
		return result === UNDEFINED_VALUE ? defaultValue : result;
	}

	function getMaximumCompressedSize(uncompressedSize) {
		return uncompressedSize + (5 * (Math$1.floor(uncompressedSize / 16383) + 1));
	}

	function setUint8(view, offset, value) {
		view.setUint8(offset, value);
	}

	function setUint16(view, offset, value) {
		view.setUint16(offset, value, true);
	}

	function setUint32(view, offset, value) {
		view.setUint32(offset, value, true);
	}

	function setBigUint64(view, offset, value) {
		view.setBigUint64(offset, value, true);
	}

	function arraySet(array, typedArray, offset) {
		array.set(typedArray, offset);
	}

	function getDataView(array) {
		return new DataView(array.buffer);
	}

	function getLength(...arrayLikes) {
		let result = 0;
		arrayLikes.forEach(arrayLike => arrayLike && (result += arrayLike.length));
		return result;
	}

	/*
	 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

	 Redistribution and use in source and binary forms, with or without
	 modification, are permitted provided that the following conditions are met:

	 1. Redistributions of source code must retain the above copyright notice,
	 this list of conditions and the following disclaimer.

	 2. Redistributions in binary form must reproduce the above copyright 
	 notice, this list of conditions and the following disclaimer in 
	 the documentation and/or other materials provided with the distribution.

	 3. The names of the authors may not be used to endorse or promote products
	 derived from this software without specific prior written permission.

	 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
	 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
	 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
	 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */

	let baseURL;
	try {
		baseURL = (document.currentScript && document.currentScript.src || new URL('single-file-extension-editor.js', document.baseURI).href);
	} catch (_error) {
		// ignored
	}
	configure({ baseURL });
	e(configure);

	var zip$1 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		BlobReader: BlobReader,
		BlobWriter: BlobWriter,
		Data64URIReader: Data64URIReader,
		Data64URIWriter: Data64URIWriter,
		ERR_BAD_FORMAT: ERR_BAD_FORMAT,
		ERR_CENTRAL_DIRECTORY_NOT_FOUND: ERR_CENTRAL_DIRECTORY_NOT_FOUND,
		ERR_DUPLICATED_NAME: ERR_DUPLICATED_NAME,
		ERR_ENCRYPTED: ERR_ENCRYPTED,
		ERR_EOCDR_LOCATOR_ZIP64_NOT_FOUND: ERR_EOCDR_LOCATOR_ZIP64_NOT_FOUND,
		ERR_EOCDR_NOT_FOUND: ERR_EOCDR_NOT_FOUND,
		ERR_EOCDR_ZIP64_NOT_FOUND: ERR_EOCDR_ZIP64_NOT_FOUND,
		ERR_EXTRAFIELD_ZIP64_NOT_FOUND: ERR_EXTRAFIELD_ZIP64_NOT_FOUND,
		ERR_HTTP_RANGE: ERR_HTTP_RANGE,
		ERR_INVALID_COMMENT: ERR_INVALID_COMMENT,
		ERR_INVALID_ENCRYPTION_STRENGTH: ERR_INVALID_ENCRYPTION_STRENGTH,
		ERR_INVALID_ENTRY_COMMENT: ERR_INVALID_ENTRY_COMMENT,
		ERR_INVALID_ENTRY_NAME: ERR_INVALID_ENTRY_NAME,
		ERR_INVALID_EXTRAFIELD_DATA: ERR_INVALID_EXTRAFIELD_DATA,
		ERR_INVALID_EXTRAFIELD_TYPE: ERR_INVALID_EXTRAFIELD_TYPE,
		ERR_INVALID_PASSWORD: ERR_INVALID_PASSWORD,
		ERR_INVALID_SIGNATURE: ERR_INVALID_SIGNATURE,
		ERR_INVALID_VERSION: ERR_INVALID_VERSION,
		ERR_ITERATOR_COMPLETED_TOO_SOON: ERR_ITERATOR_COMPLETED_TOO_SOON,
		ERR_LOCAL_FILE_HEADER_NOT_FOUND: ERR_LOCAL_FILE_HEADER_NOT_FOUND,
		ERR_SPLIT_ZIP_FILE: ERR_SPLIT_ZIP_FILE,
		ERR_UNSUPPORTED_COMPRESSION: ERR_UNSUPPORTED_COMPRESSION,
		ERR_UNSUPPORTED_ENCRYPTION: ERR_UNSUPPORTED_ENCRYPTION,
		ERR_UNSUPPORTED_FORMAT: ERR_UNSUPPORTED_FORMAT,
		HttpRangeReader: HttpRangeReader,
		HttpReader: HttpReader,
		Reader: Reader,
		SplitDataReader: SplitDataReader,
		SplitDataWriter: SplitDataWriter,
		SplitZipReader: SplitZipReader,
		SplitZipWriter: SplitZipWriter,
		TextReader: TextReader,
		TextWriter: TextWriter,
		Uint8ArrayReader: Uint8ArrayReader,
		Uint8ArrayWriter: Uint8ArrayWriter,
		Writer: Writer,
		ZipReader: ZipReader,
		ZipWriter: ZipWriter,
		configure: configure,
		getMimeType: getMimeType,
		initReader: initReader,
		initShimAsyncCodec: initShimAsyncCodec,
		initStream: initStream,
		initWriter: initWriter,
		readUint8Array: readUint8Array,
		terminateWorkers: terminateWorkers
	});

	/*
	 * Copyright 2010-2022 Gildas Lormeau
	 * contact : gildas.lormeau <at> gmail.com
	 * 
	 * This file is part of SingleFile.
	 *
	 *   The code in this file is free software: you can redistribute it and/or 
	 *   modify it under the terms of the GNU Affero General Public License 
	 *   (GNU AGPL) as published by the Free Software Foundation, either version 3
	 *   of the License, or (at your option) any later version.
	 * 
	 *   The code in this file is distributed in the hope that it will be useful, 
	 *   but WITHOUT ANY WARRANTY; without even the implied warranty of 
	 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero 
	 *   General Public License for more details.
	 *
	 *   As additional permission under GNU AGPL version 3 section 7, you may 
	 *   distribute UNMODIFIED VERSIONS OF THIS file without the copy of the GNU 
	 *   AGPL normally required by section 4, provided you include this license 
	 *   notice and a URL through which recipients can access the Corresponding 
	 *   Source.
	 */

	async function extract(content, { password, prompt = () => { }, shadowRootScriptURL, zipOptions = { useWebWorkers: false }, noBlobURL } = {}) {
		const KNOWN_MIMETYPES = {
			"gif": "image/gif",
			"jpg": "image/jpeg",
			"png": "image/png",
			"tif": "image/tiff",
			"tiff": "image/tiff",
			"bmp": "image/bmp",
			"ico": "image/vnd.microsoft.icon",
			"webp": "image/webp",
			"svg": "image/svg+xml",
			"avi": "video/x-msvideo",
			"ogv": "video/ogg",
			"mp4": "video/mp4",
			"mpeg": "video/mpeg",
			"ts": "video/mp2t",
			"webm": "video/webm",
			"3gp": "video/3gpp",
			"3g2": "video/3gpp",
			"mp3": "audio/mpeg",
			"oga": "audio/ogg",
			"mid": "audio/midi",
			"midi": "audio/midi",
			"opus": "audio/opus",
			"wav": "audio/wav",
			"weba": "audio/webm"
		};
		if (Array.isArray(content)) {
			content = new Blob([new Uint8Array(content)]);
		}
		zip.configure(zipOptions);
		const blobReader = new zip.BlobReader(content);
		let resources = [];
		const zipReader = new zip.ZipReader(blobReader);
		const entries = await zipReader.getEntries();
		const options = { password };
		await Promise.all(entries.map(async entry => {
			let dataWriter, content, textContent, name, blob;
			if (!options.password && entry.bitFlag.encrypted) {
				options.password = prompt("Please enter the password to view the page");
			}
			name = entry.filename.match(/^([0-9_]+\/)?(.*)$/)[2];
			if (entry.filename.match(/index\.html$/) || entry.filename.match(/stylesheet_[0-9]+\.css/) || entry.filename.match(/scripts\/[0-9]+\.js/)) {
				dataWriter = new zip.TextWriter();
				textContent = await entry.getData(dataWriter, options);
			} else {
				const extension = entry.filename.match(/\.([^.]+)/);
				let mimeType;
				if (extension && extension[1] && KNOWN_MIMETYPES[extension[1]]) {
					mimeType = KNOWN_MIMETYPES[extension[1]];
				} else {
					mimeType = "application/octet-stream";
				}
				if (entry.filename.match(/frames\//) || noBlobURL) {
					content = await entry.getData(new zip.Data64URIWriter(mimeType), options);
				} else {
					blob = await entry.getData(new zip.BlobWriter(mimeType), options);
					content = URL.createObjectURL(blob);
				}
			}
			resources.push({ filename: entry.filename, name, url: entry.comment, content, blob, textContent, parentResources: [] });
		}));
		await zipReader.close();
		let docContent, origDocContent, url;
		resources = resources.sort((resourceLeft, resourceRight) => resourceRight.filename.length - resourceLeft.filename.length);
		const REGEXP_ESCAPE = /([{}()^$&.*?/+|[\\\\]|\]|-)/g;
		for (const resource of resources) {
			if (resource.textContent !== undefined) {
				let prefixPath = "";
				const prefixPathMatch = resource.filename.match(/(.*\/)[^/]+$/);
				if (prefixPathMatch && prefixPathMatch[1]) {
					prefixPath = prefixPathMatch[1];
				}
				if (resource.filename.match(/^([0-9_]+\/)?index\.html$/)) {
					origDocContent = resource.textContent;
				}
				const isScript = resource.filename.match(/scripts\/[0-9]+\.js/);
				if (!isScript) {
					resources.forEach(innerResource => {
						if (innerResource.filename.startsWith(prefixPath) && innerResource.filename != resource.filename) {
							const filename = innerResource.filename.substring(prefixPath.length);
							if (!filename.match(/manifest\.json$/)) {
								const searchRegExp = new RegExp(filename.replace(REGEXP_ESCAPE, "\\$1"), "g");
								const position = resource.textContent.search(searchRegExp);
								if (position != -1) {
									innerResource.parentResources.push(resource.filename);
									resource.textContent = resource.textContent.replace(searchRegExp, innerResource.content);
								}
							}
						}
					});
				}
				let mimeType;
				if (resource.filename.match(/stylesheet_[0-9]+\.css/)) {
					mimeType = "text/css";
				} else if (isScript) {
					mimeType = "text/javascript";
				} else if (resource.filename.match(/index\.html$/)) {
					mimeType = "text/html";
					if (shadowRootScriptURL) {
						resource.textContent = resource.textContent.replace(/<script data-template-shadow-root.*<\/script>/g, "<script data-template-shadow-root src=" + shadowRootScriptURL + "></" + "script>");
					}
				}
				if (resource.filename.match(/^([0-9_]+\/)?index\.html$/)) {
					docContent = resource.textContent;
					url = resource.url;
				} else {
					const reader = new FileReader();
					if (resource.textContent) {
						reader.readAsDataURL(new Blob([resource.textContent], { type: mimeType + ";charset=utf-8" }));
						resource.content = await new Promise((resolve, reject) => {
							reader.addEventListener("load", () => resolve(reader.result), false);
							reader.addEventListener("error", reject, false);
						});
					} else {
						resource.content = "data:text/plain,";
					}
				}
			}
		}
		return { docContent, origDocContent, resources, url };
	}

	/*
	 * Copyright 2010-2022 Gildas Lormeau
	 * contact : gildas.lormeau <at> gmail.com
	 * 
	 * This file is part of SingleFile.
	 *
	 *   The code in this file is free software: you can redistribute it and/or 
	 *   modify it under the terms of the GNU Affero General Public License 
	 *   (GNU AGPL) as published by the Free Software Foundation, either version 3
	 *   of the License, or (at your option) any later version.
	 * 
	 *   The code in this file is distributed in the hope that it will be useful, 
	 *   but WITHOUT ANY WARRANTY; without even the implied warranty of 
	 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero 
	 *   General Public License for more details.
	 *
	 *   As additional permission under GNU AGPL version 3 section 7, you may 
	 *   distribute UNMODIFIED VERSIONS OF THIS file without the copy of the GNU 
	 *   AGPL normally required by section 4, provided you include this license 
	 *   notice and a URL through which recipients can access the Corresponding 
	 *   Source.
	 */

	async function display(document, docContent, { disableFramePointerEvents } = {}) {
		const DISABLED_NOSCRIPT_ATTRIBUTE_NAME = "data-single-filez-disabled-noscript";
		const doc = (new DOMParser()).parseFromString(docContent, "text/html");
		doc.querySelectorAll("noscript:not([" + DISABLED_NOSCRIPT_ATTRIBUTE_NAME + "])").forEach(element => {
			element.setAttribute(DISABLED_NOSCRIPT_ATTRIBUTE_NAME, element.innerHTML);
			element.textContent = "";
		});
		if (doc.doctype) {
			if (document.doctype) {
				document.replaceChild(doc.doctype, document.doctype);
			} else {
				document.insertBefore(doc.doctype, document.documentElement);
			}
		} else if (document.doctype) {
			document.doctype.remove();
		}
		if (disableFramePointerEvents) {
			doc.querySelectorAll("iframe").forEach(element => {
				const pointerEvents = "pointer-events";
				element.style.setProperty("-sf-" + pointerEvents, element.style.getPropertyValue(pointerEvents), element.style.getPropertyPriority(pointerEvents));
				element.style.setProperty(pointerEvents, "none", "important");
			});
		}
		document.replaceChild(document.importNode(doc.documentElement, true), document.documentElement);
		document.documentElement.setAttribute("data-sfz", "");
		document.querySelectorAll("link[rel*=icon]").forEach(element => element.parentElement.replaceChild(element, element));
		document.open = document.write = document.close = () => { };
		for (let element of Array.from(document.querySelectorAll("script"))) {
			await new Promise((resolve, reject) => {
				const scriptElement = document.createElement("script");
				Array.from(element.attributes).forEach(attribute => scriptElement.setAttribute(attribute.name, attribute.value));
				const async = element.getAttribute("async") == "" || element.getAttribute("async") == "async";
				if (element.textContent) {
					scriptElement.textContent = element.textContent;
				} else if (!async) {
					scriptElement.addEventListener("load", resolve);
					scriptElement.addEventListener("error", reject);
				}
				element.parentElement.replaceChild(scriptElement, element);
				if (element.textContent || async) {
					resolve();
				}
			});
		}
	}

	/*
	 * Copyright 2010-2020 Gildas Lormeau
	 * contact : gildas.lormeau <at> gmail.com
	 * 
	 * This file is part of SingleFile.
	 *
	 *   The code in this file is free software: you can redistribute it and/or 
	 *   modify it under the terms of the GNU Affero General Public License 
	 *   (GNU AGPL) as published by the Free Software Foundation, either version 3
	 *   of the License, or (at your option) any later version.
	 * 
	 *   The code in this file is distributed in the hope that it will be useful, 
	 *   but WITHOUT ANY WARRANTY; without even the implied warranty of 
	 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero 
	 *   General Public License for more details.
	 *
	 *   As additional permission under GNU AGPL version 3 section 7, you may 
	 *   distribute UNMODIFIED VERSIONS OF THIS file without the copy of the GNU 
	 *   AGPL normally required by section 4, provided you include this license 
	 *   notice and a URL through which recipients can access the Corresponding 
	 *   Source.
	 */

	(globalThis => {

		const singlefile = globalThis.singlefile;

		const FORBIDDEN_TAG_NAMES = ["a", "area", "audio", "base", "br", "col", "command", "embed", "hr", "img", "iframe", "input", "keygen", "link", "meta", "param", "source", "track", "video", "wbr"];
		const BUTTON_ANCHOR_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAgMAAAAOFJJnAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TtaIVETuIOASsThZERRylikWwUNoKrTqYXPohNGlIUlwcBdeCgx+LVQcXZ10dXAVB8APEydFJ0UVK/F9SaBHjwXE/3t173L0DhFqJqWbbOKBqlpGMRcVMdkUMvKIbfQCG0SExU4+nFtLwHF/38PH1LsKzvM/9OXqUnMkAn0g8y3TDIl4nnt60dM77xCFWlBTic+Ixgy5I/Mh12eU3zgWHBZ4ZMtLJOeIQsVhoYbmFWdFQiaeIw4qqUb6QcVnhvMVZLVVY4578hcGctpziOs0hxLCIOBIQIaOCDZRgIUKrRoqJJO1HPfyDjj9BLplcG2DkmEcZKiTHD/4Hv7s185MTblIwCrS/2PbHCBDYBepV2/4+tu36CeB/Bq60pr9cA2Y+Sa82tfAR0LsNXFw3NXkPuNwBBp50yZAcyU9TyOeB9zP6pizQfwt0rbq9NfZx+gCkqaulG+DgEBgtUPaax7s7W3v790yjvx825XKP2aKCdAAAAAlwSFlzAAAuIwAALiMBeKU/dgAAAAd0SU1FB+QLEQA4M3Y7LzIAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAACVBMVEUAAAAAAACKioqjwG1pAAAAAXRSTlMAQObYZgAAAAFiS0dEAmYLfGQAAABkSURBVBjThc47CsNADIThWfD0bnSfbdIroP/+V0mhsN5gTNToK0YPaSvnF9B9wGykG54j/2GF1/hauE4E1AOuNxrBdA5KUXIqdiCnqC1zIZ2mFJQzKJ3wesOhcwDM4+fo7cOuD9C4HTQ9HAAQAAAAAElFTkSuQmCC";
		const BUTTON_CLOSE_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAgMAAAAOFJJnAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TtaIVETuIOASsThZERRylikWwUNoKrTqYXPohNGlIUlwcBdeCgx+LVQcXZ10dXAVB8APEydFJ0UVK/F9SaBHjwXE/3t173L0DhFqJqWbbOKBqlpGMRcVMdkUMvKIbfQCG0SExU4+nFtLwHF/38PH1LsKzvM/9OXqUnMkAn0g8y3TDIl4nnt60dM77xCFWlBTic+Ixgy5I/Mh12eU3zgWHBZ4ZMtLJOeIQsVhoYbmFWdFQiaeIw4qqUb6QcVnhvMVZLVVY4578hcGctpziOs0hxLCIOBIQIaOCDZRgIUKrRoqJJO1HPfyDjj9BLplcG2DkmEcZKiTHD/4Hv7s185MTblIwCrS/2PbHCBDYBepV2/4+tu36CeB/Bq60pr9cA2Y+Sa82tfAR0LsNXFw3NXkPuNwBBp50yZAcyU9TyOeB9zP6pizQfwt0rbq9NfZx+gCkqaulG+DgEBgtUPaax7s7W3v790yjvx825XKP2aKCdAAAAAlwSFlzAAAuIwAALiMBeKU/dgAAAAd0SU1FB+QLEQA6Na1u6IUAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAACVBMVEUAAAAAAACKioqjwG1pAAAAAXRSTlMAQObYZgAAAAFiS0dEAmYLfGQAAABlSURBVBhXTc/BEUQhCAPQ58ES6McSPED/rfwDI7vOMCoJIeGd6CvFgZXiwk47Ia5VUKdrVXcb39kfqxqmTg+I2xJ2tqhVTaGaQjTl7/GgIc/4CL4Vs3RsjLFndcxPnAn4iww8A3yQjRZjti1t6AAAAABJRU5ErkJggg==";
		const SHADOWROOT_ATTRIBUTE_NAME = "shadowroot";
		const SCRIPT_TEMPLATE_SHADOW_ROOT = "data-template-shadow-root";
		const NOTE_TAGNAME = "single-file-note";
		const NOTE_CLASS = "note";
		const NOTE_MASK_CLASS = "note-mask";
		const NOTE_HIDDEN_CLASS = "note-hidden";
		const NOTE_ANCHORED_CLASS = "note-anchored";
		const NOTE_SELECTED_CLASS = "note-selected";
		const NOTE_MOVING_CLASS = "note-moving";
		const NOTE_MASK_MOVING_CLASS = "note-mask-moving";
		const PAGE_MASK_CLASS = "page-mask";
		const MASK_CLASS = "single-file-mask";
		const PAGE_MASK_CONTAINER_CLASS = "single-file-page-mask";
		const HIGHLIGHT_CLASS = "single-file-highlight";
		const REMOVED_CONTENT_CLASS = "single-file-removed";
		const HIGHLIGHT_HIDDEN_CLASS = "single-file-highlight-hidden";
		const PAGE_MASK_ACTIVE_CLASS = "page-mask-active";
		const CUT_HOVER_CLASS = "single-file-cut-hover";
		const CUT_OUTER_HOVER_CLASS = "single-file-cut-outer-hover";
		const CUT_SELECTED_CLASS = "single-file-cut-selected";
		const CUT_OUTER_SELECTED_CLASS = "single-file-cut-outer-selected";
		const NOTE_INITIAL_POSITION_X = 20;
		const NOTE_INITIAL_POSITION_Y = 20;
		const NOTE_INITIAL_WIDTH = 150;
		const NOTE_INITIAL_HEIGHT = 150;
		const NOTE_HEADER_HEIGHT = 25;
		const DISABLED_NOSCRIPT_ATTRIBUTE_NAME = "data-single-filez-disabled-noscript";
		const COMMENT_HEADER = "Page saved with SingleFileZ";

		const STYLE_FORMATTED_PAGE = `
	/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Avoid adding ID selector rules in this style sheet, since they could
 * inadvertently match elements in the article content. */

:root {
  --grey-90-a10: rgba(12, 12, 13, 0.1);
  --grey-90-a20: rgba(12, 12, 13, 0.2);
  --grey-90-a30: rgba(12, 12, 13, 0.3);
  --grey-90-a80: rgba(12, 12, 13, 0.8);
  --grey-30: #d7d7db;
  --blue-40: #45a1ff;
  --blue-40-a30: rgba(69, 161, 255, 0.3);
  --blue-60: #0060df;
  --body-padding: 64px;
  --font-size: 12;
  --content-width: 70em;
  --line-height: 1.6em;
}

body {
  --main-background: #fff;
  --main-foreground: #333;
  --font-color: #000000;
  --primary-color: #0B83FF;
  --toolbar-border: var(--grey-90-a20);
  --toolbar-transparent-border: transparent;
  --toolbar-box-shadow: var(--grey-90-a10);
  --toolbar-button-background: transparent;
  --toolbar-button-background-hover: var(--grey-90-a10);
  --toolbar-button-foreground-hover: var(--font-color);
  --toolbar-button-background-active: var(--grey-90-a20);
  --toolbar-button-foreground-active: var(--primary-color);
  --toolbar-button-border: transparent;
  --toolbar-button-border-hover: transparent;
  --toolbar-button-border-active: transparent;
  --tooltip-background: var(--grey-90-a80);
  --tooltip-foreground: white;
  --tooltip-border: transparent;
  --popup-background: white;
  --popup-border: rgba(0, 0, 0, 0.12);
  --opaque-popup-border: #e0e0e0;
  --popup-line: var(--grey-30);
  --popup-shadow: rgba(49, 49, 49, 0.3);
  --popup-button-background: #edecf0;
  --popup-button-background-hover: hsla(0,0%,70%,.4);
  --popup-button-foreground-hover: var(--font-color);
  --popup-button-background-active: hsla(240,5%,5%,.15);
  --selected-background: var(--blue-40-a30);
  --selected-border: var(--blue-40);
  --font-value-border: var(--grey-30);
  --icon-fill: #3b3b3c;
  --icon-disabled-fill: #8080807F;
  --link-foreground: var(--blue-60);
  --link-selected-foreground: #333;
  --visited-link-foreground: #b5007f;
  /* light colours */
}

body.sepia {
  --main-background: #f4ecd8;
  --main-foreground: #5b4636;
  --toolbar-border: #5b4636;
}

body.dark {
  --main-background: rgb(28, 27, 34);
  --main-foreground: #eee;
  --font-color: #fff;
  --toolbar-border: #4a4a4b;
  --toolbar-box-shadow: black;
  --toolbar-button-background-hover: var(--grey-90-a30);
  --toolbar-button-background-active: var(--grey-90-a80);
  --tooltip-background: black;
  --tooltip-foreground: white;
  --popup-background: rgb(66,65,77);
  --opaque-popup-border: #434146;
  --popup-line: rgb(82, 82, 94);
  --popup-button-background: #5c5c61;
  --popup-button-background-active: hsla(0,0%,70%,.6);
  --selected-background: #3E6D9A;
  --font-value-border: #656468;
  --icon-fill: #fff;
  --icon-disabled-fill: #ffffff66;
  --link-foreground: #45a1ff;
  --link-selected-foreground: #fff;
  --visited-link-foreground: #e675fd;
  /* dark colours */
}

body.hcm {
  --main-background: Canvas;
  --main-foreground: CanvasText;
  --font-color: CanvasText;
  --primary-color: SelectedItem;
  --toolbar-border: CanvasText;
   /* We need a true transparent but in HCM this would compute to an actual color,
      so select the page's background color instead: */
  --toolbar-transparent-border: Canvas;
  --toolbar-box-shadow: Canvas;
  --toolbar-button-background: ButtonFace;
  --toolbar-button-background-hover: ButtonText;
  --toolbar-button-foreground-hover: ButtonFace;
  --toolbar-button-background-active: SelectedItem;
  --toolbar-button-foreground-active: SelectedItemText;
  --toolbar-button-border: ButtonText;
  --toolbar-button-border-hover: ButtonText;
  --toolbar-button-border-active: ButtonText;
  --tooltip-background: Canvas;
  --tooltip-foreground: CanvasText;
  --tooltip-border: CanvasText;
  --popup-background: Canvas;
  --popup-border: CanvasText;
  --opaque-popup-border: CanvasText;
  --popup-line: CanvasText;
  --popup-button-background: ButtonFace;
  --popup-button-background-hover: ButtonText;
  --popup-button-foreground-hover: ButtonFace;
  --popup-button-background-active: ButtonText;
  --selected-background: Canvas;
  --selected-border: SelectedItem;
  --font-value-border: CanvasText;
  --icon-fill: ButtonText;
  --icon-disabled-fill: GrayText;
  --link-foreground: LinkText;
  --link-selected-foreground: ActiveText;
  --visited-link-foreground: VisitedText;
}

body {
  margin: 0;
  padding: var(--body-padding);
  background-color: var(--main-background);
  color: var(--main-foreground);
}

body.loaded {
  transition: color 0.4s, background-color 0.4s;
}

body.dark *::-moz-selection {
  background-color: var(--selected-background);
}

a::-moz-selection {
  color: var(--link-selected-foreground);
}

body.sans-serif,
body.sans-serif .remove-button {
  font-family: Helvetica, Arial, sans-serif;
}

body.serif,
body.serif .remove-button {
  font-family: Georgia, "Times New Roman", serif;
}

/* Override some controls and content styles based on color scheme */

body.light > .container > .header > .domain {
  border-bottom-color: #333333 !important;
}

body.sepia > .container > .header > .domain {
  border-bottom-color: #5b4636 !important;
}

body.dark > .container > .header > .domain {
  border-bottom-color: #eeeeee !important;
}

body.light blockquote {
  border-inline-start: 2px solid #333333 !important;
}

body.sepia blockquote {
  border-inline-start: 2px solid #5b4636 !important;
}

body.dark blockquote {
  border-inline-start: 2px solid #eeeeee !important;
}

.light-button {
  color: #333333;
  background-color: #ffffff;
}

.dark-button {
  color: #eeeeee;
  background-color: #1c1b22;
}

.sepia-button {
  color: #5b4636;
  background-color: #f4ecd8;
}

.auto-button {
  text-align: center;
}

@media (prefers-color-scheme: dark) {
  .auto-button {
    background-color: #1c1b22;
    color: #eeeeee;
  }
}

@media not (prefers-color-scheme: dark) {
  .auto-button {
    background-color: #ffffff;
    color: #333333;
  }
}

/* Loading/error message */

.reader-message {
  margin-top: 40px;
  display: none;
  text-align: center;
  width: 100%;
  font-size: 0.9em;
}

/* Detector element to see if we're at the top of the doc or not. */
.top-anchor {
  position: absolute;
  top: 0;
  width: 0;
  height: 5px;
  pointer-events: none;
}

/* Header */

.header {
  text-align: start;
  display: none;
}

.domain {
  font-size: 0.9em;
  line-height: 1.48em;
  padding-bottom: 4px;
  font-family: Helvetica, Arial, sans-serif;
  text-decoration: none;
  border-bottom: 1px solid;
  color: var(--link-foreground);
}

.header > h1 {
  font-size: 1.6em;
  line-height: 1.25em;
  width: 100%;
  margin: 30px 0;
  padding: 0;
}

.header > .credits {
  font-size: 0.9em;
  line-height: 1.48em;
  margin: 0 0 10px;
  padding: 0;
  font-style: italic;
}

.header > .meta-data {
  font-size: 0.65em;
  margin: 0 0 15px;
}

.reader-estimated-time {
  text-align: match-parent;
}

/* Controls toolbar */

.toolbar-container {
  position: sticky;
  z-index: 2;
  top: 32px;
  height: 0; /* take up no space, so body is at the top. */

  /* As a stick container, we're positioned relative to the body. Move us to
   * the edge of the viewport using margins, and take the width of
   * the body padding into account for calculating our width.
   */
  margin-inline-start: calc(-1 * var(--body-padding));
  width: max(var(--body-padding), calc((100% - var(--content-width)) / 2 + var(--body-padding)));
  font-size: var(--font-size); /* Needed to ensure 'em' units match, is reset for .reader-controls */
}

.toolbar {
  padding-block: 16px;
  border: 1px solid var(--toolbar-border);
  border-radius: 6px;
  box-shadow: 0 2px 8px var(--toolbar-box-shadow);

  width: 32px; /* basic width, without padding/border */

  /* padding should be 16px, except if there's not enough space for that, in
   * which case use half the available space for padding (=25% on each side).
   * The 34px here is the width + borders. We use a variable because we need
   * to know this size for the margin calculation.
   */
  --inline-padding: min(16px, calc(25% - 0.25 * 34px));
  padding-inline: var(--inline-padding);

  /* Keep a maximum of 96px distance to the body, but center once the margin
   * gets too small. We need to set the start margin, however...
   * To center, we'd want 50% of the container, but we'd subtract half our
   * own width (16px) and half the border (1px) and the inline padding.
   * When the other margin would be 96px, we want 100% - 96px - the complete
   * width of the actual toolbar (34px + 2 * padding)
   */
  margin-inline-start: max(calc(50% - 17px - var(--inline-padding)), calc(100% - 96px - 34px - 2 * var(--inline-padding)));

  font-family: Helvetica, Arial, sans-serif;
  list-style: none;
  user-select: none;
}

@media (prefers-reduced-motion: no-preference) {
  .toolbar {
    transition-property: border-color, box-shadow;
    transition-duration: 250ms;
  }

  .toolbar .toolbar-button {
    transition-property: opacity;
    transition-duration: 250ms;
  }

  .toolbar-container.scrolled .toolbar:not(:hover, :focus-within) {
    border-color: var(--toolbar-transparent-border);
    box-shadow: 0 2px 8px transparent;
  }

  .toolbar-container.scrolled .toolbar:not(:hover, :focus-within) .toolbar-button {
    opacity: 0.6;
  }

  .toolbar-container.transition-location {
    transition-duration: 250ms;
    transition-property: width;
  }
}

.toolbar-container.overlaps .toolbar-button {
  opacity: 0.1;
}

.dropdown-open .toolbar {
  border-color: var(--toolbar-transparent-border);
  box-shadow: 0 2px 8px transparent;
}

.reader-controls {
  /* We use 'em's above this node to get it to the right size. However,
   * the UI inside the toolbar should use a fixed, smaller size. */
  font-size: 11px;
}

button {
  -moz-context-properties: fill;
  color: var(--font-color);
  fill: var(--icon-fill);
}

button:disabled {
  fill: var(--icon-disabled-fill);
}

.toolbar button::-moz-focus-inner {
  border: 0;
}

.toolbar-button {
  position: relative;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--toolbar-button-border);
  border-radius: 4px;
  margin: 4px 0;
  background-color: var(--toolbar-button-background);
  background-size: 16px 16px;
  background-position: center;
  background-repeat: no-repeat;
}

.toolbar-button:hover,
.toolbar-button:focus-visible {
  background-color: var(--toolbar-button-background-hover);
  border-color: var(--toolbar-button-border-hover);
  fill: var(--toolbar-button-foreground-hover);
}

.open .toolbar-button,
.toolbar-button:hover:active {
  background-color: var(--toolbar-button-background-active);
  border-color: var(--toolbar-button-border-active);
  color: var(--toolbar-button-foreground-active);
  fill: var(--toolbar-button-foreground-active);
}

.hover-label {
  position: absolute;
  top: 4px;
  inset-inline-start: 36px;
  line-height: 16px;
  white-space: pre; /* make sure we don't wrap */
  background-color: var(--tooltip-background);
  color: var(--tooltip-foreground);
  padding: 4px 8px;
  border: 1px solid var(--tooltip-border);
  border-radius: 2px;
  visibility: hidden;
  pointer-events: none;
  /* Put above .dropdown .dropdown-popup, which has z-index: 1000. */
  z-index: 1001;
}

/* Show the hover tooltip on non-dropdown buttons. */
.toolbar-button:not(.dropdown-toggle):hover > .hover-label,
.toolbar-button:not(.dropdown-toggle):focus-visible > .hover-label,
/* Show the hover tooltip for dropdown buttons unless its dropdown is open. */
:not(.open) > li > .dropdown-toggle:hover > .hover-label,
:not(.open) > li > .dropdown-toggle:focus-visible > .hover-label {
  visibility: visible;
}

.dropdown {
  text-align: center;
  list-style: none;
  margin: 0;
  padding: 0;
  position: relative;
}

.dropdown li {
  margin: 0;
  padding: 0;
}

/* Popup */

.dropdown .dropdown-popup {
  text-align: start;
  position: absolute;
  inset-inline-start: 40px;
  z-index: 1000;
  background-color: var(--popup-background);
  visibility: hidden;
  border-radius: 4px;
  border: 1px solid var(--popup-border);
  box-shadow: 0 0 10px 0 var(--popup-shadow);
  top: 0;
}

.open > .dropdown-popup {
  visibility: visible;
}

.dropdown-arrow {
  position: absolute;
  height: 24px;
  width: 16px;
  inset-inline-start: -16px;
  background-image: url("chrome://global/skin/reader/RM-Type-Controls-Arrow.svg");
  display: block;
  -moz-context-properties: fill, stroke;
  fill: var(--popup-background);
  stroke: var(--opaque-popup-border);
  pointer-events: none;
}

.dropdown-arrow:dir(rtl) {
  transform: scaleX(-1);
}

/* Align the style dropdown arrow (narrate does its own) */
.style-dropdown .dropdown-arrow {
  top: 7px;
}

/* Font style popup */

.radio-button {
  /* We visually hide these, but we keep them around so they can be focused
   * and changed by interacting with them via the label, or the keyboard, or
   * assistive technology.
   */
  opacity: 0;
  pointer-events: none;
  position: absolute;
}

.radiorow,
.buttonrow {
  display: flex;
  align-content: center;
  justify-content: center;
}

.content-width-value,
.font-size-value,
.line-height-value {
  box-sizing: border-box;
  width: 36px;
  height: 20px;
  line-height: 20px;
  display: flex;
  justify-content: center;
  align-content: center;
  margin: auto;
  border-radius: 10px;
  border: 1px solid var(--font-value-border);
  background-color: var(--popup-button-background);
}

.buttonrow > button {
  border: 0;
  height: 60px;
  width: 90px;
  background-color: transparent;
  background-repeat: no-repeat;
  background-position: center;
}

.buttonrow > button:enabled:hover,
.buttonrow > button:enabled:focus-visible {
  background-color: var(--popup-button-background-hover);
  color: var(--popup-button-foreground-hover);
  fill: var(--popup-button-foreground-hover);
}

.buttonrow > button:enabled:hover:active {
  background-color: var(--popup-button-background-active);
}

.radiorow:not(:last-child),
.buttonrow:not(:last-child) {
  border-bottom: 1px solid var(--popup-line);
}

body.hcm .buttonrow.line-height-buttons {
  /* On HCM the .color-scheme-buttons row is hidden, so remove the border from the row above it */
  border-bottom: none;
}

.radiorow > label {
  position: relative;
  box-sizing: border-box;
  border-radius: 2px;
  border: 2px solid var(--popup-border);
}

.radiorow > label[checked] {
  border-color: var(--selected-border);
}

/* For the hover style, we draw a line under the item by means of a
 * pseudo-element. Because these items are variable height, and
 * because their contents are variable height, position it absolutely,
 * and give it a width of 100% (the content width) + 4px for the 2 * 2px
 * border width.
 */
.radiorow > input[type=radio]:focus-visible + label::after,
.radiorow > label:hover::after {
  content: "";
  display: block;
  border-bottom: 2px solid var(--selected-border);
  width: calc(100% + 4px);
  position: absolute;
  /* to skip the 2 * 2px border + 2px spacing. */
  bottom: -6px;
  /* Match the start of the 2px border of the element: */
  inset-inline-start: -2px;
}

.font-type-buttons > label {
  height: 64px;
  width: 105px;
  /* Slightly more space between these items. */
  margin: 10px;
  /* Center the Sans-serif / Serif labels */
  text-align: center;
  background-size: 63px 39px;
  background-repeat: no-repeat;
  background-position: center 18px;
  background-color: var(--popup-button-background);
  fill: currentColor;
  -moz-context-properties: fill;
  /* This mostly matches baselines, but because of differences in font
   * baselines between serif and sans-serif, this isn't always enough. */
  line-height: 1;
  padding-top: 2px;
}

.font-type-buttons > label[checked] {
  background-color: var(--selected-background);
}

.sans-serif-button {
  font-family: Helvetica, Arial, sans-serif;
  background-image: url("chrome://global/skin/reader/RM-Sans-Serif.svg");
}

/* Tweak padding to match the baseline on mac */
:root[platform=macosx] .sans-serif-button {
  padding-top: 3px;
}

.serif-button {
  font-family: Georgia, "Times New Roman", serif;
  background-image: url("chrome://global/skin/reader/RM-Serif.svg");
}

body.hcm .color-scheme-buttons {
  /* Disallow selecting themes when HCM is on. */
  display: none;
}

.color-scheme-buttons > label {
  padding: 12px;
  height: 34px;
  font-size: 12px;
  /* Center the labels horizontally as well as vertically */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* We want 10px between items, but there's no margin collapsing in flexbox. */
  margin: 10px 5px;
}

.color-scheme-buttons > input:first-child + label {
  margin-inline-start: 10px;
}

.color-scheme-buttons > label:last-child {
  margin-inline-end: 10px;
}

/* Toolbar icons */

.close-button {
  background-image: url("chrome://global/skin/icons/close.svg");
}

.style-button {
  background-image: url("chrome://global/skin/reader/RM-Type-Controls-24x24.svg");
}

.minus-button {
  background-size: 18px 18px;
  background-image: url("chrome://global/skin/reader/RM-Minus-24x24.svg");
}

.plus-button {
  background-size: 18px 18px;
  background-image: url("chrome://global/skin/reader/RM-Plus-24x24.svg");
}

.content-width-minus-button {
  background-size: 42px 16px;
  background-image: url("chrome://global/skin/reader/RM-Content-Width-Minus-42x16.svg");
}

.content-width-plus-button {
  background-size: 44px 16px;
  background-image: url("chrome://global/skin/reader/RM-Content-Width-Plus-44x16.svg");
}

.line-height-minus-button {
  background-size: 34px 14px;
  background-image: url("chrome://global/skin/reader/RM-Line-Height-Minus-38x14.svg");
}

.line-height-plus-button {
  background-size: 34px 24px;
  background-image: url("chrome://global/skin/reader/RM-Line-Height-Plus-38x24.svg");
}

/* Mirror the line height buttons if the article is RTL. */
.reader-controls[articledir="rtl"] .line-height-minus-button,
.reader-controls[articledir="rtl"] .line-height-plus-button {
  transform: scaleX(-1);
}

@media print {
  .toolbar {
    display: none !important;
  }
}

/* Article content */

/* Note that any class names from the original article that we want to match on
 * must be added to CLASSES_TO_PRESERVE in ReaderMode.jsm, so that
 * Readability.js doesn't strip them out */

.container {
  margin: 0 auto;
  font-size: var(--font-size);
  max-width: var(--content-width);
  line-height: var(--line-height);
}

pre {
  font-family: inherit;
}

.moz-reader-content {
  display: none;
  font-size: 1em;
}

@media print {
  .moz-reader-content p,
  .moz-reader-content code,
  .moz-reader-content pre,
  .moz-reader-content blockquote,
  .moz-reader-content ul,
  .moz-reader-content ol,
  .moz-reader-content li,
  .moz-reader-content figure,
  .moz-reader-content .wp-caption {
    margin: 0 0 10px !important;
    padding: 0 !important;
  }
}

.moz-reader-content h1,
.moz-reader-content h2,
.moz-reader-content h3 {
  font-weight: bold;
}

.moz-reader-content h1 {
  font-size: 1.6em;
  line-height: 1.25em;
}

.moz-reader-content h2 {
  font-size: 1.2em;
  line-height: 1.51em;
}

.moz-reader-content h3 {
  font-size: 1em;
  line-height: 1.66em;
}

.moz-reader-content a:link {
  text-decoration: underline;
  font-weight: normal;
}

.moz-reader-content a:link,
.moz-reader-content a:link:hover,
.moz-reader-content a:link:active {
  color: var(--link-foreground);
}

.moz-reader-content a:visited {
  color: var(--visited-link-foreground);
}

.moz-reader-content * {
  max-width: 100%;
  height: auto;
}

.moz-reader-content p,
.moz-reader-content p,
.moz-reader-content code,
.moz-reader-content pre,
.moz-reader-content blockquote,
.moz-reader-content ul,
.moz-reader-content ol,
.moz-reader-content li,
.moz-reader-content figure,
.moz-reader-content .wp-caption {
  margin: -10px -10px 20px;
  padding: 10px;
  border-radius: 5px;
}

.moz-reader-content li {
  margin-bottom: 0;
}

.moz-reader-content li > ul,
.moz-reader-content li > ol {
  margin-bottom: -10px;
}

.moz-reader-content p > img:only-child,
.moz-reader-content p > a:only-child > img:only-child,
.moz-reader-content .wp-caption img,
.moz-reader-content figure img {
  display: block;
}

.moz-reader-content img[moz-reader-center] {
  margin-inline: auto;
}

.moz-reader-content .caption,
.moz-reader-content .wp-caption-text
.moz-reader-content figcaption {
  font-size: 0.9em;
  line-height: 1.48em;
  font-style: italic;
}

.moz-reader-content pre {
  white-space: pre-wrap;
}

.moz-reader-content blockquote {
  padding: 0;
  padding-inline-start: 16px;
}

.moz-reader-content ul,
.moz-reader-content ol {
  padding: 0;
}

.moz-reader-content ul {
  padding-inline-start: 30px;
  list-style: disc;
}

.moz-reader-content ol {
  padding-inline-start: 30px;
}

table,
th,
td {
  border: 1px solid currentColor;
  border-collapse: collapse;
  padding: 6px;
  vertical-align: top;
}

table {
  margin: 5px;
}

/* Visually hide (but don't display: none) screen reader elements */
.moz-reader-content .visually-hidden,
.moz-reader-content .visuallyhidden,
.moz-reader-content .sr-only {
  display: inline-block;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  border-width: 0;
}

/* Hide elements with common "hidden" class names */
.moz-reader-content .hidden,
.moz-reader-content .invisible {
  display: none;
}

/* Enforce wordpress and similar emoji/smileys aren't sized to be full-width,
 * see bug 1399616 for context. */
.moz-reader-content img.wp-smiley,
.moz-reader-content img.emoji {
  display: inline-block;
  border-width: 0;
  /* height: auto is implied from '.moz-reader-content *' rule. */
  width: 1em;
  margin: 0 .07em;
  padding: 0;
}

.reader-show-element {
  display: initial;
}

/* Provide extra spacing for images that may be aided with accompanying element such as <figcaption> */
.moz-reader-block-img:not(:last-child) {
  margin-block-end: 12px;
}

.moz-reader-wide-table {
  overflow-x: auto;
  display: block;
}

pre code {
  background-color: var(--main-background);
  border: 1px solid var(--font-color);
  display: block;
  overflow: auto;
}`;

		let NOTES_WEB_STYLESHEET, MASK_WEB_STYLESHEET, HIGHLIGHTS_WEB_STYLESHEET;
		let selectedNote, anchorElement, maskNoteElement, maskPageElement, highlightSelectionMode, removeHighlightMode, resizingNoteMode, movingNoteMode, highlightColor, collapseNoteTimeout, cuttingOuterMode, cuttingMode, cuttingPath, cuttingPathIndex, previousContent;
		let removedElements = [], removedElementIndex = 0, pageResources, pageUrl;

		globalThis.zip = zip$1;
		window.onmessage = async event => {
			const message = JSON.parse(event.data);
			if (message.method == "init") {
				await init(message);
			}
			if (message.method == "addNote") {
				addNote(message);
			}
			if (message.method == "displayNotes") {
				document.querySelectorAll(NOTE_TAGNAME).forEach(noteElement => noteElement.shadowRoot.querySelector("." + NOTE_CLASS).classList.remove(NOTE_HIDDEN_CLASS));
			}
			if (message.method == "hideNotes") {
				document.querySelectorAll(NOTE_TAGNAME).forEach(noteElement => noteElement.shadowRoot.querySelector("." + NOTE_CLASS).classList.add(NOTE_HIDDEN_CLASS));
			}
			if (message.method == "enableHighlight") {
				if (highlightColor) {
					document.documentElement.classList.remove(highlightColor + "-mode");
				}
				highlightColor = message.color;
				highlightSelectionMode = true;
				document.documentElement.classList.add(message.color + "-mode");
			}
			if (message.method == "disableHighlight") {
				disableHighlight();
				highlightSelectionMode = false;
			}
			if (message.method == "displayHighlights") {
				document.querySelectorAll("." + HIGHLIGHT_CLASS).forEach(noteElement => noteElement.classList.remove(HIGHLIGHT_HIDDEN_CLASS));
			}
			if (message.method == "hideHighlights") {
				document.querySelectorAll("." + HIGHLIGHT_CLASS).forEach(noteElement => noteElement.classList.add(HIGHLIGHT_HIDDEN_CLASS));
			}
			if (message.method == "enableRemoveHighlights") {
				removeHighlightMode = true;
				document.documentElement.classList.add("single-file-remove-highlights-mode");
			}
			if (message.method == "disableRemoveHighlights") {
				removeHighlightMode = false;
				document.documentElement.classList.remove("single-file-remove-highlights-mode");
			}
			if (message.method == "enableEditPage") {
				document.body.contentEditable = true;
				onUpdate(false);
			}
			if (message.method == "formatPage") {
				formatPage(true);
			}
			if (message.method == "formatPageNoTheme") {
				formatPage(false);
			}
			if (message.method == "cancelFormatPage") {
				cancelFormatPage();
			}
			if (message.method == "disableEditPage") {
				document.body.contentEditable = false;
			}
			if (message.method == "enableCutInnerPage") {
				cuttingMode = true;
				document.documentElement.classList.add("single-file-cut-mode");
			}
			if (message.method == "enableCutOuterPage") {
				cuttingOuterMode = true;
				document.documentElement.classList.add("single-file-cut-mode");
			}
			if (message.method == "disableCutInnerPage") {
				cuttingMode = false;
				document.documentElement.classList.remove("single-file-cut-mode");
				resetSelectedElements();
				if (cuttingPath) {
					unhighlightCutElement();
					cuttingPath = null;
				}
			}
			if (message.method == "disableCutOuterPage") {
				cuttingOuterMode = false;
				document.documentElement.classList.remove("single-file-cut-mode");
				resetSelectedElements();
				if (cuttingPath) {
					unhighlightCutElement();
					cuttingPath = null;
				}
			}
			if (message.method == "undoCutPage") {
				undoCutPage();
			}
			if (message.method == "undoAllCutPage") {
				while (removedElementIndex) {
					removedElements[removedElementIndex - 1].forEach(element => element.classList.remove(REMOVED_CONTENT_CLASS));
					removedElementIndex--;
				}
			}
			if (message.method == "redoCutPage") {
				redoCutPage();
			}
			if (message.method == "getContent") {
				onUpdate(true);
				let content = getContent(message.compressHTML, message.updatedResources);
				const viewport = document.head.querySelector("meta[name=viewport]");
				window.parent.postMessage(JSON.stringify({
					method: "setContent",
					content,
					title: document.title,
					doctype: singlefile.helper.getDoctypeString(document),
					url: pageUrl,
					viewport: viewport ? viewport.content : null
				}), "*");
			}
			if (message.method == "printPage") {
				printPage();
			}
		};
		window.onresize = reflowNotes;
		document.ondragover = event => event.preventDefault();
		document.ondrop = async event => {
			if (event.dataTransfer.files && event.dataTransfer.files[0]) {
				const file = event.dataTransfer.files[0];
				event.preventDefault();
				await init({ content: file }, { filename: file.name });
			}
		};

		async function init({ content, password }, { filename, reset } = {}) {
			await initConstants();
			const zipOptions = {
				workerScripts: { inflate: ["/lib/single-file-z-worker.js"] }
			};
			try {
				const worker = new Worker(zipOptions.workerScripts);
				worker.terminate();
			} catch (error) {
				delete zipOptions.workerScripts;
			}
			const { docContent, origDocContent, resources, url } = await extract(content, {
				password,
				prompt,
				shadowRootScriptURL: new URL("/lib/single-file-extension-editor-init.js", document.baseURI).href,
				zipOptions
			});
			pageResources = resources;
			pageUrl = url;
			const contentDocument = (new DOMParser()).parseFromString(docContent, "text/html");
			if (detectSavedPage(contentDocument)) {
				await display(document, docContent, { disableFramePointerEvents: true });
				await initPage();
				let icon;
				const origContentDocument = (new DOMParser()).parseFromString(origDocContent, "text/html");
				const iconElement = origContentDocument.querySelector("link[rel*=icon]");
				if (iconElement) {
					const iconResource = resources.find(resource => resource.filename == iconElement.getAttribute("href"));
					if (iconResource && iconResource.blob) {
						const reader = new FileReader();
						reader.readAsDataURL(iconResource.blob);
						icon = await new Promise((resolve, reject) => {
							reader.addEventListener("load", () => resolve(reader.result), false);
							reader.addEventListener("error", reject, false);
						});
					} else {
						icon = iconElement.href;
					}
				}
				window.parent.postMessage(JSON.stringify({
					method: "onInit",
					title: document.title,
					icon,
					filename,
					reset,
					formatPageEnabled: isProbablyReaderable(document)
				}), "*");
			}
		}

		async function initPage() {
			document.querySelectorAll("iframe").forEach(element => {
				const pointerEvents = "pointer-events";
				element.style.setProperty("-sf-" + pointerEvents, element.style.getPropertyValue(pointerEvents), element.style.getPropertyPriority(pointerEvents));
				element.style.setProperty(pointerEvents, "none", "important");
			});
			document.querySelectorAll("[data-single-file-note-refs]").forEach(noteRefElement => noteRefElement.dataset.singleFileNoteRefs = noteRefElement.dataset.singleFileNoteRefs.replace(/,/g, " "));
			deserializeShadowRoots(document);
			reflowNotes();
			await waitResourcesLoad();
			reflowNotes();
			document.querySelectorAll(NOTE_TAGNAME).forEach(containerElement => attachNoteListeners(containerElement, true));
			document.documentElement.appendChild(getStyleElement(HIGHLIGHTS_WEB_STYLESHEET));
			maskPageElement = getMaskElement(PAGE_MASK_CLASS, PAGE_MASK_CONTAINER_CLASS);
			maskNoteElement = getMaskElement(NOTE_MASK_CLASS);
			document.documentElement.onmousedown = document.documentElement.ontouchstart = onMouseDown;
			document.documentElement.onmouseup = document.documentElement.ontouchend = onMouseUp;
			document.documentElement.onmouseover = onMouseOver;
			document.documentElement.onmouseout = onMouseOut;
			document.documentElement.onkeydown = onKeyDown;
			window.onclick = event => event.preventDefault();
		}

		async function initConstants() {
			[NOTES_WEB_STYLESHEET, MASK_WEB_STYLESHEET, HIGHLIGHTS_WEB_STYLESHEET] = await Promise.all([
				minifyText(await ((await fetch("../pages/editor-note-web.css")).text())),
				minifyText(await ((await fetch("../pages/editor-mask-web.css")).text())),
				minifyText(await ((await fetch("../pages/editor-frame-web.css")).text()))
			]);
		}

		function addNote({ color }) {
			const containerElement = document.createElement(NOTE_TAGNAME);
			const noteElement = document.createElement("div");
			const headerElement = document.createElement("header");
			const blockquoteElement = document.createElement("blockquote");
			const mainElement = document.createElement("textarea");
			const resizeElement = document.createElement("div");
			const removeNoteElement = document.createElement("img");
			const anchorIconElement = document.createElement("img");
			const noteShadow = containerElement.attachShadow({ mode: "open" });
			headerElement.appendChild(anchorIconElement);
			headerElement.appendChild(removeNoteElement);
			blockquoteElement.appendChild(mainElement);
			noteElement.appendChild(headerElement);
			noteElement.appendChild(blockquoteElement);
			noteElement.appendChild(resizeElement);
			noteShadow.appendChild(getStyleElement(NOTES_WEB_STYLESHEET));
			noteShadow.appendChild(noteElement);
			const notesElements = Array.from(document.querySelectorAll(NOTE_TAGNAME));
			const noteId = Math.max.call(Math, 0, ...notesElements.map(noteElement => Number(noteElement.dataset.noteId))) + 1;
			noteElement.cite = "https://www.w3.org/TR/annotation-model/#selector(type=CssSelector,value=[data-single-file-note-refs~=\"" + noteId + "\"])";
			noteElement.classList.add(NOTE_CLASS);
			noteElement.classList.add(NOTE_ANCHORED_CLASS);
			noteElement.classList.add(color);
			noteElement.dataset.color = color;
			mainElement.dir = "auto";
			const boundingRectDocument = document.documentElement.getBoundingClientRect();
			let positionX = NOTE_INITIAL_WIDTH + NOTE_INITIAL_POSITION_X - 1 - boundingRectDocument.x;
			let positionY = NOTE_INITIAL_HEIGHT + NOTE_INITIAL_POSITION_Y - 1 - boundingRectDocument.y;
			while (Array.from(document.elementsFromPoint(positionX - window.scrollX, positionY - window.scrollY)).find(element => element.tagName.toLowerCase() == NOTE_TAGNAME)) {
				positionX += NOTE_INITIAL_POSITION_X;
				positionY += NOTE_INITIAL_POSITION_Y;
			}
			noteElement.style.setProperty("left", (positionX - NOTE_INITIAL_WIDTH - 1) + "px");
			noteElement.style.setProperty("top", (positionY - NOTE_INITIAL_HEIGHT - 1) + "px");
			resizeElement.className = "note-resize";
			resizeElement.ondragstart = event => event.preventDefault();
			removeNoteElement.className = "note-remove";
			removeNoteElement.src = BUTTON_CLOSE_URL;
			removeNoteElement.ondragstart = event => event.preventDefault();
			anchorIconElement.className = "note-anchor";
			anchorIconElement.src = BUTTON_ANCHOR_URL;
			anchorIconElement.ondragstart = event => event.preventDefault();
			containerElement.dataset.noteId = noteId;
			addNoteRef(document.documentElement, noteId);
			attachNoteListeners(containerElement, true);
			document.documentElement.insertBefore(containerElement, maskPageElement.getRootNode().host);
			noteElement.classList.add(NOTE_SELECTED_CLASS);
			selectedNote = noteElement;
			onUpdate(false);
		}

		function attachNoteListeners(containerElement, editable = false) {
			const SELECT_PX_THRESHOLD = 4;
			const COLLAPSING_NOTE_DELAY = 750;
			const noteShadow = containerElement.shadowRoot;
			const noteElement = noteShadow.childNodes[1];
			const headerElement = noteShadow.querySelector("header");
			const mainElement = noteShadow.querySelector("textarea");
			const noteId = containerElement.dataset.noteId;
			const resizeElement = noteShadow.querySelector(".note-resize");
			const anchorIconElement = noteShadow.querySelector(".note-anchor");
			const removeNoteElement = noteShadow.querySelector(".note-remove");
			mainElement.readOnly = !editable;
			if (!editable) {
				anchorIconElement.style.setProperty("display", "none", "important");
			} else {
				anchorIconElement.style.removeProperty("display");
			}
			headerElement.ontouchstart = headerElement.onmousedown = event => {
				if (event.target == headerElement) {
					collapseNoteTimeout = setTimeout(() => {
						noteElement.classList.toggle("note-collapsed");
						hideMaskNote();
					}, COLLAPSING_NOTE_DELAY);
					event.preventDefault();
					const position = getPosition(event);
					const clientX = position.clientX;
					const clientY = position.clientY;
					const boundingRect = noteElement.getBoundingClientRect();
					const deltaX = clientX - boundingRect.left;
					const deltaY = clientY - boundingRect.top;
					maskPageElement.classList.add(PAGE_MASK_ACTIVE_CLASS);
					document.documentElement.style.setProperty("user-select", "none", "important");
					anchorElement = getAnchorElement(containerElement);
					displayMaskNote();
					selectNote(noteElement);
					moveNote(event, deltaX, deltaY);
					movingNoteMode = { event, deltaX, deltaY };
					document.documentElement.ontouchmove = document.documentElement.onmousemove = event => {
						clearTimeout(collapseNoteTimeout);
						if (!movingNoteMode) {
							movingNoteMode = { deltaX, deltaY };
						}
						movingNoteMode.event = event;
						moveNote(event, deltaX, deltaY);
					};
				}
			};
			resizeElement.ontouchstart = resizeElement.onmousedown = event => {
				event.preventDefault();
				resizingNoteMode = true;
				selectNote(noteElement);
				maskPageElement.classList.add(PAGE_MASK_ACTIVE_CLASS);
				document.documentElement.style.setProperty("user-select", "none", "important");
				document.documentElement.ontouchmove = document.documentElement.onmousemove = event => {
					event.preventDefault();
					const { clientX, clientY } = getPosition(event);
					const boundingRectNote = noteElement.getBoundingClientRect();
					noteElement.style.width = clientX - boundingRectNote.left + "px";
					noteElement.style.height = clientY - boundingRectNote.top + "px";
				};
			};
			anchorIconElement.ontouchend = anchorIconElement.onclick = event => {
				event.preventDefault();
				noteElement.classList.toggle(NOTE_ANCHORED_CLASS);
				if (!noteElement.classList.contains(NOTE_ANCHORED_CLASS)) {
					deleteNoteRef(containerElement, noteId);
					addNoteRef(document.documentElement, noteId);
				}
				onUpdate(false);
			};
			removeNoteElement.ontouchend = removeNoteElement.onclick = event => {
				event.preventDefault();
				deleteNoteRef(containerElement, noteId);
				containerElement.remove();
			};
			noteElement.onmousedown = () => {
				selectNote(noteElement);
			};

			function moveNote(event, deltaX, deltaY) {
				event.preventDefault();
				const { clientX, clientY } = getPosition(event);
				noteElement.classList.add(NOTE_MOVING_CLASS);
				if (editable) {
					if (noteElement.classList.contains(NOTE_ANCHORED_CLASS)) {
						deleteNoteRef(containerElement, noteId);
						anchorElement = getTarget(clientX, clientY) || document.documentElement;
						addNoteRef(anchorElement, noteId);
					} else {
						anchorElement = document.documentElement;
					}
				}
				document.documentElement.insertBefore(containerElement, maskPageElement.getRootNode().host);
				noteElement.style.setProperty("left", (clientX - deltaX) + "px");
				noteElement.style.setProperty("top", (clientY - deltaY) + "px");
				noteElement.style.setProperty("position", "fixed");
				displayMaskNote();
			}

			function displayMaskNote() {
				if (anchorElement == document.documentElement || anchorElement == document.documentElement) {
					hideMaskNote();
				} else {
					const boundingRectAnchor = anchorElement.getBoundingClientRect();
					maskNoteElement.classList.add(NOTE_MASK_MOVING_CLASS);
					if (selectedNote) {
						maskNoteElement.classList.add(selectedNote.dataset.color);
					}
					maskNoteElement.style.setProperty("top", (boundingRectAnchor.y - 3) + "px");
					maskNoteElement.style.setProperty("left", (boundingRectAnchor.x - 3) + "px");
					maskNoteElement.style.setProperty("width", (boundingRectAnchor.width + 3) + "px");
					maskNoteElement.style.setProperty("height", (boundingRectAnchor.height + 3) + "px");
				}
			}

			function hideMaskNote() {
				maskNoteElement.classList.remove(NOTE_MASK_MOVING_CLASS);
				if (selectedNote) {
					maskNoteElement.classList.remove(selectedNote.dataset.color);
				}
			}

			function selectNote(noteElement) {
				if (selectedNote) {
					selectedNote.classList.remove(NOTE_SELECTED_CLASS);
					maskNoteElement.classList.remove(selectedNote.dataset.color);
				}
				noteElement.classList.add(NOTE_SELECTED_CLASS);
				noteElement.classList.add(noteElement.dataset.color);
				selectedNote = noteElement;
			}

			function getTarget(clientX, clientY) {
				const targets = Array.from(document.elementsFromPoint(clientX, clientY)).filter(element => element.matches("html *:not(" + NOTE_TAGNAME + "):not(." + MASK_CLASS + ")"));
				if (!targets.includes(document.documentElement)) {
					targets.push(document.documentElement);
				}
				let newTarget, target = targets[0], boundingRect = target.getBoundingClientRect();
				newTarget = determineTargetElement("floor", target, clientX - boundingRect.left, getMatchedParents(target, "left"));
				if (newTarget == target) {
					newTarget = determineTargetElement("ceil", target, boundingRect.left + boundingRect.width - clientX, getMatchedParents(target, "right"));
				}
				if (newTarget == target) {
					newTarget = determineTargetElement("floor", target, clientY - boundingRect.top, getMatchedParents(target, "top"));
				}
				if (newTarget == target) {
					newTarget = determineTargetElement("ceil", target, boundingRect.top + boundingRect.height - clientY, getMatchedParents(target, "bottom"));
				}
				target = newTarget;
				while (boundingRect = target && target.getBoundingClientRect(), boundingRect && boundingRect.width <= SELECT_PX_THRESHOLD && boundingRect.height <= SELECT_PX_THRESHOLD) {
					target = target.parentElement;
				}
				return target;
			}

			function getMatchedParents(target, property) {
				let element = target, matchedParent, parents = [];
				do {
					const boundingRect = element.getBoundingClientRect();
					if (element.parentElement && !element.parentElement.tagName.toLowerCase() != NOTE_TAGNAME && !element.classList.contains(MASK_CLASS)) {
						const parentBoundingRect = element.parentElement.getBoundingClientRect();
						matchedParent = Math.abs(parentBoundingRect[property] - boundingRect[property]) <= SELECT_PX_THRESHOLD;
						if (matchedParent) {
							if (element.parentElement.clientWidth > SELECT_PX_THRESHOLD && element.parentElement.clientHeight > SELECT_PX_THRESHOLD &&
								((element.parentElement.clientWidth - element.clientWidth > SELECT_PX_THRESHOLD) || (element.parentElement.clientHeight - element.clientHeight > SELECT_PX_THRESHOLD))) {
								parents.push(element.parentElement);
							}
							element = element.parentElement;
						}
					} else {
						matchedParent = false;
					}
				} while (matchedParent && element);
				return parents;
			}

			function determineTargetElement(roundingMethod, target, widthDistance, parents) {
				if (Math[roundingMethod](widthDistance / SELECT_PX_THRESHOLD) <= parents.length) {
					target = parents[parents.length - Math[roundingMethod](widthDistance / SELECT_PX_THRESHOLD) - 1];
				}
				return target;
			}
		}

		function onMouseDown(event) {
			if ((cuttingMode || cuttingOuterMode) && cuttingPath) {
				event.preventDefault();
			}
		}

		function onMouseUp(event) {
			if (highlightSelectionMode) {
				highlightSelection();
				onUpdate(false);
			}
			if (removeHighlightMode) {
				let element = event.target, done;
				while (element && !done) {
					if (element.classList.contains(HIGHLIGHT_CLASS)) {
						document.querySelectorAll("." + HIGHLIGHT_CLASS + "[data-singlefile-highlight-id=" + JSON.stringify(element.dataset.singlefileHighlightId) + "]").forEach(highlightedElement => {
							resetHighlightedElement(highlightedElement);
							onUpdate(false);
						});
						done = true;
					}
					element = element.parentElement;
				}
			}
			if (resizingNoteMode) {
				resizingNoteMode = false;
				document.documentElement.style.removeProperty("user-select");
				maskPageElement.classList.remove(PAGE_MASK_ACTIVE_CLASS);
				document.documentElement.ontouchmove = document.documentElement.onmousemove = null;
				onUpdate(false);
			}
			if (movingNoteMode) {
				anchorNote(movingNoteMode.event || event, selectedNote, movingNoteMode.deltaX, movingNoteMode.deltaY);
				movingNoteMode = null;
				document.documentElement.ontouchmove = document.documentElement.onmousemove = null;
				onUpdate(false);
			}
			if (collapseNoteTimeout) {
				clearTimeout(collapseNoteTimeout);
				collapseNoteTimeout = null;
			}
			if ((cuttingMode || cuttingOuterMode) && cuttingPath) {
				if (event.ctrlKey) {
					const element = cuttingPath[cuttingPathIndex];
					element.classList.toggle(cuttingMode ? CUT_SELECTED_CLASS : CUT_OUTER_SELECTED_CLASS);
				} else {
					validateCutElement(event.shiftKey);
				}
			}
		}

		function onMouseOver(event) {
			if (cuttingMode || cuttingOuterMode) {
				const target = event.target;
				if (target.classList) {
					let ancestorFound;
					document.querySelectorAll("." + (cuttingMode ? CUT_SELECTED_CLASS : CUT_OUTER_SELECTED_CLASS)).forEach(element => {
						if (element == target || isAncestor(element, target) || isAncestor(target, element)) {
							ancestorFound = element;
						}
					});
					if (ancestorFound) {
						cuttingPath = [ancestorFound];
					} else {
						cuttingPath = getParents(event.target);
					}
					cuttingPathIndex = 0;
					highlightCutElement();
				}
			}
		}

		function onMouseOut() {
			if (cuttingMode || cuttingOuterMode) {
				if (cuttingPath) {
					unhighlightCutElement();
					cuttingPath = null;
				}
			}
		}

		function onKeyDown(event) {
			if (cuttingMode || cuttingOuterMode) {
				if (event.code == "Tab") {
					if (cuttingPath) {
						const delta = event.shiftKey ? -1 : 1;
						let element = cuttingPath[cuttingPathIndex];
						let nextElement = cuttingPath[cuttingPathIndex + delta];
						if (nextElement) {
							let pathIndex = cuttingPathIndex + delta;
							while (
								nextElement &&
								(
									(delta == 1 &&
										element.getBoundingClientRect().width >= nextElement.getBoundingClientRect().width &&
										element.getBoundingClientRect().height >= nextElement.getBoundingClientRect().height) ||
									(delta == -1 &&
										element.getBoundingClientRect().width <= nextElement.getBoundingClientRect().width &&
										element.getBoundingClientRect().height <= nextElement.getBoundingClientRect().height))) {
								pathIndex += delta;
								nextElement = cuttingPath[pathIndex];
							}
							if (nextElement && nextElement.classList && nextElement != document.body && nextElement != document.documentElement) {
								unhighlightCutElement();
								cuttingPathIndex = pathIndex;
								highlightCutElement();
							}
						}
					}
					event.preventDefault();
				}
				if (event.code == "Space") {
					if (cuttingPath) {
						if (event.ctrlKey) {
							const element = cuttingPath[cuttingPathIndex];
							element.classList.add(cuttingMode ? CUT_SELECTED_CLASS : CUT_OUTER_SELECTED_CLASS);
						} else {
							validateCutElement(event.shiftKey);
						}
						event.preventDefault();
					}
				}
				if (event.code == "Escape") {
					resetSelectedElements();
					event.preventDefault();
				}
				if (event.key.toLowerCase() == "z" && event.ctrlKey) {
					if (event.shiftKey) {
						redoCutPage();
					} else {
						undoCutPage();
					}
					event.preventDefault();
				}
			}
			if (event.key.toLowerCase() == "s" && event.ctrlKey) {
				window.parent.postMessage(JSON.stringify({ "method": "savePage" }), "*");
				event.preventDefault();
			}
			if (event.key.toLowerCase() == "p" && event.ctrlKey) {
				printPage();
				event.preventDefault();
			}
		}

		function printPage() {
			unhighlightCutElement();
			resetSelectedElements();
			window.print();
		}

		function highlightCutElement() {
			const element = cuttingPath[cuttingPathIndex];
			element.classList.add(cuttingMode ? CUT_HOVER_CLASS : CUT_OUTER_HOVER_CLASS);
		}

		function unhighlightCutElement() {
			if (cuttingPath) {
				const element = cuttingPath[cuttingPathIndex];
				element.classList.remove(CUT_HOVER_CLASS);
				element.classList.remove(CUT_OUTER_HOVER_CLASS);
			}
		}

		function disableHighlight(doc = document) {
			if (highlightColor) {
				doc.documentElement.classList.remove(highlightColor + "-mode");
			}
		}

		function undoCutPage() {
			if (removedElementIndex) {
				removedElements[removedElementIndex - 1].forEach(element => element.classList.remove(REMOVED_CONTENT_CLASS));
				removedElementIndex--;
			}
		}

		function redoCutPage() {
			if (removedElementIndex < removedElements.length) {
				removedElements[removedElementIndex].forEach(element => element.classList.add(REMOVED_CONTENT_CLASS));
				removedElementIndex++;
			}
		}

		function validateCutElement(invert) {
			const selectedElement = cuttingPath[cuttingPathIndex];
			if ((cuttingMode && !invert) || (cuttingOuterMode && invert)) {
				if (document.documentElement != selectedElement && selectedElement.tagName.toLowerCase() != NOTE_TAGNAME) {
					const elementsRemoved = [selectedElement].concat(...document.querySelectorAll("." + CUT_SELECTED_CLASS + ",." + CUT_SELECTED_CLASS + " *,." + CUT_HOVER_CLASS + " *"));
					resetSelectedElements();
					if (elementsRemoved.length) {
						elementsRemoved.forEach(element => {
							if (element.tagName.toLowerCase() == NOTE_TAGNAME) {
								resetAnchorNote(element);
							} else {
								element.classList.add(REMOVED_CONTENT_CLASS);
							}
						});
						removedElements[removedElementIndex] = elementsRemoved;
						removedElementIndex++;
						removedElements.length = removedElementIndex;
						onUpdate(false);
					}
				}
			} else {
				if (document.documentElement != selectedElement && selectedElement.tagName.toLowerCase() != NOTE_TAGNAME) {
					const elements = [];
					const searchSelector = "*:not(style):not(meta):not(." + REMOVED_CONTENT_CLASS + ")";
					const elementsKept = [selectedElement].concat(...document.querySelectorAll("." + CUT_OUTER_SELECTED_CLASS));
					document.body.querySelectorAll(searchSelector).forEach(element => {
						let removed = true;
						elementsKept.forEach(elementKept => removed = removed && (elementKept != element && !isAncestor(elementKept, element) && !isAncestor(element, elementKept)));
						if (removed) {
							if (element.tagName.toLowerCase() == NOTE_TAGNAME) {
								resetAnchorNote(element);
							} else {
								elements.push(element);
							}
						}
					});
					elementsKept.forEach(elementKept => {
						const elementKeptRect = elementKept.getBoundingClientRect();
						elementKept.querySelectorAll(searchSelector).forEach(descendant => {
							const descendantRect = descendant.getBoundingClientRect();
							if (descendantRect.width && descendantRect.height && (
								descendantRect.left + descendantRect.width < elementKeptRect.left ||
								descendantRect.right > elementKeptRect.right + elementKeptRect.width ||
								descendantRect.top + descendantRect.height < elementKeptRect.top ||
								descendantRect.bottom > elementKeptRect.bottom + elementKeptRect.height
							)) {
								elements.push(descendant);
							}
						});
					});
					resetSelectedElements();
					if (elements.length) {
						elements.forEach(element => element.classList.add(REMOVED_CONTENT_CLASS));
						removedElements[removedElementIndex] = elements;
						removedElementIndex++;
						removedElements.length = removedElementIndex;
						onUpdate(false);
					}
				}
			}
		}

		function resetSelectedElements(doc = document) {
			doc.querySelectorAll("." + CUT_OUTER_SELECTED_CLASS + ",." + CUT_SELECTED_CLASS).forEach(element => {
				element.classList.remove(CUT_OUTER_SELECTED_CLASS);
				element.classList.remove(CUT_SELECTED_CLASS);
			});
		}

		function anchorNote(event, noteElement, deltaX, deltaY) {
			event.preventDefault();
			const { clientX, clientY } = getPosition(event);
			document.documentElement.style.removeProperty("user-select");
			noteElement.classList.remove(NOTE_MOVING_CLASS);
			maskNoteElement.classList.remove(NOTE_MASK_MOVING_CLASS);
			maskPageElement.classList.remove(PAGE_MASK_ACTIVE_CLASS);
			maskNoteElement.classList.remove(noteElement.dataset.color);
			const headerElement = noteElement.querySelector("header");
			headerElement.ontouchmove = document.documentElement.onmousemove = null;
			let currentElement = anchorElement;
			let positionedElement;
			while (currentElement.parentElement && !positionedElement) {
				if (!FORBIDDEN_TAG_NAMES.includes(currentElement.tagName.toLowerCase())) {
					const currentElementStyle = getComputedStyle(currentElement);
					if (currentElementStyle.position != "static") {
						positionedElement = currentElement;
					}
				}
				currentElement = currentElement.parentElement;
			}
			if (!positionedElement) {
				positionedElement = document.documentElement;
			}
			const containerElement = noteElement.getRootNode().host;
			if (positionedElement == document.documentElement) {
				const firstMaskElement = document.querySelector("." + MASK_CLASS);
				firstMaskElement.parentElement.insertBefore(containerElement, firstMaskElement);
			} else {
				positionedElement.appendChild(containerElement);
			}
			const boundingRectPositionedElement = positionedElement.getBoundingClientRect();
			const stylePositionedElement = window.getComputedStyle(positionedElement);
			const borderX = parseInt(stylePositionedElement.getPropertyValue("border-left-width"));
			const borderY = parseInt(stylePositionedElement.getPropertyValue("border-top-width"));
			noteElement.style.setProperty("position", "absolute");
			noteElement.style.setProperty("left", (clientX - boundingRectPositionedElement.x - deltaX - borderX) + "px");
			noteElement.style.setProperty("top", (clientY - boundingRectPositionedElement.y - deltaY - borderY) + "px");
		}

		function resetAnchorNote(containerElement) {
			const noteId = containerElement.dataset.noteId;
			const noteElement = containerElement.shadowRoot.childNodes[1];
			noteElement.classList.remove(NOTE_ANCHORED_CLASS);
			deleteNoteRef(containerElement, noteId);
			addNoteRef(document.documentElement, noteId);
			document.documentElement.insertBefore(containerElement, maskPageElement.getRootNode().host);
		}

		function getPosition(event) {
			if (event.touches && event.touches.length) {
				const touch = event.touches[0];
				return touch;
			} else {
				return event;
			}
		}

		function highlightSelection() {
			let highlightId = 0;
			document.querySelectorAll("." + HIGHLIGHT_CLASS).forEach(highlightedElement => highlightId = Math.max(highlightId, highlightedElement.dataset.singlefileHighlightId));
			highlightId++;
			const selection = window.getSelection();
			const highlightedNodes = new Set();
			for (let indexRange = 0; indexRange < selection.rangeCount; indexRange++) {
				const range = selection.getRangeAt(indexRange);
				if (!range.collapsed) {
					if (range.commonAncestorContainer.nodeType == range.commonAncestorContainer.TEXT_NODE) {
						let contentText = range.startContainer.splitText(range.startOffset);
						contentText = contentText.splitText(range.endOffset);
						addHighLightedNode(contentText.previousSibling);
					} else {
						const treeWalker = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
						let highlightNodes;
						while (treeWalker.nextNode()) {
							if (highlightNodes && !treeWalker.currentNode.contains(range.endContainer)) {
								addHighLightedNode(treeWalker.currentNode);
							}
							if (treeWalker.currentNode == range.startContainer) {
								if (range.startContainer.nodeType == range.startContainer.TEXT_NODE) {
									const contentText = range.startContainer.splitText(range.startOffset);
									treeWalker.nextNode();
									addHighLightedNode(contentText);
								} else {
									addHighLightedNode(range.startContainer.childNodes[range.startOffset]);
								}
								highlightNodes = true;
							}
							if (treeWalker.currentNode == range.endContainer) {
								if (range.endContainer.nodeType == range.endContainer.TEXT_NODE) {
									const contentText = range.endContainer.splitText(range.endOffset);
									treeWalker.nextNode();
									addHighLightedNode(contentText.previousSibling);
								} else {
									addHighLightedNode(range.endContainer.childNodes[range.endOffset]);
								}
								highlightNodes = false;
							}
						}
						range.collapse();
					}
				}
			}
			highlightedNodes.forEach(node => highlightNode(node));

			function addHighLightedNode(node) {
				if (node && node.textContent.trim()) {
					if (node.nodeType == node.TEXT_NODE && node.parentElement.childNodes.length == 1 && node.parentElement.classList.contains(HIGHLIGHT_CLASS)) {
						highlightedNodes.add(node.parentElement);
					} else {
						highlightedNodes.add(node);
					}
				}
			}

			function highlightNode(node) {
				if (node.nodeType == node.ELEMENT_NODE) {
					resetHighlightedElement(node);
					node.classList.add(HIGHLIGHT_CLASS);
					node.classList.add(highlightColor);
					node.dataset.singlefileHighlightId = highlightId;
				} else if (node.parentElement) {
					highlightTextNode(node);
				}
			}

			function highlightTextNode(node) {
				const spanElement = document.createElement("span");
				spanElement.classList.add(HIGHLIGHT_CLASS);
				spanElement.classList.add(highlightColor);
				spanElement.textContent = node.textContent;
				spanElement.dataset.singlefileHighlightId = highlightId;
				node.parentNode.replaceChild(spanElement, node);
				return spanElement;
			}
		}

		function getParents(element) {
			const path = [];
			while (element) {
				path.push(element);
				element = element.parentElement;
			}
			return path;
		}

		function formatPage(applySystemTheme) {
			serializeShadowRoots(document);
			previousContent = document.documentElement.cloneNode(true);
			deserializeShadowRoots(document);
			const shadowRoots = {};
			const classesToPreserve = ["single-file-highlight", "single-file-highlight-yellow", "single-file-highlight-green", "single-file-highlight-pink", "single-file-highlight-blue"];
			document.querySelectorAll(NOTE_TAGNAME).forEach(containerElement => {
				shadowRoots[containerElement.dataset.noteId] = containerElement.shadowRoot;
				const className = "singlefile-note-id-" + containerElement.dataset.noteId;
				containerElement.classList.add(className);
				classesToPreserve.push(className);
			});
			const article = new Readability(document, { classesToPreserve }).parse();
			removedElements = [];
			removedElementIndex = 0;
			document.body.innerHTML = "";
			const domParser = new DOMParser();
			const doc = domParser.parseFromString(article.content, "text/html");
			const contentEditable = document.body.contentEditable;
			document.documentElement.replaceChild(doc.body, document.body);
			document.querySelectorAll(NOTE_TAGNAME).forEach(containerElement => {
				const noteId = (Array.from(containerElement.classList).find(className => /singlefile-note-id-\d+/.test(className))).split("singlefile-note-id-")[1];
				containerElement.classList.remove("singlefile-note-id-" + noteId);
				containerElement.dataset.noteId = noteId;
				if (!containerElement.shadowRoot) {
					containerElement.attachShadow({ mode: "open" });
					containerElement.shadowRoot.appendChild(shadowRoots[noteId]);
				}
			});
			document.querySelectorAll(NOTE_TAGNAME).forEach(containerElement => shadowRoots[containerElement.dataset.noteId].childNodes.forEach(node => containerElement.shadowRoot.appendChild(node)));
			document.body.contentEditable = contentEditable;
			document.head.querySelectorAll("style").forEach(styleElement => styleElement.remove());
			const styleElement = document.createElement("style");
			styleElement.textContent = STYLE_FORMATTED_PAGE;
			document.head.appendChild(styleElement);
			document.body.classList.add("moz-reader-content");
			document.body.classList.add("content-width6");
			document.body.classList.add("reader-show-element");
			document.body.classList.add("sans-serif");
			document.body.classList.add("container");
			document.body.classList.add("line-height4");
			const prefersColorSchemeDark = matchMedia("(prefers-color-scheme: dark)");
			if (applySystemTheme && prefersColorSchemeDark && prefersColorSchemeDark.matches) {
				document.body.classList.add("dark");
			}
			document.body.style.setProperty("display", "block");
			document.body.style.setProperty("padding", "24px");
			const titleElement = document.createElement("h1");
			titleElement.classList.add("reader-title");
			titleElement.textContent = article.title;
			document.body.insertBefore(titleElement, document.body.firstChild);
			document.querySelectorAll("a[href]").forEach(element => {
				const href = element.getAttribute("href").trim();
				if (href.startsWith(document.baseURI + "#")) {
					element.setAttribute("href", href.substring(document.baseURI.length));
				}
			});
			document.documentElement.appendChild(getStyleElement(HIGHLIGHTS_WEB_STYLESHEET));
			maskPageElement = getMaskElement(PAGE_MASK_CLASS, PAGE_MASK_CONTAINER_CLASS);
			maskNoteElement = getMaskElement(NOTE_MASK_CLASS);
			reflowNotes();
			onUpdate(false);
		}

		async function cancelFormatPage() {
			if (previousContent) {
				const contentEditable = document.body.contentEditable;
				document.body.contentEditable = contentEditable;
				document.replaceChild(previousContent, document.documentElement);
				deserializeShadowRoots(document);
				await initPage();
				onUpdate(false);
				previousContent = null;
			}
		}

		function getContent(compressHTML, updatedResources) {
			unhighlightCutElement();
			serializeShadowRoots(document);
			const doc = document.cloneNode(true);
			disableHighlight(doc);
			resetSelectedElements(doc);
			deserializeShadowRoots(doc);
			deserializeShadowRoots(document);
			doc.querySelectorAll("[" + DISABLED_NOSCRIPT_ATTRIBUTE_NAME + "]").forEach(element => {
				element.textContent = element.getAttribute(DISABLED_NOSCRIPT_ATTRIBUTE_NAME);
				element.removeAttribute(DISABLED_NOSCRIPT_ATTRIBUTE_NAME);
			});
			doc.querySelectorAll("." + MASK_CLASS + ", ." + REMOVED_CONTENT_CLASS).forEach(maskElement => maskElement.remove());
			doc.querySelectorAll("." + HIGHLIGHT_CLASS).forEach(noteElement => noteElement.classList.remove(HIGHLIGHT_HIDDEN_CLASS));
			doc.querySelectorAll(`template[${SHADOWROOT_ATTRIBUTE_NAME}]`).forEach(templateElement => {
				const noteElement = templateElement.querySelector("." + NOTE_CLASS);
				if (noteElement) {
					noteElement.classList.remove(NOTE_HIDDEN_CLASS);
				}
				const mainElement = templateElement.querySelector("textarea");
				if (mainElement) {
					mainElement.textContent = mainElement.value;
				}
			});
			doc.querySelectorAll("iframe").forEach(element => {
				const pointerEvents = "pointer-events";
				element.style.setProperty(pointerEvents, element.style.getPropertyValue("-sf-" + pointerEvents), element.style.getPropertyPriority("-sf-" + pointerEvents));
				element.style.removeProperty("-sf-" + pointerEvents);
			});
			doc.body.removeAttribute("contentEditable");
			const newResources = Object.keys(updatedResources).filter(url => updatedResources[url].type == "stylesheet").map(url => updatedResources[url]);
			newResources.forEach(resource => {
				const element = doc.createElement("style");
				doc.body.appendChild(element);
				element.textContent = resource.content;
			});
			const pageFilename = pageResources
				.filter(resource => resource.filename.endsWith("index.html"))
				.sort((resourceLeft, resourceRight) => resourceLeft.filename.length - resourceRight.filename.length)[0].filename;
			const resources = pageResources.filter(resource => resource.parentResources.includes(pageFilename));
			doc.querySelectorAll("[src]").forEach(element => resources.forEach(resource => {
				if (element.src == resource.content) {
					element.src = resource.name;
				}
			}));
			let content = singlefile.helper.serialize(doc, compressHTML);
			const REGEXP_ESCAPE = /([{}()^$&.*?/+|[\\\\]|\]|-)/g;
			resources.forEach(resource => {
				const searchRegExp = new RegExp(resource.content.replace(REGEXP_ESCAPE, "\\$1"), "g");
				const position = content.search(searchRegExp);
				if (position != -1) {
					content = content.replace(searchRegExp, resource.name);
				}
			});
			return content + "<script " + SCRIPT_TEMPLATE_SHADOW_ROOT + ">" + getEmbedScript() + "</script>";
		}

		function onUpdate(saved) {
			window.parent.postMessage(JSON.stringify({ "method": "onUpdate", saved }), "*");
		}

		function waitResourcesLoad() {
			return new Promise(resolve => {
				let counterMutations = 0;
				const done = () => {
					observer.disconnect();
					resolve();
				};
				let timeoutInit = setTimeout(done, 100);
				const observer = new MutationObserver(() => {
					if (counterMutations < 20) {
						counterMutations++;
						clearTimeout(timeoutInit);
						timeoutInit = setTimeout(done, 100);
					} else {
						done();
					}
				});
				observer.observe(document, { subtree: true, childList: true, attributes: true });
			});
		}

		function reflowNotes() {
			document.querySelectorAll(NOTE_TAGNAME).forEach(containerElement => {
				const noteElement = containerElement.shadowRoot.querySelector("." + NOTE_CLASS);
				const noteBoundingRect = noteElement.getBoundingClientRect();
				const anchorElement = getAnchorElement(containerElement);
				const anchorBoundingRect = anchorElement.getBoundingClientRect();
				const maxX = anchorBoundingRect.x + Math.max(0, anchorBoundingRect.width - noteBoundingRect.width);
				const minX = anchorBoundingRect.x;
				const maxY = anchorBoundingRect.y + Math.max(0, anchorBoundingRect.height - NOTE_HEADER_HEIGHT);
				const minY = anchorBoundingRect.y;
				let left = parseInt(noteElement.style.getPropertyValue("left"));
				let top = parseInt(noteElement.style.getPropertyValue("top"));
				if (noteBoundingRect.x > maxX) {
					left -= noteBoundingRect.x - maxX;
				}
				if (noteBoundingRect.x < minX) {
					left += minX - noteBoundingRect.x;
				}
				if (noteBoundingRect.y > maxY) {
					top -= noteBoundingRect.y - maxY;
				}
				if (noteBoundingRect.y < minY) {
					top += minY - noteBoundingRect.y;
				}
				noteElement.style.setProperty("position", "absolute");
				noteElement.style.setProperty("left", left + "px");
				noteElement.style.setProperty("top", top + "px");
			});
		}

		function resetHighlightedElement(element) {
			element.classList.remove(HIGHLIGHT_CLASS);
			element.classList.remove("single-file-highlight-yellow");
			element.classList.remove("single-file-highlight-pink");
			element.classList.remove("single-file-highlight-blue");
			element.classList.remove("single-file-highlight-green");
			delete element.dataset.singlefileHighlightId;
		}

		function serializeShadowRoots(node) {
			node.querySelectorAll("*").forEach(element => {
				const shadowRoot = getShadowRoot(element);
				if (shadowRoot) {
					serializeShadowRoots(shadowRoot);
					const templateElement = document.createElement("template");
					templateElement.setAttribute(SHADOWROOT_ATTRIBUTE_NAME, "open");
					templateElement.appendChild(shadowRoot);
					element.appendChild(templateElement);
				}
			});
		}

		function deserializeShadowRoots(node) {
			node.querySelectorAll(`template[${SHADOWROOT_ATTRIBUTE_NAME}]`).forEach(element => {
				if (element.parentElement) {
					let shadowRoot = getShadowRoot(element.parentElement);
					if (shadowRoot) {
						Array.from(element.childNodes).forEach(node => shadowRoot.appendChild(node));
						element.remove();
					} else {
						try {
							shadowRoot = element.parentElement.attachShadow({ mode: "open" });
							const contentDocument = (new DOMParser()).parseFromString(element.innerHTML, "text/html");
							Array.from(contentDocument.head.childNodes).forEach(node => shadowRoot.appendChild(node));
							Array.from(contentDocument.body.childNodes).forEach(node => shadowRoot.appendChild(node));
						} catch (error) {
							// ignored
						}
					}
					if (shadowRoot) {
						deserializeShadowRoots(shadowRoot);
					}
				}
			});
		}

		function getMaskElement(className, containerClassName) {
			let maskElement = document.documentElement.querySelector("." + className);
			if (!maskElement) {
				maskElement = document.createElement("div");
				const maskContainerElement = document.createElement("div");
				if (containerClassName) {
					maskContainerElement.classList.add(containerClassName);
				}
				maskContainerElement.classList.add(MASK_CLASS);
				const firstNote = document.querySelector(NOTE_TAGNAME);
				if (firstNote && firstNote.parentElement == document.documentElement) {
					document.documentElement.insertBefore(maskContainerElement, firstNote);
				} else {
					document.documentElement.appendChild(maskContainerElement);
				}
				maskElement.classList.add(className);
				const maskShadow = maskContainerElement.attachShadow({ mode: "open" });
				maskShadow.appendChild(getStyleElement(MASK_WEB_STYLESHEET));
				maskShadow.appendChild(maskElement);
				return maskElement;
			}
		}

		function getEmbedScript() {
			return minifyText(`(() => {
			document.currentScript.remove();
			const processNode = node => {
				node.querySelectorAll("template[${SHADOWROOT_ATTRIBUTE_NAME}]").forEach(element=>{
					let shadowRoot = getShadowRoot(element.parentElement);
					if (!shadowRoot) {
						try {
							shadowRoot = element.parentElement.attachShadow({mode:element.getAttribute("${SHADOWROOT_ATTRIBUTE_NAME}")});
							shadowRoot.innerHTML = element.innerHTML;
							element.remove();
						} catch (error) {}						
						if (shadowRoot) {
							processNode(shadowRoot);
						}
					}					
				})
			};
			const FORBIDDEN_TAG_NAMES = ${JSON.stringify(FORBIDDEN_TAG_NAMES)};
			const NOTE_TAGNAME = ${JSON.stringify(NOTE_TAGNAME)};
			const NOTE_CLASS = ${JSON.stringify(NOTE_CLASS)};
			const NOTE_ANCHORED_CLASS = ${JSON.stringify(NOTE_ANCHORED_CLASS)};
			const NOTE_SELECTED_CLASS = ${JSON.stringify(NOTE_SELECTED_CLASS)};
			const NOTE_MOVING_CLASS = ${JSON.stringify(NOTE_MOVING_CLASS)};
			const NOTE_MASK_MOVING_CLASS = ${JSON.stringify(NOTE_MASK_MOVING_CLASS)};
			const MASK_CLASS = ${JSON.stringify(MASK_CLASS)};
			const HIGHLIGHT_CLASS = ${JSON.stringify(HIGHLIGHT_CLASS)};
			const NOTES_WEB_STYLESHEET = ${JSON.stringify(NOTES_WEB_STYLESHEET)};
			const MASK_WEB_STYLESHEET = ${JSON.stringify(MASK_WEB_STYLESHEET)};
			const NOTE_HEADER_HEIGHT = ${JSON.stringify(NOTE_HEADER_HEIGHT)};
			const PAGE_MASK_ACTIVE_CLASS = ${JSON.stringify(PAGE_MASK_ACTIVE_CLASS)};
			const REMOVED_CONTENT_CLASS = ${JSON.stringify(REMOVED_CONTENT_CLASS)};
			const reflowNotes = ${minifyText(reflowNotes.toString())};			
			const addNoteRef = ${minifyText(addNoteRef.toString())};
			const deleteNoteRef = ${minifyText(deleteNoteRef.toString())};
			const getNoteRefs = ${minifyText(getNoteRefs.toString())};
			const setNoteRefs = ${minifyText(setNoteRefs.toString())};
			const getAnchorElement = ${minifyText(getAnchorElement.toString())};
			const getMaskElement = ${minifyText(getMaskElement.toString())};
			const getStyleElement = ${minifyText(getStyleElement.toString())};
			const attachNoteListeners = ${minifyText(attachNoteListeners.toString())};
			const anchorNote = ${minifyText(anchorNote.toString())};
			const getPosition = ${minifyText(getPosition.toString())};
			const onMouseUp = ${minifyText(onMouseUp.toString())};
			const getShadowRoot = ${minifyText(getShadowRoot.toString())};
			const waitResourcesLoad = ${minifyText(waitResourcesLoad.toString())};
			const maskNoteElement = getMaskElement(${JSON.stringify(NOTE_MASK_CLASS)});
			const maskPageElement = getMaskElement(${JSON.stringify(PAGE_MASK_CLASS)}, ${JSON.stringify(PAGE_MASK_CONTAINER_CLASS)});
			let selectedNote, highlightSelectionMode, removeHighlightMode, resizingNoteMode, movingNoteMode, collapseNoteTimeout, cuttingMode, cuttingOuterMode;
			window.onresize = reflowNotes;
			window.onUpdate = () => {};
			document.documentElement.onmouseup = document.documentElement.ontouchend = onMouseUp;
			processNode(document);
			document.querySelectorAll(${JSON.stringify(NOTE_TAGNAME)}).forEach(noteElement => attachNoteListeners(noteElement));
			reflowNotes();
			waitResourcesLoad().then(reflowNotes);
		})()`);
		}

		function getStyleElement(stylesheet) {
			const linkElement = document.createElement("style");
			linkElement.textContent = stylesheet;
			return linkElement;
		}

		function getAnchorElement(containerElement) {
			return document.querySelector("[data-single-file-note-refs~=\"" + containerElement.dataset.noteId + "\"]") || document.documentElement;
		}

		function addNoteRef(anchorElement, noteId) {
			const noteRefs = getNoteRefs(anchorElement);
			noteRefs.push(noteId);
			setNoteRefs(anchorElement, noteRefs);
		}

		function deleteNoteRef(containerElement, noteId) {
			const anchorElement = getAnchorElement(containerElement);
			const noteRefs = getNoteRefs(anchorElement).filter(noteRefs => noteRefs != noteId);
			if (noteRefs.length) {
				setNoteRefs(anchorElement, noteRefs);
			} else {
				delete anchorElement.dataset.singleFileNoteRefs;
			}
		}

		function getNoteRefs(anchorElement) {
			return anchorElement.dataset.singleFileNoteRefs ? anchorElement.dataset.singleFileNoteRefs.split(" ") : [];
		}

		function setNoteRefs(anchorElement, noteRefs) {
			anchorElement.dataset.singleFileNoteRefs = noteRefs.join(" ");
		}

		function minifyText(text) {
			return text.replace(/[\n\t\s]+/g, " ");
		}

		function isAncestor(element, otherElement) {
			return otherElement.parentElement && (element == otherElement.parentElement || isAncestor(element, otherElement.parentElement));
		}

		function getShadowRoot(element) {
			const chrome = window.chrome;
			if (element.openOrClosedShadowRoot) {
				return element.openOrClosedShadowRoot;
			} else if (chrome && chrome.dom && chrome.dom.openOrClosedShadowRoot) {
				try {
					return chrome.dom.openOrClosedShadowRoot(element);
				} catch (error) {
					return element.shadowRoot;
				}
			} else {
				return element.shadowRoot;
			}
		}

		function detectSavedPage(document) {
			const firstDocumentChild = document.documentElement.firstChild;
			return firstDocumentChild.nodeType == Node.COMMENT_NODE &&
				(firstDocumentChild.textContent.includes(COMMENT_HEADER));
		}

	})(typeof globalThis == "object" ? globalThis : window);

})();
