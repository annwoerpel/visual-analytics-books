 <script >
	import { onMount } from 'svelte';

	export let options;

	let ApexCharts;
	let loaded = false;

	const chart = (node, options) => {

		if (!loaded)
			return

		let myChart = new ApexCharts(node, options)
		myChart.render()

		return {
			update(options) {
				myChart.updateOptions(options)
			},
			destroy() {
				myChart.destroy()
			}
		}
	}

	onMount(async () => {
		const module = await import('apexcharts');
		ApexCharts = module.default;
		window.ApexCharts = ApexCharts
		loaded = true
	});

</script> 

{#if loaded}
    <div use:chart={options}></div>
{/if}