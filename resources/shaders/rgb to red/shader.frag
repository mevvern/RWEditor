precision highp float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D uPalette;

uniform int uDepth;
uniform int uRenderMode; //if true, the shader will output a "final render", if false, the shader will output palette colors

const ivec2 paletteSize = ivec2(32, 16);

vec4 samplePalette(ivec2 paletteIndex) {

	vec4 paletteColor = texture2D(uPalette, (vec2(paletteIndex) + vec2(0.5)) / vec2(paletteSize));

	return paletteColor;
}

void main(void) {
	ivec4 baseColor = ivec4(texture2D(uSampler, vTextureCoord) * 60.0);
	ivec4 finalIntColor = ivec4(0);
	vec4 finalColor;

	if (uRenderMode == 0) {
		//final render mode
		if (baseColor.a > 29) {
			if (baseColor.r > 0) {
				//color 1
				finalIntColor.r += 0;

				if (baseColor.r > 31) {
					//lit
					finalIntColor.r += 90;
				}
			}

			if (baseColor.g > 0) {
				//colro 2
				finalIntColor.r += 30;

				if (baseColor.g > 31) {
					//lit
					finalIntColor.r += 90;
				}
			}

			if (baseColor.b > 0) {
				//color 3
				finalIntColor.r += 60;

				if (baseColor.b > 31) {
					//lit
					finalIntColor.r += 90;
				}
			}

			finalIntColor.r += uDepth;

			finalIntColor.a = 255;

			finalColor = vec4(finalIntColor) / 255.0;
		}

	} else if (uRenderMode == 1) {
		//palette example


		//palette mode

		ivec2 paletteIndex = ivec2(0, 2); //ivec2(0, 10);

		if (baseColor.a > 29) {
			
			if (baseColor.r > 0) {
				//palette 1
				paletteIndex.y += 0;

				if (baseColor.r < 30) {
					//unlit
					paletteIndex.y += 3;
				}
			}
			
			else if (baseColor.g > 0) {
				//palette 2
				paletteIndex.y += 1;

				if (baseColor.g < 30) {
					//unlit
					paletteIndex.y += 3;
				}
			}
			
			else if (baseColor.b > 0) {
				//palette 3
				paletteIndex.y += 2;

				if (baseColor.b < 30) {
					//unlit
					paletteIndex.y += 3;
				}
			}
			
			//add depth to the x axis
			paletteIndex.x = uDepth;

			finalColor = samplePalette(paletteIndex);
		}
	} else if (uRenderMode == 2) {
		//just output the input color
		finalColor = texture2D(uSampler, vTextureCoord);
	}

	gl_FragColor = finalColor;

}