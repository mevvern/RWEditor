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
		float(cos(uShadowAngle * float(pi))),
		float(sin(uShadowAngle * float(pi)))
	);
	
	shadowOffset *= vec2(uShadowMag);

	vec2 filterCoord = ((vTextureCoord * inputSize.xy)) / outputFrame.zw;

	vec4 baseColor = texture2D(uSampler, vTextureCoord);
	vec4 shadowColor = texture2D(uShadowMap, filterCoord + shadowOffset);

	if ((baseColor.w + shadowColor.x) > float(0.0)) {
		gl_FragColor = vec4(1, 1, 1, 1);
	} else {
		gl_FragColor = vec4(0, 0, 0, 1);
	}
}