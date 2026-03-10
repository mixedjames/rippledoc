import { Element } from "../model/Element";
import { ScrollTrigger } from "../scrollTrigger/ScrollTrigger";

export interface Pin {
  get scrollTrigger(): ScrollTrigger;

  get pinnedElement(): Element;
}
