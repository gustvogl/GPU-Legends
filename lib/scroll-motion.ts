export const clamp = (value:number, min=0, max=1) => Math.min(max, Math.max(min, value));
export function pageProgress(scroll:number, height:number, viewport:number){return clamp(scroll / Math.max(1,height-viewport));}
export function galleryProgress(scroll:number, start:number, distance:number){return distance>0?clamp((scroll-start)/distance):0;}
