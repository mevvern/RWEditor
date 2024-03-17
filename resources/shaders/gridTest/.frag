precision highp float;

uniform vec4 inputSize;
uniform vec4 inputPixel;
uniform vec4 outputFrame;

uniform float pitch;
uniform float viewScale;
uniform float thickness;

varying vec2 vTextureCoord;

void main() {
	vec2 filterCoord = vTextureCoord * inputPixel.xy / outputFrame.zw;

	vec2 gridCoord = vec2(vTextureCoord.x * inputPixel.x / viewScale, vTextureCoord.y * inputPixel.y / viewScale);

	if (mod(gridCoord.x + (thickness / 2.0), pitch * viewScale) < thickness || mod(gridCoord.y + (thickness / 2.0), pitch * viewScale) < thickness) {
		gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
	} else {
		gl_FragColor = vec4(filterCoord.x, filterCoord.y, 1.0, 1.0);
	}
}