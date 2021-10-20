export type Rect = {
	left: number;
	right: number;
	top: number;
	bottom: number;
	width: number;
	height: number;
	aspect: number;
};

export const getRectFromElem = (div: HTMLElement): Rect => {
	const rect = <Rect>{};
	setRectFromElem(rect, div);
	return rect;
};

export const setRectFromElem = (rect: Rect, div: HTMLElement): void => {
	rect.left = div.offsetLeft;
	rect.top = div.offsetTop;
	rect.bottom = div.offsetTop + div.clientHeight;
	rect.right = div.offsetLeft + div.clientWidth;
	rect.width = div.clientWidth;
	rect.height = div.clientHeight;
	rect.aspect = rect.width / rect.height;
};
