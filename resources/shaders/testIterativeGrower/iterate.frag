//this shader runs multiple passes over the first init pass to grow the plants

precision highp float;

uniform int uSeed;

uniform sampler2D uBaseBuffer;
uniform sampler2D uGrowerBuffer;
uniform sampler2D uIntensityBuffer;

varying vec2 vTextureCoord;

struct GrowthParams {
	vec2 facs;
	mat3 solids;
};

float rng(void) {
	int x = uSeed;
	int randomizer = int((vTextureCoord.x + vTextureCoord.y) * float(1000));

	u += uint(randomizer);

  x ^= x >> 16;
  x *= 0x7feb352d;
  x ^= x >> 15;
  x *= 0x846ca68b;
  x ^= x >> 16;

	float(x) /= 4294967296.0;

  return x;
}

//returns a Params struct
//fac.x is a factor saying how many grown pixels are adjacent
//fac.y is a factor saying how strong the intensity map is in the surroundings
//solids contains the number and location of adjacent solid pixels in the base texture
GrowthParams sampleSurroundings(void) {
	
	GrowthParams growthParams = GrowthParams(vec2(), mat3());

	for (int xOffset = -1; xOffset < 2; xOffset++) {
		for (int yOffset = -1; yOffset < 2; yOffset++) {

			offsetTexCoord = vTextureCoord + vec2(float(xOffset), float(yOffset));

			if (vec4 texture2D(uGrowerBuffer, offsetTexCoord).w == float 1.0) {
				growthParams.facs.x++;
			}

			if (vec4 texture2D(uIntensityBuffer, offsetTexCoord).w == float 1.0) {
				growthParams.facs.y++;
			}

			if (vec4 texture2D(uBaseBuffer, offsetTexCoord).w == float 1.0) {
				growthParams.solids[xOffset + int 1][yOffset + int 1] = float 1.0;
			}
		}
	}

	growthParams.facs /= vec2(9);

	return growthParams;
}


void main(void) {
	vec4 baseColor = vec4 texture2D(uBaseBuffer, vTextureCoord);
	vec4 growerColor = vec4 texture2D(uGrowerBuffer, vTextureCoord);
	vec4 intensity = vec4 texture2D(uIntensityBuffer, vTextureCoord);

	if (growerColor.w == float 1.0) {



	}
}