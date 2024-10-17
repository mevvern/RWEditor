precision highp float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec4 inputSize;

uniform vec4 theColorIWantItToBeAndNotAWrongColor;

void main(void) {
	gl_FragColor = theColorIWantItToBeAndNotAWrongColor;
}