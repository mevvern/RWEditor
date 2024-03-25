//to be run at the top of each layer. samples the layer's render and the layers shadow map. outputs new final lit and unlit colors for the layer
precision highp float;

varying vec2 vTextureCoord;

uniform vec4 inputSize;
uniform vec4 outputFrame;

uniform sampler2D uSampler;
uniform sampler2D uShadowMap;

uniform float uShadowAngle;

#define pi 3.14159265358

void main(void) {
	//offset for shadowmap sampling to prevent fighting at the lit sides of objects
	vec2 shadowOffset = vec2(
		float(cos(uShadowAngle * float(pi))),
		float(sin(uShadowAngle * float(pi)))
	);

	shadowOffset *= vec2(0.002);

	vec2 filterCoord = ((vTextureCoord * inputSize.xy)) / outputFrame.zw;

	vec4 shadowColor = texture2D(uShadowMap, filterCoord + shadowOffset);
	vec4 baseColor = texture2D(uSampler, vTextureCoord);

	//gl_FragColor = vec4(filterCoord1.x, filterCoord1.y, 1.0, 1);

	if (shadowColor.x > float(0.0)) {
		baseColor.xyz = baseColor.xyz * vec3(0.5);
		gl_FragColor = baseColor; //vec4(0.3, 0.3, 0.3, 1);
	} else {
		gl_FragColor = baseColor;
	}
}