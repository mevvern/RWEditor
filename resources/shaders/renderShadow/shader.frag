//to be run at the top of each layer. samples the layer's render and the layers shadow map. outputs new final lit and unlit colors for the layer
precision highp float;

varying vec2 vTextureCoord;

uniform bool debug;

uniform vec2 uResolution;
uniform vec2 uQuadSize;
uniform vec2 uQuadOrigin;

uniform sampler2D uSampler;
uniform sampler2D uShadowMap;

uniform float uShadowAngle;

#define pi 3.1415926

bool insideBounds(vec2 myCoord) {
	return (myCoord.x < 1.0 && myCoord.y < 1.0 && myCoord.x > 0.0 && myCoord.y > 0.0);
}

void main(void) {
	//vec2 myCoord = vTextureCoord;
	//vec2 myCoord = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
	vec2 myCoord = gl_FragCoord.xy;

	if (uQuadOrigin.x < 0.0) {
		myCoord.x -= uQuadOrigin.x;
	}

	if (uQuadOrigin.y < 0.0) {
		myCoord.y -= uQuadOrigin.y;
	}

	//myCoord += vec2(uQuadOrigin.x, uQuadOrigin.y);
	myCoord /= uQuadSize;

	if (insideBounds(myCoord)) {
		float inverseAngle = uShadowAngle + 1.0;

		vec2 checkVector = vec2(cos(inverseAngle * pi), sin(inverseAngle * pi));

		checkVector = sign(checkVector);

		checkVector *= 0.0025;

		float shadowFac = texture2D(uShadowMap, myCoord).x;
		vec4 baseColor = texture2D(uSampler, vTextureCoord);
		vec4 shadowColor = baseColor * vec4(0.5, 0.5, 0.5, 1.0);

		if (shadowFac > 0.0) {
			shadowFac = texture2D(uShadowMap, vec2(myCoord.x + checkVector.x, myCoord.y + checkVector.y)).x;
		}

		vec4 finalColor = mix(baseColor, shadowColor, shadowFac);

		gl_FragColor = finalColor;

		if (debug) {
			gl_FragColor = vec4(texture2D(uShadowMap, myCoord).xyz, 0.05);
		}
	}
}