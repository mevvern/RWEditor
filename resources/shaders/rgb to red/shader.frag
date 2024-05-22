precision highp float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D uPalette;

uniform bool uRenderMode; //if true, the shader will output a "final render", if false, the shader will output palette colors

const ivec2 paletteSize = ivec2(32, 16);

vec4 samplePalette(ivec2 paletteIndex) {
	vec4 paletteColor = texture2D(uPalette, vec2(paletteIndex) / vec2(paletteSize));

	return paletteColor;
}

void main(void) {
	ivec4 baseColor = ivec4(texture2D(uSampler, vTextureCoord) * 60.0);
	ivec4 finalColor = ivec4(0);
	vec4 finalFloatColor;
	int depth = baseColor.a - 31;


	//CHANGE TTYHIS exclamaitio9n popint BACK!!!!
	if (!uRenderMode) {
		//final render mode
		if (baseColor.a > 29) {
			if (baseColor.r > 0) {
				finalColor.r += 0;

				if (baseColor.r > 30) {
					finalColor.r += 90;
				}
			}

			if (baseColor.g > 0) {
				finalColor.r += 30;

				if (baseColor.g > 30) {
					finalColor.r += 90;
				}
			}

			if (baseColor.b > 0) {
				finalColor.r += 60;

				if (baseColor.b > 30) {
					finalColor.r += 90;
				}
			}

			finalColor.r += depth;

			finalColor.a = 255;

			finalFloatColor = vec4(finalColor) / 255.0;
		}

	} else {
		//palette mode

		ivec2 paletteIndex = ivec2(0, 10);

		if (baseColor.a > 29) {
			if (baseColor.r > 0) {
				//palette 1
				paletteIndex.y += 0;

				if (baseColor.r <= 30) {
					//unlit
					paletteIndex.y += 3;
				}
			}

			if (baseColor.g > 0) {
				//palette 2
				paletteIndex.y += 1;

				if (baseColor.g <= 30) {
					//unlit
					paletteIndex.y += 3;
				}
			}

			if (baseColor.b > 0) {
				//palette 3
				paletteIndex.y += 2;

				if (baseColor.b <= 30) {
					//unlit
					paletteIndex.y += 3;
				}
			}

			//add depth to the x axis
			paletteIndex.x = depth;

			finalFloatColor = samplePalette(paletteIndex);
		}
	}

	gl_FragColor = finalFloatColor;

}