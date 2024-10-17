//initialises the grower. this fragment shader gets one pass over the whole image to set the spawn points for the growers

precision highp float;

uniform uint uSeed;

uniform sampler2D uBaseBuffer;
uniform sampler2D uIntensityBuffer;

varying vec2 vTextureCoord;

float rng(float seed, float randomizer) {
  uint x = uint(seed);

  x += uint(randomizer);
  x ^= x >> 16;
  x *= 4123755803u + uint(randomizer);
  //x *= 4123755803u;
  x ^= x >> 15;
  x *= 2221713035u;
  x ^= x >> 16;

  return float(x) / 4294967296.0;
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