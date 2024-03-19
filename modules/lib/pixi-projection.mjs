/*!
 * pixi-projection - v1.0.0
 * Compiled Mon, 24 Apr 2023 10:12:46 UTC
 *
 * pixi-projection is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2023, Ivan Popelyshev, All Rights Reserved
*/
import * as PIXI from "./pixi.mjs"

let Rt = PIXI.Geometry;
let it = PIXI.Buffer;
let ot = PIXI.BatchRenderer;
let Lt = PIXI.BatchShaderGenerator;
let Dt = PIXI.Color;
let wt = PIXI.ExtensionType;
let bt = PIXI.extensions;
let de = PIXI.ObjectRenderer;
let pe = PIXI.QuadUv;
let Gt = PIXI.Shader;
let at = PIXI.Program;
let me = PIXI.Filter;
let Mt = PIXI.TextureMatrix;
let qt = PIXI.MaskSystem;

let nt = PIXI.Transform;
let j = PIXI.Point;
let Xt = PIXI.Rectangle;
let kt = PIXI.ObservablePoint;
let S = PIXI.Matrix;

let fe = PIXI.premultiplyBlendMode;
let ye = PIXI.premultiplyTintToRgba;
let xe = PIXI.correctBlendMode;

let D = PIXI.Container;

let Ht = PIXI.TilingSprite;

let Bt = PIXI.Mesh;
let Ot = PIXI.MeshGeometry;
let ht = PIXI.MeshMaterial;

let $t = PIXI.SimpleMesh;
let Qt = PIXI.SimpleRope;

let $ = PIXI.Sprite;

let jt = PIXI.Text;

let Jt = PIXI.Graphics;

/* import{
	Geometry as Rt,
	Buffer as it,
	BatchRenderer as ot,
	BatchShaderGenerator as Lt,
	Color as Dt,
	ExtensionType as wt,
	extensions as bt,
	ObjectRenderer as de,
	QuadUv as pe,
	Shader as Gt,
	Program as at,
	Filter as me,
	TextureMatrix as Mt,
	MaskSystem as qt
}from"@pixi/core";

import{
	Transform as nt,
	Point as j,
	Rectangle as Xt,
	ObservablePoint as kt,
	Matrix as S
}from"@pixi/math";

import{
	premultiplyBlendMode as fe,
	premultiplyTintToRgba as ye,
	correctBlendMode as xe
}from"@pixi/utils";

import{Container as D}from"@pixi/display";

import{TilingSprite as Ht}from"@pixi/sprite-tiling";

import{
	Mesh as Bt,
	MeshGeometry as Ot,
	MeshMaterial as ht
}from"@pixi/mesh";

import{
	SimpleMesh as $t,
	SimpleRope as Qt
}from"@pixi/mesh-extras";

import{Sprite as $}from"@pixi/sprite";

import{Text as jt}from"@pixi/text";

import{Graphics as Jt}from"@pixi/graphics"; */

var _e=(t=>(t[t.WEBGL_LEGACY=0]="WEBGL_LEGACY",t[t.WEBGL=1]="WEBGL",t[t.WEBGL2=2]="WEBGL2",t))(_e||{}),ve=(t=>(t[t.UNKNOWN=0]="UNKNOWN",t[t.WEBGL=1]="WEBGL",t[t.CANVAS=2]="CANVAS",t))(ve||{}),ge=(t=>(t[t.COLOR=16384]="COLOR",t[t.DEPTH=256]="DEPTH",t[t.STENCIL=1024]="STENCIL",t))(ge||{}),Te=(t=>(t[t.NORMAL=0]="NORMAL",t[t.ADD=1]="ADD",t[t.MULTIPLY=2]="MULTIPLY",t[t.SCREEN=3]="SCREEN",t[t.OVERLAY=4]="OVERLAY",t[t.DARKEN=5]="DARKEN",t[t.LIGHTEN=6]="LIGHTEN",t[t.COLOR_DODGE=7]="COLOR_DODGE",t[t.COLOR_BURN=8]="COLOR_BURN",t[t.HARD_LIGHT=9]="HARD_LIGHT",t[t.SOFT_LIGHT=10]="SOFT_LIGHT",t[t.DIFFERENCE=11]="DIFFERENCE",t[t.EXCLUSION=12]="EXCLUSION",t[t.HUE=13]="HUE",t[t.SATURATION=14]="SATURATION",t[t.COLOR=15]="COLOR",t[t.LUMINOSITY=16]="LUMINOSITY",t[t.NORMAL_NPM=17]="NORMAL_NPM",t[t.ADD_NPM=18]="ADD_NPM",t[t.SCREEN_NPM=19]="SCREEN_NPM",t[t.NONE=20]="NONE",t[t.SRC_OVER=0]="SRC_OVER",t[t.SRC_IN=21]="SRC_IN",t[t.SRC_OUT=22]="SRC_OUT",t[t.SRC_ATOP=23]="SRC_ATOP",t[t.DST_OVER=24]="DST_OVER",t[t.DST_IN=25]="DST_IN",t[t.DST_OUT=26]="DST_OUT",t[t.DST_ATOP=27]="DST_ATOP",t[t.ERASE=26]="ERASE",t[t.SUBTRACT=28]="SUBTRACT",t[t.XOR=29]="XOR",t))(Te||{}),Zt=(t=>(t[t.POINTS=0]="POINTS",t[t.LINES=1]="LINES",t[t.LINE_LOOP=2]="LINE_LOOP",t[t.LINE_STRIP=3]="LINE_STRIP",t[t.TRIANGLES=4]="TRIANGLES",t[t.TRIANGLE_STRIP=5]="TRIANGLE_STRIP",t[t.TRIANGLE_FAN=6]="TRIANGLE_FAN",t))(Zt||{}),Ie=(t=>(t[t.RGBA=6408]="RGBA",t[t.RGB=6407]="RGB",t[t.RG=33319]="RG",t[t.RED=6403]="RED",t[t.RGBA_INTEGER=36249]="RGBA_INTEGER",t[t.RGB_INTEGER=36248]="RGB_INTEGER",t[t.RG_INTEGER=33320]="RG_INTEGER",t[t.RED_INTEGER=36244]="RED_INTEGER",t[t.ALPHA=6406]="ALPHA",t[t.LUMINANCE=6409]="LUMINANCE",t[t.LUMINANCE_ALPHA=6410]="LUMINANCE_ALPHA",t[t.DEPTH_COMPONENT=6402]="DEPTH_COMPONENT",t[t.DEPTH_STENCIL=34041]="DEPTH_STENCIL",t))(Ie||{}),we=(t=>(t[t.TEXTURE_2D=3553]="TEXTURE_2D",t[t.TEXTURE_CUBE_MAP=34067]="TEXTURE_CUBE_MAP",t[t.TEXTURE_2D_ARRAY=35866]="TEXTURE_2D_ARRAY",t[t.TEXTURE_CUBE_MAP_POSITIVE_X=34069]="TEXTURE_CUBE_MAP_POSITIVE_X",t[t.TEXTURE_CUBE_MAP_NEGATIVE_X=34070]="TEXTURE_CUBE_MAP_NEGATIVE_X",t[t.TEXTURE_CUBE_MAP_POSITIVE_Y=34071]="TEXTURE_CUBE_MAP_POSITIVE_Y",t[t.TEXTURE_CUBE_MAP_NEGATIVE_Y=34072]="TEXTURE_CUBE_MAP_NEGATIVE_Y",t[t.TEXTURE_CUBE_MAP_POSITIVE_Z=34073]="TEXTURE_CUBE_MAP_POSITIVE_Z",t[t.TEXTURE_CUBE_MAP_NEGATIVE_Z=34074]="TEXTURE_CUBE_MAP_NEGATIVE_Z",t))(we||{}),P=(t=>(t[t.UNSIGNED_BYTE=5121]="UNSIGNED_BYTE",t[t.UNSIGNED_SHORT=5123]="UNSIGNED_SHORT",t[t.UNSIGNED_SHORT_5_6_5=33635]="UNSIGNED_SHORT_5_6_5",t[t.UNSIGNED_SHORT_4_4_4_4=32819]="UNSIGNED_SHORT_4_4_4_4",t[t.UNSIGNED_SHORT_5_5_5_1=32820]="UNSIGNED_SHORT_5_5_5_1",t[t.UNSIGNED_INT=5125]="UNSIGNED_INT",t[t.UNSIGNED_INT_10F_11F_11F_REV=35899]="UNSIGNED_INT_10F_11F_11F_REV",t[t.UNSIGNED_INT_2_10_10_10_REV=33640]="UNSIGNED_INT_2_10_10_10_REV",t[t.UNSIGNED_INT_24_8=34042]="UNSIGNED_INT_24_8",t[t.UNSIGNED_INT_5_9_9_9_REV=35902]="UNSIGNED_INT_5_9_9_9_REV",t[t.BYTE=5120]="BYTE",t[t.SHORT=5122]="SHORT",t[t.INT=5124]="INT",t[t.FLOAT=5126]="FLOAT",t[t.FLOAT_32_UNSIGNED_INT_24_8_REV=36269]="FLOAT_32_UNSIGNED_INT_24_8_REV",t[t.HALF_FLOAT=36193]="HALF_FLOAT",t))(P||{}),be=(t=>(t[t.FLOAT=0]="FLOAT",t[t.INT=1]="INT",t[t.UINT=2]="UINT",t))(be||{}),je=(t=>(t[t.NEAREST=0]="NEAREST",t[t.LINEAR=1]="LINEAR",t))(je||{}),ct=(t=>(t[t.CLAMP=33071]="CLAMP",t[t.REPEAT=10497]="REPEAT",t[t.MIRRORED_REPEAT=33648]="MIRRORED_REPEAT",t))(ct||{}),Ne=(t=>(t[t.OFF=0]="OFF",t[t.POW2=1]="POW2",t[t.ON=2]="ON",t[t.ON_MANUAL=3]="ON_MANUAL",t))(Ne||{}),Ce=(t=>(t[t.NPM=0]="NPM",t[t.UNPACK=1]="UNPACK",t[t.PMA=2]="PMA",t[t.NO_PREMULTIPLIED_ALPHA=0]="NO_PREMULTIPLIED_ALPHA",t[t.PREMULTIPLY_ON_UPLOAD=1]="PREMULTIPLY_ON_UPLOAD",t[t.PREMULTIPLIED_ALPHA=2]="PREMULTIPLIED_ALPHA",t))(Ce||{}),Ue=(t=>(t[t.NO=0]="NO",t[t.YES=1]="YES",t[t.AUTO=2]="AUTO",t[t.BLEND=0]="BLEND",t[t.CLEAR=1]="CLEAR",t[t.BLIT=2]="BLIT",t))(Ue||{}),Fe=(t=>(t[t.AUTO=0]="AUTO",t[t.MANUAL=1]="MANUAL",t))(Fe||{}),Pe=(t=>(t.LOW="lowp",t.MEDIUM="mediump",t.HIGH="highp",t))(Pe||{}),Ae=(t=>(t[t.NONE=0]="NONE",t[t.SCISSOR=1]="SCISSOR",t[t.STENCIL=2]="STENCIL",t[t.SPRITE=3]="SPRITE",t[t.COLOR=4]="COLOR",t))(Ae||{}),ze=(t=>(t[t.RED=1]="RED",t[t.GREEN=2]="GREEN",t[t.BLUE=4]="BLUE",t[t.ALPHA=8]="ALPHA",t))(ze||{}),Ve=(t=>(t[t.NONE=0]="NONE",t[t.LOW=2]="LOW",t[t.MEDIUM=4]="MEDIUM",t[t.HIGH=8]="HIGH",t))(Ve||{}),Re=(t=>(t[t.ELEMENT_ARRAY_BUFFER=34963]="ELEMENT_ARRAY_BUFFER",t[t.ARRAY_BUFFER=34962]="ARRAY_BUFFER",t[t.UNIFORM_BUFFER=35345]="UNIFORM_BUFFER",t))(Re||{});const Le=`precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aColor;
attribute float aTextureId;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;
varying vec4 vColor;
varying float vTextureId;

void main(void){
gl_Position.xyw = projectionMatrix * aVertexPosition;
gl_Position.z = 0.0;

vTextureCoord = aTextureCoord;
vTextureId = aTextureId;
vColor = aColor;
}
`,De=`
varying vec2 vTextureCoord;
varying vec4 vColor;
varying float vTextureId;
uniform sampler2D uSamplers[%count%];

void main(void){
vec4 color;
%forloop%
gl_FragColor = color * vColor;
}`;class Wt extends Rt{constructor(r=!1){super(),this._buffer=new it(null,r,!1),this._indexBuffer=new it(null,r,!0),this.addAttribute("aVertexPosition",this._buffer,3,!1,P.FLOAT).addAttribute("aTextureCoord",this._buffer,2,!1,P.FLOAT).addAttribute("aColor",this._buffer,4,!0,P.UNSIGNED_BYTE).addAttribute("aTextureId",this._buffer,1,!0,P.FLOAT).addIndex(this._indexBuffer)}}class Nt extends ot{constructor(r){super(r),this.geometryClass=Wt,this.vertexSize=7}setShaderGenerator(){this.shaderGenerator=new Lt(Le,De)}packInterleavedGeometry(r,e,s,o,i){const{uint32View:a,float32View:n}=e,h=o/this.vertexSize,p=r.uvs,c=r.indices,d=r.vertexData,u=r.vertexData2d,l=r._texture.baseTexture._batchLocation,m=Math.min(r.worldAlpha,1),f=Dt.shared.setValue(r._tintRGB).toPremultiplied(m);if(u){let y=0;for(let _=0;_<u.length;_+=3,y+=2)n[o++]=u[_],n[o++]=u[_+1],n[o++]=u[_+2],n[o++]=p[y],n[o++]=p[y+1],a[o++]=f,n[o++]=l}else for(let y=0;y<d.length;y+=2)n[o++]=d[y],n[o++]=d[y+1],n[o++]=1,n[o++]=p[y],n[o++]=p[y+1],a[o++]=f,n[o++]=l;for(let y=0;y<c.length;y++)s[i++]=h+c[y]}}Nt.extension={name:"batch2d",type:wt.RendererPlugin};class Ct{constructor(r,e=!0){this._enabled=!1,this.legacy=r,e&&(this.enabled=!0),this.legacy.proj=this}get enabled(){return this._enabled}set enabled(r){this._enabled=r}clear(){}}var C=(t=>(t[t.NONE=0]="NONE",t[t.BEFORE_PROJ=4]="BEFORE_PROJ",t[t.PROJ=5]="PROJ",t[t.ALL=9]="ALL",t))(C||{}),G=(t=>(t[t.NONE=0]="NONE",t[t.FREE=1]="FREE",t[t.AXIS_X=2]="AXIS_X",t[t.AXIS_Y=3]="AXIS_Y",t[t.POINT=4]="POINT",t[t.AXIS_XR=5]="AXIS_XR",t))(G||{});function Et(t){const r=this.proj,e=this,s=t._worldID,o=e.localTransform,i=r.scaleAfterAffine&&r.affine>=2;e._localID!==e._currentLocalID&&(i?(o.a=e._cx,o.b=e._sx,o.c=e._cy,o.d=e._sy,o.tx=e.position._x,o.ty=e.position._y):(o.a=e._cx*e.scale._x,o.b=e._sx*e.scale._x,o.c=e._cy*e.scale._y,o.d=e._sy*e.scale._y,o.tx=e.position._x-(e.pivot._x*o.a+e.pivot._y*o.c),o.ty=e.position._y-(e.pivot._x*o.b+e.pivot._y*o.d)),e._currentLocalID=e._localID,r._currentProjID=-1);const a=r._projID;if(r._currentProjID!==a&&(r._currentProjID=a,r.updateLocalTransform(o),e._parentID=-1),e._parentID!==s){const n=t.proj;n&&!n._affine?r.world.setToMult(n.world,r.local):r.world.setToMultLegacy(t.worldTransform,r.local);const h=e.worldTransform;r.world.copyTo(h,r._affine,r.affinePreserveOrientation),i&&(h.a*=e.scale._x,h.b*=e.scale._x,h.c*=e.scale._y,h.d*=e.scale._y,h.tx-=e.pivot._x*h.a+e.pivot._y*h.c,h.ty-=e.pivot._x*h.b+e.pivot._y*h.d),e._parentID=s,e._worldID++}}class Ut extends Ct{constructor(){super(...arguments),this._projID=0,this._currentProjID=-1,this._affine=0,this.affinePreserveOrientation=!1,this.scaleAfterAffine=!0}updateLocalTransform(r){}set affine(r){this._affine!==r&&(this._affine=r,this._currentProjID=-1,this.legacy._currentLocalID=-1)}get affine(){return this._affine}set enabled(r){r!==this._enabled&&(this._enabled=r,r?(this.legacy.updateTransform=Et,this.legacy._parentID=-1):(this.legacy.updateTransform=nt.prototype.updateTransform,this.legacy._parentID=-1))}clear(){this._currentProjID=-1,this._projID=0}}class Kt extends ot{constructor(){super(...arguments),this.forceMaxTextures=0,this.defUniforms={}}getUniforms(r){return this.defUniforms}syncUniforms(r){if(!r)return;const e=this._shader;for(const s in r)e.uniforms[s]=r[s]}buildDrawCalls(r,e,s){const o=this,{_bufferedElements:i,_attributeBuffer:a,_indexBuffer:n,vertexSize:h}=this,p=ot._drawCallPool;let c=this._dcIndex,d=this._aIndex,u=this._iIndex,l=p[c];l.start=this._iIndex,l.texArray=r;for(let m=e;m<s;++m){const f=i[m],y=f._texture.baseTexture,_=fe[y.alphaMode?1:0][f.blendMode],g=this.getUniforms(f);i[m]=null,e<m&&(l.blend!==_||l.uniforms!==g)&&(l.size=u-l.start,e=m,l=p[++c],l.texArray=r,l.start=u),this.packInterleavedGeometry(f,a,n,d,u),d+=f.vertexData.length/2*h,u+=f.indices.length,l.blend=_,l.uniforms=g}e<s&&(l.size=u-l.start,++c),o._dcIndex=c,o._aIndex=d,o._iIndex=u}drawBatches(){const r=this._dcIndex,{gl:e,state:s,shader:o}=this.renderer,i=ot._drawCallPool;let a=null,n=null;for(let h=0;h<r;h++){const{texArray:p,type:c,size:d,start:u,blend:l,uniforms:m}=i[h];n!==p&&(n=p,this.bindAndClearTexArray(p)),a!==m&&(a=m,this.syncUniforms(m),o.syncUniformGroup(this._shader.uniformGroup)),this.state.blendMode=l,s.set(this.state),e.drawElements(c,d,e.UNSIGNED_SHORT,u*2)}}contextChange(){if(!this.forceMaxTextures){super.contextChange(),this.syncUniforms(this.defUniforms);return}const r=this;r.maxTextures=this.forceMaxTextures,this._shader=r.shaderGenerator.generateShader(this.maxTextures),this.syncUniforms(this.defUniforms);for(let e=0;e<r._packedGeometryPoolSize;e++)r._packedGeometries[e]=new this.geometryClass;this.initFlushBuffers()}}bt.add(Nt);function Yt(t,r,e,s,o){const i=r.x-t.x,a=e.x-s.x,n=e.x-t.x,h=r.y-t.y,p=e.y-s.y,c=e.y-t.y,d=i*p-h*a;if(Math.abs(d)<1e-7)return o.x=i,o.y=h,0;const u=n*p-c*a,l=i*c-h*n,m=u/d,f=l/d;return f<1e-6||f-1>-1e-6?-1:(o.x=t.x+m*(r.x-t.x),o.y=t.y+m*(r.y-t.y),1)}function Ge(t,r,e){e=e||new j;const s=1-r.x,o=1-s,i=1-r.y,a=1-i;return e.x=(t[0].x*s+t[1].x*o)*i+(t[3].x*s+t[2].x*o)*a,e.y=(t[0].y*s+t[1].y*o)*i+(t[3].y*s+t[2].y*o)*a,e}const Me=[1,0,0,0,1,0,0,0,1],lt=class{constructor(t){this.floatArray=null,this.mat3=new Float64Array(t||Me)}get a(){return this.mat3[0]/this.mat3[8]}set a(t){this.mat3[0]=t*this.mat3[8]}get b(){return this.mat3[1]/this.mat3[8]}set b(t){this.mat3[1]=t*this.mat3[8]}get c(){return this.mat3[3]/this.mat3[8]}set c(t){this.mat3[3]=t*this.mat3[8]}get d(){return this.mat3[4]/this.mat3[8]}set d(t){this.mat3[4]=t*this.mat3[8]}get tx(){return this.mat3[6]/this.mat3[8]}set tx(t){this.mat3[6]=t*this.mat3[8]}get ty(){return this.mat3[7]/this.mat3[8]}set ty(t){this.mat3[7]=t*this.mat3[8]}set(t,r,e,s,o,i){const a=this.mat3;return a[0]=t,a[1]=r,a[2]=0,a[3]=e,a[4]=s,a[5]=0,a[6]=o,a[7]=i,a[8]=1,this}toArray(t,r){this.floatArray||(this.floatArray=new Float32Array(9));const e=r||this.floatArray,s=this.mat3;return t?(e[0]=s[0],e[1]=s[1],e[2]=s[2],e[3]=s[3],e[4]=s[4],e[5]=s[5],e[6]=s[6],e[7]=s[7],e[8]=s[8]):(e[0]=s[0],e[1]=s[3],e[2]=s[6],e[3]=s[1],e[4]=s[4],e[5]=s[7],e[6]=s[2],e[7]=s[5],e[8]=s[8]),e}apply(t,r){r=r||new j;const e=this.mat3,s=t.x,o=t.y,i=1/(e[2]*s+e[5]*o+e[8]);return r.x=i*(e[0]*s+e[3]*o+e[6]),r.y=i*(e[1]*s+e[4]*o+e[7]),r}translate(t,r){const e=this.mat3;return e[0]+=t*e[2],e[1]+=r*e[2],e[3]+=t*e[5],e[4]+=r*e[5],e[6]+=t*e[8],e[7]+=r*e[8],this}scale(t,r){const e=this.mat3;return e[0]*=t,e[1]*=r,e[3]*=t,e[4]*=r,e[6]*=t,e[7]*=r,this}scaleAndTranslate(t,r,e,s){const o=this.mat3;o[0]=t*o[0]+e*o[2],o[1]=r*o[1]+s*o[2],o[3]=t*o[3]+e*o[5],o[4]=r*o[4]+s*o[5],o[6]=t*o[6]+e*o[8],o[7]=r*o[7]+s*o[8]}applyInverse(t,r){r=r||new j;const e=this.mat3,s=t.x,o=t.y,i=e[0],a=e[3],n=e[6],h=e[1],p=e[4],c=e[7],d=e[2],u=e[5],l=e[8],m=(l*p-c*u)*s+(-l*a+n*u)*o+(c*a-n*p),f=(-l*h+c*d)*s+(l*i-n*d)*o+(-c*i+n*h),y=(u*h-p*d)*s+(-u*i+a*d)*o+(p*i-a*h);return r.x=m/y,r.y=f/y,r}invert(){const t=this.mat3,r=t[0],e=t[1],s=t[2],o=t[3],i=t[4],a=t[5],n=t[6],h=t[7],p=t[8],c=p*i-a*h,d=-p*o+a*n,u=h*o-i*n;let l=r*c+e*d+s*u;return l?(l=1/l,t[0]=c*l,t[1]=(-p*e+s*h)*l,t[2]=(a*e-s*i)*l,t[3]=d*l,t[4]=(p*r-s*n)*l,t[5]=(-a*r+s*o)*l,t[6]=u*l,t[7]=(-h*r+e*n)*l,t[8]=(i*r-e*o)*l,this):this}identity(){const t=this.mat3;return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=1,t[5]=0,t[6]=0,t[7]=0,t[8]=1,this}clone(){return new lt(this.mat3)}copyTo2dOr3d(t){const r=this.mat3,e=t.mat3;return e[0]=r[0],e[1]=r[1],e[2]=r[2],e[3]=r[3],e[4]=r[4],e[5]=r[5],e[6]=r[6],e[7]=r[7],e[8]=r[8],t}copyTo(t,r,e){const s=this.mat3,o=1/s[8],i=s[6]*o,a=s[7]*o;if(t.a=(s[0]-s[2]*i)*o,t.b=(s[1]-s[2]*a)*o,t.c=(s[3]-s[5]*i)*o,t.d=(s[4]-s[5]*a)*o,t.tx=i,t.ty=a,r>=2){let n=t.a*t.d-t.b*t.c;e||(n=Math.abs(n)),r===G.POINT?(n>0?n=1:n=-1,t.a=n,t.b=0,t.c=0,t.d=n):r===G.AXIS_X?(n/=Math.sqrt(t.b*t.b+t.d*t.d),t.c=0,t.d=n):r===G.AXIS_Y?(n/=Math.sqrt(t.a*t.a+t.c*t.c),t.a=n,t.c=0):r===G.AXIS_XR&&(t.a=t.d*n,t.c=-t.b*n)}return t}copyFrom(t){const r=this.mat3;return r[0]=t.a,r[1]=t.b,r[2]=0,r[3]=t.c,r[4]=t.d,r[5]=0,r[6]=t.tx,r[7]=t.ty,r[8]=1,this}setToMultLegacy(t,r){const e=this.mat3,s=r.mat3,o=t.a,i=t.b,a=t.c,n=t.d,h=t.tx,p=t.ty,c=s[0],d=s[1],u=s[2],l=s[3],m=s[4],f=s[5],y=s[6],_=s[7],g=s[8];return e[0]=c*o+d*a+u*h,e[1]=c*i+d*n+u*p,e[2]=u,e[3]=l*o+m*a+f*h,e[4]=l*i+m*n+f*p,e[5]=f,e[6]=y*o+_*a+g*h,e[7]=y*i+_*n+g*p,e[8]=g,this}setToMultLegacy2(t,r){const e=this.mat3,s=t.mat3,o=s[0],i=s[1],a=s[2],n=s[3],h=s[4],p=s[5],c=s[6],d=s[7],u=s[8],l=r.a,m=r.b,f=r.c,y=r.d,_=r.tx,g=r.ty;return e[0]=l*o+m*n,e[1]=l*i+m*h,e[2]=l*a+m*p,e[3]=f*o+y*n,e[4]=f*i+y*h,e[5]=f*a+y*p,e[6]=_*o+g*n+c,e[7]=_*i+g*h+d,e[8]=_*a+g*p+u,this}setToMult(t,r){const e=this.mat3,s=t.mat3,o=r.mat3,i=s[0],a=s[1],n=s[2],h=s[3],p=s[4],c=s[5],d=s[6],u=s[7],l=s[8],m=o[0],f=o[1],y=o[2],_=o[3],g=o[4],v=o[5],T=o[6],I=o[7],w=o[8];return e[0]=m*i+f*h+y*d,e[1]=m*a+f*p+y*u,e[2]=m*n+f*c+y*l,e[3]=_*i+g*h+v*d,e[4]=_*a+g*p+v*u,e[5]=_*n+g*c+v*l,e[6]=T*i+I*h+w*d,e[7]=T*a+I*p+w*u,e[8]=T*n+I*c+w*l,this}prepend(t){return t.mat3?this.setToMult(t,this):this.setToMultLegacy(t,this)}};let A=lt;A.IDENTITY=new lt,A.TEMP_MATRIX=new lt;const St=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;
uniform mat3 translationMatrix;
uniform mat3 uTransform;

varying vec3 vTextureCoord;

void main(void)
{
gl_Position.xyw = projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0);

vTextureCoord = uTransform * vec3(aTextureCoord, 1.0);
}
`,qe=`
varying vec3 vTextureCoord;

uniform sampler2D uSampler;
uniform vec4 uColor;
uniform mat3 uMapCoord;
uniform vec4 uClampFrame;
uniform vec2 uClampOffset;

void main(void)
{
vec2 coord = mod(vTextureCoord.xy / vTextureCoord.z - uClampOffset, vec2(1.0, 1.0)) + uClampOffset;
coord = (uMapCoord * vec3(coord, 1.0)).xy;
coord = clamp(coord, uClampFrame.xy, uClampFrame.zw);

vec4 sample = texture2D(uSampler, coord);
gl_FragColor = sample * uColor;
}
`,Xe=`
varying vec3 vTextureCoord;

uniform sampler2D uSampler;
uniform vec4 uColor;

void main(void)
{
vec4 sample = texture2D(uSampler, vTextureCoord.xy / vTextureCoord.z);
gl_FragColor = sample * uColor;
}
`,k=new A;class Ft extends de{constructor(r){super(r),this.quad=new pe;const e={globals:this.renderer.globalUniforms};this.shader=Gt.from(St,qe,e),this.simpleShader=Gt.from(St,Xe,e)}render(r){const e=this.renderer,s=this.quad;let o=s.vertices;o[0]=o[6]=r._width*-r.anchor.x,o[1]=o[3]=r._height*-r.anchor.y,o[2]=o[4]=r._width*(1-r.anchor.x),o[5]=o[7]=r._height*(1-r.anchor.y),r.uvRespectAnchor&&(o=s.uvs,o[0]=o[6]=-r.anchor.x,o[1]=o[3]=-r.anchor.y,o[2]=o[4]=1-r.anchor.x,o[5]=o[7]=1-r.anchor.y),s.invalidate();const i=r._texture,a=i.baseTexture,n=r.tileProj.world,h=r.uvMatrix;let p=a.isPowerOfTwo&&i.frame.width===a.width&&i.frame.height===a.height;p&&(a._glTextures[e.CONTEXT_UID]?p=a.wrapMode!==ct.CLAMP:a.wrapMode===ct.CLAMP&&(a.wrapMode=ct.REPEAT));const c=p?this.simpleShader:this.shader;k.identity(),k.scale(i.width,i.height),k.prepend(n),k.scale(1/r._width,1/r._height),k.invert(),p?k.prepend(h.mapCoord):(c.uniforms.uMapCoord=h.mapCoord.toArray(!0),c.uniforms.uClampFrame=h.uClampFrame,c.uniforms.uClampOffset=h.uClampOffset),c.uniforms.uTransform=k.toArray(!0),c.uniforms.uColor=ye(r.tint,r.worldAlpha,c.uniforms.uColor,a.premultiplyAlpha),c.uniforms.translationMatrix=r.worldTransform.toArray(!0),c.uniforms.uSampler=i,e.shader.bind(c,!1),e.geometry.bind(s,void 0),e.state.setBlendMode(xe(r.blendMode,a.premultiplyAlpha)),e.geometry.draw(Zt.TRIANGLES,6,0)}}Ft.extension={name:"tilingSprite2d",type:wt.RendererPlugin};const N=new j,R=[new j,new j,new j,new j],tt=new Xt,te=new A;class M extends Ut{constructor(r,e){super(r,e),this.matrix=new A,this.pivot=new kt(this.onChange,this,0,0),this.reverseLocalOrder=!1,this.local=new A,this.world=new A}onChange(){const r=this.pivot,e=this.matrix.mat3;e[6]=-(r._x*e[0]+r._y*e[3]),e[7]=-(r._x*e[1]+r._y*e[4]),this._projID++}setAxisX(r,e=1){const s=r.x,o=r.y,i=Math.sqrt(s*s+o*o),a=this.matrix.mat3;a[0]=s/i,a[1]=o/i,a[2]=e/i,this.onChange()}setAxisY(r,e=1){const s=r.x,o=r.y,i=Math.sqrt(s*s+o*o),a=this.matrix.mat3;a[3]=s/i,a[4]=o/i,a[5]=e/i,this.onChange()}mapSprite(r,e){const s=r.texture;tt.x=-r.anchor.x*s.orig.width,tt.y=-r.anchor.y*s.orig.height,tt.width=s.orig.width,tt.height=s.orig.height,this.mapQuad(tt,e)}mapQuad(r,e){R[0].set(r.x,r.y),R[1].set(r.x+r.width,r.y),R[2].set(r.x+r.width,r.y+r.height),R[3].set(r.x,r.y+r.height);let s=1,o=2,i=3;if(Yt(e[0],e[2],e[1],e[3],N)!==0)s=1,o=3,i=2;else return;const a=Math.sqrt((e[0].x-N.x)*(e[0].x-N.x)+(e[0].y-N.y)*(e[0].y-N.y)),n=Math.sqrt((e[s].x-N.x)*(e[s].x-N.x)+(e[s].y-N.y)*(e[s].y-N.y)),h=Math.sqrt((e[o].x-N.x)*(e[o].x-N.x)+(e[o].y-N.y)*(e[o].y-N.y)),p=Math.sqrt((e[i].x-N.x)*(e[i].x-N.x)+(e[i].y-N.y)*(e[i].y-N.y)),c=(a+p)/p,d=(n+h)/h,u=(n+h)/n;let l=this.matrix.mat3;l[0]=R[0].x*c,l[1]=R[0].y*c,l[2]=c,l[3]=R[s].x*d,l[4]=R[s].y*d,l[5]=d,l[6]=R[o].x*u,l[7]=R[o].y*u,l[8]=u,this.matrix.invert(),l=te.mat3,l[0]=e[0].x,l[1]=e[0].y,l[2]=1,l[3]=e[s].x,l[4]=e[s].y,l[5]=1,l[6]=e[o].x,l[7]=e[o].y,l[8]=1,this.matrix.setToMult(te,this.matrix),this._projID++}updateLocalTransform(r){this._projID!==0?this.reverseLocalOrder?this.local.setToMultLegacy2(this.matrix,r):this.local.setToMultLegacy(r,this.matrix):this.local.copyFrom(r)}clear(){super.clear(),this.matrix.identity(),this.pivot.set(0,0)}}function ee(){return this.proj.affine?this.transform.worldTransform:this.proj.world}class ut extends D{constructor(){super(),this.proj=new M(this.transform)}toLocal(r,e,s,o,i=C.ALL){return e&&(r=e.toGlobal(r,s,o)),o||this._recursivePostUpdateTransform(),i>=C.PROJ?(o||this.displayObjectUpdateTransform(),this.proj.affine?this.transform.worldTransform.applyInverse(r,s):this.proj.world.applyInverse(r,s)):(this.parent?s=this.parent.worldTransform.applyInverse(r,s):(s.x=r.x,s.y=r.y),i===C.NONE?s:this.transform.localTransform.applyInverse(s,s))}get worldTransform(){return this.proj.affine?this.transform.worldTransform:this.proj.world}}const dt=ut.prototype.toLocal;class U extends Bt{constructor(r,e,s,o){super(r,e,s,o),this.vertexData2d=null,this.proj=new M(this.transform)}calculateVertices(){if(this.proj._affine){this.vertexData2d=null,super.calculateVertices();return}const r=this.geometry,e=r.buffers[0].data,s=this;if(r.vertexDirtyId===s.vertexDirty&&s._transformID===s.transform._worldID)return;s._transformID=s.transform._worldID,s.vertexData.length!==e.length&&(s.vertexData=new Float32Array(e.length)),(!this.vertexData2d||this.vertexData2d.length!==e.length*3/2)&&(this.vertexData2d=new Float32Array(e.length*3));const o=this.proj.world.mat3,i=this.vertexData2d,a=s.vertexData;for(let n=0;n<a.length/2;n++){const h=e[n*2],p=e[n*2+1],c=o[0]*h+o[3]*p+o[6],d=o[1]*h+o[4]*p+o[7],u=o[2]*h+o[5]*p+o[8];i[n*3]=c,i[n*3+1]=d,i[n*3+2]=u,a[n*2]=c/u,a[n*2+1]=d/u}s.vertexDirty=r.vertexDirtyId}_renderDefault(r){var e;const s=this.shader;s.alpha=this.worldAlpha,s.update&&s.update(),r.batch.flush(),(e=s.program.uniformData)!=null&&e.translationMatrix&&(s.uniforms.translationMatrix=this.worldTransform.toArray(!0)),r.shader.bind(s,!1),r.state.set(this.state),r.geometry.bind(this.geometry,s),r.geometry.draw(this.drawMode,this.size,this.start,this.geometry.instanceCount)}toLocal(r,e,s,o,i=C.ALL){return dt.call(this,r,e,s,o,i)}get worldTransform(){return this.proj.affine?this.transform.worldTransform:this.proj.world}}U.defaultVertexShader=`precision highp float;
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;
uniform mat3 translationMatrix;
uniform mat3 uTextureMatrix;

varying vec2 vTextureCoord;

void main(void)
{
gl_Position.xyw = projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0);
gl_Position.z = 0.0;

vTextureCoord = (uTextureMatrix * vec3(aTextureCoord, 1.0)).xy;
}
`,U.defaultFragmentShader=`
varying vec2 vTextureCoord;
uniform vec4 uColor;

uniform sampler2D uSampler;

void main(void)
{
gl_FragColor = texture2D(uSampler, vTextureCoord) * uColor;
}`;class re extends U{constructor(r,e,s,o,i){super(new Ot(e,s,o),new ht(r,{program:at.from(U.defaultVertexShader,U.defaultFragmentShader),pluginName:"batch2d"}),null,i),this.autoUpdate=!0,this.geometry.getBuffer("aVertexPosition").static=!1}get vertices(){return this.geometry.getBuffer("aVertexPosition").data}set vertices(r){this.geometry.getBuffer("aVertexPosition").data=r}_render(r){this.autoUpdate&&this.geometry.getBuffer("aVertexPosition").update(),super._render(r)}}class L extends ${constructor(r){super(r),this.vertexData2d=null,this.proj=new M(this.transform),this.pluginName="batch2d"}_calculateBounds(){this.calculateTrimmedVertices(),this._bounds.addQuad(this.vertexTrimmedData)}calculateVertices(){const r=this._texture,e=this;if(this.proj._affine){this.vertexData2d=null,super.calculateVertices();return}this.vertexData2d||(this.vertexData2d=new Float32Array(12));const s=this.transform._worldID,o=r._updateID;if(e._transformID===s&&this._textureID===o)return;this._textureID!==o&&(this.uvs=r._uvs.uvsFloat32),e._transformID=s,this._textureID=o;const i=this.proj.world.mat3,a=this.vertexData2d,n=this.vertexData,h=r.trim,p=r.orig,c=this._anchor;let d,u,l,m;h?(u=h.x-c._x*p.width,d=u+h.width,m=h.y-c._y*p.height,l=m+h.height):(u=-c._x*p.width,d=u+p.width,m=-c._y*p.height,l=m+p.height),a[0]=i[0]*u+i[3]*m+i[6],a[1]=i[1]*u+i[4]*m+i[7],a[2]=i[2]*u+i[5]*m+i[8],a[3]=i[0]*d+i[3]*m+i[6],a[4]=i[1]*d+i[4]*m+i[7],a[5]=i[2]*d+i[5]*m+i[8],a[6]=i[0]*d+i[3]*l+i[6],a[7]=i[1]*d+i[4]*l+i[7],a[8]=i[2]*d+i[5]*l+i[8],a[9]=i[0]*u+i[3]*l+i[6],a[10]=i[1]*u+i[4]*l+i[7],a[11]=i[2]*u+i[5]*l+i[8],n[0]=a[0]/a[2],n[1]=a[1]/a[2],n[2]=a[3]/a[5],n[3]=a[4]/a[5],n[4]=a[6]/a[8],n[5]=a[7]/a[8],n[6]=a[9]/a[11],n[7]=a[10]/a[11]}calculateTrimmedVertices(){if(this.proj._affine){super.calculateTrimmedVertices();return}const r=this.transform._worldID,e=this._texture._updateID,s=this;if(!s.vertexTrimmedData)s.vertexTrimmedData=new Float32Array(8);else if(s._transformTrimmedID===r&&this._textureTrimmedID===e)return;s._transformTrimmedID=r,this._textureTrimmedID=e;const o=this._texture,i=s.vertexTrimmedData,a=o.orig,n=this.tileProj?this._width:a.width,h=this.tileProj?this._height:a.height,p=this._anchor,c=this.proj.world.mat3,d=-p._x*n,u=d+n,l=-p._y*h,m=l+h;let f=1/(c[2]*d+c[5]*l+c[8]);i[0]=f*(c[0]*d+c[3]*l+c[6]),i[1]=f*(c[1]*d+c[4]*l+c[7]),f=1/(c[2]*u+c[5]*l+c[8]),i[2]=f*(c[0]*u+c[3]*l+c[6]),i[3]=f*(c[1]*u+c[4]*l+c[7]),f=1/(c[2]*u+c[5]*m+c[8]),i[4]=f*(c[0]*u+c[3]*m+c[6]),i[5]=f*(c[1]*u+c[4]*m+c[7]),f=1/(c[2]*d+c[5]*m+c[8]),i[6]=f*(c[0]*d+c[3]*m+c[6]),i[7]=f*(c[1]*d+c[4]*m+c[7])}toLocal(r,e,s,o,i=C.ALL){return dt.call(this,r,e,s,o,i)}get worldTransform(){return this.proj.affine?this.transform.worldTransform:this.proj.world}}const ke=new nt;class se extends Ht{constructor(r,e,s){super(r,e,s),this.tileProj=new M(this.tileTransform),this.tileProj.reverseLocalOrder=!0,this.proj=new M(this.transform),this.pluginName="tilingSprite2d",this.uvRespectAnchor=!0}get worldTransform(){return this.proj.affine?this.transform.worldTransform:this.proj.world}toLocal(r,e,s,o,i=C.ALL){return dt.call(this,r,e,s,o,i)}_render(r){const e=this._texture;!e||!e.valid||(this.tileTransform.updateTransform(ke),this.uvMatrix.update(),r.batch.setObjectRenderer(r.plugins[this.pluginName]),r.plugins[this.pluginName].render(this))}}function pt(){this.proj||(this.proj=new M(this.transform),this.toLocal=ut.prototype.toLocal,Object.defineProperty(this,"worldTransform",{get:ee,enumerable:!0,configurable:!0}))}D.prototype.convertTo2d=pt,$.prototype.convertTo2d=function(){this.proj||(this.calculateVertices=L.prototype.calculateVertices,this.calculateTrimmedVertices=L.prototype.calculateTrimmedVertices,this._calculateBounds=L.prototype._calculateBounds,this.pluginName="batch2d",pt.call(this))},D.prototype.convertSubtreeTo2d=function(){this.convertTo2d();for(let t=0;t<this.children.length;t++)this.children[t].convertSubtreeTo2d()},$t.prototype.convertTo2d=Qt.prototype.convertTo2d=function(){this.proj||(this.calculateVertices=U.prototype.calculateVertices,this._renderDefault=U.prototype._renderDefault,this.material.pluginName!=="batch2d"&&(this.material=new ht(this.material.texture,{program:at.from(U.defaultVertexShader,U.defaultFragmentShader),pluginName:"batch2d"})),pt.call(this))},Ht.prototype.convertTo2d=function(){this.proj||(this.tileProj=new M(this.tileTransform),this.tileProj.reverseLocalOrder=!0,this.uvRespectAnchor=!0,this.calculateTrimmedVertices=L.prototype.calculateTrimmedVertices,this._calculateBounds=L.prototype._calculateBounds,this._render=se.prototype._render,this.pluginName="tilingSprite2d",pt.call(this))};class mt extends jt{constructor(r,e,s){super(r,e,s),this.vertexData2d=null,this.proj=new M(this.transform),this.pluginName="batch2d"}get worldTransform(){return this.proj.affine?this.transform.worldTransform:this.proj.world}}mt.prototype.calculateVertices=L.prototype.calculateVertices,mt.prototype.calculateTrimmedVertices=L.prototype.calculateTrimmedVertices,mt.prototype._calculateBounds=L.prototype._calculateBounds;const He=`
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;
uniform mat3 otherMatrix;

varying vec3 vMaskCoord;
varying vec2 vTextureCoord;

void main(void)
{
gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

vTextureCoord = aTextureCoord;
vMaskCoord = otherMatrix * vec3( aTextureCoord, 1.0);
}
`,Be=`
varying vec3 vMaskCoord;
varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D mask;
uniform float alpha;
uniform vec4 maskClamp;

void main(void)
{
vec2 uv = vMaskCoord.xy / vMaskCoord.z;

float clip = step(3.5,
    step(maskClamp.x, uv.x) +
    step(maskClamp.y, uv.y) +
    step(uv.x, maskClamp.z) +
    step(uv.y, maskClamp.w));

vec4 original = texture2D(uSampler, vTextureCoord);
vec4 masky = texture2D(mask, uv);

original *= (masky.r * masky.a * alpha * clip);

gl_FragColor = original;
}
`,ie=new A;class Tt extends me{constructor(r){super(He,Be),this.maskMatrix=new A,r.renderable=!1,this.maskSprite=r}apply(r,e,s,o){const i=this.maskSprite,a=this.maskSprite.texture;a.valid&&(a.uvMatrix||(a.uvMatrix=new Mt(a,0)),a.uvMatrix.update(),this.uniforms.npmAlpha=a.baseTexture.alphaMode?0:1,this.uniforms.mask=i.texture,this.uniforms.otherMatrix=Tt.calculateSpriteMatrix(e,this.maskMatrix,i).prepend(a.uvMatrix.mapCoord),this.uniforms.alpha=i.worldAlpha,this.uniforms.maskClamp=a.uvMatrix.uClampFrame,r.applyFilter(this,e,s,o))}static calculateSpriteMatrix(r,e,s){const o=s.proj,i=r.filterFrame,a=o&&!o._affine?o.world.copyTo2dOr3d(ie):ie.copyFrom(s.transform.worldTransform),n=s.texture.orig;return e.set(r.width,0,0,r.height,i.x,i.y),a.invert(),e.setToMult(a,e),e.scaleAndTranslate(1/n.width,1/n.height,s.anchor.x,s.anchor.y),e}}const Oe=qt.prototype.pushSpriteMask;function $e(t){const{maskObject:r}=t,e=t._filters;if(!e){let s=this.alphaMaskPool[this.alphaMaskIndex];s||(s=this.alphaMaskPool[this.alphaMaskIndex]=[new Tt(r)]),t._filters=s}Oe.call(this,t),e||(t._filters=null)}function Qe(){qt.prototype.pushSpriteMask=$e}bt.add(Ft);class Pt extends j{constructor(r,e,s){super(r,e),this.z=s}set(r,e,s){return this.x=r||0,this.y=e===void 0?this.x:e||0,this.z=e===void 0?this.x:s||0,this}copyFrom(r){return this.set(r.x,r.y,r.z||0),this}copyTo(r){return r.set(this.x,this.y,this.z),r}}class ft extends kt{constructor(){super(...arguments),this._z=0}get z(){return this._z}set z(r){this._z!==r&&(this._z=r,this.cb.call(this.scope))}set(r,e,s){const o=r||0,i=e===void 0?o:e||0,a=e===void 0?o:s||0;return(this._x!==o||this._y!==i||this._z!==a)&&(this._x=o,this._y=i,this._z=a,this.cb.call(this.scope)),this}copyFrom(r){return this.set(r.x,r.y,r.z||0),this}copyTo(r){return r.set(this._x,this._y,this._z),r}}class It{constructor(r,e,s){this._quatUpdateId=-1,this._quatDirtyId=0,this._sign=1,this._x=r||0,this._y=e||0,this._z=s||0,this.quaternion=new Float64Array(4),this.quaternion[3]=1,this.update()}get x(){return this._x}set x(r){this._x!==r&&(this._x=r,this._quatDirtyId++)}get y(){return this._y}set y(r){this._y!==r&&(this._y=r,this._quatDirtyId++)}get z(){return this._z}set z(r){this._z!==r&&(this._z=r,this._quatDirtyId++)}get pitch(){return this._x}set pitch(r){this._x!==r&&(this._x=r,this._quatDirtyId++)}get yaw(){return this._y}set yaw(r){this._y!==r&&(this._y=r,this._quatDirtyId++)}get roll(){return this._z}set roll(r){this._z!==r&&(this._z=r,this._quatDirtyId++)}set(r,e,s){const o=r||0,i=e||0,a=s||0;(this._x!==o||this._y!==i||this._z!==a)&&(this._x=o,this._y=i,this._z=a,this._quatDirtyId++)}copyFrom(r){const e=r.x,s=r.y,o=r.z;return(this._x!==e||this._y!==s||this._z!==o)&&(this._x=e,this._y=s,this._z=o,this._quatDirtyId++),this}copyTo(r){return r.set(this._x,this._y,this._z),r}equals(r){return this._x===r.x&&this._y===r.y&&this._z===r.z}clone(){return new It(this._x,this._y,this._z)}update(){if(this._quatUpdateId===this._quatDirtyId)return!1;this._quatUpdateId=this._quatDirtyId;const r=Math.cos(this._x/2),e=Math.cos(this._y/2),s=Math.cos(this._z/2),o=this._sign,i=o*Math.sin(this._x/2),a=o*Math.sin(this._y/2),n=o*Math.sin(this._z/2),h=this.quaternion;return h[0]=i*e*s+r*a*n,h[1]=r*a*s-i*e*n,h[2]=r*e*n+i*a*s,h[3]=r*e*s-i*a*n,!0}}class oe{constructor(r,e,s,o,i){this.cb=r,this.scope=e,this._quatUpdateId=-1,this._quatDirtyId=0,this._sign=1,this._x=s||0,this._y=o||0,this._z=i||0,this.quaternion=new Float64Array(4),this.quaternion[3]=1,this.update()}get x(){return this._x}set x(r){this._x!==r&&(this._x=r,this._quatDirtyId++,this.cb.call(this.scope))}get y(){return this._y}set y(r){this._y!==r&&(this._y=r,this._quatDirtyId++,this.cb.call(this.scope))}get z(){return this._z}set z(r){this._z!==r&&(this._z=r,this._quatDirtyId++,this.cb.call(this.scope))}get pitch(){return this._x}set pitch(r){this._x!==r&&(this._x=r,this._quatDirtyId++,this.cb.call(this.scope))}get yaw(){return this._y}set yaw(r){this._y!==r&&(this._y=r,this._quatDirtyId++,this.cb.call(this.scope))}get roll(){return this._z}set roll(r){this._z!==r&&(this._z=r,this._quatDirtyId++,this.cb.call(this.scope))}set(r,e,s){const o=r||0,i=e||0,a=s||0;return(this._x!==o||this._y!==i||this._z!==a)&&(this._x=o,this._y=i,this._z=a,this._quatDirtyId++,this.cb.call(this.scope)),this}copyFrom(r){const e=r.x,s=r.y,o=r.z;return(this._x!==e||this._y!==s||this._z!==o)&&(this._x=e,this._y=s,this._z=o,this._quatDirtyId++,this.cb.call(this.scope)),this}copyTo(r){return r.set(this._x,this._y,this._z),r}equals(r){return this._x===r.x&&this._y===r.y&&this._z===r.z}clone(){return new It(this._x,this._y,this._z)}update(){if(this._quatUpdateId===this._quatDirtyId)return!1;this._quatUpdateId=this._quatDirtyId;const r=Math.cos(this._x/2),e=Math.cos(this._y/2),s=Math.cos(this._z/2),o=this._sign,i=o*Math.sin(this._x/2),a=o*Math.sin(this._y/2),n=o*Math.sin(this._z/2),h=this.quaternion;return h[0]=i*e*s+r*a*n,h[1]=r*a*s-i*e*n,h[2]=r*e*n+i*a*s,h[3]=r*e*s-i*a*n,!0}}const Je=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],X=class{constructor(t){this.floatArray=null,this._dirtyId=0,this._updateId=-1,this._mat4inv=null,this.cacheInverse=!1,this.mat4=new Float64Array(t||Je)}get a(){return this.mat4[0]/this.mat4[15]}set a(t){this.mat4[0]=t*this.mat4[15]}get b(){return this.mat4[1]/this.mat4[15]}set b(t){this.mat4[1]=t*this.mat4[15]}get c(){return this.mat4[4]/this.mat4[15]}set c(t){this.mat4[4]=t*this.mat4[15]}get d(){return this.mat4[5]/this.mat4[15]}set d(t){this.mat4[5]=t*this.mat4[15]}get tx(){return this.mat4[12]/this.mat4[15]}set tx(t){this.mat4[12]=t*this.mat4[15]}get ty(){return this.mat4[13]/this.mat4[15]}set ty(t){this.mat4[13]=t*this.mat4[15]}set(t,r,e,s,o,i){const a=this.mat4;return a[0]=t,a[1]=r,a[2]=0,a[3]=0,a[4]=e,a[5]=s,a[6]=0,a[7]=0,a[8]=0,a[9]=0,a[10]=1,a[11]=0,a[12]=o,a[13]=i,a[14]=0,a[15]=1,this}toArray(t,r){this.floatArray||(this.floatArray=new Float32Array(9));const e=r||this.floatArray,s=this.mat4;return t?(e[0]=s[0],e[1]=s[1],e[2]=s[3],e[3]=s[4],e[4]=s[5],e[5]=s[7],e[6]=s[12],e[7]=s[13],e[8]=s[15]):(e[0]=s[0],e[1]=s[4],e[2]=s[12],e[3]=s[2],e[4]=s[6],e[5]=s[13],e[6]=s[3],e[7]=s[7],e[8]=s[15]),e}setToTranslation(t,r,e){const s=this.mat4;s[0]=1,s[1]=0,s[2]=0,s[3]=0,s[4]=0,s[5]=1,s[6]=0,s[7]=0,s[8]=0,s[9]=0,s[10]=1,s[11]=0,s[12]=t,s[13]=r,s[14]=e,s[15]=1}setToRotationTranslationScale(t,r,e,s,o,i,a){const n=this.mat4,h=t[0],p=t[1],c=t[2],d=t[3],u=h+h,l=p+p,m=c+c,f=h*u,y=h*l,_=h*m,g=p*l,v=p*m,T=c*m,I=d*u,w=d*l,V=d*m;return n[0]=(1-(g+T))*o,n[1]=(y+V)*o,n[2]=(_-w)*o,n[3]=0,n[4]=(y-V)*i,n[5]=(1-(f+T))*i,n[6]=(v+I)*i,n[7]=0,n[8]=(_+w)*a,n[9]=(v-I)*a,n[10]=(1-(f+g))*a,n[11]=0,n[12]=r,n[13]=e,n[14]=s,n[15]=1,n}apply(t,r){r=r||new Pt;const e=this.mat4,s=t.x,o=t.y,i=t.z||0,a=1/(e[3]*s+e[7]*o+e[11]*i+e[15]);return r.x=a*(e[0]*s+e[4]*o+e[8]*i+e[12]),r.y=a*(e[1]*s+e[5]*o+e[9]*i+e[13]),r.z=a*(e[2]*s+e[6]*o+e[10]*i+e[14]),r}translate(t,r,e){const s=this.mat4;return s[12]=s[0]*t+s[4]*r+s[8]*e+s[12],s[13]=s[1]*t+s[5]*r+s[9]*e+s[13],s[14]=s[2]*t+s[6]*r+s[10]*e+s[14],s[15]=s[3]*t+s[7]*r+s[11]*e+s[15],this}scale(t,r,e){const s=this.mat4;return s[0]*=t,s[1]*=t,s[2]*=t,s[3]*=t,s[4]*=r,s[5]*=r,s[6]*=r,s[7]*=r,e!==void 0&&(s[8]*=e,s[9]*=e,s[10]*=e,s[11]*=e),this}scaleAndTranslate(t,r,e,s,o,i){const a=this.mat4;a[0]=t*a[0]+s*a[3],a[1]=r*a[1]+o*a[3],a[2]=e*a[2]+i*a[3],a[4]=t*a[4]+s*a[7],a[5]=r*a[5]+o*a[7],a[6]=e*a[6]+i*a[7],a[8]=t*a[8]+s*a[11],a[9]=r*a[9]+o*a[11],a[10]=e*a[10]+i*a[11],a[12]=t*a[12]+s*a[15],a[13]=r*a[13]+o*a[15],a[14]=e*a[14]+i*a[15]}applyInverse(t,r){r=r||new Pt,this._mat4inv||(this._mat4inv=new Float64Array(16));const e=this._mat4inv,s=this.mat4,o=t.x,i=t.y;let a=t.z||0;(!this.cacheInverse||this._updateId!==this._dirtyId)&&(this._updateId=this._dirtyId,X.glMatrixMat4Invert(e,s));const n=1/(e[3]*o+e[7]*i+e[11]*a+e[15]),h=n*(e[0]*o+e[4]*i+e[8]*a+e[12]),p=n*(e[1]*o+e[5]*i+e[9]*a+e[13]),c=n*(e[2]*o+e[6]*i+e[10]*a+e[14]);a+=1;const d=1/(e[3]*o+e[7]*i+e[11]*a+e[15]),u=d*(e[0]*o+e[4]*i+e[8]*a+e[12]),l=d*(e[1]*o+e[5]*i+e[9]*a+e[13]),m=d*(e[2]*o+e[6]*i+e[10]*a+e[14]);Math.abs(c-m)<1e-10&&r.set(NaN,NaN,0);const f=(0-c)/(m-c);return r.set((u-h)*f+h,(l-p)*f+p,0),r}invert(){return X.glMatrixMat4Invert(this.mat4,this.mat4),this}invertCopyTo(t){this._mat4inv||(this._mat4inv=new Float64Array(16));const r=this._mat4inv,e=this.mat4;(!this.cacheInverse||this._updateId!==this._dirtyId)&&(this._updateId=this._dirtyId,X.glMatrixMat4Invert(r,e)),t.mat4.set(r)}identity(){const t=this.mat4;return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=1,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=1,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}clone(){return new X(this.mat4)}copyTo3d(t){const r=this.mat4,e=t.mat4;return e[0]=r[0],e[1]=r[1],e[2]=r[2],e[3]=r[3],e[4]=r[4],e[5]=r[5],e[6]=r[6],e[7]=r[7],e[8]=r[8],t}copyTo2d(t){const r=this.mat4,e=t.mat3;return e[0]=r[0],e[1]=r[1],e[2]=r[3],e[3]=r[4],e[4]=r[5],e[5]=r[7],e[6]=r[12],e[7]=r[13],e[8]=r[15],t}copyTo2dOr3d(t){return t instanceof A?this.copyTo2d(t):this.copyTo3d(t)}copyTo(t,r,e){const s=this.mat4,o=1/s[15],i=s[12]*o,a=s[13]*o;if(t.a=(s[0]-s[3]*i)*o,t.b=(s[1]-s[3]*a)*o,t.c=(s[4]-s[7]*i)*o,t.d=(s[5]-s[7]*a)*o,t.tx=i,t.ty=a,r>=2){let n=t.a*t.d-t.b*t.c;e||(n=Math.abs(n)),r===G.POINT?(n>0?n=1:n=-1,t.a=n,t.b=0,t.c=0,t.d=n):r===G.AXIS_X?(n/=Math.sqrt(t.b*t.b+t.d*t.d),t.c=0,t.d=n):r===G.AXIS_Y&&(n/=Math.sqrt(t.a*t.a+t.c*t.c),t.a=n,t.c=0)}return t}copyFrom(t){const r=this.mat4;return r[0]=t.a,r[1]=t.b,r[2]=0,r[3]=0,r[4]=t.c,r[5]=t.d,r[6]=0,r[7]=0,r[8]=0,r[9]=0,r[10]=1,r[11]=0,r[12]=t.tx,r[13]=t.ty,r[14]=0,r[15]=1,this._dirtyId++,this}setToMultLegacy(t,r){const e=this.mat4,s=r.mat4,o=t.a,i=t.b,a=t.c,n=t.d,h=t.tx,p=t.ty;let c=s[0],d=s[1],u=s[2],l=s[3];return e[0]=c*o+d*a+l*h,e[1]=c*i+d*n+l*p,e[2]=u,e[3]=l,c=s[4],d=s[5],u=s[6],l=s[7],e[4]=c*o+d*a+l*h,e[5]=c*i+d*n+l*p,e[6]=u,e[7]=l,c=s[8],d=s[9],u=s[10],l=s[11],e[8]=c*o+d*a+l*h,e[9]=c*i+d*n+l*p,e[10]=u,e[11]=l,c=s[12],d=s[13],u=s[14],l=s[15],e[12]=c*o+d*a+l*h,e[13]=c*i+d*n+l*p,e[14]=u,e[15]=l,this._dirtyId++,this}setToMultLegacy2(t,r){const e=this.mat4,s=t.mat4,o=s[0],i=s[1],a=s[2],n=s[3],h=s[4],p=s[5],c=s[6],d=s[7],u=r.a,l=r.b,m=r.c,f=r.d,y=r.tx,_=r.ty;return e[0]=u*o+l*h,e[1]=u*i+l*p,e[2]=u*a+l*c,e[3]=u*n+l*d,e[4]=m*o+f*h,e[5]=m*i+f*p,e[6]=m*a+f*c,e[7]=m*n+f*d,e[8]=s[8],e[9]=s[9],e[10]=s[10],e[11]=s[11],e[12]=y*o+_*h+s[12],e[13]=y*i+_*p+s[13],e[14]=y*a+_*c+s[14],e[15]=y*n+_*d+s[15],this._dirtyId++,this}setToMult(t,r){return X.glMatrixMat4Multiply(this.mat4,t.mat4,r.mat4),this._dirtyId++,this}prepend(t){t.mat4?this.setToMult(t,this):this.setToMultLegacy(t,this)}static glMatrixMat4Invert(t,r){const e=r[0],s=r[1],o=r[2],i=r[3],a=r[4],n=r[5],h=r[6],p=r[7],c=r[8],d=r[9],u=r[10],l=r[11],m=r[12],f=r[13],y=r[14],_=r[15],g=e*n-s*a,v=e*h-o*a,T=e*p-i*a,I=s*h-o*n,w=s*p-i*n,V=o*p-i*h,F=c*f-d*m,Z=c*y-u*m,W=c*_-l*m,E=d*y-u*f,K=d*_-l*f,Y=u*_-l*y;let b=g*Y-v*K+T*E+I*W-w*Z+V*F;return b?(b=1/b,t[0]=(n*Y-h*K+p*E)*b,t[1]=(o*K-s*Y-i*E)*b,t[2]=(f*V-y*w+_*I)*b,t[3]=(u*w-d*V-l*I)*b,t[4]=(h*W-a*Y-p*Z)*b,t[5]=(e*Y-o*W+i*Z)*b,t[6]=(y*T-m*V-_*v)*b,t[7]=(c*V-u*T+l*v)*b,t[8]=(a*K-n*W+p*F)*b,t[9]=(s*W-e*K-i*F)*b,t[10]=(m*w-f*T+_*g)*b,t[11]=(d*T-c*w-l*g)*b,t[12]=(n*Z-a*E-h*F)*b,t[13]=(e*E-s*Z+o*F)*b,t[14]=(f*v-m*I-y*g)*b,t[15]=(c*I-d*v+u*g)*b,t):null}static glMatrixMat4Multiply(t,r,e){const s=r[0],o=r[1],i=r[2],a=r[3],n=r[4],h=r[5],p=r[6],c=r[7],d=r[8],u=r[9],l=r[10],m=r[11],f=r[12],y=r[13],_=r[14],g=r[15];let v=e[0],T=e[1],I=e[2],w=e[3];return t[0]=v*s+T*n+I*d+w*f,t[1]=v*o+T*h+I*u+w*y,t[2]=v*i+T*p+I*l+w*_,t[3]=v*a+T*c+I*m+w*g,v=e[4],T=e[5],I=e[6],w=e[7],t[4]=v*s+T*n+I*d+w*f,t[5]=v*o+T*h+I*u+w*y,t[6]=v*i+T*p+I*l+w*_,t[7]=v*a+T*c+I*m+w*g,v=e[8],T=e[9],I=e[10],w=e[11],t[8]=v*s+T*n+I*d+w*f,t[9]=v*o+T*h+I*u+w*y,t[10]=v*i+T*p+I*l+w*_,t[11]=v*a+T*c+I*m+w*g,v=e[12],T=e[13],I=e[14],w=e[15],t[12]=v*s+T*n+I*d+w*f,t[13]=v*o+T*h+I*u+w*y,t[14]=v*i+T*p+I*l+w*_,t[15]=v*a+T*c+I*m+w*g,t}};let H=X;H.IDENTITY=new X,H.TEMP_MATRIX=new X;const ae=new H;class Q extends Ut{constructor(r,e){super(r,e),this.cameraMatrix=null,this._cameraMode=!1,this.position=new ft(this.onChange,this,0,0),this.scale=new ft(this.onChange,this,1,1),this.euler=new oe(this.onChange,this,0,0,0),this.pivot=new ft(this.onChange,this,0,0),this.local=new H,this.world=new H,this.local.cacheInverse=!0,this.world.cacheInverse=!0,this.position._z=0,this.scale._z=1,this.pivot._z=0}get cameraMode(){return this._cameraMode}set cameraMode(r){this._cameraMode!==r&&(this._cameraMode=r,this.euler._sign=this._cameraMode?-1:1,this.euler._quatDirtyId++,r&&(this.cameraMatrix=new H))}onChange(){this._projID++}clear(){this.cameraMatrix&&this.cameraMatrix.identity(),this.position.set(0,0,0),this.scale.set(1,1,1),this.euler.set(0,0,0),this.pivot.set(0,0,0),super.clear()}updateLocalTransform(r){if(this._projID===0){this.local.copyFrom(r);return}const e=this.local,s=this.euler,o=this.position,i=this.scale,a=this.pivot;if(s.update(),!this.cameraMode){e.setToRotationTranslationScale(s.quaternion,o._x,o._y,o._z,i._x,i._y,i._z),e.translate(-a._x,-a._y,-a._z),e.setToMultLegacy(r,e);return}e.setToMultLegacy(r,this.cameraMatrix),e.translate(a._x,a._y,a._z),e.scale(1/i._x,1/i._y,1/i._z),ae.setToRotationTranslationScale(s.quaternion,0,0,0,1,1,1),e.setToMult(e,ae),e.translate(-o._x,-o._y,-o._z),this.local._dirtyId++}}function ne(){return this.proj.affine?this.transform.worldTransform:this.proj.world}class q extends D{constructor(){super(),this.proj=new Q(this.transform)}isFrontFace(r=!1){r&&(this._recursivePostUpdateTransform(),this.displayObjectUpdateTransform());const e=this.proj.world.mat4,s=e[0]*e[15]-e[3]*e[12],o=e[1]*e[15]-e[3]*e[13],i=e[4]*e[15]-e[7]*e[12],a=e[5]*e[15]-e[7]*e[13];return s*a-i*o>0}getDepth(r=!1){r&&(this._recursivePostUpdateTransform(),this.displayObjectUpdateTransform());const e=this.proj.world.mat4;return e[14]/e[15]}toLocal(r,e,s,o,i=C.ALL){return e&&(r=e.toGlobal(r,s,o)),o||this._recursivePostUpdateTransform(),i===C.ALL?(o||this.displayObjectUpdateTransform(),this.proj.affine?this.transform.worldTransform.applyInverse(r,s):this.proj.world.applyInverse(r,s)):(this.parent?s=this.parent.worldTransform.applyInverse(r,s):(s.x=r.x,s.y=r.y,s.z=r.z),i===C.NONE||(s=this.transform.localTransform.applyInverse(s,s),i===C.PROJ&&this.proj.cameraMode&&(s=this.proj.cameraMatrix.applyInverse(s,s))),s)}get worldTransform(){return this.proj.affine?this.transform.worldTransform:this.proj.world}get position3d(){return this.proj.position}set position3d(r){this.proj.position.copyFrom(r)}get scale3d(){return this.proj.scale}set scale3d(r){this.proj.scale.copyFrom(r)}get euler(){return this.proj.euler}set euler(r){this.proj.euler.copyFrom(r)}get pivot3d(){return this.proj.pivot}set pivot3d(r){this.proj.pivot.copyFrom(r)}}const yt=q.prototype.toLocal,xt=q.prototype.getDepth,_t=q.prototype.isFrontFace;class Ze extends q{constructor(){super(),this._far=0,this._near=0,this._focus=0,this._orthographic=!1,this.proj.cameraMode=!0,this.setPlanes(400,10,1e4,!1)}get far(){return this._far}get near(){return this._near}get focus(){return this._focus}get ortographic(){return this._orthographic}setPlanes(r,e=10,s=1e4,o=!1){this._focus=r,this._near=e,this._far=s,this._orthographic=o;const i=this.proj,a=i.cameraMatrix.mat4;i._projID++,a[10]=1/(s-e),a[14]=(r-e)/(s-e),this._orthographic?a[11]=0:a[11]=1/r}}class et extends Bt{constructor(r,e,s,o){super(r,e,s,o),this.vertexData2d=null,this.proj=new Q(this.transform)}calculateVertices(){if(this.proj._affine){this.vertexData2d=null,super.calculateVertices();return}const r=this.geometry,e=r.buffers[0].data,s=this;if(r.vertexDirtyId===s.vertexDirty&&s._transformID===s.transform._worldID)return;s._transformID=s.transform._worldID,s.vertexData.length!==e.length&&(s.vertexData=new Float32Array(e.length)),(!this.vertexData2d||this.vertexData2d.length!==e.length*3/2)&&(this.vertexData2d=new Float32Array(e.length*3));const o=this.proj.world.mat4,i=this.vertexData2d,a=s.vertexData;for(let n=0;n<a.length/2;n++){const h=e[n*2],p=e[n*2+1],c=o[0]*h+o[4]*p+o[12],d=o[1]*h+o[5]*p+o[13],u=o[3]*h+o[7]*p+o[15];i[n*3]=c,i[n*3+1]=d,i[n*3+2]=u,a[n*2]=c/u,a[n*2+1]=d/u}s.vertexDirty=r.vertexDirtyId}get worldTransform(){return this.proj.affine?this.transform.worldTransform:this.proj.world}toLocal(r,e,s,o,i=C.ALL){return yt.call(this,r,e,s,o,i)}isFrontFace(r){return _t.call(this,r)}getDepth(r){return xt.call(this,r)}get position3d(){return this.proj.position}set position3d(r){this.proj.position.copyFrom(r)}get scale3d(){return this.proj.scale}set scale3d(r){this.proj.scale.copyFrom(r)}get euler(){return this.proj.euler}set euler(r){this.proj.euler.copyFrom(r)}get pivot3d(){return this.proj.pivot}set pivot3d(r){this.proj.pivot.copyFrom(r)}}et.prototype._renderDefault=U.prototype._renderDefault;class he extends et{constructor(r,e,s,o,i){super(new Ot(e,s,o),new ht(r,{program:at.from(U.defaultVertexShader,U.defaultFragmentShader),pluginName:"batch2d"}),null,i),this.autoUpdate=!0,this.geometry.getBuffer("aVertexPosition").static=!1}get vertices(){return this.geometry.getBuffer("aVertexPosition").data}set vertices(r){this.geometry.getBuffer("aVertexPosition").data=r}_render(r){this.autoUpdate&&this.geometry.getBuffer("aVertexPosition").update(),super._render(r)}}class z extends ${constructor(r){super(r),this.vertexData2d=null,this.culledByFrustrum=!1,this.trimmedCulledByFrustrum=!1,this.proj=new Q(this.transform),this.pluginName="batch2d"}calculateVertices(){const r=this._texture;if(this.proj._affine){this.vertexData2d=null,super.calculateVertices();return}this.vertexData2d||(this.vertexData2d=new Float32Array(12));const e=this.transform._worldID,s=r._updateID,o=this;if(o._transformID===e&&this._textureID===s)return;this._textureID!==s&&(this.uvs=r._uvs.uvsFloat32),o._transformID=e,this._textureID=s;const i=this.proj.world.mat4,a=this.vertexData2d,n=this.vertexData,h=r.trim,p=r.orig,c=this._anchor;let d,u,l,m;h?(u=h.x-c._x*p.width,d=u+h.width,m=h.y-c._y*p.height,l=m+h.height):(u=-c._x*p.width,d=u+p.width,m=-c._y*p.height,l=m+p.height);let f=!1,y;a[0]=i[0]*u+i[4]*m+i[12],a[1]=i[1]*u+i[5]*m+i[13],y=i[2]*u+i[6]*m+i[14],a[2]=i[3]*u+i[7]*m+i[15],f=f||y<0,a[3]=i[0]*d+i[4]*m+i[12],a[4]=i[1]*d+i[5]*m+i[13],y=i[2]*d+i[6]*m+i[14],a[5]=i[3]*d+i[7]*m+i[15],f=f||y<0,a[6]=i[0]*d+i[4]*l+i[12],a[7]=i[1]*d+i[5]*l+i[13],y=i[2]*d+i[6]*l+i[14],a[8]=i[3]*d+i[7]*l+i[15],f=f||y<0,a[9]=i[0]*u+i[4]*l+i[12],a[10]=i[1]*u+i[5]*l+i[13],y=i[2]*u+i[6]*l+i[14],a[11]=i[3]*u+i[7]*l+i[15],f=f||y<0,this.culledByFrustrum=f,n[0]=a[0]/a[2],n[1]=a[1]/a[2],n[2]=a[3]/a[5],n[3]=a[4]/a[5],n[4]=a[6]/a[8],n[5]=a[7]/a[8],n[6]=a[9]/a[11],n[7]=a[10]/a[11]}calculateTrimmedVertices(){if(this.proj._affine){super.calculateTrimmedVertices();return}const r=this.transform._worldID,e=this._texture._updateID,s=this;if(!s.vertexTrimmedData)s.vertexTrimmedData=new Float32Array(8);else if(s._transformTrimmedID===r&&this._textureTrimmedID===e)return;s._transformTrimmedID=r,this._textureTrimmedID=e;const o=this._texture,i=s.vertexTrimmedData,a=o.orig,n=this._anchor,h=this.proj.world.mat4,p=-n._x*a.width,c=p+a.width,d=-n._y*a.height,u=d+a.height;let l=!1,m,f=1/(h[3]*p+h[7]*d+h[15]);i[0]=f*(h[0]*p+h[4]*d+h[12]),i[1]=f*(h[1]*p+h[5]*d+h[13]),m=h[2]*p+h[6]*d+h[14],l=l||m<0,f=1/(h[3]*c+h[7]*d+h[15]),i[2]=f*(h[0]*c+h[4]*d+h[12]),i[3]=f*(h[1]*c+h[5]*d+h[13]),m=h[2]*c+h[6]*d+h[14],l=l||m<0,f=1/(h[3]*c+h[7]*u+h[15]),i[4]=f*(h[0]*c+h[4]*u+h[12]),i[5]=f*(h[1]*c+h[5]*u+h[13]),m=h[2]*c+h[6]*u+h[14],l=l||m<0,f=1/(h[3]*p+h[7]*u+h[15]),i[6]=f*(h[0]*p+h[4]*u+h[12]),i[7]=f*(h[1]*p+h[5]*u+h[13]),m=h[2]*p+h[6]*u+h[14],l=l||m<0,this.culledByFrustrum=l}_calculateBounds(){if(this.calculateVertices(),this.culledByFrustrum)return;const r=this._texture.trim,e=this._texture.orig;if(!r||r.width===e.width&&r.height===e.height){this._bounds.addQuad(this.vertexData);return}this.calculateTrimmedVertices(),this.trimmedCulledByFrustrum||this._bounds.addQuad(this.vertexTrimmedData)}_render(r){this.calculateVertices(),!this.culledByFrustrum&&(r.batch.setObjectRenderer(r.plugins[this.pluginName]),r.plugins[this.pluginName].render(this))}containsPoint(r){return this.culledByFrustrum?!1:super.containsPoint(r)}get worldTransform(){return this.proj.affine?this.transform.worldTransform:this.proj.world}toLocal(r,e,s,o,i=C.ALL){return yt.call(this,r,e,s,o,i)}isFrontFace(r){return _t.call(this,r)}getDepth(r){return xt.call(this,r)}get position3d(){return this.proj.position}set position3d(r){this.proj.position.copyFrom(r)}get scale3d(){return this.proj.scale}set scale3d(r){this.proj.scale.copyFrom(r)}get euler(){return this.proj.euler}set euler(r){this.proj.euler.copyFrom(r)}get pivot3d(){return this.proj.pivot}set pivot3d(r){this.proj.pivot.copyFrom(r)}}const We={worldTransform:{get:ne,enumerable:!0,configurable:!0},position3d:{get(){return this.proj.position},set(t){this.proj.position.copy(t)}},scale3d:{get(){return this.proj.scale},set(t){this.proj.scale.copy(t)}},pivot3d:{get(){return this.proj.pivot},set(t){this.proj.pivot.copy(t)}},euler:{get(){return this.proj.euler},set(t){this.proj.euler.copy(t)}}};function At(){this.proj||(this.proj=new Q(this.transform),this.toLocal=q.prototype.toLocal,this.isFrontFace=q.prototype.isFrontFace,this.getDepth=q.prototype.getDepth,Object.defineProperties(this,We))}D.prototype.convertTo3d=At,$.prototype.convertTo3d=function(){this.proj||(this.calculateVertices=z.prototype.calculateVertices,this.calculateTrimmedVertices=z.prototype.calculateTrimmedVertices,this._calculateBounds=z.prototype._calculateBounds,this.containsPoint=z.prototype.containsPoint,this.pluginName="batch2d",At.call(this))},D.prototype.convertSubtreeTo3d=function(){this.convertTo3d();for(let t=0;t<this.children.length;t++)this.children[t].convertSubtreeTo3d()},$t.prototype.convertTo3d=Qt.prototype.convertTo3d=function(){this.proj||(this.calculateVertices=et.prototype.calculateVertices,this._renderDefault=et.prototype._renderDefault,this.material.pluginName!=="batch2d"&&(this.material=new ht(this.material.texture,{program:at.from(U.defaultVertexShader,U.defaultFragmentShader),pluginName:"batch2d"})),At.call(this))};class J extends jt{constructor(r,e,s){super(r,e,s),this.vertexData2d=null,this.proj=new Q(this.transform),this.pluginName="batch2d"}get worldTransform(){return this.proj.affine?this.transform.worldTransform:this.proj.world}toLocal(r,e,s,o,i=C.ALL){return yt.call(this,r,e,s,o,i)}isFrontFace(r){return _t.call(this,r)}getDepth(r){return xt.call(this,r)}get position3d(){return this.proj.position}set position3d(r){this.proj.position.copyFrom(r)}get scale3d(){return this.proj.scale}set scale3d(r){this.proj.scale.copyFrom(r)}get euler(){return this.proj.euler}set euler(r){this.proj.euler.copyFrom(r)}get pivot3d(){return this.proj.pivot}set pivot3d(r){this.proj.pivot.copyFrom(r)}}J.prototype.calculateVertices=z.prototype.calculateVertices,J.prototype.calculateTrimmedVertices=z.prototype.calculateTrimmedVertices,J.prototype._calculateBounds=z.prototype._calculateBounds,J.prototype.containsPoint=z.prototype.containsPoint,J.prototype._render=z.prototype._render;const Ee=`precision highp float;
attribute vec2 aVertexPosition;
attribute vec3 aTrans1;
attribute vec3 aTrans2;
attribute vec2 aSamplerSize;
attribute vec4 aFrame;
attribute vec4 aColor;
attribute float aTextureId;

uniform mat3 projectionMatrix;
uniform mat3 translationMatrix;

varying vec2 vertexPosition;
varying vec3 vTrans1;
varying vec3 vTrans2;
varying vec2 vSamplerSize;
varying vec4 vFrame;
varying vec4 vColor;
varying float vTextureId;

void main(void){
gl_Position.xyw = projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0);
gl_Position.z = 0.0;

vertexPosition = aVertexPosition;
vTrans1 = aTrans1;
vTrans2 = aTrans2;
vTextureId = aTextureId;
vColor = aColor;
vSamplerSize = aSamplerSize;
vFrame = aFrame;
}
`,Ke=`precision highp float;
varying vec2 vertexPosition;
varying vec3 vTrans1;
varying vec3 vTrans2;
varying vec2 vSamplerSize;
varying vec4 vFrame;
varying vec4 vColor;
varying float vTextureId;

uniform sampler2D uSamplers[%count%];
uniform vec4 distortion;

void main(void){
vec2 surface;
vec2 surface2;

float vx = vertexPosition.x;
float vy = vertexPosition.y;
float dx = distortion.x;
float dy = distortion.y;
float revx = distortion.z;
float revy = distortion.w;

if (distortion.x == 0.0) {
surface.x = vx;
surface.y = vy / (1.0 + dy * vx);
surface2 = surface;
} else
if (distortion.y == 0.0) {
surface.y = vy;
surface.x = vx / (1.0 + dx * vy);
surface2 = surface;
} else {
float c = vy * dx - vx * dy;
float b = (c + 1.0) * 0.5;
float b2 = (-c + 1.0) * 0.5;
float d = b * b + vx * dy;
if (d < -0.00001) {
    discard;
}
d = sqrt(max(d, 0.0));
surface.x = (- b + d) * revy;
surface2.x = (- b - d) * revy;
surface.y = (- b2 + d) * revx;
surface2.y = (- b2 - d) * revx;
}

vec2 uv;
uv.x = vTrans1.x * surface.x + vTrans1.y * surface.y + vTrans1.z;
uv.y = vTrans2.x * surface.x + vTrans2.y * surface.y + vTrans2.z;

vec2 pixels = uv * vSamplerSize;

if (pixels.x < vFrame.x || pixels.x > vFrame.z ||
pixels.y < vFrame.y || pixels.y > vFrame.w) {
uv.x = vTrans1.x * surface2.x + vTrans1.y * surface2.y + vTrans1.z;
uv.y = vTrans2.x * surface2.x + vTrans2.y * surface2.y + vTrans2.z;
pixels = uv * vSamplerSize;

if (pixels.x < vFrame.x || pixels.x > vFrame.z ||
   pixels.y < vFrame.y || pixels.y > vFrame.w) {
   discard;
}
}

vec4 edge;
edge.xy = clamp(pixels - vFrame.xy + 0.5, vec2(0.0, 0.0), vec2(1.0, 1.0));
edge.zw = clamp(vFrame.zw - pixels + 0.5, vec2(0.0, 0.0), vec2(1.0, 1.0));

float alpha = 1.0; //edge.x * edge.y * edge.z * edge.w;
vec4 rColor = vColor * alpha;

float textureId = floor(vTextureId+0.5);
vec2 vTextureCoord = uv;
vec4 color;
%forloop%
gl_FragColor = color * rColor;
}`;class ce extends Rt{constructor(r=!1){super(),this._buffer=new it(null,r,!1),this._indexBuffer=new it(null,r,!0),this.addAttribute("aVertexPosition",this._buffer,2,!1,P.FLOAT).addAttribute("aTrans1",this._buffer,3,!1,P.FLOAT).addAttribute("aTrans2",this._buffer,3,!1,P.FLOAT).addAttribute("aSamplerSize",this._buffer,2,!1,P.FLOAT).addAttribute("aFrame",this._buffer,4,!1,P.FLOAT).addAttribute("aColor",this._buffer,4,!0,P.UNSIGNED_BYTE).addAttribute("aTextureId",this._buffer,1,!0,P.FLOAT).addIndex(this._indexBuffer)}}class zt extends Kt{constructor(r){super(r),this.defUniforms={translationMatrix:new S,distortion:new Float32Array([0,0,1/0,1/0])},this.size=1e3,this.forceMaxTextures=1,this.vertexSize=16,this.geometryClass=ce}setShaderGenerator(){this.shaderGenerator=new Lt(Ee,Ke)}getUniforms(r){const{proj:e}=r;return e.surface!==null?e.uniforms:e._activeProjection!==null?e._activeProjection.uniforms:this.defUniforms}packInterleavedGeometry(r,e,s,o,i){const{uint32View:a,float32View:n}=e,h=o/this.vertexSize,p=r.indices,c=r.vertexData,d=r._texture._frame,u=r.aTrans,{_batchLocation:l,realWidth:m,realHeight:f,resolution:y}=r._texture.baseTexture,_=Math.min(r.worldAlpha,1),g=Dt.shared.setValue(r._tintRGB).toPremultiplied(_);for(let v=0;v<c.length;v+=2)n[o]=c[v],n[o+1]=c[v+1],n[o+2]=u.a,n[o+3]=u.c,n[o+4]=u.tx,n[o+5]=u.b,n[o+6]=u.d,n[o+7]=u.ty,n[o+8]=m,n[o+9]=f,n[o+10]=d.x*y,n[o+11]=d.y*y,n[o+12]=(d.x+d.width)*y,n[o+13]=(d.y+d.height)*y,a[o+14]=g,n[o+15]=l,o+=16;for(let v=0;v<p.length;v++)s[i++]=h+p[v]}}zt.extension={name:"batch_bilinear",type:wt.RendererPlugin};const x=[new j,new j,new j,new j],B=[0,0,0,0];class le{constructor(){this.surfaceID="default",this._updateID=0,this.vertexSrc="",this.fragmentSrc=""}fillUniforms(r){}clear(){}boundsQuad(r,e,s){let o=e[0],i=e[1],a=e[0],n=e[1];for(let h=2;h<8;h+=2)o>e[h]&&(o=e[h]),a<e[h]&&(a=e[h]),i>e[h+1]&&(i=e[h+1]),n<e[h+1]&&(n=e[h+1]);if(x[0].set(o,i),this.apply(x[0],x[0]),x[1].set(a,i),this.apply(x[1],x[1]),x[2].set(a,n),this.apply(x[2],x[2]),x[3].set(o,n),this.apply(x[3],x[3]),s)s.apply(x[0],x[0]),s.apply(x[1],x[1]),s.apply(x[2],x[2]),s.apply(x[3],x[3]),e[0]=x[0].x,e[1]=x[0].y,e[2]=x[1].x,e[3]=x[1].y,e[4]=x[2].x,e[5]=x[2].y,e[6]=x[3].x,e[7]=x[3].y;else{for(let h=1;h<=3;h++)if(x[h].y<x[0].y||x[h].y===x[0].y&&x[h].x<x[0].x){const p=x[0];x[0]=x[h],x[h]=p}for(let h=1;h<=3;h++)B[h]=Math.atan2(x[h].y-x[0].y,x[h].x-x[0].x);for(let h=1;h<=3;h++)for(let p=h+1;p<=3;p++)if(B[h]>B[p]){const c=x[h];x[h]=x[p],x[p]=c;const d=B[h];B[h]=B[p],B[p]=d}if(e[0]=x[0].x,e[1]=x[0].y,e[2]=x[1].x,e[3]=x[1].y,e[4]=x[2].x,e[5]=x[2].y,e[6]=x[3].x,e[7]=x[3].y,(x[3].x-x[2].x)*(x[1].y-x[2].y)-(x[1].x-x[2].x)*(x[3].y-x[2].y)<0){e[4]=x[3].x,e[5]=x[3].y;return}}}}const Ye=new S,rt=new Xt,st=new j;class Vt extends le{constructor(){super(...arguments),this.distortion=new j}clear(){this.distortion.set(0,0)}apply(r,e){e=e||new j;const s=this.distortion,o=r.x*r.y;return e.x=r.x+s.x*o,e.y=r.y+s.y*o,e}applyInverse(r,e){e=e||new j;const s=r.x,o=r.y,i=this.distortion.x,a=this.distortion.y;if(i===0)e.x=s,e.y=o/(1+a*s);else if(a===0)e.y=o,e.x=s/(1+i*o);else{const n=(o*i-s*a+1)*.5/a,h=n*n+s/a;if(h<=1e-5)return e.set(NaN,NaN),e;a>0?e.x=-n+Math.sqrt(h):e.x=-n-Math.sqrt(h),e.y=(s/e.x-1)/i}return e}mapSprite(r,e,s){const o=r.texture;return rt.x=-r.anchor.x*o.orig.width,rt.y=-r.anchor.y*o.orig.height,rt.width=o.orig.width,rt.height=o.orig.height,this.mapQuad(rt,e,s||r.transform)}mapQuad(r,e,s){const o=-r.x/r.width,i=-r.y/r.height,a=(1-r.x)/r.width,n=(1-r.y)/r.height,h=e[0].x*(1-o)+e[1].x*o,p=e[0].y*(1-o)+e[1].y*o,c=e[0].x*(1-a)+e[1].x*a,d=e[0].y*(1-a)+e[1].y*a,u=e[3].x*(1-o)+e[2].x*o,l=e[3].y*(1-o)+e[2].y*o,m=e[3].x*(1-a)+e[2].x*a,f=e[3].y*(1-a)+e[2].y*a,y=h*(1-i)+u*i,_=p*(1-i)+l*i,g=c*(1-i)+m*i,v=d*(1-i)+f*i,T=h*(1-n)+u*n,I=p*(1-n)+l*n,w=c*(1-n)+m*n,V=d*(1-n)+f*n,F=Ye;return F.tx=y,F.ty=_,F.a=g-y,F.b=v-_,F.c=T-y,F.d=I-_,st.set(w,V),F.applyInverse(st,st),this.distortion.set(st.x-1,st.y-1),s.setFromMatrix(F),this}fillUniforms(r){r.distortion=r.distortion||new Float32Array([0,0,0,0]);const e=Math.abs(this.distortion.x),s=Math.abs(this.distortion.y);r.distortion[0]=e*1e4<=s?0:this.distortion.x,r.distortion[1]=s*1e4<=e?0:this.distortion.y,r.distortion[2]=1/r.distortion[0],r.distortion[3]=1/r.distortion[1]}}const ue=nt.prototype.updateTransform;function Se(t){const r=this.proj,e=t.proj,s=this;if(!e){ue.call(this,t),r._activeProjection=null;return}if(e._surface){r._activeProjection=e,this.updateLocalTransform(),this.localTransform.copyTo(this.worldTransform),s._parentID<0&&++s._worldID;return}ue.call(this,t),r._activeProjection=e._activeProjection}class vt extends Ct{constructor(){super(...arguments),this._surface=null,this._activeProjection=null,this._currentSurfaceID=-1,this._currentLegacyID=-1,this._lastUniforms=null}set enabled(r){r!==this._enabled&&(this._enabled=r,r?(this.legacy.updateTransform=Se,this.legacy._parentID=-1):(this.legacy.updateTransform=nt.prototype.updateTransform,this.legacy._parentID=-1))}get surface(){return this._surface}set surface(r){this._surface!==r&&(this._surface=r||null,this.legacy._parentID=-1)}applyPartial(r,e){return this._activeProjection!==null?(e=this.legacy.worldTransform.apply(r,e),this._activeProjection.surface.apply(e,e)):this._surface!==null?this.surface.apply(r,e):this.legacy.worldTransform.apply(r,e)}apply(r,e){return this._activeProjection!==null?(e=this.legacy.worldTransform.apply(r,e),this._activeProjection.surface.apply(e,e),this._activeProjection.legacy.worldTransform.apply(e,e)):this._surface!==null?(e=this.surface.apply(r,e),this.legacy.worldTransform.apply(e,e)):this.legacy.worldTransform.apply(r,e)}applyInverse(r,e){return this._activeProjection!==null?(e=this._activeProjection.legacy.worldTransform.applyInverse(r,e),this._activeProjection._surface.applyInverse(e,e),this.legacy.worldTransform.applyInverse(e,e)):this._surface!==null?(e=this.legacy.worldTransform.applyInverse(r,e),this._surface.applyInverse(e,e)):this.legacy.worldTransform.applyInverse(r,e)}mapBilinearSprite(r,e){this._surface instanceof Vt||(this.surface=new Vt),this.surface.mapSprite(r,e,this.legacy)}clear(){this.surface&&this.surface.clear()}get uniforms(){return this._currentLegacyID===this.legacy._worldID&&this._currentSurfaceID===this.surface._updateID?this._lastUniforms:(this._lastUniforms=this._lastUniforms||{},this._lastUniforms.translationMatrix=this.legacy.worldTransform,this._surface.fillUniforms(this._lastUniforms),this._lastUniforms)}}class O extends ${constructor(r){super(r),this.aTrans=new S,this.proj=new vt(this.transform),this.pluginName="batch_bilinear"}_calculateBounds(){this.calculateTrimmedVertices(),this._bounds.addQuad(this.vertexTrimmedData)}calculateVertices(){const r=this.transform._worldID,e=this._texture._updateID,s=this;if(s._transformID===r&&this._textureID===e)return;s._transformID=r,this._textureID=e;const o=this._texture,i=this.vertexData,a=o.trim,n=o.orig,h=this._anchor;let p,c,d,u;if(a?(c=a.x-h._x*n.width,p=c+a.width,u=a.y-h._y*n.height,d=u+a.height):(c=-h._x*n.width,p=c+n.width,u=-h._y*n.height,d=u+n.height),this.proj._surface)i[0]=c,i[1]=u,i[2]=p,i[3]=u,i[4]=p,i[5]=d,i[6]=c,i[7]=d,this.proj._surface.boundsQuad(i,i);else{const m=this.transform.worldTransform,f=m.a,y=m.b,_=m.c,g=m.d,v=m.tx,T=m.ty;i[0]=f*c+_*u+v,i[1]=g*u+y*c+T,i[2]=f*p+_*u+v,i[3]=g*u+y*p+T,i[4]=f*p+_*d+v,i[5]=g*d+y*p+T,i[6]=f*c+_*d+v,i[7]=g*d+y*c+T,this.proj._activeProjection&&this.proj._activeProjection.surface.boundsQuad(i,i)}o.uvMatrix||(o.uvMatrix=new Mt(o)),o.uvMatrix.update();const l=this.aTrans;l.set(n.width,0,0,n.height,c,u),this.proj._surface===null&&l.prepend(this.transform.worldTransform),l.invert(),l.prepend(o.uvMatrix.mapCoord)}calculateTrimmedVertices(){const r=this.transform._worldID,e=this._texture._updateID,s=this;if(!s.vertexTrimmedData)s.vertexTrimmedData=new Float32Array(8);else if(s._transformTrimmedID===r&&this._textureTrimmedID===e)return;s._transformTrimmedID=r,this._textureTrimmedID=e;const o=this._texture,i=s.vertexTrimmedData,a=o.orig,n=this._anchor,h=-n._x*a.width,p=h+a.width,c=-n._y*a.height,d=c+a.height;if(this.proj._surface)i[0]=h,i[1]=c,i[2]=p,i[3]=c,i[4]=p,i[5]=d,i[6]=h,i[7]=d,this.proj._surface.boundsQuad(i,i,this.transform.worldTransform);else{const u=this.transform.worldTransform,l=u.a,m=u.b,f=u.c,y=u.d,_=u.tx,g=u.ty;i[0]=l*h+f*c+_,i[1]=y*c+m*h+g,i[2]=l*p+f*c+_,i[3]=y*c+m*p+g,i[4]=l*p+f*d+_,i[5]=y*d+m*p+g,i[6]=l*h+f*d+_,i[7]=y*d+m*h+g,this.proj._activeProjection&&this.proj._activeProjection.surface.boundsQuad(i,i,this.proj._activeProjection.legacy.worldTransform)}}get worldTransform(){return this.proj}}$.prototype.convertTo2s=function(){this.proj||(this.pluginName="sprite_bilinear",this.aTrans=new S,this.calculateVertices=O.prototype.calculateVertices,this.calculateTrimmedVertices=O.prototype.calculateTrimmedVertices,this._calculateBounds=O.prototype._calculateBounds,D.prototype.convertTo2s.call(this))},D.prototype.convertTo2s=function(){this.proj||(this.proj=new vt(this.transform),Object.defineProperty(this,"worldTransform",{get(){return this.proj},enumerable:!0,configurable:!0}))},D.prototype.convertSubtreeTo2s=function(){this.convertTo2s();for(let t=0;t<this.children.length;t++)this.children[t].convertSubtreeTo2s()};class gt extends jt{constructor(r,e,s){super(r,e,s),this.aTrans=new S,this.proj=new vt(this.transform),this.pluginName="batch_bilinear"}get worldTransform(){return this.proj}}gt.prototype.calculateVertices=O.prototype.calculateVertices,gt.prototype.calculateTrimmedVertices=O.prototype.calculateTrimmedVertices,gt.prototype._calculateBounds=O.prototype._calculateBounds,bt.add(zt);function tr(t){t.newMesh=function(r,e,s,o,i){return new re(r,e,s,o,i)},t.newContainer=function(){return this.proj||this.convertTo2d(),new ut},t.newSprite=function(r){return new L(r)},t.newGraphics=function(){const r=new Jt;return r.convertTo2d(),r},t.transformHack=function(){return 2}}function er(t){t.newMesh=function(r,e,s,o,i){return new he(r,e,s,o,i)},t.newContainer=function(){return this.proj||this.convertTo3d(),new q},t.newSprite=function(r){return new z(r)},t.newGraphics=function(){const r=new Jt;return r.convertTo3d(),r},t.transformHack=function(){return 2}}export{G as AFFINE,Ct as AbstractProjection,Nt as Batch2dRenderer,Wt as Batch3dGeometry,ce as BatchBilinearGeometry,zt as BatchBilinearRenderer,Vt as BilinearSurface,Ze as Camera3d,ut as Container2d,q as Container3d,It as Euler,Ut as LinearProjection,A as Matrix2d,H as Matrix3d,U as Mesh2d,et as Mesh3d2d,oe as ObservableEuler,ft as ObservablePoint3d,Pt as Point3d,M as Projection2d,Q as Projection3d,vt as ProjectionSurface,re as SimpleMesh2d,he as SimpleMesh3d2d,L as Sprite2d,O as Sprite2s,z as Sprite3d,Tt as SpriteMaskFilter2d,le as Surface,C as TRANSFORM_STEP,mt as Text2d,gt as Text2s,J as Text3d,se as TilingSprite2d,Ft as TilingSprite2dRenderer,Kt as UniformBatchRenderer,tr as applySpine2dMixin,er as applySpine3dMixin,dt as container2dToLocal,ee as container2dWorldTransform,xt as container3dGetDepth,_t as container3dIsFrontFace,yt as container3dToLocal,ne as container3dWorldTransform,Yt as getIntersectionFactor,Ge as getPositionFromQuad,Qe as patchSpriteMask,Et as transformHack};

