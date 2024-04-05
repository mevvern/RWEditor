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

#define pi float(3.14159265358)

void main(void) {
	vec2 myCoord = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
	myCoord -= vec2(uQuadOrigin.x, uQuadOrigin.y);
	myCoord /= uQuadSize;

	//offset for shadowmap sampling to prevent fighting at the lit sides of objects
	vec2 shadowOffset = vec2(
		cos(uShadowAngle * pi),
		sin(uShadowAngle * pi)
	);

	if (shadowOffset.x < 0.0) {
		shadowOffset.x = -1.0;
	} else if (shadowOffset.x > 0.0){
		shadowOffset.x = 1.0;
	}

	if (shadowOffset.y < 0.0) {
		shadowOffset.y = -1.0;
	} else if (shadowOffset.x > 0.0){
		shadowOffset.y = 1.0;
	}

	shadowOffset *= vec2(3.0 / uQuadSize.y);

	float shadowFac = texture2D(uShadowMap, myCoord - shadowOffset).x;
	vec4 baseColor = texture2D(uSampler, vTextureCoord);
	vec4 shadowColor = baseColor * vec4(0.7, 0.7, 0.8, 1.0);

	vec4 finalColor = mix(baseColor, shadowColor, shadowFac);

	gl_FragColor = finalColor;

	if (debug) {
		gl_FragColor = vec4(texture2D(uShadowMap, myCoord + shadowOffset).xyz, 0.05);
	}
}