//runs on a layer's pre-shadow render to get the shadow map for the next layer deep. takes into account the current layer's shadow map as well
precision highp float;

varying vec2 vTextureCoord;

uniform vec4 inputSize;
uniform vec4 outputFrame;

uniform sampler2D uSampler;
uniform sampler2D uShadowMap;

uniform float uShadowAngle;
uniform float uShadowMag;

#define pi 3.14159265358

void main(void) {
	vec2 shadowOffset = vec2(
		cos(uShadowAngle * pi),
		sin(uShadowAngle * pi)
	);
	
	shadowOffset *= vec2(uShadowMag);

	vec2 filterCoord = ((vTextureCoord * inputSize.xy)) / outputFrame.zw;

	vec4 baseColor = texture2D(uSampler, vTextureCoord);
	vec4 shadowColor = texture2D(uShadowMap, filterCoord - shadowOffset);

	if ((shadowColor.x + baseColor.w) > float(0.0)) {
		float shadowFac = baseColor.w;
		if (shadowColor.x > baseColor.w) {
			shadowFac = shadowColor.x;
		}
		gl_FragColor = vec4(shadowFac, shadowFac, shadowFac, 1);
	} else {
		gl_FragColor = vec4(0, 0, 0, 1);
	}
}