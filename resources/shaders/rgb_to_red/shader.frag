precision highp float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;

void main(void) {
	vec4 baseColor = texture2D(uSampler, vTextureCoord);
	
	
}