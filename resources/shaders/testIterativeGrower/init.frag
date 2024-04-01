//initialises the grower. this fragment shader gets one pass over the whole image to set the spawn points for the growers

precision highp float;

uniform uint uSeed;

uniform sampler2D uBaseBuffer;
uniform sampler2D uIntensityBuffer;

varying vec2 vTextureCoord;

float rng(void) {
	uint x = uSeed;
	int randomizer = int((vTextureCoord.x + vTextureCoord.y) * float(1000));

	x += uint(randomizer);

  x ^= x >> 16;
  x *= 0x7feb352d;
  x ^= x >> 15;
  x *= 0x846ca68b;
  x ^= x >> 16;

	float(x) /= 4294967296.0;

  return x;
}

void main(void) {
	float intensity = texture2D(uBaseBuffer, vTextureCoord).w;

	vec4 baseColor = texture2D(uBaseBuffer, vTextureCoord);

	if (baseColor.w > float 0.0) {
		if (rng() > intensity) {
			gl_FragColor = vec4(baseColor.xy, 1.0, baseColor.w);
		} else {
			gl_FragColor = baseColor;
		}
	} else {
		gl_FragColor = baseColor;
	}
}