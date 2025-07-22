<script>
  import { clamp } from 'yootils';

  export let start = 1900;
  export let end = 2025;
  export let minYear = 1900;
  export let maxYear = 2025;

  let leftHandle;
  let rightHandle;
  let body;
  let slider;

  function yearToPercent(year) {
    return ((year - minYear) / (maxYear - minYear)) * 100;
  }

  function percentToYear(percent) {
    return Math.round(percent / 100 * (maxYear - minYear) + minYear);
  }

  function draggable(node) {
		let x;
		let y;
		function handleMousedown(event) {
			if (event.type === 'touchstart') {
				event = event.touches[0];
			}
			x = event.clientX;
			y = event.clientY;
			node.dispatchEvent(new CustomEvent('dragstart', {
				detail: { x, y }
			}));
			window.addEventListener('mousemove', handleMousemove);
			window.addEventListener('mouseup', handleMouseup);
			window.addEventListener('touchmove', handleMousemove);
			window.addEventListener('touchend', handleMouseup);
		}
		function handleMousemove(event) {
			if (event.type === 'touchmove') {
				event = event.changedTouches[0];
			}
			const dx = event.clientX - x;
			const dy = event.clientY - y;
			x = event.clientX;
			y = event.clientY;
			node.dispatchEvent(new CustomEvent('dragmove', {
				detail: { x, y, dx, dy }
			}));
		}
		function handleMouseup(event) {
			x = event.clientX;
			y = event.clientY;
			node.dispatchEvent(new CustomEvent('dragend', {
				detail: { x, y }
			}));
			window.removeEventListener('mousemove', handleMousemove);
			window.removeEventListener('mouseup', handleMouseup);
			window.removeEventListener('touchmove', handleMousemove);
			window.removeEventListener('touchend', handleMouseup);
		}
		node.addEventListener('mousedown', handleMousedown);
		node.addEventListener('touchstart', handleMousedown);
		return {
			destroy() {
				node.removeEventListener('mousedown', handleMousedown);
				node.removeEventListener('touchstart', handleMousedown);
			}
		};
	}

  function setHandlePosition(which) {
    return evt => {
      const { left, right } = slider.getBoundingClientRect();
      const parentWidth = right - left;
      const percent = clamp(((evt.detail.x - left) / parentWidth) * 100, 0, 100);

      const year = percentToYear(percent);
      if (which === 'start') {
        start = Math.min(year, end);
      } else {
        end = Math.max(year, start);
      }
    };
  }

  function setHandlesFromBody(evt) {
    const { width } = body.getBoundingClientRect();
    const { left, right } = slider.getBoundingClientRect();
    const parentWidth = right - left;
    const pxStart = clamp((body.getBoundingClientRect().left + evt.detail.dx) - left, 0, parentWidth - width);
    const pxEnd = clamp(pxStart + width, width, parentWidth);

    start = percentToYear((pxStart / parentWidth) * 100);
    end = percentToYear((pxEnd / parentWidth) * 100);
  }
</script>

<div class="double-range-container">
  <div class="slider" bind:this={slider}>
    <div
      class="body"
      bind:this={body}
      use:draggable
      on:dragmove|preventDefault|stopPropagation={setHandlesFromBody}
      style="
        left: {yearToPercent(start)}%;
        right: {100 - yearToPercent(end)}%;
      "
    ></div>
    <div
      class="handle"
      bind:this={leftHandle}
      data-which="start"
      use:draggable
      on:dragmove|preventDefault|stopPropagation={setHandlePosition('start')}
      style="
        left: {yearToPercent(start)}%;
      "
    ></div>
    <div
      class="handle"
      bind:this={rightHandle}
      data-which="end"
      use:draggable
      on:dragmove|preventDefault|stopPropagation={setHandlePosition('end')}
      style="
        left: {yearToPercent(end)}%;
      "
    ></div>
  </div>
</div>

<style>
  .double-range-container {
    width: 100%;
    height: 20px;
    user-select: none;
    box-sizing: border-box;
    white-space: nowrap;
  }
  .slider {
    position: relative;
    width: 100%;
    height: 6px;
    top: 50%;
    transform: translateY(-50%);
    background-color: #e2e2e2;
    box-shadow: inset 0 7px 10px -5px #3a4d3b, inset 0 -1px 0px 0px #9c9c9c;
    border-radius: 1px;
  }
  .handle {
    position: absolute;
    top: 50%;
    width: 0;
    height: 0;
  }
  .handle:after {
    content: '';
    position: absolute;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    background-color: #fdfdfd;
    border: 1px solid #3a4d3b;
    transform: translate(-50%, -50%);
  }
  .handle:active:after {
    background-color: #ddd;
    z-index: 9;
  }
  .body {
    top: 0;
    position: absolute;
    background-color: #a3c4a5;
    bottom: 0;
  }
</style>
