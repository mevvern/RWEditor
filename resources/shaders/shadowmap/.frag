precision highp float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;

void main() {
	if (vec4 texture2D(uSampler, vTextureCoord).w == float 0.0) {
		gl_FragColor = vec4(0, 0, 0, 0);
	} else {
		gl_FragColor = vec4(0, 0, 0, 1);
	}
}