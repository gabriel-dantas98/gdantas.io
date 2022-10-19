import { useCallback } from 'react';
import Particles from 'react-particles';
import { loadFull } from 'tsparticles';
import { RecursivePartial, IOptions } from 'tsparticles-engine';
import particlesOptions from '../../data/particles.json';
import { Engine } from 'tsparticles-engine';

export function Standard() {
	const particlesInit = useCallback(async (engine: Engine) => {
		console.log(engine);

		// you can initialize the tsParticles instance (engine) here, adding custom shapes or presets
		// this loads the tsparticles package bundle, it's the easiest method for getting everything ready
		// starting from v2 you can add only the features you need reducing the bundle size
		await loadFull(engine);
	}, []);

	return (
		<>
			<Particles
				id="tsparticles"
				options={{
					background: {
						color: {
							value: '#232424',
						},
					},
					fpsLimit: 120,
					interactivity: {
						events: {
							onClick: {
								enable: false,
								mode: 'push',
							},
							onHover: {
								enable: true,
								mode: 'repulse',
							},
							resize: true,
						},
						modes: {
							push: {
								quantity: 10,
							},
							repulse: {
								distance: 140,
								duration: 0.3,
							},
						},
					},
					particles: {
						color: {
							value: '#ffffff',
						},
						links: {
							color: '#ffffff',
							distance: 150,
							enable: false,
							opacity: 0.5,
							width: 1,
						},
						collisions: {
							enable: true,
						},
						move: {
							direction: 'none',
							enable: true,
							outModes: 'bounce',
							random: true,
							speed: 8,
							straight: false,
						},
						number: {
							density: {
								enable: true,
								value_area: 250,
							},
							value: 20,
						},
						opacity: {
							value: 0.3,
						},
						shape: {
							type: 'image',
							options: {
								image: [
									{
										height: 40,
										particles: {
											move: {
												direction: 'right',
											},
										},
										src: 'https://user-images.githubusercontent.com/31406378/108641411-f9374f00-7496-11eb-82a7-0fa2a9cc5f93.png',
										width: 40,
									},
									{
										height: 50,
										particles: {
											move: {
												direction: 'right',
											},
										},
										src: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/kubernetes/icon/color/kubernetes-icon-color.png',
										width: 50,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'top',
											},
										},
										src: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/prometheus/icon/color/prometheus-icon-color.png',
										width: 32,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'left',
											},
										},
										src: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/envoy/icon/color/envoy-icon-color.png',
										width: 32,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'top',
											},
										},
										src: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/coredns/icon/color/coredns-icon-color.png',
										width: 32,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'right',
											},
										},
										src: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/containerd/icon/color/containerd-icon-color.png',
										width: 32,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'bottom',
											},
										},
										src: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/fluentd/icon/color/fluentd-icon-color.png',
										width: 32,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'inside',
											},
										},
										src: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/jaeger/icon/color/jaeger-icon-color.png',
										width: 32,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'left',
											},
										},
										src: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/vitess/icon/color/vitess-icon-color.png',
										width: 32,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'right',
											},
										},
										src: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/helm/icon/color/helm-icon-color.png',
										width: 32,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'left',
											},
										},
										src: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/harbor/icon/color/harbor-icon-color.png',
										width: 32,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'top',
											},
										},
										src: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/rook/icon/color/rook-icon-color.png',
										width: 32,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'bottom',
											},
										},
										src: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/etcd/icon/color/etcd-icon-color.png',
										width: 32,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'top',
											},
										},
										src: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/opa/icon/color/opa-icon-color.png',
										width: 32,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'left',
											},
										},
										src: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/cni/icon/color/cni-icon-color.png',
										width: 32,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'right',
											},
										},
										src: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/notary/icon/color/notary-icon-color.png',
										width: 32,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'right',
											},
										},
										src: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/nats/icon/color/nats-icon-color.png',
										width: 32,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'left',
											},
										},
										src: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/linkerd/icon/color/linkerd-icon-color.png',
										width: 32,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'bottom',
											},
										},
										src: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/falco/icon/color/falco-icon-color.png',
										width: 32,
									},
									{
										height: 42,
										particles: {
											move: {
												direction: 'inside',
											},
										},
										src: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/argo/icon/color/argo-icon-color.png',
										width: 32,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'inside',
											},
										},
										src: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/thanos/icon/color/thanos-icon-color.png',
										width: 32,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'right',
											},
										},
										src: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/buildpacks/icon/color/buildpacks-icon-color.png',
										width: 32,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'bottom',
											},
										},
										src: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/flux/icon/color/flux-icon-color.png',
										width: 32,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'right',
											},
										},
										src: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/keda/icon/color/keda-icon-color.png',
										width: 32,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'inside',
											},
										},
										src: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/opentelemetry/icon/color/opentelemetry-icon-color.png',
										width: 32,
									},
									{
										height: 35,
										particles: {
											move: {
												direction: 'inside',
											},
										},
										src: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/litmus/icon/color/litmus-icon-color.png',
										width: 32,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'left',
											},
										},
										src: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/longhorn/icon/color/longhorn-icon-color.png',
										width: 32,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'inside',
											},
										},
										src: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/volcano/icon/color/volcano-icon-color.png',
										width: 32,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'inside',
											},
										},
										src: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/crossplane/icon/color/crossplane-icon-color.png',
										width: 32,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'left',
											},
										},
										src: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/keptn/icon/color/keptn-icon-color.png',
										width: 32,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'left',
											},
										},
										src: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/kuma/icon/color/kuma-icon-color.png',
										width: 32,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'bottom',
											},
										},
										src: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/k3s/icon/color/k3s-icon-color.png',
										width: 32,
									},
									{
										height: 42,
										particles: {
											move: {
												direction: 'bottom',
											},
										},
										src: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/backstage/icon/color/backstage-icon-color.png',
										width: 32,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'top',
											},
										},
										src: 'https://user-images.githubusercontent.com/24623425/36042969-f87531d4-0d8a-11e8-9dee-e87ab8c6a9e3.png',
										width: 32,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'left',
											},
										},
										src: 'https://design.jboss.org/kiali/logo/final/PNG/kiali_icon_darkbkg_1280px.png',
										width: 32,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'right',
											},
										},
										src: 'https://i0.wp.com/ericsysmin.com/wp-content/uploads/2020/05/Ansible-Mark-Large-RGB-Mango-e1588411668432.png?fit=300%2C300&ssl=1',
										width: 32,
									},
									{
										height: 42,
										particles: {
											move: {
												direction: 'inside',
											},
										},
										src: 'https://firebase.google.com/static/downloads/brand-guidelines/PNG/logo-logomark.png?hl=pt-br',
										width: 32,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'bottom',
											},
										},
										src: 'https://devstickers.com/assets/img/pro/0u8g.png',
										width: 32,
									},
									{
										height: 50,
										particles: {
											move: {
												direction: 'left',
											},
										},
										src: 'https://cdn4.iconfinder.com/data/icons/logos-3/181/MySQL-512.png',
										width: 50,
									},
									{
										height: 42,
										particles: {
											move: {
												direction: 'left',
											},
										},
										src: 'https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png',
										width: 55,
									},
									{
										height: 45,
										particles: {
											move: {
												direction: 'inside',
											},
										},
										src: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/grafana-icon.png',
										width: 42,
									},
									{
										height: 42,
										particles: {
											move: {
												direction: 'left',
											},
										},
										src: 'https://cdn-icons-png.flaticon.com/512/5968/5968853.png',
										width: 42,
									},
									{
										height: 33,
										particles: {
											move: {
												direction: 'bottom',
											},
										},
										src: 'https://seeklogo.com/images/K/kong-logo-30290787E5-seeklogo.com.png',
										width: 35,
									},
									{
										height: 35,
										particles: {
											move: {
												direction: 'top',
											},
										},
										src: 'https://logodownload.org/wp-content/uploads/2018/03/nginx-logo-3.png',
										width: 32,
									},
									{
										height: 32,
										particles: {
											move: {
												direction: 'bottom',
											},
										},
										src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Logo-ubuntu_cof-orange-hex.svg/1200px-Logo-ubuntu_cof-orange-hex.svg.png',
										width: 32,
									},
								],
							},
						},
						size: {
							random: false,
							value: 20,
						},
					},
					detectRetina: true,
				}}
				init={particlesInit}
			/>
			<div className="fixed inset-0" />
		</>
	);
}
