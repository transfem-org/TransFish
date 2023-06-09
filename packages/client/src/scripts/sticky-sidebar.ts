export class StickySidebar {
	private lastScrollTop = 0;
	private container: HTMLElement;
	private el: HTMLElement;
	private isTop = false;
	private isBottom = false;
	private offsetTop: number;

	constructor(
		container: StickySidebar["container"],
	) {
		this.container = container;
		this.container.style.display = "flex";
		this.el = this.container.children[0] as HTMLElement;
		this.el.style.position = "sticky";
		this.offsetTop = this.container.getBoundingClientRect().top;
	}

	public calc(scrollTop: number) {
		if (scrollTop > this.lastScrollTop) { 
			// downscroll			
			this.isTop = false;
			this.isBottom =
				scrollTop + window.innerHeight >
				this.el.offsetTop + this.el.clientHeight;
		} else { 
			// upscroll
			this.isBottom = false;
			this.isTop = scrollTop < this.el.offsetTop + 1;
		}

		if (this.isTop) {
			if (this.el.style.alignSelf != "flex-start") {
				this.el.style.position = "sticky";
				this.el.style.bottom = null;
				this.el.style.top = "0px";
				this.el.style.alignSelf = "flex-start";
				console.log("top");
			}
			this.offsetTop = scrollTop;
		} else if (this.isBottom) {
			if (this.el.style.alignSelf != "flex-end") {
				this.el.style.position = "sticky";
				this.el.style.bottom = "0px";
				this.el.style.top = null;
				this.el.style.alignSelf = "flex-end";
				console.log("bottom");
			}
			this.offsetTop = window.innerHeight + scrollTop - this.el.scrollHeight;
		} else {
			this.el.style.position = "relative";
			this.el.style.top = this.offsetTop + "px";
			this.el.style.bottom = null;
			this.el.style.alignSelf = null;
		}

		this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
	}
}
