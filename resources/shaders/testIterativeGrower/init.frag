//initialises the grower. this fragment shader gets one pass over the whole image to set the spawn points for the growers

precision highp float;

uniform uint uSeed;

uniform sampler2D uBaseBuffer;
uniform sampler2D uIntensityBuffer;

varying vec2 vTextureCoord;

uint rng(uint x) {
  x ^= x >> 16;
  x *= 0x7feb352d;
  x ^= x >> 15;
  x *= 0x846ca68b;
  x ^= x >> 16;
  return x;
}

void main(void) {
	vec4 baseColor = vec4 texture2D(uBaseBuffer, vTextureCoord);

	if (baseColor.w > float 0.0) {
		if (rng(uSeed) / (pow(uint 2, 32) - uint 1)) {

		} else {
			gl_FragColor = baseColor;
		}
	} else {
		gl_FragColor = baseColor;
	}
}